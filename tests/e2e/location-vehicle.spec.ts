import { expect, test, type Page } from "@playwright/test";

async function location(page: Page) {
  await page.goto("/");
  await page.getByRole("textbox", { name: "کد معرفی / کد ارجاع" }).fill("A4K9P2");
  await page.getByRole("button", { name: "شروع بازدید" }).click();
  await page.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" }).fill("12345");
  await page.getByRole("button", { name: "همه چیز آماده است" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(page).toHaveURL(/\/inspection\/insp_demo\/location$/);
  await expect(page.getByRole("button", { name: "تأیید این موقعیت" })).toBeEnabled();
}
async function vehicle(page: Page) {
  await location(page);
  await page.getByRole("button", { name: "تأیید این موقعیت" }).click();
  await expect(page).toHaveURL(/\/inspection\/insp_demo\/vehicle$/);
  await expect(page.getByRole("button", { name: "تأیید مشخصات و ادامه" })).toBeEnabled();
}
async function readyImages(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode())));
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test("consent → location → vehicle uses mocks, fixed pin and no browser permissions/API", async ({ page }) => {
  const errors: string[] = [], backend: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on("request", (request) => { if (new URL(request.url()).pathname.startsWith("/api/")) backend.push(request.url()); });
  await page.addInitScript(() => {
    const calls: string[] = [];
    Object.defineProperty(window, "phaseThreePermissionCalls", { value: calls });
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition = () => { calls.push("GPS"); };
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { calls.push("camera"); throw new Error("Unexpected permission"); };
  });
  await location(page);
  await expect(page.locator('[aria-current="step"]')).toContainText("موقعیت");
  await expect(page.getByText("دقت موقعیت ± ۸ متر")).toBeVisible();
  const pin = page.getByRole("img", { name: "نشانگر ثابت موقعیت انتخابی" });
  const before = await pin.boundingBox();
  const bounds = await page.getByRole("group", { name: "جابجایی نقشه" }).boundingBox();
  if (!bounds) throw new Error("Map has no bounds");
  await page.mouse.move(bounds.x + bounds.width * .65, bounds.y + bounds.height * .6);
  await page.mouse.down(); await page.mouse.move(bounds.x + bounds.width * .65 + 55, bounds.y + bounds.height * .6 + 20, { steps: 5 }); await page.mouse.up();
  expect(await pin.boundingBox()).toEqual(before);
  await expect(page.locator(".development-map-scene")).not.toHaveAttribute("style", "transform: translate(0px, 0px);");
  await page.getByRole("button", { name: "بازگشت به موقعیت من" }).click();
  await expect(page.locator(".development-map-scene")).toHaveAttribute("style", "transform: translate(0px, 0px);");
  await page.getByRole("button", { name: "ویرایش", exact: true }).click();
  await expect(page.getByLabel("آدرس بازدید")).toBeFocused();
  await page.getByLabel("آدرس بازدید").fill("تهران، خیابان سهروردی شمالی، ساختمان دوم");
  await page.getByRole("button", { name: "پایان ویرایش آدرس" }).click();
  await expect(page.getByRole("button", { name: "ویرایش", exact: true })).toBeFocused();
  await page.getByLabel("شماره پلاک ساختمان").fill("۴۵۶");
  await page.getByLabel("طبقه / واحد (اختیاری)").fill("");
  await page.getByLabel("توضیحات محل پارک (اختیاری)").fill("پارکینگ زیرزمین");
  await noOverflow(page);
  await page.getByRole("button", { name: "تأیید این موقعیت" }).click();
  await expect(page).toHaveURL(/\/vehicle$/);
  await expect(page.locator('[aria-current="step"]')).toContainText("خودرو");
  await expect(page.getByRole("heading", { name: "کیا اسپورتیج" })).toBeVisible();
  await expect(page.locator(".vehicle-vin bdi")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("img", { name: "پلاک خودرو: ۴۵ ب ۷۲۳، ایران ۱۱" })).toBeVisible();
  await page.getByRole("link", { name: "بازگشت", exact: true }).click();
  await expect(page.getByLabel("شماره پلاک ساختمان")).toHaveValue("456");
  await expect(page.getByLabel("طبقه / واحد (اختیاری)")).toHaveValue("");
  await expect(page.getByLabel("توضیحات محل پارک (اختیاری)")).toHaveValue("پارکینگ زیرزمین");
  await page.getByRole("button", { name: "تأیید این موقعیت" }).click();
  await page.getByRole("button", { name: "درست است", exact: true }).click();
  await page.getByRole("button", { name: "تأیید مشخصات و ادامه" }).click();
  await expect(page.getByRole("status")).toContainText("مشخصات خودرو تأیید شد.");
  await expect(page).toHaveURL(/\/vehicle$/);
  await expect(page.locator('a[href*="/capture"]')).toHaveCount(0);
  expect(errors).toEqual([]); expect(backend).toEqual([]);
  expect(await page.evaluate(() => (window as Window & { phaseThreePermissionCalls?: string[] }).phaseThreePermissionCalls)).toEqual([]);
});

