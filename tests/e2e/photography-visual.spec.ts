import { expect, test } from "@playwright/test";
import { inspectionPhotographyTemplate as template } from "../../src/features/photography/inspection-template";
import { mockCamera, photography, snapshotReady } from "./photography-helpers";

test("image-guided overview, all seven sections, guide, camera and comparison at 390×844", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "customer", "Customer acceptance screenshots only.");
  await mockCamera(page); await photography(page);
  await snapshotReady(page); await expect(page).toHaveScreenshot("photography-overview.png");
  for (const section of template.sections) {
    await page.locator(`.photography-section-row[href$="/${section.id}"]`).click();
    await expect(page.getByRole("heading", { name: section.title, exact: true })).toBeVisible();
    await snapshotReady(page); await expect(page).toHaveScreenshot(`section-${section.id}.png`);
    await page.getByRole("link", { name: "بازگشت به نمای کلی" }).click();
    await expect(page.getByRole("heading", { name: "بخش‌های عکاسی" })).toBeVisible();
  }
  await page.getByRole("link", { name: "شروع عکاسی: نمای راست" }).click();
  await page.getByRole("link", { name: "شروع عکاسی", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "راهنمای عکاسی" })).toBeVisible();
  await snapshotReady(page); await expect(page).toHaveScreenshot("photo-guidance.png");
  await page.getByRole("link", { name: "باز کردن دوربین" }).click();
  await expect(page.getByRole("button", { name: "ثبت عکس" })).toBeEnabled();
  await expect.poll(() => page.locator("video").evaluate((video: HTMLVideoElement) => video.videoWidth)).toBeGreaterThan(0);
  await expect(page).toHaveScreenshot("photo-camera.png");
  await page.getByRole("button", { name: "ثبت عکس" }).click();
  await expect(page.getByRole("button", { name: "تأیید و ذخیره" })).toBeVisible();
  await snapshotReady(page); await expect(page).toHaveScreenshot("photo-comparison.png");
  for (const checkbox of await page.getByRole("checkbox").all()) await checkbox.check();
  await snapshotReady(page); await expect(page).toHaveScreenshot("photo-comparison-accepted.png");
});

test("derived partial, completed section, retake and twelve-photo completion visuals", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "customer", "Customer acceptance screenshots only.");
  await photography(page, 4); await snapshotReady(page); await expect(page).toHaveScreenshot("photography-partial.png");
  await page.getByRole("link", { name: "نمای راست، ۲ از ۲" }).click();
  await expect(page.getByText("✓ نمای راست تکمیل شد")).toBeVisible();
  await snapshotReady(page); await expect(page).toHaveScreenshot("section-completed.png");
  await photography(page, 12, "front-plate");
  await page.getByRole("link", { name: "جلو، ۰ از ۱، نیاز به عکاسی مجدد" }).click();
  await expect(page.getByText("پلاک خوانا نیست.")).toBeVisible();
  await snapshotReady(page); await expect(page).toHaveScreenshot("photo-retake.png");
  await photography(page, 12); await snapshotReady(page); await expect(page).toHaveScreenshot("photography-complete.png");
  await page.getByRole("link", { name: "بررسی و ارسال" }).click();
  await expect(page.getByRole("heading", { name: "عکاسی خودرو تکمیل شد" })).toBeVisible();
  await snapshotReady(page); await expect(page).toHaveScreenshot("photography-final-review.png");
});
