import {test,expect,type Page} from "@playwright/test";
import {brokerageFixture} from "../../src/config/site-settings.defaults";
import {enterPhotography,snapshotReady} from "./photography-helpers";
async function brokerage(page:Page,id:"broker-a"|"broker-b") {
  const api=id==="broker-a"?"/api":"https://api.broker-b.example/api";
  await page.route("**/site-bootstrap.json",route=>route.fulfill({json:{schemaVersion:1,tenantId:id,apiBaseUrl:api,siteSettingsEndpoint:api+"/public/site-settings",settingsSource:"api"}}));
  await page.route(api.startsWith("/")?"**/api/public/site-settings":api+"/public/site-settings",route=>route.fulfill({json:brokerageFixture(id,api),headers:{"access-control-allow-origin":"*","cache-control":"no-store"}}));
}
async function overflow(page:Page) {expect(await page.evaluate(()=>({x:document.documentElement.scrollWidth>innerWidth,y:document.documentElement.scrollHeight>innerHeight}))).toEqual({x:false,y:false});}
test("two brokerage deployments load their own identity, colors, image and configured API",async({context},info)=>{
  test.skip(info.project.name!=="customer");
  for(const id of ["broker-a","broker-b"] as const) {
    const own=await context.browser()!.newContext({viewport:{width:390,height:844},reducedMotion:"reduce"}),tab=await own.newPage();
    try {
    const errors:string[]=[];tab.on("pageerror",e=>errors.push(e.message));
    const urls:string[]=[];tab.on("request",r=>{if(r.url().includes("/public/site-settings"))urls.push(r.url());});
    await brokerage(tab,id);await tab.goto(info.project.use.baseURL! as string);
    await expect(tab.locator(".entry-branding .brokerage-mark")).toContainText(id==="broker-a"?"کارگزاری آبی":"کارگزاری سبز");
    expect(new URL((await tab.locator(".landing-art img").getAttribute("src"))!,tab.url()).pathname).toBe(brokerageFixture(id).images.landing);
    expect(await tab.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue("--brand-primary"))).toBe(id==="broker-a"?"#2563EB":"#047857");
    expect(urls).toContain(id==="broker-a"?(info.project.use.baseURL as string)+"/api/public/site-settings":"https://api.broker-b.example/api/public/site-settings");
    await snapshotReady(tab);await expect(tab).toHaveTitle(brokerageFixture(id).identity.appTitle);await overflow(tab);expect(errors).toEqual([]);await expect(tab).toHaveScreenshot(id+"-landing.png");
    } finally { await own.close(); }
  }
});
test("configuration failure never falls back to another brokerage and retry recovers",async({page},info)=>{
  test.skip(info.project.name!=="customer");let broken=true;
  await page.route("**/site-bootstrap.json",r=>r.fulfill({json:{schemaVersion:1,tenantId:"broker-b",apiBaseUrl:"/api",siteSettingsEndpoint:"/api/public/site-settings",settingsSource:"api"}}));
  await page.route("**/api/public/site-settings",r=>r.fulfill({json:brokerageFixture(broken?"broker-a":"broker-b")}));
  await page.goto("/");await expect(page.getByRole("heading",{name:"تنظیمات سایت بارگذاری نشد"})).toBeVisible();
  await expect(page.locator(".landing-screen")).toHaveCount(0);broken=false;await page.getByRole("button",{name:"تلاش مجدد"}).click();
  await expect(page.locator(".entry-branding .brokerage-mark")).toContainText("کارگزاری سبز");
});
test("a changed tenant on an existing origin is blocked without deleting durable data",async({page},info)=>{
  test.skip(info.project.name!=="customer");await brokerage(page,"broker-a");await page.goto("/");
  await expect(page.locator(".entry-branding .brokerage-mark")).toContainText("کارگزاری آبی");
  await page.evaluate(()=>new Promise<void>((resolve,reject)=>{
    const open=indexedDB.open("inspection-photos",1);
    open.onupgradeneeded=()=>{if(!open.result.objectStoreNames.contains("photos"))open.result.createObjectStore("photos",{keyPath:"key"});};
    open.onerror=()=>reject(open.error);
    open.onsuccess=()=>{const db=open.result,tx=db.transaction("photos","readwrite");
      tx.objectStore("photos").put({key:"preserve-white-label",namespace:"preserve-white-label",requirementId:"sentinel",status:"completed",blob:new Blob(["accepted photo"],{type:"image/png"})});
      tx.oncomplete=()=>{db.close();resolve();};tx.onabort=()=>{db.close();reject(tx.error);};};
  }));
  await page.unrouteAll();await brokerage(page,"broker-b");await page.reload();
  await expect(page.getByText(/این نشانی قبلاً به نصب دیگری متصل شده است/)).toBeVisible();
  expect(await page.evaluate(()=>new Promise<number>((resolve,reject)=>{
    const open=indexedDB.open("inspection-photos",1);open.onerror=()=>reject(open.error);
    open.onsuccess=()=>{const db=open.result,tx=db.transaction("photos","readonly"),read=tx.objectStore("photos").get("preserve-white-label");let size=0;
      read.onsuccess=()=>{size=read.result?.blob?.size??0;};tx.oncomplete=()=>{db.close();resolve(size);};tx.onabort=()=>{db.close();reject(tx.error);};};
  }))).toBe(14);
  await expect(page.locator(".landing-screen")).toHaveCount(0);
});
test("query parameters cannot replace deployment API configuration",async({page},info)=>{
  test.skip(info.project.name!=="customer");const dangerous:string[]=[];page.on("request",r=>{if(r.url().startsWith("https://evil.example"))dangerous.push(r.url());});
  await page.goto("/?apiBaseUrl=https%3A%2F%2Fevil.example%2Fapi&tenantId=evil");
  await expect(page.getByRole("textbox",{name:"کد معرفی / کد ارجاع"})).toBeVisible();expect(dangerous).toEqual([]);
});
test("failed brokerage image falls back while preserving its frame",async({page},info)=>{
  test.skip(info.project.name!=="customer");await brokerage(page,"broker-b");await page.route("**/assets/inspection-vehicle/hero/readiness-vehicle.webp",r=>r.abort());
  await page.goto("/");await expect(page.locator(".landing-art img")).toHaveAttribute("src",/_next\/image.*landing-vehicle/);await overflow(page);
});
for(const viewport of [{width:360,height:800},{width:390,height:844},{width:430,height:932}])test("brokerage customer workflow and viewport "+viewport.width,async({page},info)=>{
  test.skip(info.project.name!=="customer");await page.setViewportSize(viewport);await brokerage(page,"broker-b");await page.goto("/");
  await enterPhotography(page);await expect(page).toHaveTitle(brokerageFixture("broker-b").identity.appTitle);await expect(page.locator(".vehicle-photo-controls")).toBeVisible();
  const image=await page.locator(".vehicle-photo-scene .photography-image").boundingBox(),controls=await page.locator(".vehicle-photo-controls").boundingBox();
  expect(controls!.y).toBeGreaterThanOrEqual(image!.y+image!.height);await overflow(page);
});
test("Site Settings save, preview, publication and reset survive refresh",async({page},info)=>{
  test.skip(info.project.name!=="desktop");await page.goto("/admin/branding");
  await page.locator(".admin-main").getByRole("link",{name:"تنظیمات سایت",exact:true}).click();await expect(page.getByRole("heading",{name:"تنظیمات سایت",exact:true})).toBeVisible();
  await page.getByRole("tab",{name:"تنظیمات عمومی",exact:true}).click();
  await page.getByLabel("نمایش پشتیبانی").uncheck();
  await page.getByRole("tab",{name:"هویت کارگزاری",exact:true}).click();
  await page.getByLabel("نام کارگزاری",{exact:true}).fill("کارگزاری نمونه جدید");
  await page.getByRole("button",{name:"پیش‌نمایش",exact:true}).click();await expect(page.getByRole("dialog")).toContainText("کارگزاری نمونه جدید");
  await page.getByRole("button",{name:"بستن پیش‌نمایش"}).click();await page.getByRole("button",{name:"ذخیره پیش‌نویس",exact:true}).click();
  await expect(page.getByText("پیش‌نویس محلی ذخیره شد.")).toBeVisible();await page.reload();
  await expect(page.getByLabel("نام کارگزاری",{exact:true})).toHaveValue("کارگزاری نمونه جدید");
  await page.getByRole("button",{name:"انتشار تنظیمات",exact:true}).click();await page.getByRole("button",{name:"تأیید انتشار",exact:true}).click();
  await expect(page.getByText("نسخه منتشرشده ۲",{exact:true})).toBeVisible();
  await page.goto("/");await expect(page.locator(".entry-branding .brokerage-mark")).toContainText("کارگزاری نمونه جدید");await expect(page.locator("#support")).toHaveCount(0);
  await page.goto("/admin/site-settings");await page.getByLabel("نام کارگزاری",{exact:true}).fill("پیش‌نویس دیگری");await page.getByRole("button",{name:"ذخیره پیش‌نویس",exact:true}).click();
  await page.getByRole("button",{name:"بازگردانی پیش‌نویس"}).click();await expect(page.getByLabel("نام کارگزاری",{exact:true})).toHaveValue("کارگزاری نمونه جدید");
});
test("Site Settings validation, role checks and unverified storage status",async({page},info)=>{
  test.skip(info.project.name!=="desktop");await page.goto("/admin/site-settings");
  await page.getByRole("tab",{name:"رنگ‌بندی",exact:true}).click();await page.getByLabel("رنگ اصلی",{exact:true}).fill("#FFFFFF");await page.getByRole("button",{name:"ذخیره پیش‌نویس",exact:true}).click();
  await expect(page.getByText("کنتراست متن باید حداقل ۴٫۵ باشد.",{exact:true}).first()).toBeVisible();
  await page.getByRole("tab",{name:"فضای ذخیره‌سازی",exact:true}).click();await expect(page.getByText("بررسی نشده؛ اطلاعات سلامت از ASP.NET دریافت نشده است.")).toBeVisible();
  await page.getByLabel("هویت آزمایشی").selectOption("viewer");await page.getByRole("button",{name:"ادامه بدون ذخیره"}).click();
  await page.getByRole("tab",{name:"هویت کارگزاری",exact:true}).click();await expect(page.getByLabel("نام کارگزاری",{exact:true})).toBeDisabled();
});
for(const viewport of [{width:1440,height:960},{width:1280,height:800},{width:1024,height:768}])test("Site Settings desktop viewport "+viewport.width,async({page},info)=>{
  test.skip(info.project.name!=="desktop");await page.setViewportSize(viewport);await page.goto("/admin/site-settings");await expect(page.getByLabel("نام کارگزاری",{exact:true})).toBeVisible();await overflow(page);await expect(page.getByRole("button",{name:"پیش‌نمایش",exact:true})).toBeInViewport();if(viewport.width===1440){await page.evaluate(()=>document.fonts.ready);await expect(page).toHaveScreenshot("admin-site-settings.png");}
});

test("runtime title and favicon survive late route metadata",async({page},info)=>{
  test.skip(info.project.name!=="customer");
  await brokerage(page,"broker-a");
  const settings=brokerageFixture("broker-a");settings.identity.favicon="/icons/security/shield.svg";
  await page.route("**/api/public/site-settings",r=>r.fulfill({json:settings}));
  await page.goto("/");
  await expect(page.locator(".entry-branding .brokerage-mark")).toContainText("کارگزاری آبی");
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href","/icons/security/shield.svg");
  await page.evaluate(()=>{document.title="Route metadata";document.querySelector<HTMLLinkElement>('link[rel="icon"]')!.href="/favicon.ico";});
  await expect(page).toHaveTitle(settings.identity.appTitle);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href","/icons/security/shield.svg");
  await enterPhotography(page);
  await expect(page).toHaveTitle(settings.identity.appTitle);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href","/icons/security/shield.svg");
});
