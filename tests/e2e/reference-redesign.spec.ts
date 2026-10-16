import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { photography, snapshotReady } from "./photography-helpers";
import { submissionWorkflow } from "./submission-helpers";
const stage = process.env.REDESIGN_STAGE ?? "after", folder = ".agent/reference-review/reference-redesign/" + stage;
const mobile = [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 430, height: 932 }], desktop = [{ width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1440, height: 960 }];
async function capture(page: Page, name: string) { if (name.startsWith("reviewer"))
    await expect(page.locator(".review-shot-strip .review-evidence-loading")).toHaveCount(0);
  await mkdir(folder, { recursive: true });
  await expect(async () => snapshotReady(page)).toPass({ timeout: 15000 });
  await page.screenshot({ path: folder + "/" + name + ".png" });
  await expect.poll(() => page.evaluate(() => ({ x: document.documentElement.scrollWidth <= innerWidth, y: document.documentElement.scrollHeight <= innerHeight + 1 }))).toEqual({ x: true, y: true }); }
function diagnostics(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("response", r => { if (r.status() >= 400 && new URL(r.url()).origin === new URL(page.url()).origin)
    errors.push(r.status() + " " + new URL(r.url()).pathname);
});
  page.on("console", m => { if (m.type() === "error")
    errors.push(m.text());
});
  return errors; }
test.beforeEach(async ({ page }) => {
  await page.route("**/site-bootstrap.json", r => r.fulfill({ json: { schemaVersion: 1, tenantId: "demo", apiBaseUrl: "/api", siteSettingsEndpoint: "/api/public/site-settings", settingsSource: "mock" } }));
});
test("landing and photography candidate review", async ({ page }) => {
  const errors = diagnostics(page);
  await page.goto("/");
  for (const size of mobile) {
    await page.setViewportSize(size);
    await capture(page, "landing-" + size.width);
}
  await page.setViewportSize(mobile[1]);
  await photography(page, 7);
  for (const size of mobile) {
    await page.setViewportSize(size);
    await capture(page, "photography-" + size.width);
    const image = await page.locator(".vehicle-photo-artwork .photography-image").boundingBox(), controls = await page.locator(".vehicle-photo-controls").boundingBox();
    expect(controls!.y).toBeGreaterThanOrEqual(image!.y + image!.height);
    for (const button of await page.locator(".vehicle-photo-controls button").all()) {
        const b = await button.boundingBox();
        expect(b!.width).toBeGreaterThanOrEqual(44);
        expect(b!.height).toBeGreaterThanOrEqual(44);
    }
}
  await expect(page.locator(".vehicle-photo-marker").first()).toBeEnabled();
  await page.setViewportSize(mobile[1]);
  await page.locator(".photography-shot-carousel").scrollIntoViewIfNeeded();
  await capture(page, "photography-navigation-390");
  if (stage !== "before") {
    await photography(page, 0);
    await capture(page, "photography-empty-390");
    await page.locator(".photography-shot-carousel").scrollIntoViewIfNeeded();
    await capture(page, "photography-empty-navigation-390");
}
  expect(errors).toEqual([]);
});
test("site settings candidate review", async ({ page }) => {
  const errors = diagnostics(page);
  await page.goto("/admin/site-settings");
  await expect(page.getByLabel("نام کارگزاری")).toBeVisible();
  for (const size of desktop) {
    await page.setViewportSize(size);
    await capture(page, "settings-" + size.width);
}
  await page.getByRole("tab", { name: "تصاویر", exact: true }).click();
  await capture(page, "settings-images-1440");
  await page.getByRole("tab", { name: "هویت کارگزاری", exact: true }).click();
  await page.getByRole("switch", { name: "پوسته تیره" }).check();
  await capture(page, "settings-dark-1440");
  if (stage !== "before") {
    await page.getByLabel("نام کارگزاری", { exact: true }).fill("کارگزاری آزمایشی بیمه و خدمات بازدید خودرو");
    await expect(page.locator(".settings-preview-brand")).toContainText("کارگزاری آزمایشی بیمه و خدمات بازدید خودرو");
    await page.getByRole("button", { name: "ذخیره پیش‌نویس", exact: true }).click();
    await expect(page.getByText("پیش‌نویس محلی ذخیره شد.", { exact: true })).toBeVisible();
    await page.getByRole("tab", { name: "هویت کارگزاری", exact: true }).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("tab", { name: "رنگ‌بندی", exact: true })).toBeFocused();
    await expect(page.getByLabel("رنگ اصلی", { exact: true })).toBeVisible();
}
  expect(errors).toEqual([]);
});
test("reviewer evidence candidate review", async ({ page }) => {
  const errors = diagnostics(page);
  await submissionWorkflow(page);
  await page.getByRole("button", { name: "ارسال برای بررسی", exact: true }).click();
  await expect(page).toHaveURL(/submitted$/);
  await page.goto("/admin/assignments");
  await page.getByLabel("ارجاع BDI-8F31K2", { exact: true }).selectOption("reviewer-demo");
  await expect(page.getByLabel("ارجاع BDI-8F31K2", { exact: true }).locator("xpath=ancestor::tr").locator("td").nth(3)).toHaveText("علی محمدی");
  await page.goto("/reviewer");
  await page.getByRole("link", { name: "مشاهده پرونده" }).click();
  await expect(page.getByRole("button", { name: "درخواست ثبت مجدد", exact: true })).toBeVisible();
  for (const size of desktop) {
    await page.setViewportSize(size);
    await capture(page, "reviewer-" + size.width);
}
  await page.getByRole("switch", { name: "پوسته تیره" }).check();
  await capture(page, "reviewer-dark-1440");
  if (stage !== "before") {
    await expect(page.getByRole("button", { name: "تأیید مدرک", exact: true })).toBeInViewport();
    await page.getByRole("button", { name: "اطلاعات پرونده", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("تاریخچه تصمیم‌ها");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "مدرک بعدی", exact: true }).click();
    await page.getByRole("button", { name: "تصویر تار است.", exact: true }).click();
    await page.getByRole("button", { name: "درخواست ثبت مجدد", exact: true }).click();
    await expect(page.getByText("تصمیم این نسخه ثبت شد. برای ادامه، مدرک بعدی را انتخاب کنید.", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "مدرک بعدی", exact: true }).click();
    await page.getByRole("button", { name: "تأیید مدرک", exact: true }).click();
    await expect(page.getByText("تصمیم این نسخه ثبت شد. برای ادامه، مدرک بعدی را انتخاب کنید.", { exact: true })).toBeVisible();
}
  expect(errors).toEqual([]);
});
test("small and keyboard viewports preserve the start task", async ({ page }) => {
  await page.goto("/");
  for (const size of [{ width: 320, height: 740 }, { width: 390, height: 500 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(size);
    const input = page.getByRole("textbox", { name: "کد معرفی / کد ارجاع" });
    await input.focus();
    await input.fill("A4K9P2");
    await expect(input).toBeFocused();
    await expect(page.getByRole("button", { name: "شروع بازدید", exact: true })).toBeInViewport();
    await capture(page, "landing-keyboard-" + size.width + "x" + size.height);
} });
