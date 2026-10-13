// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { request, type Server } from "node:http";
import { createReverseServer } from "../../tools/dev-neshan-proxy/server.mjs";
import { developmentNeshanRewrites } from "../../tools/dev-neshan-proxy/dev-rewrites";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants";

const servers: Server[] = [];
afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve) => { server.closeAllConnections(); server.close(() => resolve()); })));
});
async function start(options: Partial<Parameters<typeof createReverseServer>[0]> = {}) {
  const server = createReverseServer({ key: "service.unit-fixture-only", port: 0, ...options });
  servers.push(server);
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing test listener");
  return "http://127.0.0.1:" + address.port;
}
const ok = () => new Response(JSON.stringify({ status: "OK", formatted_address: "تهران، آدرس آزمون", ignored: "not-forwarded" }));
describe("isolated development reverse proxy", () => {
  it("calls only v5 with a private header and returns only the address", async () => {
    const provider = vi.fn<typeof fetch>(async () => ok()), base = await start({ fetcher: provider });
    const response = await fetch(base + "/api/maps/reverse?lat=35.7&lng=51.4");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ formatted_address: "تهران، آدرس آزمون" });
    const [url, options] = provider.mock.calls[0];
    expect(String(url)).toBe("https://api.neshan.org/v5/reverse?lat=35.7&lng=51.4");
    expect(options?.headers).toEqual({ "Api-Key": "service.unit-fixture-only", Accept: "application/json" });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it.each(["", "?lat=&lng=1", "?lat=NaN&lng=1", "?lat=91&lng=1", "?lat=1&lng=-181", "?lat=1&lng=1&url=https://evil.example", "?lat=1&lat=2&lng=1", "?lat=0x10&lng=1"])("rejects invalid coordinates %s without calling upstream", async query => {
    const provider = vi.fn<typeof fetch>(async () => ok()), base = await start({ fetcher: provider });
    expect((await fetch(base + "/api/maps/reverse" + query)).status).toBe(400);
    expect(provider).not.toHaveBeenCalled();
  });
  it("accepts zero and boundary WGS84 values", async () => {
    const base = await start({ fetcher: vi.fn<typeof fetch>(async () => ok()) });
    expect((await fetch(base + "/api/maps/reverse?lat=0&lng=0")).status).toBe(200);
    expect((await fetch(base + "/api/maps/reverse?lat=-90&lng=180")).status).toBe(200);
  });
  it("rejects unknown origins and rebinding hosts; handles allowed preflight", async () => {
    const provider = vi.fn<typeof fetch>(async () => ok()), base = await start({ fetcher: provider });
    const url = base + "/api/maps/reverse?lat=1&lng=1";
    expect((await fetch(url, { headers: { Origin: "https://evil.example" } })).status).toBe(403);
    const rebindingStatus = await new Promise<number | undefined>((resolve, reject) => { const r = request(url, { headers: { Host: "evil.example" } }, response => { response.resume(); resolve(response.statusCode); }); r.on("error", reject); r.end(); });
    expect(rebindingStatus).toBe(403);
    const preflight = await fetch(url, { method: "OPTIONS", headers: { Origin: "http://localhost:3114" } });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3114");
    expect(provider).not.toHaveBeenCalled();
  });
  it("never provides arbitrary forwarding or other business endpoints", async () => {
    const base = await start();
    expect((await fetch(base + "/api/evidence")).status).toBe(404);
    expect((await fetch(base + "/api/maps/reverse", { method: "POST" })).status).toBe(405);
  });
  it.each([480, 483, 484, 485, 500])("returns safe provider failure for HTTP %s", async status => {
    const base = await start({ fetcher: vi.fn<typeof fetch>(async () => new Response("service.unit-fixture-only", { status })) });
    const response = await fetch(base + "/api/maps/reverse?lat=1&lng=1");
    expect(response.status).toBe(502); expect(await response.text()).not.toContain("service.unit-fixture-only");
  });
  it.each([429, 481, 482])("translates provider throttle %s", async status => {
    const base = await start({ fetcher: vi.fn<typeof fetch>(async () => new Response("", { status })) });
    const response = await fetch(base + "/api/maps/reverse?lat=1&lng=1");
    expect(response.status).toBe(429); expect(response.headers.get("Retry-After")).toBe("60");
  });
  it("applies local request throttling", async () => {
    const provider = vi.fn<typeof fetch>(async () => ok()), base = await start({ fetcher: provider, limit: 1 });
    expect((await fetch(base + "/api/maps/reverse?lat=1&lng=1")).status).toBe(200);
    expect((await fetch(base + "/api/maps/reverse?lat=1&lng=1")).status).toBe(429);
    expect(provider).toHaveBeenCalledTimes(1);
  });
  it("aborts slow upstream and clears resources", async () => {
    const provider = vi.fn<typeof fetch>((_url, options) => new Promise((_resolve, reject) => options?.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true })));
    const base = await start({ fetcher: provider, timeoutMs: 10 });
    expect((await fetch(base + "/api/maps/reverse?lat=1&lng=1")).status).toBe(504);
    expect(provider.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });
  it.each([{ status: "OK", formatted_address: "" }, { status: "OK", formatted_address: "x".repeat(301) }, { status: "ERROR", formatted_address: "x" }, { status: "OK", formatted_address: "service.unit-fixture-only" }])("does not forward invalid provider data", async body => {
    const base = await start({ fetcher: vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body))) });
    expect((await fetch(base + "/api/maps/reverse?lat=1&lng=1")).status).toBe(502);
  });
  it("refuses production execution", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(() => createReverseServer({ key: "service.unit-fixture-only" })).toThrow("cannot run in production");
  });
});
describe("development-only Next rewrites", () => {
  it("are absent from builds, production servers and ordinary development", () => {
    for (const phase of [PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER]) expect(developmentNeshanRewrites(phase, { DEV_NESHAN_ENABLED: "1" })).toEqual({});
    expect(developmentNeshanRewrites(PHASE_DEVELOPMENT_SERVER, {})).toEqual({});
  });
  it("preserves existing contracts only in explicitly enabled development", async () => {
    const config = developmentNeshanRewrites(PHASE_DEVELOPMENT_SERVER, { DEV_NESHAN_ENABLED: "1" });
    const rewrites = await config.rewrites!();
    expect(rewrites.beforeFiles.map(r => r.source)).toEqual(["/site-bootstrap.json", "/api/public/site-settings", "/api/maps/reverse"]);
    expect(rewrites.beforeFiles.every(r => r.destination.startsWith("http://127.0.0.1:"))).toBe(true);
  });
});
