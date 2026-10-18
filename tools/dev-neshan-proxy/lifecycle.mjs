export class ServiceStartupError extends Error {
  constructor(service, port, error) {
    const code = typeof error?.code === "string" && /^[A-Z][A-Z0-9_]{0,63}$/.test(error.code) ? error.code : "STARTUP_FAILED";
    super("Cannot start " + service + " on 127.0.0.1:" + port + " (" + code + ").");
    this.name = "ServiceStartupError"; this.code = code; this.service = service; this.port = port;
  }
}

// Close the acceptor before its connections; await every owned listener's close.
export async function closeServices(services) {
  await Promise.all(services.map(({ server }) => new Promise(resolve => {
    server.close(() => resolve());
    server.closeAllConnections();
  })));
}

export async function startServices(services, { signals = process, reportError = () => {} } = {}) {
  const controller = new AbortController();
  let stopping, ready = false;
  const runtimeHandlers = [];
  const stop = () => {
    if (stopping) return stopping;
    ready = false; controller.abort();
    stopping = closeServices(services).finally(() => {
      signals.removeListener("SIGINT", stop); signals.removeListener("SIGTERM", stop);
      for (const [server, error, closed] of runtimeHandlers) {
        server.removeListener("error", error); server.removeListener("close", closed);
      }
    });
    return stopping;
  };
  signals.on("SIGINT", stop); signals.on("SIGTERM", stop);
  for (const { server, name, port } of services) {
    const error = cause => { if (ready) { reportError(new ServiceStartupError(name, port, cause)); void stop(); } };
    const closed = () => { if (ready) { reportError(new ServiceStartupError(name, port, {code: "SERVICE_CLOSED"})); void stop(); } };
    server.on("error", error); server.on("close", closed); runtimeHandlers.push([server, error, closed]);
  }
  try {
    for (const { server, name, port } of services) await new Promise((resolve, reject) => {
      const cleanup = () => { server.removeListener("error", failed); server.removeListener("listening", listening); controller.signal.removeEventListener("abort", aborted); };
      const failed = error => { cleanup(); reject(new ServiceStartupError(name, port, error)); };
      const listening = () => { cleanup(); resolve(); };
      const aborted = () => failed({code: "ABORT_ERR"});
      if (controller.signal.aborted) { aborted(); return; }
      server.once("error", failed); server.once("listening", listening); controller.signal.addEventListener("abort", aborted, {once: true});
      try { server.listen({host: "127.0.0.1", port, signal: controller.signal}); }
      catch (error) { failed(error); }
    });
    if (controller.signal.aborted) throw new ServiceStartupError("development services", 0, {code: "ABORT_ERR"});
    ready = true;
    return { stop };
  } catch (error) { await stop(); throw error; }
}
