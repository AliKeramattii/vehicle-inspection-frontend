import {defineConfig} from "@playwright/test";
import {delimiter,join} from "node:path";
if(process.platform==="win32")process.env.PATH=`${process.env.PATH??""}${delimiter}${join(process.env.SystemRoot??"C:\\Windows","System32")}`;
export default defineConfig({testDir:"./tests/performance",workers:1,retries:0,timeout:180_000,reporter:"list",outputDir:".agent/reference-review/performance/test-results",use:{baseURL:"http://127.0.0.1:3217",browserName:"chromium",viewport:{width:390,height:844},reducedMotion:"reduce"},webServer:{command:"npm run start -- --hostname 127.0.0.1 --port 3217",url:"http://127.0.0.1:3217",reuseExistingServer:false,timeout:30_000}});
