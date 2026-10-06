import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { enterPhotography, mockCamera, photography, seedPhotos, snapshotReady } from "./photography-helpers";

test.beforeEach(async () => { await mkdir(".agent/reference-review/polish-renders", { recursive: true }); });

for (const viewport of [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
  test(`photography hierarchy and full evidence at ${viewport.width}×${viewport.height}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "customer", "Customer viewport acceptance.");
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("requestfailed", (request) => {
      // Next cancels speculative RSC prefetches on navigation; this is not an asset failure.
      if (request.resourceType() === "fetch" && request.url().includes("_rsc=") && request.failure()?.errorText === "net::ERR_ABORTED") return;
      errors.push(`Resource failed: ${request.url()}`);
    });
    await mockCamera(page);
    await photography(page);
    await snapshotReady(page);
    const scene = page.locator(".vehicle-photo-scene"), controls = page.locator(".vehicle-photo-controls");
    const imageBox = (await scene.boundingBox())!, controlsBox = (await controls.boundingBox())!;
    expect(imageBox.height).toBeGreaterThanOrEqual(300);
    expect(controlsBox.y).toBeGreaterThanOrEqual(imageBox.y + imageBox.height + 8);
    expect(await controls.evaluate((element) => element.closest(".vehicle-photo-scene"))).toBeNull();
    for (const control of await controls.locator("button").all()) {
      const box = (await control.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    const region = page.locator(".photography-overview-content");
    expect(await region.evaluate((element) => element.scrollTop)).toBe(0);
    const sizes = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, body: document.body.scrollHeight }));
    expect(sizes).toEqual({ width: viewport.width, height: viewport.height, body: viewport.height });
    await expect(page.locator(".photography-actions a")).toBeInViewport();
    const directory = ".agent/reference-review/polish-renders";
    await mkdir(directory, { recursive: true });
    await page.screenshot({ path: `${directory}/overview-${viewport.width}.png` });
    await region.evaluate((element) => { element.scrollTop = element.scrollHeight; });
    await expect(page.locator(".photography-shot-card").first()).toBeInViewport();
    await page.screenshot({ path: `${directory}/cards-${viewport.width}.png` });
    await page.locator(".photography-shot-card").nth(1).click();
    await expect(page.locator('.vehicle-photo-marker[aria-pressed="true"]')).toHaveAttribute("data-requirement", "back-45-right");
    await page.getByRole("link", { name: "مشاهده بخش" }).click();
    await page.locator('.photo-requirement-card a[href$="/front-45-right/guide"]').click();
    await expect(page.getByRole("heading", { name: "راهنمای عکاسی" })).toBeVisible();
    await snapshotReady(page);
    await page.screenshot({ path: `${directory}/guide-exterior-${viewport.width}.png` });
    await page.getByRole("link", { name: "باز کردن دوربین" }).click();
    await expect(page.getByRole("button", { name: "ثبت عکس" })).toBeEnabled();
    await expect.poll(() => page.locator("video").evaluate((video: HTMLVideoElement) => video.videoWidth)).toBeGreaterThan(0);
    await page.getByRole("button", { name: "ثبت عکس" }).click();
    await expect(page.getByRole("button", { name: "تأیید و ادامه" })).toBeEnabled();
    await snapshotReady(page);
    const evidence = page.locator('.photo-review-capture [data-frame="captured-evidence"]');
    const evidenceBox = (await evidence.boundingBox())!;
    expect(evidenceBox.width / evidenceBox.height).toBeCloseTo(1.5, 1);
    expect(await evidence.locator("img").evaluate((image) => getComputedStyle(image).objectFit)).toBe("contain");
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await page.screenshot({ path: `${directory}/review-landscape-${viewport.width}.png` });
    await page.getByRole("button", { name: "تأیید و ادامه" }).click();
    await expect(page).toHaveURL(/back-45-right\/guide$/);
    expect(errors).toEqual([]);
  });
}

test("accepted replacement attention retains progress and synchronizes section status", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "customer", "Customer evidence presentation.");
  await photography(page, 2, undefined, "front-45-right");
  await snapshotReady(page);
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
  await expect(page.locator('[data-requirement="front-45-right"]').first()).toHaveAttribute("data-state", "attention");
  await page.screenshot({ path: ".agent/reference-review/polish-renders/overview-replacement.png" });
  await expect(page).toHaveScreenshot("overview-replacement.png");
  await page.getByRole("button", { name: "نمای خودرو: راست" }).click();
  await page.getByRole("link", { name: "مشاهده بخش" }).click();
  await expect(page.locator(".section-attention")).toHaveText("در انتظار تأیید");
  await expect(page.getByText("۲ از ۲ تصویر", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "ادامه بررسی عکس" }).click();
  await expect(page.getByRole("heading", { name: "بررسی عکس" })).toBeVisible();
  await expect(page.getByRole("button", { name: "تأیید و ادامه" })).toBeEnabled();
  await snapshotReady(page);
  await page.screenshot({ path: ".agent/reference-review/polish-renders/review-replacement.png" });
  await expect(page).toHaveScreenshot("review-replacement.png");
  await expect(page.getByRole("checkbox")).toHaveCount(0);
});

test("failed guide images retain their frame and can retry", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "customer", "Customer image recovery.");
  await photography(page);
  await page.getByRole("link", { name: "مشاهده بخش" }).click();
  await page.route("**/_next/image?*front-45-right*", (route) => route.abort());
  await page.getByRole("link", { name: "شروع عکاسی", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "راهنمای عکاسی" })).toBeVisible();
  const frame = page.locator(".photo-guide-image");
  await expect(frame.getByRole("alert")).toHaveText("تصویر قابل نمایش نیست.");
  expect((await frame.boundingBox())!.height).toBeGreaterThan(200);
  await page.unroute("**/_next/image?*front-45-right*");
  await frame.getByRole("button", { name: "تلاش دوباره" }).click();
  await expect(frame.getByRole("img")).toBeVisible();
  await snapshotReady(page);
  expect(await frame.getByRole("img").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});

test("portrait evidence is contained and height bounded, with reference and actions reachable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "customer", "Customer portrait evidence.");
  await page.goto("/");
  await seedPhotos(page, 1);
  await page.evaluate(async () => {
    // Synthetic test-only evidence, never substituted for runtime automotive assets.
    const canvas = document.createElement("canvas"); canvas.width = 600; canvas.height = 900;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#e2e8f0"; context.fillRect(0, 0, 600, 900);
    context.fillStyle = "#2563eb"; context.fillRect(0, 0, 600, 40); context.fillRect(0, 860, 600, 40);
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((value) => resolve(value!), "image/jpeg"));
    const db = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open("inspection-photos", 1); request.onsuccess = () => resolve(request.result); });
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("photos", "readwrite"), store = transaction.objectStore("photos");
      const read = store.getAll(); read.onsuccess = () => { const record = read.result[0]; store.put({ ...record, blob }); };
      transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error);
    }); db.close();
  });
  await enterPhotography(page);
  await page.getByRole("button", { name: "نمای خودرو: راست" }).click();
  await page.getByRole("link", { name: "مشاهده بخش" }).click();
  await page.getByRole("link", { name: "مشاهده", exact: true }).click();
  await expect(page.getByRole("heading", { name: "بررسی عکس" })).toBeVisible();
  await snapshotReady(page);
  const frame = page.locator('.photo-review-capture [data-frame="captured-evidence"]');
  expect(await frame.locator("img").evaluate((image: HTMLImageElement) => image.naturalHeight > image.naturalWidth)).toBe(true);
  expect((await frame.boundingBox())!.height).toBeLessThanOrEqual(844 * .62 + 1);
  expect(await frame.locator("img").evaluate((image) => getComputedStyle(image).objectFit)).toBe("contain");
  await expect(page.getByRole("button", { name: "عکاسی مجدد" })).toBeInViewport();
  await page.getByRole("button", { name: "بزرگ‌نمایی نمونه" }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "بزرگ‌نمایی نمونه" })).toBeInViewport();
  await page.screenshot({ path: ".agent/reference-review/polish-renders/review-portrait.png" });
  await expect(page).toHaveScreenshot("review-portrait.png");
});

test("new draft has orange attention with zero credit and technical guidance remains specific", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "customer", "Customer draft and technical imagery.");
  await photography(page, 0, undefined, "front-45-right");
  await snapshotReady(page);
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  await expect(page.locator('.vehicle-photo-marker[aria-pressed="true"]')).toHaveAttribute("data-state", "attention");
  await page.screenshot({ path: ".agent/reference-review/polish-renders/overview-new-draft.png" });
  await expect(page).toHaveScreenshot("overview-new-draft.png");
  await page.locator(".photography-categories button").nth(2).click();
  await page.getByRole("link", { name: "مشاهده بخش" }).click();
  await page.locator('.photo-requirement-card a[href$="/spec-plate/guide"]').click();
  await expect(page.getByRole("heading", { name: "راهنمای عکاسی" })).toBeVisible();
  await snapshotReady(page);
  await expect(page.locator('.photo-guide-image')).toHaveAttribute("data-frame", "technical-closeup");
  await page.screenshot({ path: ".agent/reference-review/polish-renders/guide-spec-plate.png" });
  await expect(page).toHaveScreenshot("guide-spec-plate.png");
});
