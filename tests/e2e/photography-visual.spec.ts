import { expect, test, type Page } from "@playwright/test";
import { inspectionPhotographyTemplate as template } from "../../src/features/photography/inspection-template";
import { mockCamera, photography, snapshotReady } from "./photography-helpers";

async function selectSection(page: Page, id: string) {
  if (id === "cabin" || id === "engine-details") await page.locator(".photography-categories button").nth(id === "cabin" ? 1 : 2).click();
  else await page.getByRole("button", { name: `نمای خودرو: ${{ right: "راست", left: "چپ", front: "جلو", rear: "عقب", roof: "بالا" }[id]}` }).click();
  await page.getByRole("link", { name: "مشاهده بخش" }).click();
  await expect(page).toHaveURL(new RegExp(`/section/${id}$`));
  await expect(page.locator(".photo-requirement-card").first()).toBeVisible();
}

test("reference composition, seven sections, custom guides, camera and real photo review at 390×844", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "customer", "Customer acceptance screenshots only.");
  await mockCamera(page); await photography(page);
  await snapshotReady(page); await expect(page).toHaveScreenshot("photography-overview.png");
  for (const section of template.sections) {
    await selectSection(page, section.id);
    await expect(page.getByRole("heading", { name: section.title, exact: true })).toBeVisible();
    await snapshotReady(page); await expect(page).toHaveScreenshot(`section-${section.id}.png`);
    await page.getByRole("link", { name: "بازگشت به نمای کلی" }).click();
    await expect(page.locator(".vehicle-photo-scene")).toBeVisible();
  }
  for (const [sectionId, photoId] of [["cabin", "odometer-on"], ["engine-details", "chassis-number"]]) {
    await selectSection(page, sectionId);
    await page.locator(`.photo-requirement-card a[href$="/${photoId}/guide"]`).click();
    await expect(page.getByRole("heading", { name: "راهنمای عکاسی" })).toBeVisible();
    await snapshotReady(page); await expect(page).toHaveScreenshot(`guide-${photoId}.png`);
    await page.locator(".photo-back").click(); await page.getByRole("link", { name: "بازگشت به نمای کلی" }).click();
  }
  await selectSection(page, "right");
  await page.getByRole("link", { name: "شروع عکاسی", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "راهنمای عکاسی" })).toBeVisible();
  await snapshotReady(page); await expect(page).toHaveScreenshot("photo-guidance.png");
  await page.getByRole("link", { name: "باز کردن دوربین" }).click();
  await expect(page.getByRole("button", { name: "ثبت عکس" })).toBeEnabled();
  await expect.poll(() => page.locator("video").evaluate((video: HTMLVideoElement) => video.videoWidth)).toBeGreaterThan(0);
  await expect(page).toHaveScreenshot("photo-camera.png");
  await page.getByRole("button", { name: "ثبت عکس" }).click();
  await expect(page.getByRole("button", { name: "تأیید و ادامه" })).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await snapshotReady(page); await expect(page).toHaveScreenshot("photo-comparison.png");
  await page.getByRole("button", { name: "تأیید و ادامه" }).click(); await expect(page).toHaveURL(/back-45-right\/guide$/);
  await page.locator(".photo-back").click(); await page.getByRole("link", { name: "مشاهده", exact: true }).click();
  await expect(page.getByText("عکس ثبت‌شده روی این دستگاه ذخیره شده است.")).toBeVisible();
  await snapshotReady(page); await expect(page).toHaveScreenshot("photo-comparison-accepted.png");
});

test("derived blue completion, orange retake, next section and twelve-photo completion visuals", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "customer", "Customer acceptance screenshots only.");
  await photography(page, 4); await snapshotReady(page); await expect(page).toHaveScreenshot("photography-partial.png");
  await selectSection(page, "right");
  await expect(page.getByText("✓ نمای راست تکمیل شد")).toBeVisible();
  await snapshotReady(page); await expect(page).toHaveScreenshot("section-completed.png");
  await photography(page, 12, "front-plate"); await snapshotReady(page); await expect(page).toHaveScreenshot("photography-attention.png");
  await page.getByRole("link", { name: "مشاهده بخش" }).click();
  await expect(page.getByText("پلاک خوانا نیست.")).toBeVisible();
  await snapshotReady(page); await expect(page).toHaveScreenshot("photo-retake.png");
  await photography(page, 12); await snapshotReady(page); await expect(page).toHaveScreenshot("photography-complete.png");
  await page.getByRole("link", { name: "بررسی و ارسال" }).click();
  await expect(page.getByRole("heading", { name: "عکاسی خودرو تکمیل شد" })).toBeVisible();
  await snapshotReady(page); await expect(page).toHaveScreenshot("photography-final-review.png");
});
