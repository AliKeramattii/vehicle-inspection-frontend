import { test, expect, type Page } from "@playwright/test";
import { brokerageFixture } from "../../src/config/site-settings.defaults";
import { roleContrast, semanticColor, visibleTextContrast } from "./color-helpers";

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Admin brand acceptance includes explicit mobile/tablet viewports");
  const messages: string[] = []; errors.set(page, messages);
  page.on("pageerror", error => messages.push(error.message));
  page.on("console", message => { if (message.type() === "error") messages.push(message.text()); });
  await page.route("**/site-bootstrap.json", route => route.fulfill({ json: { schemaVersion: 1, tenantId: "demo", apiBaseUrl: "/api", siteSettingsEndpoint: "/api/public/site-settings", settingsSource: "mock" } }));
  await page.addInitScript(() => { if (!localStorage.getItem("inspection-admin-theme")) localStorage.setItem("inspection-admin-theme", "light"); });
});
test.afterEach(({ page }) => expect(errors.get(page) ?? []).toEqual([]));
async function bounded(page: Page) {
  expect(await page.evaluate(() => ({ x: document.documentElement.scrollWidth > innerWidth, y: document.documentElement.scrollHeight > innerHeight }))).toEqual({ x: false, y: false });
}
async function readable(page: Page) {
  expect((await visibleTextContrast(page)).filter(check => check.ratio + .01 < check.minimum)).toEqual([]);
  for (const check of await roleContrast(page, ".admin-root")) expect(check.ratio, check.label).toBeGreaterThanOrEqual(check.minimum);
}
const palette = { "navy-950": "rgb(0, 29, 74)", "blue-900": "rgb(1, 59, 124)", "blue-700": "rgb(2, 94, 175)", "blue-500": "rgb(5, 156, 240)", "cyan-400": "rgb(14, 221, 248)", "cyan-300": "rgb(77, 237, 249)" };

test("approved Admin palette, contrast and layout work in both themes at all target widths", async ({ page }) => {
  for (const [width, height] of [[390, 844], [768, 1024], [1440, 960]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "داشبورد", exact: true })).toBeVisible();
    for (const [name, color] of Object.entries(palette)) expect(await semanticColor(page, "--admin-" + name, ".admin-root")).toBe(color);
    for (const dark of [false, true]) {
      await page.getByRole("switch", { name: "پوسته تیره" }).setChecked(dark);
      await expect(page.locator(".admin-primary-link")).toHaveCSS("background-color", palette["blue-700"]);
      await expect(page.locator(".admin-primary-link")).toHaveCSS("color", "rgb(255, 255, 255)");
      await bounded(page); await readable(page);
    }
    await page.goto("/admin/site-settings");
    await expect(page.getByLabel("نام کارگزاری", { exact: true })).toBeVisible();
    for (const dark of [false, true]) {
      await page.getByRole("switch", { name: "پوسته تیره" }).setChecked(dark);
      await bounded(page); await readable(page);
      await expect(page.getByRole("button", { name: "ذخیره پیش‌نویس", exact: true })).toBeInViewport();
      await page.getByRole("tab", { name: "رنگ‌بندی", exact: true }).click();
      const field = page.getByLabel("رنگ اصلی", { exact: true }); await field.focus();
      await expect(field).toBeFocused();
      expect(await field.evaluate(element => getComputedStyle(element).outlineStyle)).toBe("solid");
      await readable(page);
      await page.getByRole("tab", { name: "هویت کارگزاری", exact: true }).click();
    }
  }
});

test("navy navigation supports collapse, drawer keyboard focus and existing permissions", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.locator(".admin-sidebar")).toHaveCSS("background-color", palette["navy-950"]);
  await expect(page.locator('.admin-sidebar a[aria-current="page"]')).toHaveCSS("background-color", palette["blue-700"]);
  await page.getByRole("button", { name: "جمع کردن منوی مدیریت" }).click();
  await expect(page.locator(".admin-sidebar")).toHaveCSS("width", "76px");
  await expect(page.locator(".admin-sidebar .application-logo img")).toHaveAttribute("src", "/branding/logo.webp");
  await page.getByRole("button", { name: "گسترش منوی مدیریت" }).click();
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1024 });
    for (const dark of [false, true]) {
      await page.getByRole("switch", { name: "پوسته تیره" }).setChecked(dark);
      await page.getByRole("button", { name: "باز کردن منوی مدیریت" }).focus();
      await page.keyboard.press("Enter");
      const dialog = page.getByRole("dialog", { name: "منوی مدیریت" }); await expect(dialog).toBeVisible();
      await expect(dialog).toHaveCSS("background-color", palette["navy-950"]);
      const link = dialog.getByRole("link", { name: "تنظیمات سایت", exact: true }); await link.focus();
      expect(await link.evaluate(element => getComputedStyle(element).outlineColor)).toBe(palette["cyan-400"]);
      await readable(page); await bounded(page); await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
    }
  }
});

