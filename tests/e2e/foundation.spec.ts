import { expect, test } from "@playwright/test";

test("RTL shell, local font, safe-area action, and screenshots", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/foundation/preview");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    "content",
    /viewport-fit=cover/,
  );
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() =>
      [...document.fonts].some(
        (font) =>
          font.status === "loaded" &&
          font.family.toLowerCase().includes("vazirmatn"),
      ),
    ),
  ).toBe(true);
  const action = page.getByRole("link", { name: "مشاهده اجزای رابط کاربری" });
  await expect(action).toBeInViewport();
  expect((await action.boundingBox())?.height).toBeGreaterThanOrEqual(48);
  expect(
    await page
      .locator(".safe-area-bottom")
      .evaluate((element) =>
        parseFloat(getComputedStyle(element).paddingBottom),
      ),
  ).toBeGreaterThanOrEqual(16);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page).toHaveScreenshot("foundation-home.png", {
    fullPage: true,
  });
  await action.click();
  await expect(
    page.getByRole("heading", { name: "اجزای رابط کاربری", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("کیا اسپورتیج", { exact: true })).toBeVisible();
  await expect(page.locator('li[aria-current="step"]')).toContainText("خودرو");
  await expect(
    page.getByRole("textbox", { name: "شناسه نمونه" }),
  ).toHaveAttribute("dir", "ltr");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page).toHaveScreenshot("foundation-gallery.png", {
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("form validation, focus, keyboard selection, and button states", async ({
  page,
}) => {
  await page.goto("/foundation");
  const input = page.getByRole("textbox", { name: "نام نمونه" });
  await page.getByRole("button", { name: "ثبت نمونه", exact: true }).click();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toBeFocused();
  await expect(input).toHaveAccessibleDescription(
    "نام باید حداقل ۲ حرف داشته باشد.",
  );
  await input.fill("علی");
  await page.getByRole("button", { name: "ثبت نمونه", exact: true }).click();
  await expect(page.getByText("نمونه با موفقیت ثبت شد.")).toBeVisible();
  const checkbox = page.getByRole("checkbox", { name: "نمایش نمونه انتخاب" });
  await checkbox.focus();
  await page.keyboard.press("Space");
  await expect(checkbox).toBeChecked();
  await expect(checkbox).toBeFocused();
  const help = page.getByRole("button", { name: "راهنمای نمونه" });
  await help.focus();
  await page.keyboard.press("Enter");
  await expect(help).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#sample-help")).toBeVisible();
  await expect(page.getByRole("button", { name: "در حال ثبت" })).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "در حال ثبت" }),
  ).toHaveAttribute("aria-busy", "true");
  await expect(
    page.getByRole("textbox", { name: "ورودی غیرفعال" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "پاک کردن" }).click();
  await expect(input).toHaveValue("");
  await expect(page.getByText("نمونه با موفقیت ثبت شد.")).toHaveCount(0);
});

test("skip link provides keyboard access to main content", async ({ page }) => {
  await page.goto("/foundation/preview");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "رفتن به محتوای اصلی" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});
