import {defineConfig,devices} from "@playwright/test";
const systemRoot=process.env.SystemRoot??"C:\\Windows";
process.env.PATH=[process.env.PATH,systemRoot+"\\System32"].filter(Boolean).join(";");
export default defineConfig({testDir:"./tests/photo-policy",timeout:90000,expect:{timeout:15000},workers:1,
 snapshotPathTemplate:"{testDir}/screenshots/{testFilePath}/{arg}{ext}",
 reporter:[["list"]],outputDir:"test-results/photo-policy",
 use:{...devices["Desktop Chrome"],baseURL:"http://127.0.0.1:3221",viewport:{width:390,height:844},trace:"retain-on-failure"},
 webServer:{command:"npm run start -- --hostname 127.0.0.1 --port 3221",url:"http://127.0.0.1:3221",reuseExistingServer:false,timeout:120000},
});
