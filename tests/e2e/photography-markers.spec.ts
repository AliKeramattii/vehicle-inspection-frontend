import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { photoDatabase } from "../../src/lib/media/photo-store";
import { mockCamera, photography, snapshotReady } from "./photography-helpers";

const renders = ".agent/reference-review/marker-renders";
const viewports = [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 430, height: 932 }];
const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== "customer", "Customer marker interaction viewports");
  await mkdir(renders, { recursive: true });
  const messages: string[] = []; errors.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") messages.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) messages.push(`${response.status()} ${response.url()}`); });
});
test.afterEach(({ page }) => { expect(errors.get(page) ?? [], "Console/page/resource errors").toEqual([]); });

async function layout(page: Page) {
  const image = await page.locator(".vehicle-photo-artwork > .photography-image").boundingBox();
  const scene = await page.locator(".vehicle-photo-scene").boundingBox();
  const controls = await page.locator(".vehicle-photo-controls").boundingBox();
  expect(image && scene && controls).toBeTruthy();
  expect(controls!.y).toBeGreaterThanOrEqual(scene!.y + scene!.height + 7);
  expect(controls!.y).toBeGreaterThanOrEqual(image!.y + image!.height);
  const boxes = [];
  for (const marker of await page.locator(".vehicle-photo-marker").all()) {
    const hit = await marker.boundingBox(), visible = await marker.locator(":scope > span").boundingBox();
    expect(hit!.width).toBeGreaterThanOrEqual(44); expect(hit!.height).toBeGreaterThanOrEqual(44);
    expect(visible!.width).toBe(28); expect(visible!.height).toBe(28);
    expect(await marker.evaluate((node) => node.tagName)).toBe("BUTTON");
    await expect(marker).toBeEnabled(); await marker.click({ trial: true });
    const relative = await marker.evaluate((node) => ({ x: node.style.left, y: node.style.top }));
    expect(relative.x).toMatch(/%$/); expect(relative.y).toMatch(/%$/);
    boxes.push(hit!);
  }
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    expect(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y, "Neighbor marker targets do not overlap").toBe(true);
  }
  expect(await page.evaluate(() => ({ horizontal: document.documentElement.scrollWidth > innerWidth, vertical: document.documentElement.scrollHeight > innerHeight, scrolled: scrollY }))).toEqual({ horizontal: false, vertical: false, scrolled: 0 });
}

for (const viewport of viewports) test(`pending marker is keyboard/touch accessible with unchanged layout at ${viewport.width}x${viewport.height}`, async ({ page }) => {
  await page.setViewportSize(viewport); await mockCamera(page); await photography(page);
  await layout(page); await snapshotReady(page);
  await page.screenshot({ path: `${renders}/pending-${viewport.width}.png` });
  const marker = page.locator('.vehicle-photo-marker[data-requirement="front-45-right"]');
  await expect(marker).toHaveAccessibleName(/^عکاسی جلو/);
  await marker.focus(); await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab");
  await expect(marker).toBeFocused();
  expect(await marker.evaluate((node) => ({ visible: node.matches(":focus-visible"), width: getComputedStyle(node).outlineWidth, color: getComputedStyle(node).outlineColor }))).toEqual({ visible: true, width: "3px", color: "rgb(37, 99, 235)" });
  await page.screenshot({ path: `${renders}/focus-${viewport.width}.png` });
  await page.keyboard.press("Enter"); await expect(page).toHaveURL(/front-45-right\/guide$/);
  await expect(page.getByRole("heading", { name: "راهنمای عکاسی" })).toBeVisible();
  await expect(page.getByRole("img", { name: /نمونه صحیح: جلو/ })).toBeVisible();
  expect(await cameraCalls(page)).toBe(0);
  await page.getByRole("link", { name: "بازگشت به نمای راست" }).click();
  await page.getByRole("link", { name: "بازگشت به نمای کلی" }).click();
  const hit = await marker.boundingBox();
  // Tap the transparent part of the 44px target, outside the visible 28px marker.
  await page.touchscreen.tap(hit!.x + 2, hit!.y + hit!.height / 2);
  await expect(page).toHaveURL(/front-45-right\/guide$/);
  expect(await cameraCalls(page)).toBe(0);
});

test("completed marker opens evidence and Space activates the existing atomic replacement path", async ({ page }) => {
  await mockCamera(page); await photography(page, 2);
  await page.getByRole("button", { name: "نمای خودرو: راست" }).click();
  const marker = page.locator('.vehicle-photo-marker[data-requirement="front-45-right"]');
  await expect(marker).toHaveAttribute("data-state", "complete");
  await expect(marker).toHaveAccessibleName(/^مشاهده عکس جلو/);
  await page.locator('.photography-shot-card[data-requirement="front-45-right"]').click();
  await expect(marker).toHaveAttribute("aria-pressed", "true");
  const original = await evidence(page, "front-45-right");
  for (const viewport of viewports) {
    await page.setViewportSize(viewport); await layout(page); await snapshotReady(page);
    await page.screenshot({ path: `${renders}/completed-${viewport.width}.png` });
  }
  await marker.focus(); await page.keyboard.press("Space");
  await expect(page).toHaveURL(/front-45-right\/review$/);
  await expect(page.getByRole("img", { name: /عکس شما: جلو/ })).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  expect(await cameraCalls(page)).toBe(0); expect(await evidence(page, "front-45-right")).toEqual(original);
  await page.getByRole("button", { name: "عکاسی مجدد" }).click();
  await expect(page).toHaveURL(/front-45-right\/guide$/);
  await page.getByRole("link", { name: "باز کردن دوربین" }).click();
  await expect(page.getByRole("button", { name: "ثبت عکس" })).toBeEnabled();
  await page.getByRole("button", { name: "ثبت عکس" }).click();
  await expect(page).toHaveURL(/front-45-right\/review$/);
  await expect(page.getByRole("button", { name: "تأیید و ادامه" })).toBeEnabled();
  expect(await evidence(page, "front-45-right")).toMatchObject({ acceptedHash: original.acceptedHash, status: "captured" });
  await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(page).toHaveURL(/section\/right$/);
  expect(await evidence(page, "front-45-right")).toMatchObject({ status: "captured", draftBytes: 0 });
});

