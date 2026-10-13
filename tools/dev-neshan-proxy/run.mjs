import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { assertDevelopment, createReverseServer } from "./server.mjs";
import { createRuntimeSettingsServer } from "./runtime-settings.mjs";

assertDevelopment();
try { loadEnvFile(fileURLToPath(new URL("./.env.local", import.meta.url))); }
catch { throw new Error("Create tools/dev-neshan-proxy/.env.local; see the development guide."); }
const port = (value, fallback) => {
  const number = Number(value ?? fallback);
  if (!Number.isInteger(number) || number < 1024 || number > 65535) throw new Error("Invalid development port.");
  return number;
};
const origins = (process.env.DEV_NESHAN_ALLOWED_ORIGIN ?? "http://localhost:3114,http://127.0.0.1:3114").split(",").map(s => s.trim());
if (origins.some(s => { try { const u = new URL(s); return !["localhost","127.0.0.1"].includes(u.hostname) || u.origin !== s || u.protocol !== "http:"; } catch { return true; } })) throw new Error("Only explicit local development origins are allowed.");
const reversePort = port(process.env.DEV_NESHAN_PROXY_PORT, 8787);
const settingsPort = port(process.env.DEV_NESHAN_SETTINGS_PORT, 8788);
if (reversePort === settingsPort) throw new Error("Development service ports must differ.");
const reverse = createReverseServer({ key: process.env.NESHAN_SERVICE_KEY, port: reversePort, origins, report: ({ upstreamStatus }) => console.info("Neshan reverse upstream HTTP", upstreamStatus) });
const settings = await createRuntimeSettingsServer({ path: fileURLToPath(new URL("./site-settings.local.json", import.meta.url)), port: settingsPort, origins });
const listen = (server, number) => new Promise((resolve,reject) => { server.once("error", reject); server.listen(number, "127.0.0.1", resolve); });
try { await listen(reverse, reversePort); await listen(settings, settingsPort); }
catch { reverse.close(); settings.close(); throw new Error("Development service port unavailable."); }
console.info("Development-only reverse proxy on loopback port", reversePort);
console.info("Separate public runtime settings host on loopback port", settingsPort);
const stop = () => { reverse.closeAllConnections(); settings.closeAllConnections(); reverse.close(); settings.close(); };
process.once("SIGINT", stop); process.once("SIGTERM", stop);
