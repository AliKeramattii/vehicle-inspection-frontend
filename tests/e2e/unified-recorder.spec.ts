import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { mockRecorder, packageWorkflow, recordedState, captureData, openPackageReview } from "./capture-package-helpers";
const folder = ".agent/reference-review/unified";
test("V2 live camera, eight manual ghosts, pause-aware target, durable review and replacement", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await mkdir(folder, { recursive: true }); await mockRecorder(page); await packageWorkflow(page, { kilometers: 48320, video: "accepted" });
  await openPackageReview(page);
  const existing = page.getByRole("link", { name: "مشاهده ویدیو", exact: true });
  if (await existing.isVisible()) { await existing.click(); await page.getByRole("button", { name: "ضبط مجدد", exact: true }).click(); }
  else await page.getByRole("link", { name: "ضبط ویدیو", exact: true }).click();
  await expect(page.getByRole("button", { name: "فعال کردن دوربین", exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { photographyCameraCalls?: number }).photographyCameraCalls ?? 0)).toBe(0);
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  await page.screenshot({ path: folder + "/recorder-v2-ready-390.png" });
  for (let index = 0; index < 8; index++) {
    await expect(page.locator(".recorder-ghost")).toHaveAttribute("data-guide", ["front","front-45-right","right","rear-45-left","rear","rear-45-right","left","front-45-left"][index]);
    await page.getByRole("button", { name: "نمای راهنمای بعدی" }).click();
  }
  await page.getByRole("button", { name: "نمایش راهنمای خودرو" }).click(); await expect(page.locator(".recorder-ghost")).toHaveCount(0);
  await page.getByRole("button", { name: "نمایش راهنمای خودرو" }).click();
  await recordedState(page); await page.clock.fastForward(11000);
  await expect(page.getByLabel("مدت ضبط")).toHaveText("۰۰:۳۹");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "65");
  for (const [width,height] of [[360,800],[390,844],[430,932]]) {
    await page.setViewportSize({ width,height }); await page.screenshot({ path: folder + "/recorder-v2-active-" + width + ".png" });
    expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([width,height]);
    await expect(page.getByRole("button", { name: "پایان ضبط", exact: true })).toBeInViewport();
  }
  await page.getByRole("button", { name: "مکث ضبط" }).click();
  await expect(page.locator(".video-capture")).toHaveAttribute("data-recording-state", "paused");
  await page.clock.fastForward(90000); await expect(page.getByLabel("مدت ضبط")).toHaveText("۰۰:۳۹");
  await page.screenshot({ path: folder + "/recorder-v2-paused.png" });
  await page.getByRole("button", { name: "ادامه ضبط", exact: true }).click(); await page.clock.fastForward(21000);
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  await expect(page.locator(".video-capture")).toHaveAttribute("data-recording-state", "recording");
  await page.screenshot({ path: folder + "/recorder-v2-target.png" });
  await page.getByRole("link", { name: "بازگشت به بررسی بازدید" }).click(); await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "ادامه ضبط", exact: true }).click();
  await page.clock.resume(); await page.getByRole("button", { name: "پایان ضبط", exact: true }).click();
  await expect(page.locator("video[controls]")).toBeVisible(); await expect(page.getByRole("checkbox")).toHaveCount(0);
  const data = (await captureData(page))[0]; expect(data.acceptedBytes).toBeGreaterThan(0); expect(data.draftBytes).toBeGreaterThan(0);
  await page.screenshot({ path: folder + "/recorder-v2-review.png" });
  await page.getByRole("button", { name: "تأیید و ذخیره" }).click(); await expect(page).toHaveURL(/capture\/review$/);
  expect(await page.evaluate(() => (window as Window & { stoppedPhotoTracks?: number }).stoppedPhotoTracks)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
test("V2 permission failure remains live-only with explicit retry", async ({ page }) => {
  await mockRecorder(page); await packageWorkflow(page, { kilometers: 48320 });
  await openPackageReview(page); await page.getByRole("link", { name: "ضبط ویدیو", exact: true }).click();
  await page.evaluate(() => Object.defineProperty(navigator.mediaDevices, "getUserMedia", { value: async () => { throw new DOMException("denied", "NotAllowedError"); } }));
  await expect(page.getByRole("button", { name: "فعال کردن دوربین", exact: true })).toBeVisible(); await page.getByRole("button", { name: "فعال کردن دوربین", exact: true }).click(); await expect(page.locator(".video-capture").getByRole("alert")).toContainText("دسترسی دوربین");
  await expect(page.getByRole("button", { name: "تلاش مجدد برای فعال‌سازی دوربین" })).toBeVisible(); await expect(page.locator('input[type="file"]')).toHaveCount(0);
  await page.screenshot({ path: folder + "/recorder-v2-error.png" });
});
