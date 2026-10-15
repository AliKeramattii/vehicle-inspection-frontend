import { defineConfig } from "@playwright/test";
import base from "./playwright.completion.config";
export default defineConfig({...base,testMatch:"vehicle-assets.spec.ts",reporter:[["list"],["json",{outputFile:".agent/reference-review/new-vehicle/browser.json"}]],outputDir:".agent/reference-review/new-vehicle/test-results"});
