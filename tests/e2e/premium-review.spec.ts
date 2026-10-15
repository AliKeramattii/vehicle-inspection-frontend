import {test,expect} from "@playwright/test";
import {mkdir} from "node:fs/promises";
import {photography,snapshotReady} from "./photography-helpers";
import {submissionWorkflow} from "./submission-helpers";
test.beforeEach(async({page})=>{await page.route("**/site-bootstrap.json",r=>r.fulfill({json:{schemaVersion:1,tenantId:"demo",apiBaseUrl:"/api",siteSettingsEndpoint:"/api/public/site-settings",settingsSource:"mock"}}));});
const stage=process.env.PREMIUM_STAGE??"after",folder=".agent/reference-review/premium/"+stage;
test("representative application visual review",async({page})=>{
 await mkdir(folder,{recursive:true});
 const shot=async(name:string)=>{await page.evaluate(()=>document.fonts.ready);await page.locator(".application-logo img").evaluateAll(images=>Promise.all(images.map(image=>(image as HTMLImageElement).decode())));await page.screenshot({path:folder+"/"+name+".png"});};
 await page.goto("/");await expect(page.getByLabel("کد معرفی / کد ارجاع")).toBeVisible();await shot("landing-390");
 await page.getByLabel("کد معرفی / کد ارجاع").fill("A4K9P2");await page.getByRole("button",{name:"شروع بازدید"}).click();await expect(page.getByLabel("کد تأیید پنج‌رقمی")).toBeVisible();await shot("otp-390");await page.getByLabel("کد تأیید پنج‌رقمی").fill("12345");await expect(page.getByRole("button",{name:"همه چیز آماده است"})).toBeEnabled();await shot("readiness-390");
 await photography(page,7);await snapshotReady(page);await shot("photography-390");
 await page.locator(".photography-overview .shot-card").first().count();
 await submissionWorkflow(page);await shot("summary-390");await page.getByRole("button",{name:"ارسال برای بررسی",exact:true}).click();await expect(page).toHaveURL(/submitted$/);await shot("receipt-390");
 await page.setViewportSize({width:1440,height:960});await page.goto("/admin");await expect(page.getByRole("heading",{name:"داشبورد",exact:true})).toBeVisible();await shot("admin-dashboard-1440");await page.goto("/admin/site-settings");await expect(page.getByLabel("نام کارگزاری")).toBeVisible();await shot("admin-settings-1440");
 if(stage==="before")await page.getByLabel("پوسته مدیریت").selectOption("dark");else await page.getByRole("switch",{name:"پوسته تیره"}).check();await shot("admin-dark-1440");
 await page.goto("/admin/assignments");await page.getByLabel("ارجاع BDI-8F31K2",{exact:true}).selectOption("reviewer-demo");await expect(page.getByLabel("ارجاع BDI-8F31K2",{exact:true}).locator("xpath=ancestor::tr").locator("td").nth(3)).toHaveText("علی محمدی");await page.goto("/reviewer");await expect(page.getByRole("link",{name:"مشاهده پرونده"})).toBeVisible();await shot("reviewer-queue-1440");await page.getByRole("link",{name:"مشاهده پرونده"}).click();await expect(page.getByRole("button",{name:"درخواست ثبت مجدد",exact:true})).toBeVisible();if(stage!=="before")await expect(page.locator(".review-thumbnail img").first()).toBeVisible();await shot("reviewer-evidence-1440");
});
