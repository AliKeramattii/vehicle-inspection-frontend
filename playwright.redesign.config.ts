import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// Review artifacts only. Start the canonical dev server explicitly; no snapshot updates.
export default defineConfig({
  ...base,
  workers: 1,
  timeout: 150000,
  testMatch: "reference-redesign.spec.ts",
  projects: [{ name: "checkpoint", use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 } }],
  reporter: [
    ["list"],
    ["json", { outputFile: ".agent/reference-review/reference-redesign/" + (process.env.REDESIGN_STAGE ?? "after") + "/results.json" }],
  ],
  outputDir: ".agent/reference-review/reference-redesign/test-results",
  use: { ...base.use, baseURL: process.env.REDESIGN_ORIGIN ?? "http://127.0.0.1:3114" },
  webServer: undefined,
});
