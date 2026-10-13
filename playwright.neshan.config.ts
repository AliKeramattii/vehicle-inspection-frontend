
import { defineConfig } from "@playwright/test";
import { delimiter, join } from "node:path";
if (process.platform === "win32") process.env.PATH = [process.env.PATH ?? "", join(process.env.SystemRoot ?? "C:\\Windows", "System32")].join(delimiter);
export default defineConfig({
  testDir: "./tests/e2e", testMatch: "neshan-location.spec.ts", workers: 1, timeout: 90000,
  expect: { timeout: 10000 }, reporter: "list",
  outputDir: ".agent/reference-review/neshan/test-results",
  use: { baseURL: "http://127.0.0.1:3113", browserName: "chromium", hasTouch: true, viewport: { width: 390, height: 844 }, reducedMotion: "reduce", trace: "retain-on-failure" },
  webServer: { command: "npm run build && npm run start -- --hostname 127.0.0.1 --port 3113", url: "http://127.0.0.1:3113", reuseExistingServer: false, timeout: 120000 },
});
