import { expect, test, type Page } from "@playwright/test";

async function enterOtp(page: Page) {
  await page.goto("/");
  await page.getByRole("textbox", { name: "کد معرفی / کد ارجاع" }).fill("A4K9P2");
  await page.getByRole("button", { name: "شروع بازدید" }).click();
  await expect(page).toHaveURL(/\/verify$/);
  await expect(page.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" })).toBeFocused();
}
test("reference-led mobile landing and OTP screenshots", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "customer", "Phase 01 canonical screenshots use 390×844.");
  const errors: string[] = [];
  const backendCalls: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("request", (request) => { if (new URL(request.url()).pathname.startsWith("/api/")) backendCalls.push(request.url()); });
  await page.clock.install({ time: new Date("2026-10-04T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-04T00:00:00Z"));
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("textbox", { name: "کد معرفی / کد ارجاع" }).fill("A4K9P2");
  await page.getByRole("heading", { name: "بازدید آنلاین خودرو در کمتر از ۱۵ دقیقه" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  expect(page.viewportSize()).toEqual({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const supportBounds = await page.locator(".entry-support summary").boundingBox();
  expect(supportBounds?.height).toBeGreaterThanOrEqual(44);
  expect((supportBounds?.y ?? 0) + (supportBounds?.height ?? 0)).toBeLessThanOrEqual(844);
  await expect(page).toHaveScreenshot("landing-referral.png");
  await page.getByRole("button", { name: "شروع بازدید" }).click();
  await expect(page).toHaveURL(/\/verify$/);
  await page.clock.runFor(18_000);
  await page.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" }).fill("2917");
  await expect(page.getByText("۱:۴۲", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page).toHaveScreenshot("otp-verification.png");
  expect(errors).toEqual([]);
  expect(backendCalls).toEqual([]);
});

test("referral entry preserves LTR order and rejects incomplete/invalid codes", async ({ page }) => {
  await page.goto("/");
  const input = page.getByRole("textbox", { name: "کد معرفی / کد ارجاع" });
  await input.fill("A4");
  await page.getByRole("button", { name: "شروع بازدید" }).click();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toBeFocused();
  await input.fill("XXXXXX");
  await page.getByRole("button", { name: "شروع بازدید" }).click();
  await expect(page.locator(".referral-panel [role=alert]")).toContainText("کد معرفی معتبر نیست");
  await input.fill("a4k9p2");
  await expect(input).toHaveValue("A4K9P2");
  await expect(input).toHaveAttribute("dir", "ltr");
  await expect(page.locator(".code-cell")).toHaveText(["A", "4", "K", "9", "P", "2"]);
});

test("five-digit OTP autofill auto-verifies and enters readiness", async ({ page }) => {
  await enterOtp(page);
  const input = page.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" });
  await expect(input).toHaveAttribute("autocomplete", "one-time-code");
  await expect(input).toHaveAttribute("inputmode", "numeric");
  await expect(input).toHaveAttribute("dir", "ltr");
  await input.fill("۱۲۳۴");
  await expect(input).toHaveValue("1234");
  await expect(page.getByRole("heading", { name: "قبل از شروع، آماده‌اید؟" })).toHaveCount(0);
  await input.fill("۱۲۳۴۵");
  await expect(page.getByRole("heading", { name: "قبل از شروع، آماده‌اید؟" })).toBeVisible();
  await expect(page).toHaveURL(/\/readiness$/);
});

test("OTP rejects wrong digits, counts attempts, then resends when the countdown ends", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-04T00:00:00Z") });
  await enterOtp(page);
  const input = page.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" });
  await expect(page.getByText("۳ بار فرصت باقی مانده است.")).toBeVisible();
  for (const attempts of [2, 1, 0]) {
    await input.fill("99999");
    await expect(input).toHaveValue("");
    await expect(page.locator(".otp-attempts")).toContainText(`${["۰", "۱", "۲"][attempts]} بار`);
  }
  await expect(input).toBeDisabled();
  await expect(page.getByRole("button", { name: "ارسال مجدد کد" })).toHaveCount(0);
  await page.clock.fastForward(120_000);
  await page.getByRole("button", { name: "ارسال مجدد کد" }).click();
  await expect(input).toBeEnabled();
  await expect(input).toBeFocused();
  await expect(page.locator(".otp-attempts")).toContainText("۳ بار");
  await expect(page.locator(".otp-countdown")).toContainText("۲:۰۰");
});

test("edit-number dialog validates, changes number, and restores input focus", async ({ page }) => {
  await enterOtp(page);
  const edit = page.getByRole("button", { name: "ویرایش شماره موبایل" });
  await edit.click();
  const dialog = page.getByRole("dialog", { name: "ویرایش شماره موبایل" });
  const mobile = dialog.getByRole("textbox", { name: "شماره موبایل", exact: true });
  await expect(mobile).toBeFocused();
  await mobile.fill("123");
  await dialog.getByRole("button", { name: "ذخیره و ارسال کد" }).click();
  await expect(mobile).toHaveAttribute("aria-invalid", "true");
  await mobile.fill("۰۹۳۵۱۲۳۴۵۶۷");
  await dialog.getByRole("button", { name: "ذخیره و ارسال کد" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".otp-masked-number")).toHaveText("۰۹۳۵•••۴۵۶۷");
  await expect(page.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" })).toBeFocused();
  await edit.click();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(edit).toBeFocused();
  await page.getByRole("link", { name: "بازگشت", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("direct OTP navigation has a recoverable missing-challenge state", async ({ page }) => {
  await page.goto("/verify");
  await expect(page.getByText("برای دریافت کد تأیید، ابتدا کد معرفی خود را وارد کنید.")).toBeVisible();
  await page.getByRole("link", { name: "بازگشت به شروع بازدید" }).click();
  await expect(page.getByRole("button", { name: "شروع بازدید" })).toBeVisible();
});

test("customer layouts have no horizontal overflow on narrow and wide phones", async ({ page }) => {
  for (const width of [320, 390, 480]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("textbox", { name: "کد معرفی / کد ارجاع" }).fill("A4K9P2");
    await page.getByRole("button", { name: "شروع بازدید" }).click();
    await expect(page).toHaveURL(/\/verify$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