test("retake marker opens the exact affected guidance with reviewer reason and preserves evidence", async ({ page }) => {
  await mockCamera(page); await photography(page, 12, "front-plate");
  const marker = page.locator('.vehicle-photo-marker[data-requirement="front-plate"]');
  await expect(marker).toHaveAttribute("data-state", "attention");
  await expect(marker).toHaveAccessibleName(/^عکاسی مجدد.*نیاز به بررسی/);
  const original = await evidence(page, "front-plate");
  for (const viewport of viewports) {
    await page.setViewportSize(viewport); await layout(page); await snapshotReady(page);
    await page.screenshot({ path: `${renders}/retake-${viewport.width}.png` });
  }
  await marker.click(); await expect(page).toHaveURL(/front-plate\/guide$/);
  await expect(page.getByText("نیاز به عکاسی مجدد: پلاک خوانا نیست.")).toBeVisible();
  expect(await evidence(page, "front-plate")).toEqual(original); expect(await cameraCalls(page)).toBe(0);
});

test("retake with a draft opens review with the reviewer reason and retains the original", async ({ page }) => {
  await photography(page, 12, "front-plate", "front-plate");
  const original = await evidence(page, "front-plate");
  await page.locator('.vehicle-photo-marker[data-requirement="front-plate"]').click();
  await expect(page).toHaveURL(/front-plate\/review$/);
  await expect(page.getByText("نیاز به عکاسی مجدد: پلاک خوانا نیست.")).toBeVisible();
  await expect(page.getByRole("button", { name: "تأیید و ادامه" })).toBeEnabled();
  await snapshotReady(page); await page.screenshot({ path: `${renders}/retake-draft-review-390.png` });
  expect(await evidence(page, "front-plate")).toEqual(original);
  await page.getByRole("button", { name: "عکاسی مجدد" }).click();
  await expect(page).toHaveURL(/front-plate\/guide$/);
  await expect(page.getByText("نیاز به عکاسی مجدد: پلاک خوانا نیست.")).toBeVisible();
  expect(await evidence(page, "front-plate")).toMatchObject({ acceptedHash: original.acceptedHash, reviewerReason: original.reviewerReason, draftBytes: 0 });
});

for (const accepted of [false, true]) test(`${accepted ? "replacement" : "new"} draft attention marker opens review without losing evidence or completion credit`, async ({ page }) => {
  await photography(page, accepted ? 2 : 0, undefined, "front-45-right");
  await page.getByRole("button", { name: "نمای خودرو: راست" }).click();
  const original = await evidence(page, "front-45-right");
  const marker = page.locator('.vehicle-photo-marker[data-requirement="front-45-right"]');
  await expect(marker).toHaveAttribute("data-state", "attention");
  await expect(marker).toHaveAccessibleName(/^ادامه بررسی عکس/);
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", accepted ? "2" : "0");
  await marker.click(); await expect(page).toHaveURL(/front-45-right\/review$/);
  await expect(page.getByRole("button", { name: "تأیید و ادامه" })).toBeEnabled();
  expect(await evidence(page, "front-45-right")).toEqual(original);
  await page.getByRole("link", { name: "بازگشت به نمای راست" }).click();
  await page.getByRole("link", { name: "بازگشت به نمای کلی" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", accepted ? "2" : "0");
});

async function cameraCalls(page: Page) { return page.evaluate(() => (window as Window & { photographyCameraCalls?: number }).photographyCameraCalls); }
async function evidence(page: Page, id: string) {
  return page.evaluate(async ({ config, id }) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(config.name, config.version);
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    const records = await new Promise<{ requirementId: string; status: string; blob?: Blob; draft?: { blob: Blob }; reviewerReason?: string }[]>((resolve, reject) => {
      const transaction = database.transaction(config.store, "readonly"), request = transaction.objectStore(config.store).getAll();
      transaction.oncomplete = () => resolve(request.result); transaction.onerror = () => reject(transaction.error);
    });
    database.close();
    const record = records.find((item) => item.requirementId === id)!;
    const hash = record.blob && await crypto.subtle.digest("SHA-256", await record.blob.arrayBuffer());
    return { status: record.status, acceptedHash: hash ? Array.from(new Uint8Array(hash)).join(",") : null, draftBytes: record.draft?.blob.size ?? 0, reviewerReason: record.reviewerReason ?? null };
  }, { config: photoDatabase, id });
}
