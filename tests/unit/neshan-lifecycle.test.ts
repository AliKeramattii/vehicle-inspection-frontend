// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { createServer, type Server } from "node:http";
import { EventEmitter } from "node:events";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { closeServices, startServices, ServiceStartupError, type DevelopmentService } from "../../tools/dev-neshan-proxy/lifecycle.mjs";
import { healthPath, inspectExistingPair, type DevelopmentIdentity } from "../../tools/dev-neshan-proxy/health.mjs";
import { readDevelopmentOptions } from "../../tools/dev-neshan-proxy/development-config.mjs";
import { createReverseServer } from "../../tools/dev-neshan-proxy/server.mjs";
import { createRuntimeSettingsServer } from "../../tools/dev-neshan-proxy/runtime-settings.mjs";
import { defaultSiteSettings } from "@/config/site-settings.defaults";
const owned: DevelopmentService[] = [], folders: string[] = [], cleanups: (() => Promise<void>)[] = [];
const track = (server = createServer((_req, res) => res.end("fixture"))) => { const service = {server, name: "fixture", port: 0}; owned.push(service); return service; };
const portOf = (server: Server) => { const address = server.address(); if (!address || typeof address === "string") throw new Error("No fixture listener"); return address.port; };
async function occupy() { const service = track(); await new Promise<void>(resolve => service.server.listen(0, "127.0.0.1", resolve)); return portOf(service.server); }
async function group(services: DevelopmentService[], signals = new EventEmitter(), reportError = vi.fn()) {
  const running = await startServices(services, {signals, reportError}); cleanups.push(running.stop); return {...running, signals, reportError};
}
afterEach(async () => {
  await Promise.all(cleanups.splice(0).map(stop => stop())); vi.restoreAllMocks();
  await closeServices(owned.splice(0));
  for (const folder of folders.splice(0)) await rm(folder, {recursive: true, force: true});
});
describe("paired development listener lifecycle", () => {
  it("starts and stops both listeners, releasing ports and signal/error listeners", async () => {
    const services = [track(), track()], running = await group(services), ports = services.map(s => portOf(s.server));
    expect(services.every(s => s.server.listening)).toBe(true);
    await Promise.all([running.stop(), running.stop()]);
    expect(services.every(s => !s.server.listening)).toBe(true);
    expect(running.signals.listenerCount("SIGINT") + running.signals.listenerCount("SIGTERM")).toBe(0);
    for (let i = 0; i < ports.length; i++) {
      expect(services[i].server.listenerCount("error")).toBe(0);
      const replacement = track(); await new Promise<void>(resolve => replacement.server.listen(ports[i], "127.0.0.1", resolve));
    }
  });
  it.each([0, 1])("reports the exact bind conflict and rolls back owned servers when listener %s fails", async index => {
    const occupied = await occupy(), services = [track(), track()], signals = new EventEmitter();
    services[index].name = index === 0 ? "reverse-geocoding" : "runtime-settings"; services[index].port = occupied;
    await expect(startServices(services, {signals})).rejects.toMatchObject({service: services[index].name, port: occupied, code: "EADDRINUSE"});
    expect(services.every(s => !s.server.listening)).toBe(true);
    expect(owned[0].server.listening).toBe(true); // never kill the unrelated owner
    expect(signals.listenerCount("SIGINT") + signals.listenerCount("SIGTERM")).toBe(0);
  });
  it("preserves a non-port error code without exposing an underlying exception message", async () => {
    const services = [track(), track()]; services[1].name = "runtime-settings";
    vi.spyOn(services[1].server, "listen").mockImplementation(() => { throw Object.assign(new Error("service.private-fixture"), {code: "EACCES"}); });
    const error = await startServices(services, {signals: new EventEmitter()}).catch(error => error);
    expect(error).toBeInstanceOf(ServiceStartupError); expect(error.code).toBe("EACCES");
    expect(error.message).toContain("runtime-settings on 127.0.0.1:0 (EACCES)"); expect(error.message).not.toContain("private-fixture");
    expect(services.every(s => !s.server.listening)).toBe(true);
  });
  it.each(["SIGINT", "SIGTERM"])("stops both services cleanly on %s", async signal => {
    const services = [track(), track()], running = await group(services);
    running.signals.emit(signal); await running.stop();
    expect(services.every(s => !s.server.listening)).toBe(true); expect(running.reportError).not.toHaveBeenCalled();
  });
  it("aborts startup between listeners without leaving a partial listener", async () => {
    const services = [track(), track()], signals = new EventEmitter();
    services[0].server.once("listening", () => signals.emit("SIGTERM"));
    await expect(startServices(services, {signals})).rejects.toMatchObject({code: "ABORT_ERR"});
    expect(services.every(s => !s.server.listening)).toBe(true);
    expect(signals.listenerCount("SIGINT") + signals.listenerCount("SIGTERM")).toBe(0);
  });
  it("closes the sibling on runtime listener failure", async () => {
    const services = [track(), track()], running = await group(services);
    services[1].server.emit("error", Object.assign(new Error("not logged"), {code: "ENETDOWN"})); await running.stop();
    expect(running.reportError).toHaveBeenCalledWith(expect.objectContaining({code: "ENETDOWN"}));
    expect(services.every(s => !s.server.listening)).toBe(true);
  });
  it("aborts active reverse requests and releases their resources on shutdown", async () => {
    const provider = vi.fn<typeof fetch>((_url, options) => new Promise((_resolve, reject) => options!.signal!.addEventListener("abort", () => reject(new Error("fixture aborted")), {once: true})));
    const reverse = track(createReverseServer({key: "service.unit-fixture", fetcher: provider, port: 0})), settings = track();
    const running = await group([reverse, settings]);
    const response = fetch("http://127.0.0.1:" + portOf(reverse.server) + "/api/maps/reverse?lat=1&lng=1").catch(() => null);
    await vi.waitFor(() => expect(provider).toHaveBeenCalledTimes(1));
    await running.stop(); await response;
    expect(provider.mock.calls[0][1]!.signal!.aborted).toBe(true);
    expect(reverse.server.listening || settings.server.listening).toBe(false);
  });
});
const identity: DevelopmentIdentity = {instanceId: "fixture-pair", workspaceId: "fixture-workspace", revision: "fixture-revision", origins: ["http://localhost:3114"]};
async function healthyPair() {
  const folder = await mkdtemp(join(tmpdir(), "neshan-lifecycle-")); folders.push(folder);
  const path = join(folder, "public.json"), settings = defaultSiteSettings("demo"); settings.application.locationMap!.webMapKey = "web.unit-fixture";
  await writeFile(path, JSON.stringify(settings));
  const withPrivateExtra = {...identity, privateKey: "service.must-not-appear"};
  const reverse = track(createReverseServer({key: "service.unit-fixture", port: 0, developmentIdentity: withPrivateExtra}));
  const runtime = track(await createRuntimeSettingsServer({path, port: 0, developmentIdentity: withPrivateExtra}));
  await group([reverse, runtime]); return {reverse, runtime, options: {reversePort: portOf(reverse.server), settingsPort: portOf(runtime.server), identity}};
}
describe("safe matching-pair health/reuse", () => {
  it("recognizes a healthy same-worktree pair and exposes metadata only", async () => {
    const pair = await healthyPair(), result = await inspectExistingPair(pair.options);
    expect(result.reusable).toBe(true); expect(result.recognized).toHaveLength(2);
    const response = await fetch("http://127.0.0.1:" + pair.options.reversePort + healthPath), body = await response.text();
    expect(body).not.toContain("web.unit-fixture"); expect(body).not.toContain("service.");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(JSON.parse(body)).toMatchObject({service: "reverse-geocoding", pid: process.pid});
    expect(pair.reverse.server.listening && pair.runtime.server.listening).toBe(true);
  });
  it.each(["workspaceId", "revision", "instanceId"] as const)("never reuses a mismatched %s", async field => {
    const pair = await healthyPair();
    if (field === "instanceId") {
      const extra = track(createReverseServer({key: "service.unit-fixture", port: 0, developmentIdentity: {...identity, instanceId: "other-pair"}}));
      await group([extra]); pair.options.reversePort = portOf(extra.server);
    } else pair.options.identity = {...identity, [field]: "different"};
    expect((await inspectExistingPair(pair.options)).reusable).toBe(false);
    expect(pair.reverse.server.listening && pair.runtime.server.listening).toBe(true);
  });
  it("refuses a partial pair or unrelated HTTP server without disturbing it", async () => {
    const pair = await healthyPair(), unrelatedPort = await occupy();
    const result = await inspectExistingPair({...pair.options, settingsPort: unrelatedPort});
    expect(result.reusable).toBe(false); expect(result.recognized).toHaveLength(1);
    expect(pair.reverse.server.listening && pair.runtime.server.listening).toBe(true);
  });
  it("bounds oversized and unresponsive diagnostic responses", async () => {
    const large = track(createServer((_req, res) => res.end("x".repeat(5000)))), silent = track(createServer(() => {}));
    await group([large, silent]); const started = performance.now();
    const result = await inspectExistingPair({reversePort: portOf(large.server), settingsPort: portOf(silent.server), identity});
    expect(result.reusable).toBe(false); expect(result.recognized).toHaveLength(0); expect(performance.now() - started).toBeLessThan(2500);
  });
});
describe("explicit alternate frontend ports", () => {
  it("extends only the explicitly requested loopback frontend port", () => {
    const options = readDevelopmentOptions({}, ["--frontend-port", "3115"]);
    expect(options.origins).toEqual(["http://127.0.0.1:3114", "http://127.0.0.1:3115", "http://localhost:3114", "http://localhost:3115"]);
    expect(options.reversePort).toBe(8787); expect(options.settingsPort).toBe(8788);
  });
  it.each([["--frontend-port", "8787"], ["--frontend-port", "-1"], ["--frontend-port", "65536"], ["--unknown", "3115"], ["--frontend-port"]].map(args => ({args})))("rejects invalid CLI arguments %j", ({args}) => {
    expect(() => readDevelopmentOptions({}, args)).toThrow();
  });
  it.each(["https://localhost:3115", "http://192.168.1.2:3115", "http://localhost:3115/path", "http://localhost:8787", ""])("rejects unsafe allowed origin %s", origin => {
    expect(() => readDevelopmentOptions({DEV_NESHAN_ALLOWED_ORIGIN: origin})).toThrow();
  });
  it("accepts configured Next forwarded hosts and rejects a missing alternate frontend origin with recovery instructions", async () => {
    const pair = await healthyPair(), url = "http://127.0.0.1:" + pair.options.settingsPort + "/site-bootstrap.json";
    expect((await fetch(url, {headers: {"x-forwarded-host": "localhost:3114"}})).status).toBe(200);
    const rejected = await fetch(url, {headers: {"x-forwarded-host": "localhost:3115"}});
    expect(rejected.status).toBe(403); expect(await rejected.json()).toMatchObject({error: {code: "frontend-origin-denied", message: expect.stringContaining("--frontend-port")}});
    const configured = readDevelopmentOptions({}, ["--frontend-port", "3115"]);
    const reverse = track(createReverseServer({key: "service.unit-fixture", port: 0, origins: configured.origins})); await group([reverse]);
    const response = await fetch("http://127.0.0.1:" + portOf(reverse.server) + "/api/maps/reverse", {headers: {"x-forwarded-host": "localhost:3115", Origin: "http://localhost:3115"}});
    expect(response.status).toBe(400); // origin accepted; expected coordinate validation, no upstream call
    expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:3115");
  });
});
