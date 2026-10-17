export class DevelopmentConfigurationError extends Error {}
export function readDevelopmentOptions(env, args = []) {
  const port = (value, fallback) => {
    const parsed = Number(value ?? fallback);
    if (!Number.isInteger(parsed) || parsed < 1024 || parsed > 65535) throw new DevelopmentConfigurationError("Development ports must be integers from 1024 to 65535.");
    return parsed;
  };
  const reversePort = port(env.DEV_NESHAN_PROXY_PORT, 8787), settingsPort = port(env.DEV_NESHAN_SETTINGS_PORT, 8788);
  if (reversePort === settingsPort) throw new DevelopmentConfigurationError("Development service ports must differ.");
  const origins = (env.DEV_NESHAN_ALLOWED_ORIGIN ?? "http://localhost:3114,http://127.0.0.1:3114").split(",").map(value => value.trim());
  if (!origins.length || origins.some(value => {
    try { const url = new URL(value); return !["localhost", "127.0.0.1"].includes(url.hostname) || url.origin !== value || url.protocol !== "http:" || [reversePort, settingsPort].includes(Number(url.port || 80)); }
    catch { return true; }
  })) throw new DevelopmentConfigurationError("DEV_NESHAN_ALLOWED_ORIGIN must list explicit HTTP loopback frontend origins, separate from the service ports.");
  if (args.length) {
    if (args.length !== 2 || args[0] !== "--frontend-port") throw new DevelopmentConfigurationError("Usage: npm run dev:neshan-proxy -- [--frontend-port PORT]");
    const frontendPort = port(args[1]);
    if ([reversePort, settingsPort].includes(frontendPort)) throw new DevelopmentConfigurationError("Frontend and development service ports must differ.");
    origins.push("http://localhost:" + frontendPort, "http://127.0.0.1:" + frontendPort);
  }
  return { reversePort, settingsPort, origins: [...new Set(origins)].sort() };
}
