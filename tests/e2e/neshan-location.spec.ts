
import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { defaultSiteSettings } from "../../src/config/site-settings.defaults";
import { defaultLocationMap } from "../../src/config/site-settings.schema";
import { chooseDemoLocation, demoLocationAddress } from "./location-helpers";
import { submissionWorkflow } from "./submission-helpers";

const renders = ".agent/reference-review/neshan";
const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  await mkdir(renders, { recursive: true });
  const found: string[] = []; errors.set(page, found);
  page.on("pageerror", error => found.push(error.message));
  page.on("console", message => { if (message.type() === "error") found.push(message.text()); });
});
test.afterEach(({ page }) => expect(errors.get(page)).toEqual([]));
async function enter(page: Page) {
  await page.goto("/");
  await page.getByRole("textbox", { name: "کد معرفی / کد ارجاع" }).fill("A4K9P2");
  await page.getByRole("button", { name: "شروع بازدید" }).click();
  await page.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" }).fill("12345");
  await page.getByRole("button", { name: "همه چیز آماده است" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(page).toHaveURL(/\/location$/);
  await expect(page.getByRole("heading", { name: "موقعیت خودرو را مشخص کنید" })).toBeVisible();
}
async function bounded(page: Page) {
  expect(await page.evaluate(() => ({ height: document.documentElement.scrollHeight, width: document.documentElement.scrollWidth })))
    .toEqual({ height: page.viewportSize()!.height, width: page.viewportSize()!.width });
  const box = await page.getByRole("button", { name: "تأیید این موقعیت" }).boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44); expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
}
async function shot(page: Page, name: string) { await page.evaluate(() => document.fonts.ready); await page.screenshot({ path: renders + "/" + name + ".png" }); }
async function configureMap(page: Page, reverse: "mock" | "api" = "mock") {
  const settings = defaultSiteSettings("demo");
  settings.application.locationMap = { ...defaultLocationMap(), webMapKey: "web.fixture-not-a-real-key", reverseGeocoding: reverse };
  await page.route("**/site-bootstrap.json", route => route.fulfill({ json: { schemaVersion: 1, tenantId: "demo", apiBaseUrl: "/api", siteSettingsEndpoint: "/api/public/site-settings", settingsSource: "api" } }));
  await page.route("**/api/public/site-settings", route => route.fulfill({ json: settings }));
  // Deterministic provider tile traffic only. This is not a live Neshan authorization test.
  await page.route(/https:\/\/[^/]*neshan[^/]*\//, route => {
    const url = route.request().url();
    if (/\.pbf/.test(url)) return route.fulfill({ contentType: "application/x-protobuf", body: Buffer.alloc(0) });
    return route.fulfill({ contentType: "image/png", body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64") });
  });
}
test("missing key: initial viewport is not selected; explicit manual point persists and unconfirmed changes do not", async ({ page }) => {
  await enter(page);
  const confirm = page.getByRole("button", { name: "تأیید این موقعیت" }); await expect(confirm).toBeDisabled();
  await expect(page.getByText("نقشه هنوز پیکربندی نشده است")).toBeVisible();
  await shot(page, "location-unconfigured-390");
  await chooseDemoLocation(page); await confirm.click(); await expect(page).toHaveURL(/\/vehicle$/);
  await page.goBack(); await expect(page.getByRole("textbox", { name: "آدرس موقعیت خودرو" })).toHaveValue(demoLocationAddress);
  await page.getByRole("textbox", { name: "آدرس موقعیت خودرو" }).fill("پیش‌نویس تأییدنشده");
  await page.reload();
  await expect(page.getByRole("textbox", { name: "آدرس موقعیت خودرو" })).toHaveValue(demoLocationAddress);
  await expect(page.locator(".location-coordinate-values")).toContainText("35.7350000");
});
test("official SDK pan, zoom, fixed pin, explicit GPS and viewport layout", async ({ page, context }) => {
  await configureMap(page); await context.grantPermissions(["geolocation"]); await context.setGeolocation({ latitude: 35.7, longitude: 51.4, accuracy: 8 });
  await page.addInitScript(() => {
    const original = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
    let calls = 0; Object.defineProperty(window, "locationGpsCalls", { get: () => calls });
    navigator.geolocation.getCurrentPosition = (...args) => { calls++; original(...args); };
  });
  await enter(page); await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page.locator(".neshan-map-message")).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, "locationGpsCalls"))).toBe(0);
  await expect(page.getByRole("button", { name: "تأیید این موقعیت" })).toBeDisabled();
  const pin = page.locator(".neshan-center-pin"), before = await pin.boundingBox();
  await page.locator(".leaflet-control-zoom-in").click();
  await expect(page.getByRole("button", { name: "تأیید این موقعیت" })).toBeDisabled();
  await page.getByRole("button", { name: "بازگشت به موقعیت من" }).click();
  await expect(page.locator(".location-coordinate-values")).toContainText("35.7000000");
  await expect(page.locator(".location-source-status")).toContainText("۸ متر");
  await expect(page.getByRole("textbox", { name: "آدرس موقعیت خودرو" })).toHaveValue(/آدرس آزمایشی/);
  await expect(page.locator(".leaflet-control-attribution")).toBeVisible();
  const map = await page.locator(".neshan-map-canvas").boundingBox();
  await page.mouse.move(map!.x + map!.width * .6, map!.y + map!.height * .6);
  await page.mouse.down(); await page.mouse.move(map!.x + map!.width * .6 + 55, map!.y + map!.height * .6 + 30, { steps: 6 }); await page.mouse.up();
  await expect(page.locator(".location-source-status")).toContainText("موقعیت دستی");
  expect(await pin.boundingBox()).toEqual(before);
  await page.locator(".neshan-map-canvas").focus();
  await expect(page.locator(".neshan-map-canvas")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".location-source-status")).toContainText("موقعیت دستی");
  for (const control of [".leaflet-control-zoom-in", ".leaflet-control-zoom-out", ".neshan-locate"]) {
    const bounds = await page.locator(control).boundingBox();
    expect(bounds!.width).toBeGreaterThanOrEqual(44); expect(bounds!.height).toBeGreaterThanOrEqual(44);
  }
  for (const [width, height] of [[360,800],[390,844],[430,932],[1440,960]]) {
    await page.setViewportSize({ width, height }); await bounded(page); await shot(page, "location-sdk-fixture-" + width);
  }
});
test("GPS denial allows manual point; late first-party address cannot overwrite user edits", async ({ page }) => {
  await configureMap(page, "api");
  await page.addInitScript(() => { navigator.geolocation.getCurrentPosition = (_ok, fail) => fail?.({ code: 1, message: "", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 }); });
  let finish!: () => void;
  await page.route("**/api/maps/reverse?**", async route => { await new Promise<void>(resolve => { finish = resolve; }); await route.fulfill({ json: { formatted_address: "آدرس دیررس سرویس" } }).catch(() => undefined); });
  await enter(page); await expect(page.locator(".leaflet-container")).toBeVisible();
  await page.getByRole("button", { name: "بازگشت به موقعیت من" }).click();
  await expect(page.locator(".neshan-location-error")).toContainText("اجازه دسترسی");
  await page.locator(".neshan-map-canvas").tap({ position: { x: 180, y: 190 } });
  await expect.poll(() => Boolean(finish)).toBe(true);
  await page.getByRole("textbox", { name: "آدرس موقعیت خودرو" }).fill("آدرس اصلاح‌شده توسط کاربر"); finish();
  await expect(page.getByRole("textbox", { name: "آدرس موقعیت خودرو" })).toHaveValue("آدرس اصلاح‌شده توسط کاربر");
  await expect(page.getByRole("button", { name: "تأیید این موقعیت" })).toBeEnabled();
  await shot(page, "location-address-edited");
});
test("address failure remains recoverable; selected point and GPS accuracy survive zoom", async ({ page, context }) => {
  await configureMap(page, "api"); await context.grantPermissions(["geolocation"]); await context.setGeolocation({ latitude: 35.7, longitude: 51.4, accuracy: 12 });
  await page.route("**/api/maps/reverse?**", route => route.fulfill({ status: 200, json: {} }));
  await enter(page); await page.getByRole("button", { name: "بازگشت به موقعیت من" }).click();
  await expect(page.getByText("آدرس به‌صورت خودکار دریافت نشد. لطفاً آدرس را دستی وارد کنید.")).toBeVisible();
  await page.getByRole("textbox", { name: "آدرس موقعیت خودرو" }).fill("تهران، آدرس دستی محل خودرو");
  await page.locator(".leaflet-control-zoom-in").click(); await expect(page.locator(".location-source-status")).toContainText("۱۲ متر");
  await expect(page.getByRole("textbox", { name: "آدرس موقعیت خودرو" })).toHaveValue("تهران، آدرس دستی محل خودرو");
  await shot(page, "location-address-failure-manual");
});
test("summary uses confirmed location and submitted edit route remains locked", async ({ page }) => {
  await submissionWorkflow(page);
  await expect(page.locator(".summary-location")).toContainText(demoLocationAddress);
  await page.getByRole("button", { name: "ارسال برای بررسی", exact: true }).click();
  await expect(page).toHaveURL(/\/submitted$/);
  await page.goto("/inspection/insp_demo/location");
  await expect(page).toHaveURL(/\/submitted$/);
});
