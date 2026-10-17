import { createHash, randomUUID } from "node:crypto";
import { stat, realpath } from "node:fs/promises";
import { get } from "node:http";
import { fileURLToPath } from "node:url";
export const healthPath = "/__development/neshan/health";
const protocol = "neshan-development-v1";

export async function developmentIdentity({ origins, reversePort, settingsPort }) {
  const root = await realpath(fileURLToPath(new URL("../..", import.meta.url)));
  const digest = value => createHash("sha256").update(value).digest("hex");
  // File metadata detects stale local configuration/code without hashing or exposing key values.
  const files = [".env.local", "site-settings.local.json", "run.mjs", "lifecycle.mjs", "health.mjs", "server.mjs", "runtime-settings.mjs", "development-config.mjs", "../../src/config/site-settings.schema.ts", "../../src/config/vehicle-assets.ts", "../../src/config/package.json", "../../tsconfig.json"];
  const revisions = await Promise.all(files.map(async file => { const value = await stat(new URL(file, import.meta.url)); return [file, value.mtimeMs, value.size]; }));
  return { instanceId: randomUUID(), workspaceId: digest(process.platform === "win32" ? root.toLowerCase() : root),
    revision: digest(JSON.stringify({revisions, origins, reversePort, settingsPort})), origins };
}

// Called only after the existing Host/Origin checks; never includes keys or settings.
export function respondHealth(request, response, service, identity) {
  if (!identity || request.url !== healthPath || request.method !== "GET") return false;
  response.writeHead(200, {"Content-Type": "application/json", "Cache-Control": "no-store"});
  response.end(JSON.stringify({protocol, service, pid: process.pid, instanceId: identity.instanceId, workspaceId: identity.workspaceId, revision: identity.revision, origins: identity.origins})); return true;
}

function readHealth(port) {
  return new Promise(resolve => {
    let done = false;
    const finish = value => { if (!done) { done = true; clearTimeout(deadline); request.destroy(); resolve(value); } };
    const request = get({hostname: "127.0.0.1", port, path: healthPath, agent: false, timeout: 1000}, response => {
      if (response.statusCode !== 200) { response.resume(); finish(null); return; }
      let bytes = 0; const chunks = [];
      response.on("data", chunk => { bytes += chunk.length; if (bytes > 4096) finish(null); else chunks.push(chunk); });
      response.once("error", () => finish(null)); response.once("aborted", () => finish(null));
      response.once("end", () => { try { finish(JSON.parse(Buffer.concat(chunks).toString("utf8"))); } catch { finish(null); } });
    });
    const deadline = setTimeout(() => finish(null), 1000);
    request.once("timeout", () => finish(null)); request.once("error", () => finish(null));
  });
}
export async function inspectExistingPair({ reversePort, settingsPort, identity }) {
  const ports = [reversePort, settingsPort], names = ["reverse-geocoding", "runtime-settings"];
  const responses = await Promise.all(ports.map(readHealth));
  const recognized = responses.map((value, i) => value?.protocol === protocol && value.service === names[i] &&
    Number.isSafeInteger(value.pid) && value.pid > 0 && typeof value.instanceId === "string" && typeof value.workspaceId === "string" && typeof value.revision === "string" ?
    {service: names[i], port: ports[i], pid: value.pid, sameWorkspace: value.workspaceId === identity.workspaceId} : null);
  const reusable = recognized.every(value => value?.sameWorkspace) && responses.every(value => value.revision === identity.revision) &&
    responses[0].instanceId === responses[1].instanceId && responses[0].pid === responses[1].pid;
  return { reusable, recognized: recognized.filter(Boolean), reason: reusable ? "matching" : recognized.some(Boolean) ? "partial-or-different-configuration" : "unrecognized" };
}
