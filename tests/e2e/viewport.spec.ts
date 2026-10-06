import { expect, test, type Page, type Locator } from "@playwright/test";
import { mockCamera, snapshotReady } from "./photography-helpers";
async function bounded(page: Page) {
  expect(await page.evaluate(() => ({ html: document.documentElement.scrollHeight, body: document.body.scrollHeight, width: document.documentElement.scrollWidth, height: innerHeight, viewportWidth: innerWidth }))).toEqual(expect.objectContaining({ html: page.viewportSize()!.height, body: page.viewportSize()!.height, width: page.viewportSize()!.width }));
}
async function reachable(control: Locator, page: Page) {
  const box = await control.boundingBox();
  expect(box).not.toBeNull(); expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y).toBeGreaterThanOrEqual(0); expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
}
for (const viewport of [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
  test(`bounded customer workflow and fixed actions at ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport); await mockCamera(page); await page.goto("/");
    await bounded(page); await reachable(page.getByRole("button", { name: "شروع بازدید" }), page);
    await page.getByRole("textbox", { name: "کد معرفی / کد ارجاع" }).fill("A4K9P2"); await page.getByRole("button", { name: "شروع بازدید" }).click();
    const otp = page.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" }); await expect(otp).toBeVisible(); await bounded(page);
    await otp.fill("12345"); const ready = page.getByRole("button", { name: "همه چیز آماده است" }); await expect(ready).toBeEnabled(); await bounded(page); await reachable(ready, page); await ready.click();
    const consent = page.getByRole("button", { name: "تأیید و ادامه" }); await bounded(page); await reachable(consent, page);
    await page.getByRole("button", { name: "مشاهده متن کامل شرایط" }).click(); await bounded(page); await reachable(consent, page);
    await page.getByRole("checkbox").check(); await reachable(consent, page); await consent.click();
    const location = page.getByRole("button", { name: "تأیید این موقعیت" }); await expect(location).toBeEnabled(); await bounded(page); await reachable(location, page);
    await page.getByRole("button", { name: "ویرایش", exact: true }).click(); await expect(page.getByLabel("آدرس بازدید")).toBeFocused(); await bounded(page); await reachable(location, page);
    await page.getByRole("button", { name: "پایان ویرایش آدرس" }).click(); await location.click();
    const vehicle = page.getByRole("button", { name: "تأیید مشخصات و ادامه" }); await expect(vehicle).toBeEnabled(); await bounded(page); await reachable(vehicle, page);
    await page.getByRole("button", { name: /پلاک اشتباه/ }).click(); await page.getByRole("button", { name: "پلاک من فرمت متفاوتی دارد" }).click(); await bounded(page); await reachable(vehicle, page);
    await page.getByRole("button", { name: "پلاک من فرمت متفاوتی دارد" }).click(); await vehicle.click();
    await expect(page.getByRole("progressbar")).toBeVisible(); await bounded(page); await reachable(page.locator(".photography-actions a"), page);
    const scene = (await page.locator(".vehicle-photo-scene").boundingBox())!;
    for (const button of await page.locator(".vehicle-photo-controls button").all()) {
      await reachable(button, page); const box = (await button.boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(scene.y); expect(box.y + box.height).toBeLessThanOrEqual(scene.y + scene.height);
    }
    for (const name of ["راست", "چپ", "عقب", "جلو", "بالا"]) {
      await page.getByRole("button", { name: `نمای خودرو: ${name}` }).click();
      for (const marker of await page.locator(".vehicle-photo-marker").all()) await marker.click({ trial: true });
    }
    await page.getByRole("button", { name: "نمای خودرو: راست" }).click();
    await page.getByRole("link", { name: "مشاهده بخش" }).click(); await bounded(page);
    const region = page.locator(".photo-requirement-list"); expect(await region.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    await region.evaluate((element) => { element.scrollTop = element.scrollHeight; }); await reachable(page.locator(".photography-actions a"), page);
    await page.getByRole("link", { name: "شروع عکاسی", exact: true }).first().click(); await expect(page.getByRole("heading", { name: "راهنمای عکاسی" })).toBeVisible(); await bounded(page); await reachable(page.getByRole("link", { name: "باز کردن دوربین" }), page);
    await page.getByRole("link", { name: "باز کردن دوربین" }).click(); const shutter = page.getByRole("button", { name: "ثبت عکس" }); await expect(shutter).toBeEnabled(); await bounded(page); await reachable(shutter, page); await snapshotReady(page); await shutter.click();
    const confirm = page.getByRole("button", { name: "تأیید و ادامه" }); await expect(confirm).toBeEnabled(); await bounded(page); await reachable(confirm, page); await expect(page.getByRole("checkbox")).toHaveCount(0);
  });
}
test("forms keep focus and actions reachable in a reduced-height keyboard viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 500 }); await page.goto("/");
  const input = page.getByRole("textbox", { name: "کد معرفی / کد ارجاع" }); await input.focus(); await input.fill("A4K9P2");
  await expect(input).toBeFocused(); await expect(input).toBeInViewport(); await bounded(page); await reachable(page.getByRole("button", { name: "شروع بازدید" }), page);
  await page.getByRole("button", { name: "شروع بازدید" }).click(); const otp = page.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" }); await expect(otp).toBeFocused(); await expect(otp).toBeInViewport(); await bounded(page);
});
