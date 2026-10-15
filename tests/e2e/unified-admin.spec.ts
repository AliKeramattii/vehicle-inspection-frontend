import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const folder = ".agent/reference-review/unified";
test("eight local image slots publish and recover after refresh; theme and authorization persist", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await mkdir(folder, { recursive: true }); await page.goto("/admin/site-settings");
  await expect(page.getByRole("heading", { name: "تنظیمات سایت", exact: true })).toBeVisible();
  await page.getByRole("button", {name:"باز کردن منوی مدیریت"}).click();
  await expect(page.getByRole("dialog").getByRole("link", { name: "تنظیمات سایت" })).toBeVisible();
  await page.getByRole("dialog").getByRole("button",{name:"بستن",exact:true}).click();
  await expect(page.getByLabel("انتخاب فایل لوگوی کارگزاری")).toHaveCount(1);
  await expect(page.getByLabel("انتخاب فایل فاویکن")).toHaveCount(1);
  await page.getByLabel("انتخاب فایل لوگوی کارگزاری").setInputFiles("public/images/auth/landing-suv.png");
  await expect(page.getByLabel("نشانی لوگوی کارگزاری")).toHaveValue(/\/__local-branding\/demo\//);
  const icon = Buffer.from(await page.evaluate(() => { const canvas = document.createElement("canvas"); canvas.width = canvas.height = 32; canvas.getContext("2d")!.fillRect(0,0,32,32); return canvas.toDataURL("image/png").split(",")[1]; }), "base64");
  await page.getByLabel("انتخاب فایل فاویکن").setInputFiles({ name: "favicon.png", mimeType: "image/png", buffer: icon });
  await expect(page.getByLabel("نشانی فاویکن")).toHaveValue(/\/__local-branding\/demo\//);
  await page.getByRole("tab", { name: "تصاویر", exact: true }).click();
  for (const label of ["تصویر شروع","تصویر معرفی","تصویر تأیید موبایل","تصویر آمادگی","تصویر حریم خصوصی"]) {
    await page.getByLabel("انتخاب فایل " + label).setInputFiles("public/images/auth/landing-suv.png");
    await expect(page.getByLabel("نشانی " + label)).toHaveValue(/\/__local-branding\/demo\//);
  }
  await expect(page.locator('input[type="file"]')).toHaveCount(6);
  await page.getByLabel("انتخاب فایل تصویر ارسال موفق و انتظار کارشناس").setInputFiles("public/images/auth/landing-suv.png");
  await expect(page.getByLabel("نشانی تصویر ارسال موفق و انتظار کارشناس")).toHaveValue(/\/__local-branding\/demo\//);
  await page.getByRole("button", { name: "ذخیره پیش‌نویس", exact: true }).click();
  await expect(page.getByText("پیش‌نویس محلی ذخیره شد.")).toBeVisible();
  await page.getByRole("button", { name: "انتشار تنظیمات", exact: true }).click();
  await page.getByRole("button", { name: "تأیید انتشار", exact: true }).click();
  await expect(page.getByText("تنظیمات نمونه منتشر شد.")).toBeVisible();
  await expect(page.locator(".runtime-logo")).toHaveAttribute("src", /^blob:/);
  await page.getByRole("switch", { name: "پوسته تیره" }).check();
  await expect(page.locator("html")).toHaveAttribute("data-admin-theme", "dark");
  await page.reload();
  await expect(page.getByRole("switch", {name:"پوسته تیره"})).toBeChecked();
  await expect(page.locator(".runtime-logo")).toHaveAttribute("src", /^blob:/);
  await page.getByRole("tab", { name: "تصاویر", exact: true }).click();
  const references: string[] = [];
  for (const label of ["تصویر شروع","تصویر معرفی","تصویر تأیید موبایل","تصویر آمادگی","تصویر حریم خصوصی","تصویر ارسال موفق و انتظار کارشناس"]) {
    const field = page.getByLabel("نشانی " + label); await expect(field).toHaveValue(/\/__local-branding\/demo\//); references.push(await field.inputValue());
  }
  expect(new Set(references).size).toBe(6);
  for (const [width, height] of [[360,800],[390,844],[430,932],[1440,960]]) {
    await page.setViewportSize({ width, height });
    await page.screenshot({ path: folder + "/admin-settings-dark-" + width + ".png" });
    expect(await page.evaluate(() => [document.documentElement.scrollWidth,document.documentElement.scrollHeight])).toEqual([width,height]);
  }
  await page.getByLabel("هویت آزمایشی").selectOption("reviewer");
  await expect(page.getByText("تنظیمات سایت فقط برای مدیر سایت در دسترس است.")).toBeVisible();
  await expect(page.locator(".admin-sidebar,.admin-mobile-nav").getByRole("link", { name: "تنظیمات سایت" })).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("تنظیمات سایت فقط برای مدیر سایت در دسترس است.")).toBeVisible();
  expect(errors).toEqual([]);
});
import { submissionWorkflow } from "./submission-helpers";
test("published local receipt illustration survives submission and refresh", async ({ page }) => {
  await page.goto("/admin/site-settings");
  await page.getByRole("tab", { name: "تصاویر", exact: true }).click();
  await page.getByLabel("انتخاب فایل تصویر ارسال موفق و انتظار کارشناس").setInputFiles("public/images/auth/landing-suv.png");
  await expect(page.getByLabel("نشانی تصویر ارسال موفق و انتظار کارشناس")).toHaveValue(/\/__local-branding\/demo\//);
  await page.getByRole("button", { name: "ذخیره پیش‌نویس", exact: true }).click(); await expect(page.getByText("پیش‌نویس محلی ذخیره شد.")).toBeVisible();
  await page.getByRole("button", { name: "انتشار تنظیمات", exact: true }).click(); await page.getByRole("button", { name: "تأیید انتشار", exact: true }).click(); await expect(page.getByText("تنظیمات نمونه منتشر شد.")).toBeVisible();
  await submissionWorkflow(page);
  await expect(page.locator(".inspection-journey-header")).not.toContainText("BDI-8F31K2");
  await page.getByRole("button", { name: "ارسال برای بررسی", exact: true }).click(); await expect(page).toHaveURL(/submitted$/);
  await expect(page.locator(".receipt-hero")).toHaveAttribute("src", /^blob:/); await expect(page.getByText("BDI-8F31K2", { exact: true })).toBeVisible();
  for (const [width,height] of [[360,800],[390,844],[430,932]]) {
    await page.setViewportSize({width,height}); await page.screenshot({path:folder+"/receipt-custom-"+width+".png"});
    expect(await page.evaluate(() => [document.documentElement.scrollWidth,document.documentElement.scrollHeight])).toEqual([width,height]);
  }
  await page.reload(); await expect(page.locator(".receipt-hero")).toHaveAttribute("src", /^blob:/);
  await expect(page.getByRole("heading", { name: "بازدید با موفقیت ارسال شد" })).toBeVisible();
});
test("dark theme covers Admin routes, dialogs, tables and assigned reviewer workspace", async ({ page }) => {
  await page.setViewportSize({width:1440,height:960}); await page.goto("/admin"); await page.getByRole("switch", { name: "پوسته تیره" }).check();
  for (const route of ["/admin","/admin/templates","/admin/templates/body-image-guided","/admin/branding","/admin/policies","/admin/webhooks","/admin/assignments","/admin/users","/admin/permissions"]) {
    await page.goto(route); await expect(page.locator("html")).toHaveAttribute("data-admin-theme","dark");
    await expect(page.locator(".admin-root")).toHaveCSS("background-color","rgb(15, 23, 42)");
    const panel = page.locator(".admin-panel").first(); if (await panel.isVisible()) await expect(panel).toHaveCSS("background-color","rgb(23, 34, 52)");
  }
  await submissionWorkflow(page); await page.getByRole("button",{name:"ارسال برای بررسی",exact:true}).click(); await expect(page).toHaveURL(/submitted$/);
  await page.goto("/admin/assignments"); await page.getByRole("combobox",{name:"ارجاع BDI-8F31K2"}).selectOption("reviewer-demo");
  await page.goto("/reviewer/cases/insp_demo"); await expect(page.getByRole("button",{name:"درخواست ثبت مجدد",exact:true})).toBeVisible();
  await expect(page.locator(".reviewer-root")).toHaveCSS("background-color","rgb(15, 23, 42)");
  await expect(page.locator(".review-facts>section").first()).toHaveCSS("background-color","rgb(23, 34, 52)");
  await page.getByRole("textbox",{name:"دلیل درخواست ثبت مجدد"}).fill("پلاک خوانا نیست.");
  await page.screenshot({path:folder+"/reviewer-workspace-dark-1440.png"});
  await page.getByRole("button",{name:"درخواست ثبت مجدد",exact:true}).click(); await expect(page.getByText("نیاز به مدرک تکمیلی",{exact:true})).toBeVisible();
  await page.getByRole("combobox",{name:"کارشناس نمونه"}).selectOption("reviewer-sara"); await expect(page.getByText("این پرونده در صف شما نیست.")).toBeVisible();
});