test("tenant logos and draft colors persist independently of Admin blue through publication", async ({ page }) => {
  const settings = brokerageFixture("broker-b"); settings.theme.primary = "#fbbf24"; settings.theme.onPrimary = "#0f172b";
  await page.route("**/site-bootstrap.json", route => route.fulfill({ json: { schemaVersion: 1, tenantId: "broker-b", apiBaseUrl: "/api", siteSettingsEndpoint: "/api/public/site-settings", settingsSource: "api" } }));
  await page.route("**/api/public/site-settings", route => route.fulfill({ json: settings }));
  await page.goto("/admin/site-settings");
  await expect(page.getByLabel("نام کارگزاری", { exact: true })).toHaveValue(settings.identity.brokerageName);
  await expect(page.locator(".brokerage-mark .runtime-logo")).toHaveAttribute("src", new URL(settings.identity.logo!, page.url()).href);
  await page.getByRole("tab", { name: "رنگ‌بندی", exact: true }).click();
  await expect(page.getByLabel("رنگ اصلی", { exact: true })).toHaveValue("#fbbf24");
  for (const dark of [false, true]) {
    await page.getByRole("switch", { name: "پوسته تیره" }).setChecked(dark); await readable(page);
    await expect(page.locator(".site-settings-preview-action")).toHaveCSS("background-color", "rgb(251, 191, 36)");
  }
  await page.getByLabel("رنگ اصلی", { exact: true }).fill("#7c2d12");
  await page.getByLabel("متن روی رنگ اصلی", { exact: true }).fill("#ffffff");
  const save = page.getByRole("button", { name: "ذخیره پیش‌نویس", exact: true });
  await expect(save).toBeEnabled(); await expect(save).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(save).toHaveCSS("background-color", palette["blue-700"]);
  await expect(page.locator(".site-settings-preview-action")).toHaveCSS("background-color", "rgb(124, 45, 18)");
  await save.click(); await expect(page.getByText("پیش‌نویس محلی ذخیره شد.", { exact: true })).toBeVisible();
  await page.reload(); await page.getByRole("tab", { name: "رنگ‌بندی", exact: true }).click();
  await expect(page.getByLabel("رنگ اصلی", { exact: true })).toHaveValue("#7c2d12");
  await page.getByRole("button", { name: "انتشار تنظیمات", exact: true }).click();
  await readable(page);
  await page.getByRole("button", { name: "تأیید انتشار", exact: true }).click();
  await expect(page.getByText("نسخه منتشرشده ۲", { exact: true })).toBeVisible();
  await page.goto("/"); await expect(page.getByLabel("کد معرفی / کد ارجاع")).toBeVisible();
  // The configured API stays authoritative; local publication does not mutate its settings.
  expect(await semanticColor(page, "--color-primary")).toBe("rgb(251, 191, 36)");
  await expect(page.locator(".brokerage-mark .runtime-logo")).toHaveAttribute("src", new URL(settings.identity.logo!, page.url()).href);
  await page.goto("/reviewer"); await expect(page.locator(".reviewer-topbar")).toBeVisible();
  expect(await semanticColor(page, "--color-primary", ".reviewer-root")).toBe("rgb(251, 191, 36)");
  await page.goto("/admin"); await page.getByLabel("هویت آزمایشی").selectOption("platform-admin");
  await expect(page.locator(".admin-primary-link")).toHaveCSS("background-color", palette["blue-700"]);
});

test("semantic status, tables, errors and theme system preference remain distinct", async ({ page }) => {
  await page.goto("/admin/site-settings"); await expect(page.getByLabel("نام کارگزاری", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "رنگ‌بندی", exact: true }).click();
  await page.getByLabel("رنگ اصلی", { exact: true }).fill("#ffffff");
  await page.getByRole("button", { name: "ذخیره پیش‌نویس", exact: true }).click();
  await expect(page.getByText("کنتراست متن باید حداقل ۴٫۵ باشد.", { exact: true }).first()).toBeVisible();
  await readable(page);
  await page.goto("/admin/assignments"); await expect(page.getByRole("table", { name: "ظرفیت کارشناسان", exact: true })).toBeVisible();
  for (const dark of [false, true]) { await page.getByRole("switch", { name: "پوسته تیره" }).setChecked(dark); await readable(page); }
  await page.goto("/admin");
  const warning = page.locator('.operations-metric-CHANGES_REQUESTED>svg'), success = page.locator('.operations-metric-REVIEW_APPROVED>svg');
  await expect(warning).toHaveCSS("color", await semanticColor(page, "--admin-warning-ink", ".admin-root"));
  await expect(success).toHaveCSS("color", await semanticColor(page, "--admin-success-ink", ".admin-root"));
  await page.emulateMedia({ colorScheme: "light" }); await page.getByRole("button", { name: "استفاده از پوسته دستگاه" }).click();
  await expect(page.getByRole("switch", { name: "پوسته تیره" })).not.toBeChecked();
  await page.emulateMedia({ colorScheme: "dark" }); await expect(page.getByRole("switch", { name: "پوسته تیره" })).toBeChecked();
  await page.reload(); await expect(page.getByRole("switch", { name: "پوسته تیره" })).toBeChecked();
  await page.goto("/"); await expect(page.getByLabel("کد معرفی / کد ارجاع")).toBeVisible();
  expect(await semanticColor(page, "--color-primary")).toBe(await semanticColor(page, "--color-emerald-700"));
});
