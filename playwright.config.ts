import { defineConfig } from "@playwright/test";
import { delimiter, join } from "node:path";

// Some Windows terminals omit System32. Playwright needs taskkill for server cleanup.
if (process.platform === "win32") {
  process.env.PATH = `${process.env.PATH ?? ""}${delimiter}${join(process.env.SystemRoot ?? "C:\\Windows", "System32")}`;
}

export default defineConfig({
  testDir: "./tests/e2e", fullyParallel: true, forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0, workers: 2,
  reporter: [["list"], ["html", { open: "never" }]],
  snapshotPathTemplate: "{testDir}/screenshots/{testFilePath}/{arg}-{projectName}{ext}",
  use: { baseURL: "http://127.0.0.1:3100", browserName: "chromium", trace: "retain-on-failure", reducedMotion: "reduce" },
  projects: [
    { name: "customer", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } },
    { name: "desktop", use: { viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 } },
  ],
  webServer: { command: "npm run build && npm run start -- --hostname 127.0.0.1 --port 3100", url: "http://127.0.0.1:3100", reuseExistingServer: false, timeout: 120_000 },
});
