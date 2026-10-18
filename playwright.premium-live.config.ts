import base from "./playwright.neshan-live.config";
const config = {...base,use:{...base.use,baseURL:process.env.PREMIUM_ORIGIN??"http://localhost:3120"}};
export default config;
