import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
import { delimiter, join } from "node:path";

// Match the existing Windows configs: server teardown needs taskkill.
if (process.platform === "win32") {
  process.env.PATH = [process.env.PATH ?? "", join(process.env.SystemRoot ?? "C:\\Windows", "System32")].join(delimiter);
}

// Restricted GLB remains an ignored local fixture, never a test asset in Git.
const modelAvailable = existsSync(".agent/vehicle-3d/mobile.glb");
process.env.UI_REFINEMENT_DEV = modelAvailable ? "1" : "0";
const external = process.env.UI_REFINEMENT_ORIGIN;
const origin = external ?? "http://127.0.0.1:3110";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "ui-modernization.spec.ts",
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 10_000 }, // Allow the development server to compile first visits.
  reporter: "list",
  outputDir: ".agent/reference-review/modernization/test-results",
  use: {
    baseURL: origin, browserName: "chromium", reducedMotion: "reduce",
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
  },
  projects: [
    { name: "customer", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "desktop", use: { viewport: { width: 1440, height: 960 } } },
  ],
  ...(external ? {} : { webServer: {
    command: "npm run dev -- --webpack --port 3110",
    url: origin, reuseExistingServer: false, timeout: 120_000,
    env: { VEHICLE_3D_PREVIEW: modelAvailable ? "1" : "0", NEXT_PUBLIC_VEHICLE_3D_PREVIEW: modelAvailable ? "1" : "0" },
  } }),
});
