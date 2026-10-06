import { expect, test } from "@playwright/test";
import { photography } from "./photography-helpers";

test("image markers, shot cards, side controls and statuses share one selection", async ({ page }) => {
  await photography(page, 2);
  await page.getByRole("button", { name: "نمای خودرو: راست" }).click();
  const marker = page.locator('.vehicle-photo-marker[data-requirement="front-45-right"]');
  const card = page.locator('.photography-shot-card[data-requirement="front-45-right"]');
  await expect(marker).toHaveAttribute("data-state", "complete");
  expect(await marker.locator(":scope > span").evaluate((node) => getComputedStyle(node).backgroundColor)).toBe("rgb(37, 99, 235)");
  await marker.click(); await expect(card).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: /مشاهده عکس: جلو/ })).toHaveAttribute("href", /front-45-right\/review$/);
  await page.locator('.photography-shot-card[data-requirement="front-plate"]').click();
  await expect(page.locator('.vehicle-photo-marker[data-requirement="front-plate"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("img", { name: /نمای راهنمای خودرو/ })).toHaveAttribute("src", /front-plate/);
  await page.locator(".photography-categories button").nth(1).click();
  await expect(page.locator(".photography-shot-card")).toHaveCount(2);
  await expect(page.getByRole("img", { name: /نمای راهنمای خودرو/ })).toHaveAttribute("src", /odometer-on/);
  await page.getByRole("button", { name: "نمای خودرو: چپ" }).click();
  await expect(page.getByRole("img", { name: /نمای راهنمای خودرو/ })).toHaveAttribute("src", /front-45-left/);
  await page.getByRole("button", { name: "بازنشانی به نمای بعدی" }).click();
  await expect(page.getByRole("img", { name: /نمای راهنمای خودرو/ })).toHaveAttribute("src", /front-45-left/);
  await photography(page, 12, "front-plate");
  const attention = page.locator('.vehicle-photo-marker[data-requirement="front-plate"]');
  await expect(attention).toHaveAttribute("data-state", "attention");
  expect(await attention.locator(":scope > span").evaluate((node) => getComputedStyle(node).backgroundColor)).toBe("rgb(217, 119, 6)");
  await expect(attention).toHaveAccessibleName(/نیاز به بررسی/);
});
