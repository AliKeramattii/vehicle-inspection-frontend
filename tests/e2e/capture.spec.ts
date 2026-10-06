import { expect, test, type Page } from "@playwright/test";
import { photoDatabase } from "../../src/lib/media/photo-store";
import { enterPhotography, mockCamera, photography, snapshotReady } from "./photography-helpers";

const errors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const messages: string[] = []; errors.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") messages.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) messages.push(`${response.status()} ${response.url()}`); });
});
test.afterEach(({ page }) => { expect(errors.get(page), "Console/page/resource errors").toEqual([]); });

test("vehicle confirmation opens vehicle image navigation with twelve derived photos and no 3D download", async ({ page }) => {
  const heavy: string[] = [], backend: string[] = [];
  page.on("request", (request) => { if (/\.glb|\.hdr|vehicle-scene|three_|react-three/.test(request.url())) heavy.push(request.url()); if (new URL(request.url()).pathname.startsWith("/api/")) backend.push(request.url()); });
  await mockCamera(page); await photography(page);
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "12");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  await expect(page.locator(".photography-shot-card")).toHaveCount(7);
  await expect(page.locator('[aria-current="step"]')).toContainText("عکاسی");
  await expect(page.locator(".capture-reference bdi")).toHaveText("BDI-8F31K2");
  await expect(page.locator(".capture-reference bdi")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("canvas")).toHaveCount(0); expect(heavy).toEqual([]); expect(backend).toEqual([]);
  expect(await page.evaluate(() => (window as Window & { photographyCameraCalls?: number }).photographyCameraCalls)).toBe(0);
});

test("capture persists a draft, review needs no certification, confirmation advances and stops the camera", async ({ page }) => {
  await mockCamera(page); await photography(page);
  await page.getByRole("button", { name: "نمای خودرو: راست" }).click(); await page.getByRole("link", { name: "مشاهده بخش" }).click();
  await expect(page.locator(".photo-requirement-card")).toHaveCount(2);
  await page.getByRole("link", { name: "شروع عکاسی", exact: true }).first().click();
  expect(await page.evaluate(() => (window as Window & { photographyCameraCalls?: number }).photographyCameraCalls)).toBe(0);
  await page.getByRole("link", { name: "باز کردن دوربین" }).click();
  await expect(page.getByRole("button", { name: "ثبت عکس" })).toBeEnabled(); await snapshotReady(page);
  await page.getByRole("button", { name: "ثبت عکس" }).click();
  await expect(page).toHaveURL(/front-45-right\/review$/);
  const save = page.getByRole("button", { name: "تأیید و ادامه" }); await expect(save).toBeEnabled();
  const enlarge = page.getByRole("button", { name: "بزرگ‌نمایی عکس شما" });
  await enlarge.click(); await expect(page.getByRole("dialog", { name: "عکس شما" })).toBeVisible();
  await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0); await expect(enlarge).toBeFocused();
  const stored = await records(page); expect(stored[0].draftBytes).toBeGreaterThan(0); expect(stored[0].status).toBe("pending");
  expect(await page.evaluate(() => (window as Window & { stoppedPhotoTracks?: number }).stoppedPhotoTracks)).toBeGreaterThan(0);

  await save.click(); await expect(page).toHaveURL(/back-45-right\/guide$/);
  expect((await records(page))[0]).toMatchObject({ status: "captured", draftBytes: 0 });
  await page.getByRole("link", { name: "باز کردن دوربین" }).click(); await page.getByRole("button", { name: "ثبت عکس" }).click();
  await expect(page).toHaveURL(/back-45-right\/review$/); await expect(page.getByRole("checkbox")).toHaveCount(0);

  await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(page).toHaveURL(/section\/right$/); await expect(page.getByText("✓ نمای راست تکمیل شد")).toBeVisible();
  await expect(page.getByRole("link", { name: "ادامه به نمای چپ" })).toHaveAttribute("href", /front-45-left\/guide$/);
  await page.getByRole("link", { name: "ادامه به نمای چپ" }).click(); await expect(page).toHaveURL(/front-45-left\/guide$/);
  await page.getByRole("link", { name: "بازگشت به نمای چپ" }).click(); await page.getByRole("link", { name: "بازگشت به نمای کلی" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
});

test("completed sections allow review and atomic replacement, discarded draft retains old accepted photo", async ({ page }) => {
  await mockCamera(page); await photography(page, 2);
  await page.getByRole("button", { name: "نمای خودرو: راست" }).click(); await page.getByRole("link", { name: "مشاهده بخش" }).click();
  await page.getByRole("link", { name: "مشاهده", exact: true }).first().click();
  await expect(page.getByText("عکس ثبت‌شده روی این دستگاه ذخیره شده است.")).toBeVisible();
  await page.getByRole("button", { name: "عکاسی مجدد" }).click();
  const before = (await records(page)).find((photo) => photo.id === "front-45-right")!.acceptedBytes;
  await page.getByRole("link", { name: "باز کردن دوربین" }).click(); await page.getByRole("button", { name: "ثبت عکس" }).click();
  await expect(page).toHaveURL(/front-45-right\/review$/); await expect(page.getByRole("checkbox")).toHaveCount(0);
  let photo = (await records(page)).find((photo) => photo.id === "front-45-right")!; expect(photo.acceptedBytes).toBe(before); expect(photo.draftBytes).toBeGreaterThan(0);
  await page.getByRole("button", { name: "عکاسی مجدد" }).click();
  await expect(page).toHaveURL(/front-45-right\/guide$/);
  photo = (await records(page)).find((photo) => photo.id === "front-45-right")!; expect(photo.acceptedBytes).toBe(before); expect(photo.draftBytes).toBe(0);
  await page.getByRole("link", { name: "باز کردن دوربین" }).click(); await page.getByRole("button", { name: "ثبت عکس" }).click();
  await expect(page).toHaveURL(/front-45-right\/review$/); await expect(page.getByRole("checkbox")).toHaveCount(0);
   await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(page).toHaveURL(/section\/right$/); photo = (await records(page)).find((photo) => photo.id === "front-45-right")!; expect(photo.draftBytes).toBe(0); expect(photo.acceptedBytes).not.toBe(before);
});

test("retake reason maps to a requirement and full completion enables local final review", async ({ page }) => {
  await photography(page, 12, "front-plate");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "11");
  await page.getByRole("link", { name: "مشاهده بخش" }).click();
  await expect(page.getByText("پلاک خوانا نیست.")).toBeVisible(); await page.getByRole("link", { name: "عکاسی مجدد", exact: true }).click();
  await expect(page).toHaveURL(/front-plate\/guide$/); await expect(page.getByText("نیاز به عکاسی مجدد: پلاک خوانا نیست.")).toBeVisible();
  await photography(page, 12); await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "12");
  await page.getByRole("link", { name: "بررسی و ارسال" }).click();
  await expect(page.getByRole("heading", { name: "عکاسی خودرو تکمیل شد" })).toBeVisible();
  await expect(page.getByText(/پس از اتصال سرویس ارسال/)).toBeVisible();
});

