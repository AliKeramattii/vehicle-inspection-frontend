import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({
  ...base,
  testMatch: /admin\.spec\.ts/,
  projects: [{ name:"desktop", use:{ viewport:{width:1440,height:960},deviceScaleFactor:1 } }],
  use:{ ...base.use, baseURL:"http://127.0.0.1:3104" },
  webServer:{ command:"npm run dev -- --hostname 127.0.0.1 --port 3104",url:"http://127.0.0.1:3104",reuseExistingServer:true,timeout:120_000 },
});