test("manual plate entry normalizes/pastes digits, validates, selects letters and records discrepancy", async ({ page }) => {
  await vehicle(page);
  await expect(page.getByLabel("دو رقم اول پلاک")).toBeDisabled();
  await page.getByRole("button", { name: /پلاک اشتباه/ }).click();
  const first = page.getByLabel("دو رقم اول پلاک"), main = page.getByLabel("سه رقم اصلی پلاک");
  await expect(first).toBeFocused();
  await first.fill("۶۷");
  await expect(first).toHaveValue("67");
  await expect(page.getByLabel("حرف پلاک")).toBeFocused();
  await page.getByLabel("حرف پلاک").selectOption("ج");
  await main.fill("۱۲");
  await page.getByRole("button", { name: "تأیید مشخصات و ادامه" }).click();
  await expect(main).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("سه رقم اصلی پلاک را وارد کنید.")).toBeVisible();
  await first.evaluate((input) => {
    const clipboardData = new DataTransfer(); clipboardData.setData("text", "۶۷ ج ۸۹۰ ایران ۲۲");
    input.dispatchEvent(new ClipboardEvent("paste", { clipboardData, bubbles: true, cancelable: true }));
  });
  await expect(main).toHaveValue("890");
  await expect(page.getByLabel("دو رقم کد ایران")).toHaveValue("۲۲");
  await page.getByRole("button", { name: "پلاک من فرمت متفاوتی دارد" }).click();
  await expect(page.getByText("برای پلاک با فرمت متفاوت، با نماینده شرکت بیمه هماهنگ کنید.")).toBeVisible();
  await page.getByRole("button", { name: "پلاک من فرمت متفاوتی دارد" }).click();
  await page.getByRole("button", { name: "مشخصات دیگری مغایرت دارد" }).click();
  await expect(page.getByRole("dialog", { name: "مغایرت مشخصات خودرو" })).toBeVisible();
  await page.getByLabel("مشخصات دارای مغایرت").selectOption("color");
  await page.getByLabel("توضیح مغایرت").fill("رنگ بدنه سفید است");
  await page.getByRole("button", { name: "ثبت توضیح" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "توضیح مغایرت ثبت شد؛ ویرایش" })).toBeFocused();
  await page.getByRole("button", { name: "تأیید مشخصات و ادامه" }).click();
  await expect(page.getByRole("status")).toContainText("مشخصات خودرو تأیید شد.");
  await expect(page.getByRole("img", { name: /پلاک خودرو/ })).toHaveCount(0);
});

test("location and vehicle canonical 390×844 screenshots", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "customer", "Phase 03 screenshots use the mobile reference viewport.");
  await location(page);
  await readyImages(page);
  expect(page.viewportSize()).toEqual({ width: 390, height: 844 });
  await expect(page).toHaveScreenshot("inspection-location.png");
  await page.getByRole("button", { name: "تأیید این موقعیت" }).click();
  await expect(page.getByRole("img", { name: /پلاک خودرو/ })).toBeVisible();
  await readyImages(page);
  await expect(page).toHaveScreenshot("vehicle-identity.png");
});

test("location/vehicle controls remain usable at 320, 390 and 480 without overflow", async ({ page }) => {
  for (const width of [320, 390, 480]) {
    await page.setViewportSize({ width, height: 844 }); await location(page);
    await noOverflow(page);
    for (const name of ["ویرایش", "بازگشت به موقعیت من", "تأیید این موقعیت"]) {
      const bounds = await page.getByRole("button", { name, exact: true }).boundingBox();
      expect(bounds?.height).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole("button", { name: "تأیید این موقعیت" }).click();
    await expect(page.getByRole("button", { name: /پلاک اشتباه/ })).toBeVisible();
    await noOverflow(page);
    await page.getByRole("button", { name: /پلاک اشتباه/ }).click();
    for (const label of ["دو رقم اول پلاک", "حرف پلاک", "سه رقم اصلی پلاک", "دو رقم کد ایران"]) {
      const bounds = await page.getByLabel(label).boundingBox();
      expect(bounds?.width).toBeGreaterThanOrEqual(44);
      expect(bounds?.height).toBeGreaterThanOrEqual(44);
    }
    await expect(page.locator(".plate-input-segments")).toHaveAttribute("dir", "ltr");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await noOverflow(page);
  }
});

test("unverified direct visitors and unknown inspection IDs have bounded recovery states", async ({ page }) => {
  await page.goto("/inspection/insp_demo/location");
  await expect(page.getByRole("button", { name: "تأیید این موقعیت" })).toBeDisabled();
  await page.goto("/inspection/insp_demo/vehicle");
  await expect(page.getByRole("button", { name: "تأیید مشخصات و ادامه" })).toBeDisabled();
  await page.goto("/inspection/missing/location");
  await expect(page.locator(".identity-load-error").getByRole("alert")).toContainText("بازدید پیدا نشد.");
  await expect(page.getByRole("button", { name: "تلاش دوباره" })).toBeEnabled();
});
