import { defineConfig } from "@playwright/test";
import base from "./playwright.completion.config";
export default defineConfig({ ...base, testMatch: ["vehicle-guidance.spec.ts", "vehicle-assets.spec.ts", "unified-recorder.spec.ts", "photography-markers.spec.ts", "photography-navigation.spec.ts"], reporter: [["list"], ["json", { outputFile: ".agent/reference-review/vehicle-guidance/browser-results.json" }]], outputDir: ".agent/reference-review/vehicle-guidance/test-results" });
