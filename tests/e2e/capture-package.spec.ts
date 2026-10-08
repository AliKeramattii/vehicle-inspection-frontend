import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { captureData, mockRecorder, packageWorkflow, openPackageReview, recordedState } from "./capture-package-helpers";
import { enterPhotography, snapshotReady } from "./photography-helpers";
const renders = ".agent/reference-review/phase05-renders";
const approvedScreens = new Set(["odometer-entry", "odometer-error", "video-ready", "video-recording", "video-review", "video-fallback", "video-replacement", "package-partial", "package-complete"]);
const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== "customer", "Mobile capture package"); await mkdir(renders, { recursive: true });
  const messages: string[] = []; errors.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message)); page.on("console", (message) => { if (message.type() === "error") messages.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) messages.push(`${response.status()} ${response.url()}`); });
});
test.afterEach(({ page }) => expect(errors.get(page) ?? [], "Console/page/resource errors").toEqual([]));
async function visual(page: Page, name: string) {
  if (name.startsWith("video-ready") || name === "video-recording" || name === "video-fallback") await expect(page.locator(".video-orbit img")).toBeVisible();
  if (name.startsWith("video-review") || name === "video-replacement") {
    await expect(page.locator(".walkaround-review")).toBeVisible();
    await expect.poll(() => page.locator(".walkaround-review").evaluate((video: HTMLVideoElement) => video.readyState)).toBeGreaterThanOrEqual(2);
  }
  await snapshotReady(page);
  await page.screenshot({ path: `${renders}/${name}.png` });
  if (approvedScreens.has(name)) await expect(page).toHaveScreenshot(`${name}.png`);
}
async function bounds(page: Page) {
  expect(await page.evaluate(() => ({ html: document.documentElement.scrollHeight, body: document.body.scrollHeight, width: document.documentElement.scrollWidth, height: innerHeight, viewport: innerWidth }))).toMatchObject({ html: await page.evaluate(() => innerHeight), body: await page.evaluate(() => innerHeight), width: await page.evaluate(() => innerWidth) });
}
test("odometer review validates empty input, normalizes Persian kilometers, persists edits and keeps twelve-photo credit", async ({ page }) => {
  await packageWorkflow(page); await page.getByRole("link", { name: "ثبت کیلومتر فعلی", exact: true }).click();
  await expect(page.locator('.photo-review-capture img')).toBeVisible(); await visual(page, "odometer-entry");
  await page.getByRole("button", { name: "تأیید و ادامه" }).click(); await expect(page.getByLabel("کیلومتر فعلی")).toHaveAttribute("aria-invalid", "true"); await visual(page, "odometer-error");
  await page.getByLabel("کیلومتر فعلی").fill("۴۸٬۳۲۰"); await page.getByRole("button", { name: "تأیید و ادامه" }).click(); await expect(page).toHaveURL(/video\/record$/);
  expect((await captureData(page))[0].kilometers).toBe(48320);
  await page.getByRole("link", { name: "بازگشت به بررسی بازدید" }).click(); await expect(page.getByRole("button", { name: "ادامه به ارسال" })).toBeDisabled();
  await expect(page.getByText("۴۸٬۳۲۰ کیلومتر")).toBeVisible(); await page.getByRole("link", { name: "ویرایش کیلومتر" }).click(); await expect(page.getByLabel("کیلومتر فعلی")).toHaveValue("۴۸٬۳۲۰");
  await page.getByLabel("کیلومتر فعلی").fill("0"); await page.getByRole("button", { name: "تأیید و ادامه" }).click(); expect((await captureData(page))[0].kilometers).toBe(0);
  await page.goto("/"); await enterPhotography(page); await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "12"); await openPackageReview(page); await expect(page.getByText("۰ کیلومتر")).toBeVisible();
});
test("odometer photo replacement preserves the reading and accepted evidence until confirmation", async ({ page }) => {
  await mockRecorder(page); await packageWorkflow(page, { kilometers: 48320 });
  await page.getByRole("button", { name: /کابین.*۲ از ۲/ }).click(); await page.locator('.vehicle-photo-marker[data-requirement="odometer-on"]').click();
  await expect(page.getByLabel("کیلومتر فعلی")).toHaveValue("۴۸٬۳۲۰"); await page.getByRole("button", { name: "عکاسی مجدد" }).click();
  expect((await captureData(page))[0].kilometers).toBe(48320);
  await page.getByRole("link", { name: "باز کردن دوربین" }).click(); await page.getByRole("button", { name: "ثبت عکس" }).click();
  await expect(page.getByLabel("کیلومتر فعلی")).toHaveValue("۴۸٬۳۲۰"); await page.getByRole("button", { name: "تأیید و ادامه" }).click(); await expect(page).toHaveURL(/video\/record$/);
});
test("video ready, deterministic recording, durable review and confirmation complete the local package", async ({ page }) => {
  await mockRecorder(page); await packageWorkflow(page, { kilometers: 48320 }); await page.getByRole("link", { name: "ادامه به ویدیوی ۳۶۰ درجه" }).click();
  await visual(page, "video-ready"); expect(await page.evaluate(() => (window as Window & { photographyCameraCalls?: number }).photographyCameraCalls ?? 0)).toBe(0);
  await recordedState(page); await visual(page, "video-recording");
  await page.clock.resume(); await page.getByRole("button", { name: "پایان ضبط" }).click(); await expect(page).toHaveURL(/video\/review$/);
  await expect(page.locator(".walkaround-review")).toHaveAttribute("controls", ""); await visual(page, "video-review");
  expect((await captureData(page))[0].acceptedBytes).toBe(0); expect((await captureData(page))[0].draftBytes).toBeGreaterThan(0);
  expect(await page.evaluate(() => (window as Window & { stoppedPhotoTracks?: number }).stoppedPhotoTracks)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "تأیید و ذخیره" }).click(); await expect(page).toHaveURL(/capture\/review$/);
  await expect(page.getByRole("button", { name: "ادامه به ارسال" })).toBeEnabled(); await expect(page.getByText("ثبت شده", { exact: true })).toBeVisible(); await visual(page, "package-complete");
  await page.getByRole("button", { name: "ادامه به ارسال" }).click(); await expect(page).toHaveURL(/\/upload$/); await expect(page.getByRole("heading", { name: "همگام‌سازی فایل‌ها" })).toBeVisible();
  await page.goto("/"); await enterPhotography(page); await openPackageReview(page); await expect(page.getByRole("button", { name: "ادامه به ارسال" })).toBeEnabled();
});
test("native video fallback is playable and durable without MediaRecorder", async ({ page }) => {
  await mockRecorder(page, true); await packageWorkflow(page, { kilometers: 48320 }); await page.getByRole("link", { name: "ادامه به ویدیوی ۳۶۰ درجه" }).click();
  await page.getByRole("button", { name: "شروع ضبط", exact: true }).click(); await expect(page.locator(".video-capture-error[role=alert]")).toContainText("پشتیبانی"); await visual(page, "video-fallback");
  const native = page.getByLabel("انتخاب یا ضبط ویدیو با دوربین دستگاه"); await expect(native).toHaveAttribute("accept", "video/*"); await expect(native).toHaveAttribute("capture", "environment");
  await native.setInputFiles("tests/e2e/fixtures/walkaround.webm"); await expect(page).toHaveURL(/video\/review$/); await expect(page.getByText("۰۰:۲۸", { exact: true })).toBeVisible();
  await page.locator(".walkaround-review").evaluate(async (video: HTMLVideoElement) => { await video.play(); video.pause(); });
  await page.getByRole("button", { name: "تأیید و ذخیره" }).click(); expect((await captureData(page))[0].acceptedBytes).toBeGreaterThan(0);
});
test("re-record keeps accepted video until replacement succeeds, discard retains it and save failure is retryable", async ({ page }) => {
  await mockRecorder(page, true); await packageWorkflow(page, { kilometers: 48320, video: "accepted" }); await openPackageReview(page); await page.getByRole("link", { name: "مشاهده ویدیو" }).click();
  const before = (await captureData(page))[0].acceptedBytes; await page.getByRole("button", { name: "ضبط مجدد" }).click(); expect((await captureData(page))[0].acceptedBytes).toBe(before);
  await page.getByLabel("انتخاب یا ضبط ویدیو با دوربین دستگاه").setInputFiles("tests/e2e/fixtures/walkaround.webm"); await expect(page).toHaveURL(/video\/review$/);
  await expect(page.getByText(/ویدیوی قبلی تا تأیید/)).toBeVisible(); await visual(page, "video-replacement");
  await page.getByRole("button", { name: "ضبط مجدد" }).click(); expect((await captureData(page))[0]).toMatchObject({ acceptedBytes: before, draftBytes: 0 });
  await page.getByLabel("انتخاب یا ضبط ویدیو با دوربین دستگاه").setInputFiles("tests/e2e/fixtures/walkaround.webm"); await expect(page).toHaveURL(/video\/review$/);
  await page.evaluate(() => { const put = IDBObjectStore.prototype.put; IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore["put"]>) { IDBObjectStore.prototype.put = put; if (this.name === "packages") throw new DOMException("simulated quota", "QuotaExceededError"); return Reflect.apply(put, this, args); }; });
  await page.getByRole("button", { name: "تأیید و ذخیره" }).click(); await expect(page.getByRole("alert")).toBeVisible(); expect((await captureData(page))[0]).toMatchObject({ acceptedBytes: before, draftBytes: before });
  await page.getByRole("button", { name: "تأیید و ذخیره" }).click(); await expect(page).toHaveURL(/capture\/review$/); expect((await captureData(page))[0].draftBytes).toBe(0);
});
test("video retake reason remains visible through recording/replacement context", async ({ page }) => {
  await packageWorkflow(page, { kilometers: 48320, video: "retake" }); await openPackageReview(page); await expect(page.getByRole("button", { name: "ادامه به ارسال" })).toBeDisabled();
  await page.getByRole("link", { name: "مشاهده ویدیو" }).click(); await expect(page.getByText(/یک دور کامل از خودرو دیده نمی‌شود/)).toBeVisible(); await page.getByRole("button", { name: "ضبط مجدد" }).click(); await expect(page.getByText(/یک دور کامل از خودرو دیده نمی‌شود/)).toBeVisible();
});
test("partial package has separate photo/odometer/video states", async ({ page }) => {
  await packageWorkflow(page, { photos: 8 }); await openPackageReview(page); await expect(page.getByText("۸ از ۱۲", { exact: true })).toBeVisible();
  await expect(page.getByText("تکمیل نشده", { exact: true })).toBeVisible(); await expect(page.getByText("پس از تکمیل تصاویر", { exact: true })).toBeVisible(); await visual(page, "package-partial");
  await expect(page.getByRole("button", { name: "ادامه به ارسال" })).toBeDisabled();
});
test("new inputs fit all application viewports and a keyboard-sized view", async ({ page }) => {
  await mockRecorder(page, true); await packageWorkflow(page);
  for (const viewport of [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
    await page.setViewportSize(viewport); await page.getByRole("button", { name: /کابین.*۲ از ۲/ }).click(); await page.locator('.vehicle-photo-marker[data-requirement="odometer-on"]').click(); await bounds(page); await visual(page, `odometer-${viewport.width}`);
    await page.getByLabel("کیلومتر فعلی").fill("۴۸٬۳۲۰"); await page.getByRole("button", { name: "تأیید و ادامه" }).click();
    await expect(page).toHaveURL(/video\/(record|review)$/); if (viewport.width !== 360) await page.getByRole("button", { name: "ضبط مجدد" }).click();
    await expect(page).toHaveURL(/video\/record$/); await bounds(page); await visual(page, `video-ready-${viewport.width}`);
    const button = await page.getByRole("button", { name: "شروع ضبط", exact: true }).boundingBox(); expect(button!.y + button!.height).toBeLessThanOrEqual(viewport.height);
    await page.getByLabel("انتخاب یا ضبط ویدیو با دوربین دستگاه").setInputFiles("tests/e2e/fixtures/walkaround.webm"); await expect(page).toHaveURL(/video\/review$/); await bounds(page); await visual(page, `video-review-${viewport.width}`);
    await page.getByRole("link", { name: "بازگشت به بررسی بازدید", exact: true }).click(); await page.getByRole("link", { name: "بازگشت به عکاسی", exact: true }).click();
    await page.getByRole("button", { name: /کابین.*۲ از ۲/ }).click(); await page.locator('.vehicle-photo-marker[data-requirement="odometer-on"]').click(); await expect(page.getByLabel("کیلومتر فعلی")).toBeVisible();
    await page.getByRole("link", { name: "بازگشت به کابین" }).click(); await page.getByRole("link", { name: "بازگشت به نمای کلی" }).click();
  }
  await openPackageReview(page); await page.getByRole("link", { name: "ویرایش کیلومتر" }).click(); await page.setViewportSize({ width: 390, height: 500 }); await page.getByLabel("کیلومتر فعلی").focus(); await bounds(page);
  await expect(page.getByLabel("کیلومتر فعلی")).toBeInViewport();
  const input = await page.getByLabel("کیلومتر فعلی").boundingBox(), action = await page.getByRole("button", { name: "تأیید و ادامه" }).boundingBox();
  expect(input!.y + input!.height).toBeLessThanOrEqual(action!.y);
  await visual(page, "odometer-keyboard");
});
test("route exit while recording releases stream/recorder and never creates accepted evidence", async ({ page }) => {
  await mockRecorder(page); await packageWorkflow(page, { kilometers: 48320 }); await page.getByRole("link", { name: "ادامه به ویدیوی ۳۶۰ درجه" }).click();
  await recordedState(page); await page.clock.resume(); await page.getByRole("link", { name: "بازگشت به بررسی بازدید" }).click();
  await expect(page).toHaveURL(/capture\/review$/); await expect.poll(() => page.evaluate(() => (window as Window & { recorderStops?: number }).recorderStops)).toBe(1); expect(await page.evaluate(() => (window as Window & { stoppedPhotoTracks?: number }).stoppedPhotoTracks)).toBeGreaterThan(0);
  expect((await captureData(page))[0]).toMatchObject({ acceptedBytes: 0, draftBytes: 0 });
});
