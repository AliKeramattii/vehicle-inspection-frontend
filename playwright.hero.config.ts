import { defineConfig } from "@playwright/test";
import base from "./playwright.completion.config";
const external=process.env.HERO_ORIGIN;
export default defineConfig({...base,testMatch:"hero-composition.spec.ts",projects:base.projects?.filter(project=>project.name==="customer"),use:{...base.use,baseURL:external??base.use?.baseURL},webServer:external?undefined:base.webServer,reporter:[["list"],["json",{outputFile:".agent/reference-review/hero-composition/"+(process.env.HERO_REVIEW??"after")+"-results.json"}]],outputDir:".agent/reference-review/hero-composition/test-results"});
