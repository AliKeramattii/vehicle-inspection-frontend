import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
test("four truthful readiness checks require no camera or GPS request on load", async ({ page }) => {
  let cameraCalls = 0; await page.exposeFunction("readinessOpenedCamera", () => cameraCalls++);
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async constraints => { await (window as unknown as Window & { readinessOpenedCamera: () => Promise<void> }).readinessOpenedCamera(); return original(constraints); };
  });
  await page.goto("/"); await page.getByRole("textbox",{name:"کد معرفی / کد ارجاع"}).fill("A4K9P2"); await page.getByRole("button",{name:"شروع بازدید"}).click(); await page.getByRole("textbox",{name:"کد تأیید پنج‌رقمی"}).fill("12345");
  await expect(page.locator(".device-diagnostics li")).toHaveCount(4);
  await expect(page.locator(".device-diagnostics")).toContainText("ضبط ویدیوی ۳۶۰ درجه");
  await expect(page.locator('.device-diagnostics img[src="/icons/readiness/inspection-pin.svg"]')).toBeVisible();
  await expect(page.locator(".device-diagnostics li").filter({hasText:"موقعیت مکانی"})).not.toHaveAttribute("data-status","ready");
  await expect(page.locator(".device-diagnostics")).not.toContainText("نمایش سه‌بعدی");
  await expect(page.getByRole("button",{name:"همه چیز آماده است"})).toBeEnabled();
  await mkdir(".agent/reference-review/unified",{recursive:true});
  for (const [width,height] of [[360,800],[390,844],[430,932]]) {
    await page.setViewportSize({width,height}); await page.screenshot({path:".agent/reference-review/unified/readiness-four-checks-"+width+".png"});
    expect(await page.evaluate(() => [document.documentElement.scrollWidth,document.documentElement.scrollHeight])).toEqual([width,height]);
    const rows = await page.locator(".device-diagnostics li").evaluateAll(items => items.map(item => Math.round(item.getBoundingClientRect().top))); expect(new Set(rows).size).toBe(2);
  }
  expect(cameraCalls).toBe(0);
});test("production keeps restricted model routes unavailable", async ({ request }) => {
  test.skip(Boolean(process.env.UNIFIED_ORIGIN), "Production server assertion; external development explicitly enables local preview.");
  for (const variant of ["mobile","desktop","original"]) expect((await request.get("/api/development/vehicle-model/" + variant)).status()).toBe(404);
});