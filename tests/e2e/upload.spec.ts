import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { uploadWorkflow, queueJobs, setOnline, releaseFixtureJobs, type UploadFixture } from "./upload-helpers";
import { enterPhotography, snapshotReady } from "./photography-helpers";
import { openPackageReview, captureData } from "./capture-package-helpers";
import { photoDatabase } from "../../src/lib/media/photo-store";
import { mockRecorder } from "./capture-package-helpers";
const renders = ".agent/reference-review/phase06-renders";
const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== "customer", "Customer upload center"); await mkdir(renders, { recursive: true });
  const messages: string[] = []; errors.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message)); page.on("console", (message) => { if (message.type() === "error") messages.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) messages.push(`${response.status()} ${response.url()}`); });
  page.on("request", (request) => { if (/\.glb|three.*\.js/i.test(request.url())) messages.push("Unexpected production 3D resource"); });
});
test.afterEach(({ page }) => expect(errors.get(page) ?? [], "Console/page/resource errors").toEqual([]));
async function bounds(page: Page) {
  const sizes = await page.evaluate(() => ({ html: document.documentElement.scrollHeight, body: document.body.scrollHeight, width: document.documentElement.scrollWidth, height: innerHeight, viewport: innerWidth }));
  expect(sizes.html).toBe(sizes.height); expect(sizes.body).toBe(sizes.height); expect(sizes.width).toBe(sizes.viewport);
  await expect(page.getByRole("button", { name: "ادامه به بررسی نهایی" })).toBeInViewport();
}
async function visual(page: Page, state: string, baseline = true) {
  await expect(page.locator(".upload-preview img").first()).toBeVisible(); await snapshotReady(page); await page.screenshot({ path: `${renders}/upload-center-${state}.png` });
  if (baseline && process.env.REVIEW_UPLOAD !== "1") await expect(page).toHaveScreenshot(`upload-center-${state}.png`);
}
for (const state of ["mixed", "offline", "uploading", "failed", "processing", "complete"] satisfies UploadFixture[]) test(`upload center ${state} visual and media-only progress`, async ({ page }) => {
  await uploadWorkflow(page, state); await bounds(page); await visual(page, state);
  await expect(page.getByRole("progressbar", { name: "فایل‌های ارسال شده" })).toHaveAttribute("aria-valuemax", "13");
  await expect(page.getByText("۴۸٬۳۲۰ کیلومتر", { exact: true })).toBeVisible(); await expect(page.locator('[data-kind="photo"]')).toHaveCount(12); await expect(page.locator('[data-kind="video-360"]')).toHaveCount(1);
  if (state === "complete" || state === "processing") await expect(page.getByRole("button", { name: "ادامه به بررسی نهایی" })).toBeEnabled();
  else await expect(page.getByRole("button", { name: "ادامه به بررسی نهایی" })).toBeDisabled();
  if (state === "uploading") await expect(page.getByRole("progressbar", { name: "ارسال جلو ۴۵° راست" })).toHaveAttribute("aria-valuenow", "45");
  if (state === "offline") await expect(page.getByText("اتصال اینترنت برقرار نیست.")).toBeVisible();
  if (state === "complete") { await page.getByRole("button", { name: "ادامه به بررسی نهایی" }).click(); await expect(page.getByText(/بازدید هنوز ثبت نهایی نشده است/)).toBeVisible(); }
});
test("photo and video queue start with bounded concurrency, meaningful byte progress and processing/verification", async ({ page }) => {
  await uploadWorkflow(page, "queued", true);
  await expect.poll(async () => (await queueJobs(page)).filter((job) => job.upload === "uploading").length).toBeGreaterThan(0);
  expect((await queueJobs(page)).filter((job) => job.owner).length).toBeLessThanOrEqual(2);
  await expect.poll(async () => (await queueJobs(page)).filter((job) => job.verification === "verified").length, { timeout: 20000 }).toBe(13);
  expect((await queueJobs(page)).every((job) => job.attemptCount === 1 && !Object.hasOwn(job, "blob"))).toBe(true);
});
test("offline queue survives refresh, app start resumes and reconnect completes it without duplicate registrations", async ({ page }) => {
  await uploadWorkflow(page, "offline"); const ids = (await queueJobs(page)).map((job) => job.id);
  await releaseFixtureJobs(page); await expect(page.locator('[data-upload="uploading"]')).toHaveCount(0);
  await page.addInitScript(() => Object.defineProperty(navigator, "onLine", { configurable: true, value: false })); await page.reload();
  expect((await queueJobs(page)).map((job) => job.id)).toEqual(ids);
  await setOnline(page, true); await expect.poll(async () => (await queueJobs(page)).filter((job) => job.upload === "uploaded").length, { timeout: 15000 }).toBe(13);
  await page.getByRole("link", { name: "بازگشت به شروع" }).click(); await enterPhotography(page); await openPackageReview(page); await page.getByRole("button", { name: "ادامه به ارسال" }).click();
  await expect(page.getByRole("button", { name: "ادامه به بررسی نهایی" })).toBeEnabled(); expect((await queueJobs(page)).map((job) => job.id)).toEqual(ids);
});
test("connection loss aborts an active file and safely restarts after online", async ({ page }) => {
  await uploadWorkflow(page, "queued", true); await expect.poll(async () => (await queueJobs(page)).filter((job) => job.upload === "uploading").length).toBe(2);
  await setOnline(page, false); await expect.poll(async () => (await queueJobs(page)).filter((job) => job.upload === "uploading").length).toBe(0);
  const data = await captureData(page); expect(data[0].acceptedBytes).toBeGreaterThan(0); await setOnline(page, true);
  await expect.poll(async () => (await queueJobs(page)).filter((job) => job.upload === "uploaded").length, { timeout: 20000 }).toBe(13);
});
test("individual retry and retry-all are safe, specific and retain accepted evidence", async ({ page }) => {
  await uploadWorkflow(page, "failed"); const before = (await captureData(page))[0].acceptedBytes;
  await page.getByRole("button", { name: "تلاش مجدد برای جلو ۴۵° راست", exact: true }).click();
  await expect(page.locator('.upload-row').first()).toHaveAttribute("data-upload", "uploaded");
  await expect(page.getByRole("button", { name: "تلاش مجدد همه" })).toHaveCount(0);
  await page.getByRole("button", { name: "تلاش مجدد برای عقب ۴۵° راست", exact: true }).click();
  await expect.poll(async () => (await queueJobs(page)).filter((job) => job.upload === "failed").length).toBe(0); expect((await captureData(page))[0].acceptedBytes).toBe(before);
});
test("retry all restarts multiple recoverable failures", async ({ page }) => {
  await uploadWorkflow(page, "failed"); await page.getByRole("button", { name: "تلاش مجدد همه" }).click();
  await expect.poll(async () => (await queueJobs(page)).filter((job) => job.upload === "uploaded").length).toBe(2);
});
test("video uploading uses the shared byte progress and verified state stays distinct", async ({ page }) => {
  await uploadWorkflow(page, "uploading"); const video = page.locator('[data-kind="video-360"]'); await video.scrollIntoViewIfNeeded();
  await expect(video.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "45"); await expect(video.locator("video")).toHaveCount(0);
  await page.screenshot({ path: `${renders}/upload-center-video-uploading.png` });
  await setOnline(page, false); await releaseFixtureJobs(page); await setOnline(page, true);
  await expect.poll(async () => (await queueJobs(page)).filter((job) => job.verification === "verified").length, { timeout: 15000 }).toBe(13);
});
test("local odometer edits remain durable offline without increasing the media denominator", async ({ page }) => {
  await uploadWorkflow(page, "offline"); await page.getByRole("link", { name: "ویرایش", exact: true }).click();
  await page.getByLabel("کیلومتر فعلی").fill("۴۸٬۳۲۱"); await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(page).toHaveURL(/capture\/review$/); expect((await captureData(page))[0].kilometers).toBe(48321);
  await page.getByRole("button", { name: "ادامه به ارسال" }).click(); await expect(page.getByText("۴۸٬۳۲۱ کیلومتر", { exact: true })).toBeVisible(); expect((await queueJobs(page)).filter((job) => job.current)).toHaveLength(13);
});
test("offline native video replacement persists before replacing its queued accepted revision", async ({ page }) => {
  await mockRecorder(page, true); await uploadWorkflow(page, "offline"); const old = (await queueJobs(page)).find((job) => job.evidenceKind === "video-360")!;
  await page.getByRole("link", { name: "مشاهده ویدیوی ۳۶۰ درجه", exact: true }).scrollIntoViewIfNeeded(); await page.getByRole("link", { name: "مشاهده ویدیوی ۳۶۰ درجه", exact: true }).click();
  await page.getByRole("button", { name: "ضبط مجدد", exact: true }).click(); expect((await captureData(page))[0].acceptedBytes).toBeGreaterThan(0);
  await page.getByLabel("انتخاب یا ضبط ویدیو با دوربین دستگاه").setInputFiles("tests/e2e/fixtures/walkaround.webm"); await expect(page).toHaveURL(/video\/review$/);
  await page.getByRole("button", { name: "تأیید و ذخیره" }).click(); await page.getByRole("button", { name: "ادامه به ارسال" }).click();
  await expect.poll(async () => (await queueJobs(page)).find((job) => job.id === old.id)?.upload).toBe("cancelled");
  expect((await queueJobs(page)).filter((job) => job.current && job.evidenceKind === "video-360")).toHaveLength(1); expect((await captureData(page))[0].acceptedBytes).toBeGreaterThan(0);
});
test("a queued superseded photo never uploads stale content; accepted replacement gets one new job", async ({ page }) => {
  await uploadWorkflow(page); const old = (await queueJobs(page)).find((job) => job.requirementId === "front-45-right")!;
  await page.evaluate(async ({ config, key }) => { const db = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open(config.name, config.version); request.onsuccess = () => resolve(request.result); }); await new Promise<void>((resolve) => { const tx = db.transaction(config.store, "readwrite"), store = tx.objectStore(config.store), read = store.get(key); read.onsuccess = () => store.put({ ...read.result, revisionId: "replacement-revision" }); tx.oncomplete = () => resolve(); }); db.close(); }, { config: photoDatabase, key: old.localBlobKey });
  await page.getByRole("link", { name: "بازگشت", exact: true }).click(); await page.getByRole("button", { name: "ادامه به ارسال" }).click();
  await expect.poll(async () => (await queueJobs(page)).find((job) => job.id === old.id)?.upload).toBe("cancelled");
  await releaseFixtureJobs(page); await expect.poll(async () => (await queueJobs(page)).filter((job) => job.current && job.upload === "uploaded").length, { timeout: 15000 }).toBe(13);
  const jobs = await queueJobs(page); expect(jobs.find((job) => job.id === old.id)?.attemptCount).toBe(0); expect(jobs.filter((job) => job.requirementId === old.requirementId && job.current)).toHaveLength(1);
});
test("upload list is the single scroll region, retry targets and actions fit all target viewports", async ({ page }) => {
  await uploadWorkflow(page, "mixed");
  for (const viewport of [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
    await page.setViewportSize(viewport); await bounds(page); await visual(page, `mixed-${viewport.width}`, false);
    await page.locator('[data-kind="video-360"]').scrollIntoViewIfNeeded(); await expect(page.locator('[data-kind="video-360"]')).toBeInViewport();
    await page.getByRole("button", { name: /تلاش مجدد برای/ }).scrollIntoViewIfNeeded(); const box = await page.getByRole("button", { name: /تلاش مجدد برای/ }).boundingBox(); expect(box!.width).toBeGreaterThanOrEqual(44); expect(box!.height).toBeGreaterThanOrEqual(44);
    await page.getByRole("button", { name: /تلاش مجدد برای/ }).focus(); await expect(page.getByRole("button", { name: /تلاش مجدد برای/ })).toBeFocused();
    await page.locator(".upload-list-scroll").evaluate((element) => { element.scrollTop = 0; });
  }
});
