import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { submissionWorkflow, changeSummary, submissionRecord } from "./submission-helpers";
import { setOnline, queueJobs } from "./upload-helpers";
import { snapshotReady } from "./photography-helpers";
const renders = ".agent/reference-review/phase07-renders", errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== "customer", "Customer submission flow"); await mkdir(renders, { recursive: true });
  const messages: string[] = []; errors.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message)); page.on("console", (message) => { if (message.type() === "error") messages.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) messages.push(`${response.status()} ${response.url()}`); });
  page.on("request", (request) => { if (/\.glb|three.*\.js/i.test(request.url())) messages.push("Unexpected production 3D resource"); });
});
test.afterEach(({ page }) => expect(errors.get(page) ?? [], "Console/page/resource errors").toEqual([]));
async function bounds(page: Page, receipt = false) {
  const sizes = await page.evaluate(() => ({ html: document.documentElement.scrollHeight, body: document.body.scrollHeight, width: document.documentElement.scrollWidth, height: innerHeight, viewport: innerWidth }));
  expect(sizes.html).toBe(sizes.height); expect(sizes.body).toBe(sizes.height); expect(sizes.width).toBe(sizes.viewport);
  await expect(page.getByRole("button", { name: receipt ? "بازگشت به بیمه‌گر" : /ارسال برای بررسی|تلاش مجدد/, exact: true }).last()).toBeInViewport();
}
async function visual(page: Page, name: string) {
  await snapshotReady(page); await page.screenshot({ path: `${renders}/${name}.png` });
  if (process.env.REVIEW_SUBMISSION !== "1") await expect(page).toHaveScreenshot(`${name}.png`);
}
test("final summary ready visual derives separate photo/odometer/video and file counts", async ({ page }) => {
  await submissionWorkflow(page); await expect(page.locator(".summary-thumbnails img").first()).toBeVisible(); await bounds(page);
  await expect(page.getByText("۱۲ از ۱۲ تصویر تکمیل شده", { exact: true })).toBeVisible(); await expect(page.getByText("۴۸٬۳۲۰ کیلومتر", { exact: true })).toBeVisible();
  await expect(page.getByText("۱۳ از ۱۳ فایل ارسال شده", { exact: true })).toBeVisible(); await expect(page.locator(".summary-scroll")).toHaveCount(1);
  await expect(page.getByRole("checkbox")).toHaveCount(0); await visual(page, "final-summary-ready");
  await expect(page.getByRole("button", { name: "ارسال برای بررسی", exact: true })).toBeEnabled();
});
test("final summary upload-blocked visual explains failure and routes recovery to Upload Center", async ({ page }) => {
  await submissionWorkflow(page); await changeSummary(page, { queue: "failed" }); await expect(page.getByText("برخی فایل‌ها هنوز ارسال نشده‌اند.")).toBeVisible(); await bounds(page); await visual(page, "final-summary-upload-blocked");
  await expect(page.getByRole("button", { name: "ارسال برای بررسی", exact: true })).toBeDisabled(); await page.getByRole("link", { name: "رفتن به مرکز ارسال" }).click(); await expect(page.getByRole("button", { name: "تلاش مجدد همه" })).toBeVisible();
});
test("final summary incomplete visual does not pretend ready with a missing photo", async ({ page }) => {
  await submissionWorkflow(page); await changeSummary(page, { missing: "photo" }); await expect(page.getByText("۱۱ از ۱۲ تصویر تکمیل شده", { exact: true })).toBeVisible(); await bounds(page); await visual(page, "final-summary-incomplete");
  await expect(page.getByRole("button", { name: "ارسال برای بررسی", exact: true })).toBeDisabled();
});
test("submission loading visual blocks double activation", async ({ page }) => {
  await submissionWorkflow(page, { delayMs: 5000 }); await page.getByRole("button", { name: "ارسال برای بررسی", exact: true }).click(); await expect(page.getByRole("button", { name: "ارسال برای بررسی", exact: true })).toBeDisabled();
  await expect(page.getByText("در حال ارسال بازدید برای بررسی…")).toBeVisible(); await bounds(page); await visual(page, "submission-loading"); expect((await submissionRecord(page)).attemptCount).toBe(1);
});
test("same-frame duplicate submit activation produces one durable attempt", async ({ page }) => {
  await submissionWorkflow(page, { delayMs: 600 });
  await page.getByRole("button", { name: "ارسال برای بررسی", exact: true }).evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
  await expect(page).toHaveURL(/\/submitted$/); expect((await submissionRecord(page)).attemptCount).toBe(1);
});
test("connection loss during submit releases the attempt safely for retry", async ({ page }) => {
  await submissionWorkflow(page, { delayMs: 2000 }); await page.getByRole("button", { name: "ارسال برای بررسی", exact: true }).click();
  await expect.poll(async () => (await submissionRecord(page))?.status).toBe("submitting"); await setOnline(page, false);
  await expect.poll(async () => (await submissionRecord(page))?.status).toBe("submit-failed"); const first = await submissionRecord(page); expect(first.receipt).toBeUndefined();
  await setOnline(page, true); await page.getByRole("button", { name: "تلاش مجدد", exact: true }).click(); await expect(page).toHaveURL(/\/submitted$/); expect((await submissionRecord(page)).idempotencyKey).toBe(first.idempotencyKey);
});
test("submission error visual retries with stable identity and no evidence reset", async ({ page }) => {
  await submissionWorkflow(page, { failure: "once" }); const files = (await queueJobs(page)).map((job) => job.id); await page.getByRole("button", { name: "ارسال برای بررسی", exact: true }).click();
  await expect(page.getByRole("button", { name: "تلاش مجدد", exact: true })).toBeEnabled(); const first = await submissionRecord(page); await bounds(page); await visual(page, "submission-error");
  await page.getByRole("button", { name: "تلاش مجدد", exact: true }).click(); await expect(page).toHaveURL(/\/submitted$/); const second = await submissionRecord(page);
  expect(second.idempotencyKey).toBe(first.idempotencyKey); expect(second.attemptCount).toBe(2); expect((await queueJobs(page)).map((job) => job.id)).toEqual(files);
});
test("submission receipt visual persists reference and truthful review timeline after refresh", async ({ page }) => {
  await submissionWorkflow(page); await page.getByRole("button", { name: "ارسال برای بررسی", exact: true }).click(); await expect(page.getByRole("heading", { name: "بازدید با موفقیت ارسال شد" })).toBeVisible();
  await bounds(page, true); await expect(page.locator(".receipt-reference bdi")).toHaveAttribute("dir", "ltr"); await expect(page.getByText("BDI-8F31K2", { exact: true })).toBeVisible();
  await expect(page.locator('[aria-current="step"]')).toContainText("در صف بررسی"); await visual(page, "submission-receipt");
  const first = await submissionRecord(page); await page.reload(); await expect(page.getByRole("heading", { name: "بازدید با موفقیت ارسال شد" })).toBeVisible(); expect((await submissionRecord(page)).idempotencyKey).toBe(first.idempotencyKey); expect((await submissionRecord(page)).attemptCount).toBe(1);
});
for (const missing of ["odometer", "video"] as const) test(`missing ${missing} blocks submission separately from twelve photo credit`, async ({ page }) => {
  await submissionWorkflow(page); await changeSummary(page, { missing }); await expect(page.getByRole("button", { name: "ارسال برای بررسی", exact: true })).toBeDisabled(); await expect(page.getByText("۱۲ از ۱۲ تصویر تکمیل شده", { exact: true })).toBeVisible();
  await expect(page.locator(missing === "odometer" ? ".summary-odometer" : ".summary-video")).toContainText("ثبت نشده");
});
test("queued uploads block but processing after binary completion can submit without requiring verification", async ({ page }) => {
  await submissionWorkflow(page); await changeSummary(page, { queue: "queued" }); await expect(page.getByRole("button", { name: "ارسال برای بررسی", exact: true })).toBeDisabled();
  await changeSummary(page, { queue: "processing" }); await expect(page.getByRole("button", { name: "ارسال برای بررسی", exact: true })).toBeEnabled(); await expect(page.getByText(/۱۳ فایل در حال پردازش است/)).toBeVisible();
  await page.getByRole("button", { name: "ارسال برای بررسی", exact: true }).click(); await expect(page).toHaveURL(/\/submitted$/);
});
test("offline blocks formal submission and reconnect enables it", async ({ page }) => {
  await submissionWorkflow(page); await setOnline(page, false); await expect(page.getByRole("button", { name: "ارسال برای بررسی", exact: true })).toBeDisabled(); await expect(page.getByText("برای ارسال نهایی، اتصال اینترنت را برقرار کنید.")).toBeVisible();
  expect(await submissionRecord(page)).toBeUndefined(); await setOnline(page, true); await page.getByRole("button", { name: "ارسال برای بررسی", exact: true }).click(); await expect(page).toHaveURL(/\/submitted$/);
});
test("submitted inspection locks direct editable routes and summary recovers existing receipt", async ({ page }) => {
  await submissionWorkflow(page); await page.getByRole("button", { name: "ارسال برای بررسی", exact: true }).click(); await expect(page).toHaveURL(/\/submitted$/);
  for (const route of ["location", "vehicle", "capture", "capture/photo/odometer-on/review", "capture/photo/front-plate/camera", "capture/video/record", "upload", "review"]) {
    await page.goto(`/inspection/insp_demo/${route}`); await expect(page).toHaveURL(/\/submitted$/); await expect(page.getByRole("heading", { name: "بازدید با موفقیت ارسال شد" })).toBeVisible(); await expect(page.locator(".camera-screen")).toHaveCount(0);
  }
  expect((await submissionRecord(page)).attemptCount).toBe(1);
});
test("receipt before submission safely redirects without claiming success", async ({ page }) => {
  await page.goto("/inspection/insp_demo/submitted"); await expect(page).toHaveURL(/\/insp_demo\/review$/); await expect(page.getByText("برای بررسی نهایی، بازدید خود را از صفحه شروع باز کنید.")).toBeVisible(); await expect(page.getByText("بازدید با موفقیت ارسال شد")).toHaveCount(0);
});
test("ready summary edit links reuse existing odometer/video/photo flows", async ({ page }) => {
  await submissionWorkflow(page); await page.getByRole("link", { name: "ویرایش کیلومتر فعلی" }).click(); await expect(page).toHaveURL(/odometer-on\/review$/); await expect(page.getByLabel("کیلومتر فعلی")).toBeVisible();
  await page.goBack(); await page.getByRole("link", { name: "مشاهده ویدیوی ۳۶۰ درجه" }).click(); await expect(page.locator("video[controls]")).toBeVisible(); await expect(page.locator("video")).not.toHaveAttribute("autoplay", "");
});
test("uncertain acknowledged response recovers same receipt with no duplicate submission", async ({ page }) => {
  await submissionWorkflow(page, { failure: "uncertain-once" }); await page.getByRole("button", { name: "ارسال برای بررسی", exact: true }).click(); await expect(page).toHaveURL(/\/submitted$/); expect((await submissionRecord(page)).receipt).toBeDefined();
});
test("summary and receipt preserve 100dvh at all acceptance widths", async ({ page }) => {
  await submissionWorkflow(page);
  for (const [width, height] of [[360, 800], [390, 844], [430, 932]]) { await page.setViewportSize({ width, height }); await bounds(page); await page.getByRole("link", { name: "مرکز ارسال آمادگی ارسال" }).scrollIntoViewIfNeeded(); await page.screenshot({ path: `${renders}/final-summary-${width}.png` }); }
  await page.getByRole("button", { name: "ارسال برای بررسی", exact: true }).click(); await expect(page).toHaveURL(/\/submitted$/);
  for (const [width, height] of [[360, 800], [390, 844], [430, 932]]) { await page.setViewportSize({ width, height }); await bounds(page, true); const content = page.locator(".receipt-content"); expect(await content.evaluate((element) => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1); await snapshotReady(page); await page.screenshot({ path: `${renders}/receipt-${width}.png` }); }
});
