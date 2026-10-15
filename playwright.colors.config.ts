import {defineConfig} from "@playwright/test";
import base from "./playwright.completion.config";
export default defineConfig({...base,testMatch:"color-system.spec.ts",reporter:[["list"],["json",{outputFile:".agent/reference-review/color-system/"+(process.env.COLOR_REVIEW??"after")+".json"}]],outputDir:".agent/reference-review/color-system/test-results"});