test("denied camera supports native photo selection and durable evidence survives a fresh mock workflow", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "mediaDevices", { value: { getUserMedia: async () => { throw new DOMException("denied", "NotAllowedError"); } } }));
  await photography(page); await page.getByRole("link", { name: "مشاهده بخش" }).click();
  await page.getByRole("link", { name: "شروع عکاسی", exact: true }).first().click(); await page.getByRole("link", { name: "باز کردن دوربین" }).click();
  await expect(page.locator(".camera-message[role=alert]")).toContainText("دسترسی دوربین");
  await page.getByLabel("انتخاب عکس از گوشی").setInputFiles("public/assets/inspection/photo-guides/front-45-right.webp");
  await expect(page).toHaveURL(/front-45-right\/review$/);
   await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(page).toHaveURL(/back-45-right\/guide$/);
  await page.reload(); await expect(page.getByText("برای شروع عکاسی، موقعیت و مشخصات خودرو را تأیید کنید.")).toBeVisible();
  expect((await records(page)).find((photo) => photo.id === "front-45-right")?.status).toBe("captured");
  await page.goto("/"); await enterPhotography(page);
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  await page.getByRole("button", { name: "نمای خودرو: راست" }).click(); await page.getByRole("link", { name: "مشاهده بخش" }).click();
  await expect(page.getByRole("link", { name: "مشاهده", exact: true })).toBeVisible();
});

test("overview, sections, guide and review have no overflow at 360, 390 and 430", async ({ page }) => {
  await photography(page, 1);
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "نمای خودرو: راست" }).click(); await page.getByRole("link", { name: "مشاهده بخش" }).click();
    await page.getByRole("link", { name: "مشاهده", exact: true }).click();
    await expect(page.getByRole("heading", { name: "بررسی عکس" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "عکاسی مجدد" }).click();
    await expect(page.getByRole("heading", { name: "راهنمای عکاسی" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const cta = await page.getByRole("link", { name: "باز کردن دوربین" }).boundingBox(); expect(cta && cta.height >= 44 && cta.y + cta.height <= 844).toBe(true);
    await page.getByRole("link", { name: "بازگشت به نمای راست" }).click();
    await page.getByRole("link", { name: "بازگشت به نمای کلی" }).click();
    await expect(page.locator(".vehicle-photo-scene")).toBeVisible();
  }
});

test("storage failure during replacement confirmation preserves accepted blob and draft for retry", async ({ page }) => {
  await mockCamera(page); await photography(page, 2);
  await page.getByRole("button", { name: "نمای خودرو: راست" }).click(); await page.getByRole("link", { name: "مشاهده بخش" }).click(); await page.getByRole("link", { name: "تعویض عکس", exact: true }).first().click();
  await page.getByRole("link", { name: "باز کردن دوربین" }).click(); await page.getByRole("button", { name: "ثبت عکس" }).click();
  await expect(page.getByRole("button", { name: "تأیید و ادامه" })).toBeEnabled();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  const before = (await records(page)).find((photo) => photo.id === "front-45-right")!;
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore["put"]>) {
      IDBObjectStore.prototype.put = put;
      if (this.name === "photos") throw new DOMException("simulated quota", "QuotaExceededError");
      return Reflect.apply(put, this, args);
    };
  });

  await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(page.locator(".photo-error")).toContainText("عکس قبلی محفوظ است");
  expect((await records(page)).find((photo) => photo.id === "front-45-right")).toEqual(before);
  await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(page).toHaveURL(/section\/right$/);
});

async function records(page: Page) {
  return page.evaluate(async (config) => {
    const database = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open(config.name, config.version); request.onsuccess = () => resolve(request.result); });
    const result = await new Promise<{ requirementId: string; status: string; blob?: Blob; draft?: { blob: Blob } }[]>((resolve) => { const request = database.transaction(config.store).objectStore(config.store).getAll(); request.onsuccess = () => resolve(request.result); });
    database.close(); return result.map((record) => ({ id: record.requirementId, status: record.status, acceptedBytes: record.blob?.size ?? 0, draftBytes: record.draft?.blob.size ?? 0 }));
  }, photoDatabase);
}
