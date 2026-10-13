// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
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
