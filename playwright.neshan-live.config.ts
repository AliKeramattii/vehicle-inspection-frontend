import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e", testMatch: "neshan-live.spec.ts", workers: 1,
  timeout: 120000, expect: { timeout: 20000 }, reporter: "list",
  outputDir: ".agent/reference-review/neshan-live/test-results",
  use: { baseURL: "http://localhost:3114", viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: "reduce", trace: "off", screenshot: "off", video: "off" },
  // Requires the explicitly started dev server/proxy. Never starts or intercepts provider services.
});
