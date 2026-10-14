import { expect, type Page } from "@playwright/test";

/** Explicit manual fixture selection; never treats the map's initial viewport as a user choice. */
export const demoLocationAddress = "تهران، خیابان نمونه، پلاک ۱۲";
export async function chooseDemoLocation(page: Page) {
  await expect(page.getByRole("heading", { name: "موقعیت خودرو را مشخص کنید" })).toBeVisible();
  await expect(page.locator(".leaflet-container,.location-manual-coordinates summary").first()).toBeVisible();
  const liveMap = page.locator(".leaflet-container");
  if (await liveMap.isVisible()) {
    await liveMap.click({ position: { x: 150, y: 140 } });
    await expect(page.locator(".neshan-center-pin")).toBeVisible();
    await page.getByRole("textbox", { name: "آدرس موقعیت خودرو" }).fill(demoLocationAddress);
    await expect(page.getByRole("button", { name: "تأیید این موقعیت" })).toBeEnabled(); return;
  }
  await page.locator(".location-manual-coordinates summary").click();
  await page.getByRole("textbox", { name: "عرض جغرافیایی انتخابی" }).fill("35.735");
  await page.getByRole("textbox", { name: "طول جغرافیایی انتخابی" }).fill("51.435");
  await page.getByRole("button", { name: "انتخاب این مختصات" }).click();
  await page.getByRole("textbox", { name: "آدرس موقعیت خودرو" }).fill(demoLocationAddress);
  await expect(page.getByRole("button", { name: "تأیید این موقعیت" })).toBeEnabled();
}
