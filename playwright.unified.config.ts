import { defineConfig } from "@playwright/test";
import { delimiter, join } from "node:path";
if (process.platform === "win32") process.env.PATH = [process.env.PATH ?? "", join(process.env.SystemRoot ?? "C:\\Windows", "System32")].join(delimiter);
const external = process.env.UNIFIED_ORIGIN;
export default defineConfig({
  testDir: "./tests/e2e", testMatch: "unified-*.spec.ts", workers: 1, timeout: 120000,
  expect: { timeout: 12000 }, reporter: "list", outputDir: ".agent/reference-review/unified/test-results",
  use: { baseURL: external ?? "http://127.0.0.1:3135", viewport: { width: 390, height: 844 }, reducedMotion: "reduce", trace: "off", video: "off", screenshot: "off" },
  webServer: external ? undefined : { command: "npm run start -- --hostname 127.0.0.1 --port 3135", url: "http://127.0.0.1:3135", reuseExistingServer: false, timeout: 120000 },
});
