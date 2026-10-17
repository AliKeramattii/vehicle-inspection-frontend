// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import type { Server } from "node:http";
import { createRuntimeSettingsServer } from "../../tools/dev-neshan-proxy/runtime-settings.mjs";
import { defaultSiteSettings } from "../../src/config/site-settings.defaults";
const folders: string[] = [], servers: Server[] = [];
afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(servers.splice(0).map(s => new Promise<void>(resolve => {s.closeAllConnections();s.close(()=>resolve());})));
  await Promise.all(folders.splice(0).map(path=>rm(path,{recursive:true,force:true})));
});
async function config(value: unknown) {
  const folder=await mkdtemp(join(tmpdir(),"neshan-settings-test-")); folders.push(folder);
  const path=join(folder,"settings.json"); await writeFile(path,JSON.stringify(value)); return path;
}
describe("local public runtime configuration host", () => {
  it("starts under native Node with standard explicit TypeScript imports and no custom resolver", async () => {
    const settings = defaultSiteSettings("demo"); settings.application.locationMap!.webMapKey = "web.unit-fixture";
    const path = await config(settings);
    const runtimeUrl = new URL("../../tools/dev-neshan-proxy/runtime-settings.mjs", import.meta.url).href;
    const script = `
      import assert from "node:assert/strict";
      const { createRuntimeSettingsServer } = await import(${JSON.stringify(runtimeUrl)});
      const server = await createRuntimeSettingsServer({path: ${JSON.stringify(path)}, port: 0});
      try {
        await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
        const base = "http://127.0.0.1:" + server.address().port;
        const bootstrap = await (await fetch(base + "/site-bootstrap.json")).json();
        const settings = await (await fetch(base + "/api/public/site-settings")).json();
        assert.equal(bootstrap.settingsSource, "api");
        assert.equal(settings.application.locationMap.webMapKey, "web.unit-fixture");
        assert.equal(JSON.stringify(settings).includes("service.fixture-private"), false);
        console.log("native-runtime-ok");
      } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
    `;
    const result = await promisify(execFile)(process.execPath, ["--input-type=module", "--eval", script], {
      cwd: fileURLToPath(new URL("../..", import.meta.url)), timeout: 10000,
      env: { ...process.env, NODE_ENV: "development", NESHAN_SERVICE_KEY: "service.fixture-private" },
    });
    expect(result.stdout.trim()).toBe("native-runtime-ok");
    expect(result.stderr).toBe("");
  });
  it("loads the shared schema directly in a fresh native process without registering resolution hooks", async () => {
    const url = new URL("../../src/config/site-settings.schema.ts", import.meta.url).href;
    const script = `const schema = await import(${JSON.stringify(url)}); if (typeof schema.siteSettingsSchema.parse !== "function") throw Error("Missing schema"); console.log("native-schema-ok");`;
    const result = await promisify(execFile)(process.execPath, ["--input-type=module", "--eval", script], {timeout: 10000});
    expect(result.stdout.trim()).toBe("native-schema-ok");
    expect(result.stderr).toBe("");
  });
  it("reports only safe startup configuration and identifies a missing public key", async () => {
    const report = vi.fn();
    const server = await createRuntimeSettingsServer({path: await config(defaultSiteSettings("demo")), report}); servers.push(server);
    expect(report).toHaveBeenCalledWith({tenantId: "demo", mapEnabled: true, webMapConfigured: false, reverseGeocoding: "unavailable"});
  });
  it("uses the same strict Site Settings schema and contracts without private configuration", async () => {
    const settings=defaultSiteSettings("demo"); settings.application.locationMap!.webMapKey="web.unit-fixture";
    const server=await createRuntimeSettingsServer({path:await config(settings),port:0}); servers.push(server);
    await new Promise<void>(resolve=>server.listen(0,"127.0.0.1",resolve));
    const address=server.address(); if(!address||typeof address==="string")throw new Error("No listener");
    const base="http://127.0.0.1:"+address.port;
    expect(await (await fetch(base+"/api/public/site-settings")).json()).toEqual(settings);
    expect(await (await fetch(base+"/site-bootstrap.json")).json()).toMatchObject({apiBaseUrl:"/api",settingsSource:"api",tenantId:"demo"});
    expect((await fetch(base+"/api/maps/reverse")).status).toBe(404);
    expect((await fetch(base+"/api/public/site-settings",{headers:{Origin:"https://unapproved.example"}})).status).toBe(403);
  });
  it("rejects private configuration and service keys", async () => {
    await expect(createRuntimeSettingsServer({path:await config({...defaultSiteSettings("demo"),NESHAN_SERVICE_KEY:"private-unit-fixture"})})).rejects.toThrow();
    const settings=defaultSiteSettings("demo"); settings.application.locationMap!.webMapKey="service.unit-fixture";
    await expect(createRuntimeSettingsServer({path:await config(settings)})).rejects.toThrow("public Web Map key");
  });
  it("cannot substitute another API deployment context", async () => {
    const settings=defaultSiteSettings("demo","https://different.example/api");
    await expect(createRuntimeSettingsServer({path:await config(settings)})).rejects.toThrow("same-origin /api");
  });
  it("refuses production execution before reading any local file", async () => {
    vi.stubEnv("NODE_ENV","production");
    await expect(createRuntimeSettingsServer({path:"does-not-exist.json"})).rejects.toThrow("cannot run in production");
  });
});
