import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { respondHealth } from "./health.mjs";
import { loadSettingsSchema } from "./load-settings-schema.mjs";
import { assertDevelopment, localAccess } from "./server.mjs";

// Separate public configuration host. The reverse proxy itself only handles reverse geocoding.
// Reads a strict Site Settings document, never the private environment file.
export async function createRuntimeSettingsServer({ path, port = 8788, origins = ["http://localhost:3114"], report = () => {}, developmentIdentity }) {
  assertDevelopment();
  const { siteSettingsSchema, validateContext } = await loadSettingsSchema();
  const settings = siteSettingsSchema.parse(JSON.parse(await readFile(path, "utf8")));
  if (settings.application.locationMap?.webMapKey && !settings.application.locationMap.webMapKey.startsWith("web.")) throw new Error("Only a public Web Map key belongs in local runtime settings.");
  const bootstrap = { schemaVersion: 1, tenantId: settings.tenantId, apiBaseUrl: settings.application.apiBaseUrl, siteSettingsEndpoint: "/api/public/site-settings", settingsSource: "api" };
  if (bootstrap.apiBaseUrl !== "/api") throw new Error("Local runtime configuration must use same-origin /api.");
  validateContext(bootstrap, settings, origins[0]);
  report({ tenantId: settings.tenantId, mapEnabled: settings.application.locationMap?.enabled === true, webMapConfigured: !!settings.application.locationMap?.webMapKey, reverseGeocoding: settings.application.locationMap?.reverseGeocoding ?? "unavailable" });
  const server = createServer((request, response) => {
    if (!localAccess(request, response, server.address()?.port ?? port, origins)) return;
    if (respondHealth(request, response, "runtime-settings", developmentIdentity)) return;
    let pathname;
    try { pathname = new URL(request.url, "http://localhost").pathname; }
    catch { response.writeHead(400, { "Content-Type": "application/json", "Cache-Control": "no-store" }); response.end(JSON.stringify({error:{code:"invalid-request"}})); return; }
    const value = request.method === "GET" ? (pathname === "/site-bootstrap.json" ? bootstrap : pathname === "/api/public/site-settings" ? settings : null) : null;
    response.writeHead(value ? 200 : 404, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    response.end(JSON.stringify(value ?? { error: { code: "not-found" } }));
  });
  return server;
}
