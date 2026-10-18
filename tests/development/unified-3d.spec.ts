import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { photography } from "../e2e/photography-helpers";
test("single licensed local model, twelve canonical capture markers and guidance before capture", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  let downloads = 0; page.on("response", response => { if (response.url().includes("/api/development/vehicle-model/") && response.status() === 200) downloads++; });
  await mkdir(".agent/reference-review/unified", { recursive: true }); await photography(page, 3);
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const pins = page.locator(".fixed-inspection-marker");
  await expect(pins).toHaveCount(12, { timeout: 60000 }); expect(downloads).toBe(1);
  await expect(page.locator('.fixed-inspection-marker[data-requirement="front-45-right"]')).toHaveAttribute("data-state", "complete");
  const positions = () => pins.evaluateAll(elements => elements.map(element => [element.getBoundingClientRect().x, element.getBoundingClientRect().y]));
  const before = await positions(), canvas = await page.locator("canvas").boundingBox();
  await page.mouse.move(canvas!.x + canvas!.width / 2, canvas!.y + canvas!.height / 2); await page.mouse.down(); await page.mouse.move(canvas!.x + canvas!.width / 2 + 55, canvas!.y + canvas!.height / 2 + 10, { steps: 8 }); await page.mouse.up(); await page.mouse.wheel(0,-100);
  expect(await positions()).toEqual(before);
  for (const [width,height] of [[360,800],[390,844],[430,932],[1440,960]]) {
    await page.setViewportSize({ width,height }); await page.screenshot({ path: ".agent/reference-review/unified/optional-3d-" + width + ".png" });
    expect(await page.evaluate(() => [document.documentElement.scrollWidth,document.documentElement.scrollHeight])).toEqual([width,height]);
    const image = await page.locator(".optional-vehicle-display").boundingBox(), controls = await page.locator(".vehicle-photo-controls").boundingBox(); expect(controls!.y).toBeGreaterThanOrEqual(image!.y + image!.height);
  }
  await page.setViewportSize({width:390,height:844});
  const pending = pins.filter({ has: page.locator("span") }).locator('xpath=self::*[@data-state="pending"]').first();
  const id = await pending.getAttribute("data-requirement"); await pending.click(); await expect(page).toHaveURL(/\/capture$/);
  await expect(page.locator(".marker-guidance")).toBeVisible();
  await expect(page.locator(".photography-shot-card[aria-pressed=true]")).toHaveAttribute("data-requirement", id!);
  await expect(page.locator(".optional-vehicle-canvas")).toHaveAttribute("data-view", /front|rear|left|right|top/);
  await page.screenshot({ path: ".agent/reference-review/unified/3d-guidance.png" });
  await page.getByRole("button", { name: "گرفتن عکس", exact: true }).click(); await expect(page).toHaveURL(new RegExp(id + "/guide$"));
  await expect(page.getByRole("link", { name: "باز کردن دوربین" })).toBeVisible();
  expect(errors).toEqual([]);
});
