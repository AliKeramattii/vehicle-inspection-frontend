import { expect, test, type Page } from "@playwright/test";

async function verifyReferral(page: Page) {
  await page.goto("/");
  await page.getByRole("textbox", { name: "کد معرفی / کد ارجاع" }).fill("A4K9P2");
  await page.getByRole("button", { name: "شروع بازدید" }).click();
  await page.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" }).fill("12345");
  await expect(page).toHaveURL(/\/readiness$/);
  await expect(page.getByRole("button", { name: "همه چیز آماده است" })).toBeEnabled();
}
async function consent(page: Page) {
  await verifyReferral(page);
  await page.getByRole("button", { name: "همه چیز آماده است" }).click();
  await expect(page).toHaveURL(/\/consent$/);
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test("Phase 01 flows through readiness and consent, without permissions or backend calls", async ({ page }) => {
  const errors: string[] = [];
  const backend: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on("request", (request) => { if (new URL(request.url()).pathname.startsWith("/api/")) backend.push(request.url()); });
  await page.addInitScript(() => {
    const calls: string[] = [];
    Object.defineProperty(window, "permissionCalls", { value: calls });
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { calls.push("camera"); throw new Error("Unexpected camera request"); };
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition = () => { calls.push("location"); };
  });
  await verifyReferral(page);
  await expect(page.getByRole("heading", { name: "قبل از شروع، آماده‌اید؟" })).toBeVisible();
  await expect(page.locator(".readiness-requirements li")).toHaveCount(4);
  await expect(page.locator('.device-diagnostics li[data-status="ready"]')).toHaveCount(4);
  await noOverflow(page);
  await page.getByRole("button", { name: "همه چیز آماده است" }).click();
  await expect(page).toHaveURL(/\/consent$/);
  const button = page.getByRole("button", { name: "تأیید و ادامه" });
  const checkbox = page.getByRole("checkbox");
  await expect(checkbox).not.toBeChecked();
  await expect(button).toBeDisabled();
  const terms = page.getByRole("button", { name: "مشاهده متن کامل شرایط" });
  await expect(terms).toHaveAttribute("aria-expanded", "false");
  await terms.click();
  await expect(terms).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("heading", { name: "شرایط بازدید و پردازش اطلاعات" })).toBeVisible();
  await terms.click();
  await expect(terms).toHaveAttribute("aria-expanded", "false");
  await checkbox.focus();
  await page.keyboard.press("Space");
  await expect(checkbox).toBeChecked();
  await expect(button).toBeEnabled();
  await noOverflow(page);
  await button.click();
  await expect(page.getByRole("status")).toContainText("رضایت شما ثبت شد.");
  await expect(page).toHaveURL(/\/consent$/);
  await expect(page.locator("a[href*='/location']")).toHaveCount(0);
  expect(await page.evaluate(() => (window as Window & { permissionCalls?: string[] }).permissionCalls)).toEqual([]);
  expect(errors).toEqual([]);
  expect(backend).toEqual([]);
});

test("reference-led readiness and collapsed consent screenshots", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "customer", "Phase 02 canonical screenshots use 390×844.");
  await verifyReferral(page);
  await page.evaluate(() => document.fonts.ready);
  expect(page.viewportSize()).toEqual({ width: 390, height: 844 });
  const hero = page.locator(".readiness-hero");
  await expect(hero.locator("img")).toHaveCount(0);
  await expect(hero).toHaveCSS("background-image", /vehicle-inspection/);
  await hero.evaluate(async (element) => {
    const sources = [...getComputedStyle(element).backgroundImage.matchAll(/url\("([^"]+)"\)/g)];
    await Promise.all(sources.map(async ([, source]) => {
      const image = new Image();
      image.src = source;
      await image.decode();
    }));
  });
  await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode())));
  await expect(page).toHaveScreenshot("readiness.png");
  await page.getByRole("button", { name: "همه چیز آماده است" }).click();
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await expect(page.getByRole("button", { name: "تأیید و ادامه" })).toBeDisabled();
  await expect.poll(() => page.locator(".consent-hero img").evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)).toBe(true);
  await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode())));
  await expect(page).toHaveScreenshot("consent-privacy.png");
});

test("preparation remains usable at 320, 390 and 480px without horizontal overflow", async ({ page }) => {
  for (const width of [320, 390, 480]) {
    await page.setViewportSize({ width, height: 844 });
    await consent(page);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await noOverflow(page);
    for (const selector of [".consent-terms-toggle", ".consent-checkbox label", ".consent-actions button"]) {
      const bounds = await page.locator(selector).boundingBox();
      expect(bounds?.height).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole("button", { name: "مشاهده متن کامل شرایط" }).click();
    await noOverflow(page);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "تأیید و ادامه" }).click();
    await expect(page.getByRole("status")).toBeVisible();
    await page.goto("/readiness");
    await noOverflow(page);
    await expect(page.getByRole("button", { name: "همه چیز آماده است" })).toBeEnabled();
    const bounds = await page.locator(".preparation-actions button").boundingBox();
    expect(bounds?.height).toBeGreaterThanOrEqual(48);
  }
});

test("direct consent visit cannot record consent without a verified workflow", async ({ page }) => {
  await page.goto("/consent");
  await page.getByRole("checkbox").check();
  await expect(page.getByRole("button", { name: "تأیید و ادامه" })).toBeDisabled();
  await page.getByRole("link", { name: /ابتدا شماره موبایل/ }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("textbox", { name: "کد معرفی / کد ارجاع" })).toHaveValue("");
});
