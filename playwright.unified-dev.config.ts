import { defineConfig } from "@playwright/test";
import base from "./playwright.unified.config";
const external = process.env.UNIFIED_DEV_ORIGIN;
export default defineConfig({ ...base, testDir: "./tests/development", testMatch: "unified-3d.spec.ts",
  use: { ...base.use, baseURL: external ?? "http://127.0.0.1:3136", launchOptions: { args: ["--enable-webgl","--use-angle=swiftshader","--enable-unsafe-swiftshader"] } },
  webServer: external ? undefined : { command: "npm run dev -- --port 3136", url: "http://127.0.0.1:3136", reuseExistingServer: false, timeout: 120000,
    env: { DEV_NESHAN_ENABLED: "0", VEHICLE_3D_PREVIEW: "1", NEXT_PUBLIC_VEHICLE_3D_PREVIEW: "1" } }
});
