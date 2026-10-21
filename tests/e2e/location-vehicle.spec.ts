import { verifiedFixtureInspectionId } from "./photography-helpers";
import { chooseDemoLocation, demoLocationAddress } from "./location-helpers";
import { expect, test, type Page } from "@playwright/test";

async function location(page: Page, select = true) {
  if(await verifiedFixtureInspectionId(page))await page.goto("/readiness");
  else {
   await page.goto("/");
   await page.getByRole("textbox", { name: "کد معرفی / کد ارجاع" }).fill("A4K9P2");
   await page.getByRole("button", { name: "شروع بازدید" }).click();
   await page.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" }).fill("12345");
  }
  await page.getByRole("button", { name: "همه چیز آماده است" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(page).toHaveURL(/\/inspection\/insp_demo\/location$/);
  if (select) await chooseDemoLocation(page);
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

test("consent → explicit location → vehicle persists canonical facts without eager GPS", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await location(page);
  await expect(page.locator('[aria-current="step"]')).toContainText("موقعیت");
  await page.getByLabel("شماره پلاک ساختمان").fill("۴۵۶");
  await page.getByLabel("طبقه / واحد (اختیاری)").fill("");
  await page.getByLabel("توضیحات محل پارک (اختیاری)").fill("پارکینگ زیرزمین");
  await page.getByRole("button", { name: "تأیید این موقعیت" }).click();
  await expect(page).toHaveURL(/\/vehicle$/);
  await page.goBack();
  await expect(page.getByRole("textbox", { name: "آدرس موقعیت خودرو" })).toHaveValue(demoLocationAddress);
  await expect(page.getByLabel("شماره پلاک ساختمان")).toHaveValue("456");
  await page.getByRole("button", { name: "تأیید این موقعیت" }).click();
  await page.getByRole("button", { name: "درست است", exact: true }).click();
  await page.getByRole("button", { name: "تأیید مشخصات و ادامه" }).click();
  await expect(page).toHaveURL(/\/capture$/);
  expect(errors).toEqual([]);
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
  await expect(page).toHaveURL(/\/capture$/);
  await expect(page.getByRole("progressbar", { name: "۰ از ۱۲ تصویر تکمیل شده" })).toBeVisible();
  await expect(page.getByRole("img", { name: /پلاک خودرو/ })).toHaveCount(0);
});

test("Neshan unconfigured location and preserved vehicle 390×844 screenshots", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "customer", "Phase 03 screenshots use the mobile reference viewport.");
  await location(page, false);
  await readyImages(page);
  expect(page.viewportSize()).toEqual({ width: 390, height: 844 });
  await expect.soft(page).toHaveScreenshot("inspection-location-neshan-unconfigured.png");
  await chooseDemoLocation(page);
  await page.getByRole("button", { name: "تأیید این موقعیت" }).click();
  await expect(page.getByRole("img", { name: /پلاک خودرو/ })).toBeVisible();
  await readyImages(page);
  await expect.soft(page).toHaveScreenshot("vehicle-identity.png");
});

test("location/vehicle controls remain usable at 320, 390 and 480 without overflow", async ({ page }) => {
  for (const width of [320, 390, 480]) {
    await page.setViewportSize({ width, height: 844 }); await location(page);
    await noOverflow(page);
    for (const name of ["بازگشت به موقعیت من", "تأیید این موقعیت"]) {
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

test("unverified direct visitors and unknown inspection IDs have bounded identity recovery", async ({ page }) => {
  for(const route of ["/inspection/insp_demo/location","/inspection/insp_demo/vehicle","/inspection/missing/location"]){
   await page.goto(route);await expect(page.getByText("برای مشاهده این بازدید، هویت خود را از مسیر کارگزاری تأیید کنید.")).toBeVisible();
   await expect(page.getByRole("link",{name:"تأیید هویت و ادامه"})).toHaveAttribute("href","/");
   await expect(page.locator(".leaflet-container,.vehicle-summary")).toHaveCount(0);await noOverflow(page);
  }
  await location(page);await page.goto("/inspection/missing/location");await expect(page.getByText("برای مشاهده این بازدید، هویت خود را از مسیر کارگزاری تأیید کنید.")).toBeVisible();
});
