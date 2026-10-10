import { defineConfig } from "@playwright/test";
import { delimiter, join } from "node:path";
import { tmpdir } from "node:os";
if(process.platform==="win32") process.env.PATH=`${process.env.PATH??""}${delimiter}${join(process.env.SystemRoot??"C:\\Windows","System32")}`;
export default defineConfig({
  testDir:"./tests/vehicle-3d", workers:1, timeout:90_000, reporter:"list",
  // Software WebGL context disposal/route commit can exceed the ordinary 5s UI assertion budget.
  expect:{timeout:15_000},
  // Trace writes inside a filesystem-serving dev project can cause a Fast Refresh feedback loop.
  outputDir:join(tmpdir(),"vehicle-inspection-phase09","browser-results"),
  use:{ baseURL:"http://127.0.0.1:3103", viewport:{width:390,height:844}, reducedMotion:"reduce", trace:"retain-on-failure", launchOptions:{args:["--enable-webgl","--use-angle=swiftshader","--enable-unsafe-swiftshader"]} },
  // Override only this private preview's bind address; the normal LAN dev command is unchanged.
  webServer:{command:"npm run dev -- --webpack --hostname 127.0.0.1 --port 3103",url:"http://127.0.0.1:3103",reuseExistingServer:!!process.env.VEHICLE_PREVIEW_TEST_SERVER,timeout:120_000,env:{VEHICLE_3D_PREVIEW:"1"}},
});
