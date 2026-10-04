import { defineConfig } from "@playwright/test";
import { networkInterfaces } from "node:os";
import { delimiter, join } from "node:path";

if (process.platform === "win32") {
  process.env.PATH = `${process.env.PATH ?? ""}${delimiter}${join(process.env.SystemRoot ?? "C:\\Windows", "System32")}`;
}

const external = Boolean(process.env.DEV_TEST_ORIGINS);
const lanAddress = Object.values(networkInterfaces()).flat().find(
  (address) => address?.family === "IPv4" && !address.internal,
)?.address;
if (!process.env.DEV_TEST_ORIGINS) {
  process.env.DEV_TEST_ORIGINS = ["http://localhost:3102", `http://${lanAddress ?? "127.0.0.1"}:3102`].join(",");
}

export default defineConfig({
  testDir: "./tests/development",
  outputDir: ".agent/reference-review/development-tests",
  snapshotPathTemplate: ".agent/reference-review/development-baselines/{testFilePath}/{arg}{ext}",
  workers: 1,
  reporter: "list",
  use: { browserName: "chromium", viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: "reduce", trace: "retain-on-failure" },
  ...(external ? {} : { webServer: {
    command: "npm run dev -- --port 3102",
    url: "http://localhost:3102",
    reuseExistingServer: false,
    timeout: 120_000,
  } }),
});
