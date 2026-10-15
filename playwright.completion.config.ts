import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
const external=process.env.COMPLETION_ORIGIN;
// Reuse the canonical production build. Historical comparisons remain enabled and unmodified.
export default defineConfig({ ...base,
 reporter: [["list"], ["json", { outputFile: process.env.COMPLETION_REPORT ?? ".agent/reference-review/frontend-completion/browser-results.json" }]],
 outputDir: ".agent/reference-review/frontend-completion/browser-results",
 use: { ...base.use, baseURL: external ?? "http://127.0.0.1:3140" },
 webServer: external ? undefined : { command: "npm run start -- --hostname 127.0.0.1 --port 3140", url: "http://127.0.0.1:3140", reuseExistingServer: false, timeout: 120000 },
});
