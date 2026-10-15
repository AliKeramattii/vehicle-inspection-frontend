import {test,expect,type Page} from "@playwright/test";
import {mkdir} from "node:fs/promises";
import {vehicleGuideAssets,vehicleHeroAssets,vehicleViewAssets,vehicleGhostAssets} from "../../src/config/vehicle-assets";
import {snapshotReady} from "./photography-helpers";
import {chooseDemoLocation} from "./location-helpers";
import {mockRecorder,packageWorkflow,recordedState} from "./capture-package-helpers";
import {submissionWorkflow} from "./submission-helpers";
import {brokerageFixture} from "../../src/config/site-settings.defaults";
const folder=".agent/reference-review/new-vehicle/after";
const errors=new WeakMap<Page,string[]>();
test.beforeEach(async({page})=>{
 await mkdir(folder,{recursive:true});await page.route("**/site-bootstrap.json",r=>r.fulfill({json:{schemaVersion:1,tenantId:"demo",apiBaseUrl:"/api",siteSettingsEndpoint:"/api/public/site-settings",settingsSource:"mock"}}));
 const messages:string[]=[];errors.set(page,messages);page.on("pageerror",e=>messages.push(e.message));page.on("console",m=>{if(m.type()==="error")messages.push(m.text());});page.on("response",r=>{if(r.status()>=400)messages.push(r.status()+" "+new URL(r.url()).pathname);});
});
test.afterEach(({page})=>expect(errors.get(page)).toEqual([]));
async function bounded(page:Page){expect(await page.evaluate(()=>({x:document.documentElement.scrollWidth>innerWidth,y:document.documentElement.scrollHeight>innerHeight}))).toEqual({x:false,y:false});}
async function shot(page:Page,name:string){await snapshotReady(page);await bounded(page);await page.screenshot({path:folder+"/"+name+".png"});}
async function source(page:Page,selector:string,src:string){await expect(page.locator(selector).first()).toBeVisible();await expect.poll(()=>page.locator(selector).first().getAttribute("src").then(value=>decodeURIComponent(value??""))).toContain(src);await expect.poll(()=>page.locator(selector).first().evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);}
async function sizes(page:Page,name:string){for(const [width,height] of [[360,800],[390,844],[430,932],[1440,960]]){await page.setViewportSize({width,height});await shot(page,name+"-"+width);}}
test("sedan heroes, identity, eight navigation roles and all twelve guides retain the approved journey",async({page},info)=>{
 test.skip(info.project.name!=="customer");test.setTimeout(180000);const models:string[]=[];page.on("request",r=>{if(/\.glb(?:\?|$)/.test(r.url()))models.push(r.url());});
 await page.goto("/");await source(page,".landing-art img",vehicleHeroAssets.landing);await sizes(page,"landing");
 await page.getByLabel("کد معرفی / کد ارجاع").fill("A4K9P2");await page.getByRole("button",{name:"شروع بازدید"}).click();await page.getByLabel("کد تأیید پنج‌رقمی").fill("12345");await expect(page.getByRole("button",{name:"همه چیز آماده است"})).toBeEnabled();
 await expect.poll(()=>page.locator(".readiness-hero").evaluate(el=>decodeURIComponent(getComputedStyle(el).backgroundImage))).toContain(vehicleHeroAssets.readiness);await expect(page.locator(".readiness-requirements li")).toHaveCount(4);await sizes(page,"readiness");
 await page.getByRole("button",{name:"همه چیز آماده است"}).click();await source(page,".consent-hero img",vehicleHeroAssets.consent);await sizes(page,"consent");await page.getByRole("checkbox").check();await page.getByRole("button",{name:"تأیید و ادامه"}).click();await chooseDemoLocation(page);await page.getByRole("button",{name:"تأیید این موقعیت"}).click();
 await source(page,".vehicle-summary-render",vehicleHeroAssets.introduction);await expect(page.getByText("خودروی سدان نمونه",{exact:true})).toBeVisible();await sizes(page,"vehicle-introduction");await page.getByRole("button",{name:"تأیید مشخصات و ادامه"}).click();await expect(page.getByRole("progressbar")).toBeVisible();
 for(const [width,height] of [[360,800],[390,844],[430,932],[1440,960]]){await page.setViewportSize({width,height});await shot(page,"photography-"+width);const image=await page.locator(".vehicle-photo-scene .photography-image").boundingBox(),controls=await page.locator(".vehicle-photo-controls").boundingBox();expect(controls!.y).toBeGreaterThanOrEqual(image!.y+image!.height);expect(await page.locator(".vehicle-photo-marker").first().getAttribute("type")).toBe("button");}
 await page.setViewportSize({width:390,height:844});
 for(const [name,title] of [["top","بالا"],["rear","عقب"],["right","راست"],["front","جلو"],["left","چپ"]] as const){await page.getByRole("button",{name:"نمای خودرو: "+title,exact:true}).click();await source(page,'.vehicle-photo-controls button[aria-pressed="true"] img',vehicleViewAssets[name]);await shot(page,"view-"+name);}
 for(const [name,label] of [["body","بدنه"],["cabin","کابین"],["engine-specs","موتور و مشخصات"]] as const){await page.locator(".photography-categories button").filter({hasText:label}).click();await source(page,'.photography-categories button[aria-pressed="true"] img',vehicleViewAssets[name]);await shot(page,"view-"+name);}
 for(const [id,asset] of Object.entries(vehicleGuideAssets)){const category=["odometer-on","driver-interior"].includes(id)?"کابین":["engine-bay","spec-plate","chassis-number"].includes(id)?"موتور و مشخصات":"بدنه";await page.locator(".photography-categories button").filter({hasText:category}).click();await page.locator('.photography-shot-card[data-requirement="'+id+'"]').click();await page.getByRole("link",{name:/عکاسی نمای بعدی:/}).click();await source(page,".photography-guide img",asset.src);await shot(page,"guide-"+id);await page.locator(".photo-back").click();await expect(page.locator(".photography-section")).toBeVisible();await page.locator(".photo-back").click();await expect(page.locator(".photography-overview")).toBeVisible();}
 expect(models).toEqual([]);
});
test("Recorder V2 shows eight transparent sedan ghosts and keeps live recording and cleanup",async({page},info)=>{
 test.skip(info.project.name!=="customer");test.setTimeout(120000);await mockRecorder(page);await packageWorkflow(page,{kilometers:48320});await page.getByRole("link",{name:"ادامه به ویدیوی ۳۶۰ درجه"}).click();
 for(const [id,src] of Object.entries(vehicleGhostAssets)){await expect(page.locator(".recorder-ghost")).toHaveAttribute("data-guide",id);await source(page,".recorder-ghost img",src);await shot(page,"ghost-"+id);await page.getByRole("button",{name:"نمای راهنمای بعدی"}).click();}
 await sizes(page,"recorder-idle");await page.setViewportSize({width:390,height:844});await recordedState(page);await shot(page,"recorder-active");await page.clock.resume();await page.getByRole("button",{name:"پایان ضبط"}).click();await expect(page).toHaveURL(/video\/review$/);await expect(page.locator(".walkaround-review")).toHaveAttribute("controls","");await shot(page,"recorder-review");await expect.poll(()=>page.evaluate(()=>(window as Window&{stoppedPhotoTracks?:number}).stoppedPhotoTracks??0)).toBeGreaterThan(0);
});
test("sedan summary, receipt and Admin light/dark default previews share new assets",async({page},info)=>{
 test.skip(info.project.name!=="desktop");test.setTimeout(120000);await submissionWorkflow(page);await sizes(page,"summary");await page.getByRole("button",{name:"ارسال برای بررسی",exact:true}).click();await expect(page).toHaveURL(/submitted$/);await source(page,".receipt-hero",vehicleHeroAssets.receipt);await sizes(page,"receipt");
 await page.setViewportSize({width:1440,height:960});await page.goto("/admin/site-settings");await page.getByRole("tab",{name:"تصاویر",exact:true}).click();await expect(page.locator('.admin-asset-preview img')).not.toHaveCount(0);await shot(page,"admin-images-light");await page.getByRole("switch",{name:"پوسته تیره"}).check();await shot(page,"admin-images-dark");await page.goto("/admin/templates");await page.getByRole("link",{name:"مشاهده قالب",exact:true}).first().click();await expect(page.locator(".admin-guide-image").first()).toBeVisible();await source(page,".admin-guide-image",vehicleGuideAssets["front-45-right"].src);await shot(page,"admin-template-dark");
});
test("brokerage custom imagery survives while failed overrides recover to sedan defaults",async({page},info)=>{
 test.skip(info.project.name!=="customer");const settings=brokerageFixture("broker-a");settings.images.landing="/images/auth/otp-phone-shield.png";
 await page.route("**/site-bootstrap.json",r=>r.fulfill({json:{schemaVersion:1,tenantId:"broker-a",apiBaseUrl:"/api",siteSettingsEndpoint:"/api/public/site-settings",settingsSource:"api"}}));await page.route("**/api/public/site-settings",r=>r.fulfill({json:settings}));await page.goto("/");await expect(page.locator(".landing-art img")).toHaveAttribute("src",/\/images\/auth\/otp-phone-shield\.png$/);await shot(page,"tenant-custom-preserved");
 // Failed custom image: test-only intercepted failure. It must recover to this same sedan.
 await page.route("**/images/auth/otp-phone-shield.png",r=>r.fulfill({status:200,contentType:"image/png",body:"invalid test image"}));await page.reload();await source(page,".landing-art img",vehicleHeroAssets.landing);await shot(page,"tenant-fallback-sedan");
});
