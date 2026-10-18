import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { assertDevelopment, createReverseServer } from "./server.mjs";
import { createRuntimeSettingsServer } from "./runtime-settings.mjs";
import { readDevelopmentOptions, DevelopmentConfigurationError } from "./development-config.mjs";
import { developmentIdentity, inspectExistingPair } from "./health.mjs";
import { startServices, ServiceStartupError } from "./lifecycle.mjs";

async function main() {
  assertDevelopment();
  try { loadEnvFile(fileURLToPath(new URL("./.env.local", import.meta.url))); }
  catch { throw new DevelopmentConfigurationError("Create tools/dev-neshan-proxy/.env.local; see the development guide."); }
  const options = readDevelopmentOptions(process.env, process.argv.slice(2));
  const { reversePort, settingsPort, origins } = options;
  const identity = await developmentIdentity(options);
  const reverse = createReverseServer({ key: process.env.NESHAN_SERVICE_KEY, port: reversePort, origins, developmentIdentity: identity,
    report: ({ upstreamStatus }) => console.info("Neshan reverse upstream HTTP", upstreamStatus) });
  const settings = await createRuntimeSettingsServer({ path: fileURLToPath(new URL("./site-settings.local.json", import.meta.url)), port: settingsPort, origins, developmentIdentity: identity,
    report: configuration => {
      console.info("Public runtime configuration:", JSON.stringify(configuration));
      if (!configuration.webMapConfigured) console.warn("Set application.locationMap.webMapKey in tools/dev-neshan-proxy/site-settings.local.json to the authorized public Web Map key.");
    } });
  const existing = await inspectExistingPair({...options, identity});
  if (existing.reusable) {
    console.info("Healthy Neshan development services already running (PID " + existing.recognized[0].pid + "). Reuse 127.0.0.1:" + reversePort + " and :" + settingsPort + "; no second process was started.");
    console.info("Allowed frontend origins:", origins.join(", ")); return;
  }
  try {
    await startServices([{name: "reverse-geocoding", server: reverse, port: reversePort}, {name: "runtime-settings", server: settings, port: settingsPort}], {
      reportError: error => { console.error(error.message); process.exitCode = 1; },
    });
  } catch (error) {
    if (error instanceof ServiceStartupError && error.code === "ABORT_ERR") return;
    if (error instanceof ServiceStartupError) {
      console.error(error.message);
      if (error.code === "EADDRINUSE") {
        console.error("No existing process was stopped. The existing pair is " + existing.reason + "; verify the listener owners before reusing or stopping it.");
        for (const value of existing.recognized) console.error("Recognized " + value.service + " on port " + value.port + ", PID " + value.pid + (value.sameWorkspace ? " (this worktree)." : " (another worktree)."));
        console.error("Use Ctrl+C in the verified owning terminal, then restart. See tools/dev-neshan-proxy/README.md for safe process inspection.");
      }
      process.exitCode = 1; return;
    }
    throw error;
  }
  console.info("Development-only reverse proxy on 127.0.0.1:" + reversePort);
  console.info("Public runtime settings host on 127.0.0.1:" + settingsPort);
  console.info("Service owner PID:", process.pid);
  console.info("Allowed frontend origins:", origins.join(", "));
  console.info("Ctrl+C in this terminal stops both services.");
}
main().catch(error => { console.error(error instanceof DevelopmentConfigurationError ? error.message : "Neshan development configuration could not be initialized. Check tools/dev-neshan-proxy/.env.local and site-settings.local.json; no credentials are logged."); process.exitCode = 1; });
