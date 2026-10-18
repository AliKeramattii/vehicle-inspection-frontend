import { test, expect, type Page } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import { chooseDemoLocation } from "./location-helpers";
import { submissionWorkflow } from "./submission-helpers";
import { brokerageFixture } from "../../src/config/site-settings.defaults";

const folder = ".agent/reference-review/application-logo";
const mobile = [[360, 800], [390, 844], [430, 932]] as const;
const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== "customer", "Shared logo tour sets its mobile and desktop viewports explicitly");
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("requestfailed", request => { if (new URL(request.url()).pathname === "/branding/logo.webp") errors.push("Application logo request failed"); });
  await mkdir(folder, { recursive: true });
  await page.route("**/site-bootstrap.json", route => route.fulfill({ json: { schemaVersion: 1, tenantId: "demo", apiBaseUrl: "/api", siteSettingsEndpoint: "/api/public/site-settings", settingsSource: "mock" } }));
});
test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([]);
});
async function logo(page: Page) {
  const images = page.locator(".application-logo img");
  await expect(images.first()).toBeVisible();
  for (const image of await images.all()) {
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("src", "/branding/logo.webp");
    await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBe(1254);
    await image.evaluate(node => (node as HTMLImageElement).decode());
    await expect.poll(() => image.evaluate(node => node.getBoundingClientRect().width)).toBeGreaterThanOrEqual(30);
    const result = await image.evaluate(node => {
      const image = node as HTMLImageElement, box = image.getBoundingClientRect();
      const frame = image.parentElement!.getBoundingClientRect(), style = getComputedStyle(image);
      return { naturalHeight: image.naturalHeight, width: box.width, height: box.height, frameWidth: frame.width, frameHeight: frame.height,
        contained: box.left >= frame.left - 1 && box.right <= frame.right + 1 && box.top >= frame.top - 1 && box.bottom <= frame.bottom + 1,
        fit: style.objectFit, filter: style.filter, mask: style.maskImage, transform: style.transform };
    });
    expect(result.naturalHeight).toBe(1254);
    expect(result.width).toBeGreaterThanOrEqual(30);
    expect(result.width).toBeLessThanOrEqual(46);
    expect(result.width).toBeCloseTo(result.height, 1);
    expect(result.frameWidth).toBeCloseTo(result.frameHeight, 1);
    expect(result).toMatchObject({ contained: true, fit: "contain", filter: "none", mask: "none", transform: "none" });
  }
  const overlap = await page.locator(".co-branding").evaluateAll(groups => groups.some(group => {
    const a = group.querySelector(".application-logo")?.getBoundingClientRect(), b = group.querySelector(".brokerage-mark")?.getBoundingClientRect();
    return a && b && Math.min(a.right, b.right) > Math.max(a.left, b.left) && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top);
  }));
  expect(overlap).toBe(false);
}
async function shot(page: Page, name: string) {
  await page.evaluate(() => document.fonts.ready);
  await logo(page);
  expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([page.viewportSize()!.width, page.viewportSize()!.height]);
  await page.screenshot({ path: folder + "/" + name + ".png" });
}
test("exact public logo loads across the customer journey and mobile sizes", async ({ page, request }) => {
  const response = await request.get("/branding/logo.webp");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/webp");
  expect((await response.body()).equals(await readFile("public/branding/logo.webp"))).toBe(true);
  await page.goto("/");
  for (const [width, height] of mobile) {
    await page.setViewportSize({ width, height });
    await expect(page.locator(".entry-branding")).toHaveCSS("height", "64px");
    await shot(page, "customer-landing-" + width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel("کد معرفی / کد ارجاع").fill("A4K9P2");
  await page.getByRole("button", { name: "شروع بازدید" }).click();
  await shot(page, "customer-otp-390");
  await page.getByLabel("کد تأیید پنج‌رقمی").fill("12345");
  await expect(page.getByRole("button", { name: "همه چیز آماده است" })).toBeEnabled();
  await shot(page, "customer-readiness-390");
  await page.getByRole("button", { name: "همه چیز آماده است" }).click();
  await shot(page, "customer-consent-390");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await logo(page);
  await chooseDemoLocation(page);
  await page.getByRole("button", { name: "تأیید این موقعیت" }).click();
  await logo(page);
  await page.getByRole("button", { name: "تأیید مشخصات و ادامه" }).click();
  await expect(page).toHaveURL(/capture$/);
  for (const [width, height] of mobile) {
    await page.setViewportSize({ width, height });
    await shot(page, "customer-photography-" + width);
  }
});
test("upload, summary, receipt and reviewer evidence keep the shared logo", async ({ page }) => {
  await submissionWorkflow(page);
  await shot(page, "customer-final-summary-390");
  await page.getByRole("link", { name: "مرکز ارسال آمادگی ارسال" }).click();
  await shot(page, "customer-upload-390");
  await page.goBack();
  await page.getByRole("button", { name: "ارسال برای بررسی", exact: true }).click();
  await expect(page).toHaveURL(/submitted$/);
  await shot(page, "customer-receipt-390");
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/admin/assignments");
  await page.getByLabel("ارجاع BDI-8F31K2", { exact: true }).selectOption("reviewer-demo");
  await page.goto("/reviewer");
  await expect(page.locator(".reviewer-topbar")).toHaveCSS("height", "72px");
  await shot(page, "reviewer-queue-1440");
  await page.getByRole("link", { name: "مشاهده پرونده" }).click();
  await expect(page.locator(".review-thumbnail img").first()).toBeVisible();
  await shot(page, "reviewer-evidence-1440");
  await page.getByRole("switch", { name: "پوسته تیره" }).check();
  await shot(page, "reviewer-evidence-dark-1440");
});
test("Admin light and dark headers preserve geometry and the settings preview uses the default logo", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/admin");
  await expect(page.locator(".admin-brand")).toHaveCSS("height", "72px");
  await expect(page.locator(".admin-topbar")).toHaveCSS("height", "68px");
  await shot(page, "admin-light-1440");
  await page.getByRole("switch", { name: "پوسته تیره" }).check();
  await shot(page, "admin-dark-1440");
  await page.goto("/admin/site-settings");
  await expect(page.getByLabel("نام کارگزاری")).toBeVisible();
  await logo(page);
  await page.getByRole("button", { name: "پیش‌نمایش", exact: true }).click();
  await expect(page.getByRole("dialog").locator('.application-logo img')).toHaveAttribute("src", "/branding/logo.webp");
});
test("a configured brokerage logo remains independent of the application identity", async ({ page }) => {
  const settings = brokerageFixture("broker-a");
  await page.route("**/site-bootstrap.json", route => route.fulfill({ json: { schemaVersion: 1, tenantId: "broker-a", apiBaseUrl: "/api", siteSettingsEndpoint: "/api/public/site-settings", settingsSource: "api" } }));
  await page.route("**/api/public/site-settings", route => route.fulfill({ json: settings }));
  await page.goto("/");
  await logo(page);
  await expect(page.locator(".brokerage-mark .runtime-logo")).toHaveAttribute("src", new URL(settings.identity.logo!, page.url()).href);
  await expect(page.locator(".brokerage-mark")).toContainText(settings.identity.brokerageName);
  await page.reload();
  await logo(page);
  await expect(page.locator(".brokerage-mark .runtime-logo")).toHaveAttribute("src", new URL(settings.identity.logo!, page.url()).href);
  await shot(page, "brokerage-custom-logo-390");
});
