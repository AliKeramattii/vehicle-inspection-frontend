import {test,expect,type Page} from "@playwright/test";
import {mkdir} from "node:fs/promises";
import {submissionWorkflow} from "./submission-helpers";
import {brokerageFixture} from "../../src/config/site-settings.defaults";
import {customerReferenceAssets as assets} from "../../src/config/customer-reference-assets";
const qa=".agent/reference-review/final-reference-ui";
const sizes=[[320,568],[360,800],[390,844],[430,932],[768,1024],[1440,960]];
test.beforeEach(async({page},info)=>{
 test.skip(info.project.name!=="customer","Explicit customer viewports; operations have their own acceptance tests");
 await page.route("**/site-bootstrap.json",r=>r.fulfill({json:{schemaVersion:1,tenantId:"demo",apiBaseUrl:"/api",siteSettingsEndpoint:"/api/public/site-settings",settingsSource:"mock"}}));
 await mkdir(qa+"/details",{recursive:true});
});
async function bounded(page:Page){expect(await page.evaluate(()=>[document.documentElement.scrollWidth,document.documentElement.scrollHeight])).toEqual([await page.evaluate(()=>innerWidth),await page.evaluate(()=>innerHeight)]);}
test("reference entry uses real supplied art, contained heroes and reachable responsive controls",async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/");await expect(page.getByLabel("کد معرفی / کد ارجاع")).toBeVisible();
 for(const [width,height] of sizes){await page.setViewportSize({width,height});await expect(page.locator(".landing-art img")).toHaveCSS("object-fit","contain");await bounded(page);await page.getByRole("button",{name:"شروع بازدید",exact:true}).scrollIntoViewIfNeeded();await expect(page.getByRole("button",{name:"شروع بازدید",exact:true})).toBeInViewport();}
 await page.getByLabel("کد معرفی / کد ارجاع").fill("A4K9P2");await page.getByRole("button",{name:"شروع بازدید",exact:true}).click();
 await expect(page.locator(".otp-art img")).toHaveAttribute("src",new RegExp(assets.otp.replaceAll(".","\\.")));
 await expect(page.getByLabel("کد تأیید پنج‌رقمی")).toBeVisible();
 await expect.poll(()=>page.locator(".otp-art img").evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);
 await expect(page.locator(".otp-art img")).toHaveCSS("object-fit","contain");
 for(const [width,height] of sizes){await page.setViewportSize({width,height});await bounded(page);await page.getByLabel("کد تأیید پنج‌رقمی").focus();await expect(page.getByLabel("کد تأیید پنج‌رقمی")).toBeInViewport();}
 await page.getByLabel("کد تأیید پنج‌رقمی").fill("۱۲۳۴۵");await expect(page.getByRole("button",{name:"همه چیز آماده است"})).toBeEnabled();expect(errors).toEqual([]);
});
test("summary leads with coherent vehicle facts and an unsqueezed natural image at every target",async({page})=>{
 await submissionWorkflow(page);await expect(page.locator(".summary-scroll>.summary-section").first()).toHaveClass(/summary-vehicle/);
 for(const [width,height] of sizes){
  await page.setViewportSize({width,height});const art=page.locator(".summary-vehicle .vehicle-summary-art");await art.scrollIntoViewIfNeeded();
  await expect(art.locator("img")).toHaveCSS("object-fit","contain");const box=(await art.boundingBox())!;expect(box.height).toBeGreaterThan(140);expect(box.width/box.height).toBeCloseTo(width<359?1.7:1.75,1);
  await expect(page.locator(".summary-vehicle .iranian-plate")).toBeVisible();await expect(page.getByRole("button",{name:"ارسال برای بررسی",exact:true})).toBeInViewport();await bounded(page);
  await page.screenshot({path:qa+"/details/summary-vehicle-"+width+".png"});
 }
});
test("receipt uses submission art and estimated three-to-five working days, copy and refresh remain functional",async({page,context})=>{
 await submissionWorkflow(page);await page.getByRole("button",{name:"ارسال برای بررسی",exact:true}).click();await expect(page).toHaveURL(/submitted$/);
 await expect(page.locator(".receipt-eta")).toContainText("۳ تا ۵ روز کاری");await expect(page.locator(".receipt-eta")).not.toContainText("۲ ساعت");
 await expect(page.locator(".receipt-hero img")).toHaveAttribute("src",new RegExp(assets.submission.replaceAll(".","\\.")));await expect(page.locator(".receipt-hero img")).toHaveCSS("object-fit","contain");
 await context.grantPermissions(["clipboard-read","clipboard-write"]);
 await page.getByRole("button",{name:"کپی کد پیگیری",exact:true}).click();await expect(page.getByRole("status")).toContainText("کد پیگیری کپی شد");
 for(const [width,height] of sizes){await page.setViewportSize({width,height});await bounded(page);await expect(page.getByRole("button",{name:"بازگشت به بیمه‌گر",exact:false})).toBeInViewport();}
 await page.reload();await expect(page.locator(".receipt-reference bdi")).toHaveText("BDI-8F31K2");await expect(page.locator(".receipt-eta")).toContainText("۳ تا ۵ روز کاری");
});
test("custom brokerage theme and OTP artwork take precedence over the default mint presentation",async({page})=>{
 const settings=brokerageFixture("broker-a");settings.theme.background="#fff7ed";settings.images.otp="/images/tenant-custom.webp";
 await page.route("**/site-bootstrap.json",r=>r.fulfill({json:{schemaVersion:1,tenantId:"broker-a",apiBaseUrl:"/api",siteSettingsEndpoint:"/api/public/site-settings",settingsSource:"api"}}));
 await page.route("**/api/public/site-settings",r=>r.fulfill({json:settings}));
 await page.route("**/images/tenant-custom.webp",r=>r.fulfill({path:"public"+assets.otp}));
 await page.goto("/");await expect(page.locator("html")).toHaveAttribute("data-runtime-brand","custom");await expect(page.locator(".landing-screen")).toHaveCSS("background-image","none");await expect(page.locator(".landing-screen")).toHaveCSS("background-color","rgb(255, 247, 237)");
 await expect(page.locator(".runtime-logo")).toHaveAttribute("src",new URL(settings.identity.logo!,page.url()).href);
 await page.getByLabel("کد معرفی / کد ارجاع").fill("A4K9P2");await page.getByRole("button",{name:"شروع بازدید",exact:true}).click();
 await expect(page.locator(".otp-art img")).toHaveAttribute("src",new URL("/images/tenant-custom.webp",page.url()).href);await expect.poll(()=>page.locator(".otp-art img").evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);
});
