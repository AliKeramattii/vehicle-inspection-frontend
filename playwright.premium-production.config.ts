import base from "./playwright.premium.config";
import {delimiter,join} from "node:path";
if(process.platform==="win32")process.env.PATH=[process.env.PATH??"",join(process.env.SystemRoot??"C:/Windows","System32")].join(delimiter);
const external=process.env.PREMIUM_PRODUCTION_ORIGIN;
const config={...base,testIgnore:[],testMatch:process.env.PREMIUM_VISUAL_ONLY==="1"?"premium-visual.spec.ts":base.testMatch,use:{...base.use,baseURL:external??"http://127.0.0.1:3138"},webServer:external?undefined:{command:"npm run start -- --hostname 127.0.0.1 --port 3138",url:"http://127.0.0.1:3138",reuseExistingServer:false,timeout:120000}};
export default config;
