import { expect, test, type Page } from "@playwright/test";
const templateRoute = "/admin/templates/body-image-guided";
test.beforeEach(async ({page}, info) => {
  test.skip(info.project.name !== "desktop","Admin acceptance is desktop-first.");
  await page.clock.setFixedTime(new Date("2026-10-11T06:30:00.000Z"));
});
async function published(page: Page) {
  await page.goto(templateRoute); await expect(page.getByRole("heading",{name:/بازدید استاندارد بیمه بدنه/})).toBeVisible();
  await expect(page.getByLabel("عنوان تصویر")).toBeDisabled();
}
async function draft(page: Page) {
  await published(page); await page.getByRole("button",{name:"ایجاد / بازکردن پیش‌نویس"}).click();
  await expect(page.getByLabel("عنوان تصویر")).toBeEnabled();
}
async function save(page: Page) {
  await page.getByRole("button",{name:"ذخیره پیش‌نویس",exact:true}).click();
  await expect(page.getByText("پیش‌نویس ذخیره شد.",{exact:true})).toBeVisible();
}
test("Admin shell, navigation, filtering and direct routes",async ({page}) => {
  const errors:string[]=[]; const glb:string[]=[];
  page.on("pageerror",e=>errors.push(e.message)); page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
  page.on("request",r=>{if(/\.glb(?:\?|$)|vehicle-3d|preview-3d/.test(r.url()))glb.push(r.url());});
  await page.goto("/admin"); await expect(page.getByRole("heading",{name:"داشبورد",exact:true})).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("dir","rtl");
  for(const [name,href] of [["برندینگ","branding"],["سیاست‌ها","policies"],["وب‌هوک‌ها","webhooks"],["کاربران","users"],["دسترسی‌ها","permissions"]]) {
    await page.getByRole("navigation").getByRole("link",{name,exact:true}).click();
    await expect(page).toHaveURL(new RegExp("/admin/"+href+"$"));
    await expect(page.getByRole("heading",{name,exact:true})).toBeVisible();
  }
  await page.goto("/admin/templates"); await expect(page.getByRole("link",{name:"مشاهده قالب",exact:true})).toBeVisible();
  await page.getByLabel("جست‌وجوی قالب").fill("missing"); await expect(page.getByText("قالبی با این جست‌وجو پیدا نشد.")).toBeVisible();
  await page.getByLabel("جست‌وجوی قالب").fill("استاندارد"); await expect(page.getByRole("link",{name:"مشاهده قالب",exact:true})).toBeVisible();
  await page.getByLabel("وضعیت",{exact:true}).selectOption("draft"); await expect(page.getByText("قالبی با این جست‌وجو پیدا نشد.")).toBeVisible();
  await page.goto("/admin/templates/missing"); await expect(page.getByRole("heading",{name:"قالب پیدا نشد"})).toBeVisible();
  expect(errors).toEqual([]); expect(glb).toEqual([]);
});
test("draft save, ordering, preview, publish and immutable version history",async ({page}) => {
  await draft(page);
  await page.getByLabel("عنوان تصویر").fill("جلو راست آزمایشی");
  await page.getByRole("button",{name:"انتقال جلو راست آزمایشی به پایین",exact:true}).click();
  await expect(page.locator(".admin-requirement-list tbody tr").first()).toContainText("back-45-right");
  await page.getByRole("button",{name:"پیش‌نمایش راهنما"}).click();
  await expect(page.getByRole("dialog")).toContainText("جلو راست آزمایشی");
  await expect(page.getByRole("dialog").locator("img")).toBeVisible();
  await page.getByRole("dialog").getByRole("button",{name:"بستن",exact:true}).click();
  await save(page); await page.reload();
  await expect(page.getByRole("button",{name:"ویرایش جلو راست آزمایشی"})).toBeVisible();
  await page.getByRole("button",{name:"انتشار نسخه جدید",exact:true}).click();
  await expect(page.getByRole("dialog")).toContainText("بازدیدهای موجود");
  await page.getByRole("button",{name:"تأیید انتشار",exact:true}).click();
  await expect(page.getByText("نسخه منتشر شد. نسخه‌های بازدیدهای قبلی تغییر نکرده‌اند.")).toBeVisible();
  await expect(page.getByLabel("عنوان تصویر")).toBeDisabled();
  await page.getByLabel("نسخه قالب",{exact:true}).selectOption("body-image-guided:v1");
  await expect(page.getByRole("button",{name:"ویرایش جلو ۴۵° راست",exact:true})).toBeVisible();
  await page.getByRole("tab",{name:"تاریخچه نسخه‌ها"}).click();
  await expect(page.locator(".admin-history tbody tr")).toHaveCount(2);
  await page.reload(); await expect(page.getByLabel("عنوان تصویر")).toBeDisabled();
});
test("validation and unsaved navigation protection retain form values",async ({page}) => {
  await draft(page); await page.getByLabel("عنوان تصویر").fill("");
  await page.getByRole("button",{name:"ذخیره پیش‌نویس",exact:true}).click();
  await expect(page.locator(".admin-main [role=alert]")).toContainText("عنوان و راهنمای");
  await expect(page.getByLabel("عنوان تصویر")).toHaveAttribute("aria-invalid","true");
  await page.getByRole("navigation").getByRole("link",{name:"داشبورد",exact:true}).click();
  await expect(page.getByRole("dialog",{name:"تغییرات ذخیره نشده"})).toBeVisible();
  await page.getByRole("button",{name:"ماندن در صفحه"}).click();
  await expect(page.getByLabel("عنوان تصویر")).toHaveValue("");
  await page.getByLabel("عنوان تصویر").fill("ذخیره نشده");
  await page.getByRole("navigation").getByRole("link",{name:"داشبورد",exact:true}).click();
  await page.getByRole("button",{name:"ادامه بدون ذخیره"}).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto(templateRoute); await expect(page.getByLabel("عنوان تصویر")).not.toHaveValue("ذخیره نشده");
});
test("two-tab stale draft conflict rejects overwrite and supports recovery",async ({page,context}) => {
  await draft(page); const second = await context.newPage(); await second.goto(templateRoute);
  await expect(second.getByLabel("عنوان تصویر")).toBeEnabled();
  await page.getByLabel("عنوان تصویر").fill("تغییر پنجره اول"); await save(page);
  await second.getByLabel("عنوان تصویر").fill("تغییر پنجره دوم");
  await second.getByRole("button",{name:"ذخیره پیش‌نویس",exact:true}).click();
  await expect(second.locator(".admin-main [role=alert]")).toContainText("پنجره دیگری");
  await expect(second.getByLabel("عنوان تصویر")).toHaveValue("تغییر پنجره دوم");
  await second.getByRole("button",{name:"بارگذاری نسخه تازه"}).click();
  await second.getByRole("button",{name:"ادامه بدون ذخیره"}).click();
  await expect(second.getByLabel("عنوان تصویر")).toHaveValue("تغییر پنجره اول"); await second.close();
});
test("role restrictions, keyboard controls and canonical preview",async ({page}) => {
  await draft(page); await page.getByLabel("هویت آزمایشی").selectOption("viewer");
  await expect(page.getByLabel("عنوان تصویر")).toBeDisabled();
  await expect(page.getByRole("button",{name:"انتشار نسخه جدید",exact:true})).toBeDisabled();
  await page.getByRole("button",{name:"ویرایش کیلومترشمار",exact:true}).focus();
  await page.keyboard.press("Enter"); await expect(page.getByLabel("عنوان تصویر")).toHaveValue("کیلومترشمار");
  const image=page.getByRole("img",{name:"تصویر مرجع کیلومترشمار",exact:true});
  await expect(image).toBeVisible(); expect(await image.evaluate(e => (e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.getByRole("button",{name:"پیش‌نمایش راهنما"}).click();
  await expect(page.getByRole("dialog")).toBeVisible(); await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByLabel("هویت آزمایشی").selectOption("template-editor");
  await expect(page.getByLabel("عنوان تصویر")).toBeEnabled(); await expect(page.getByRole("button",{name:"انتشار نسخه جدید",exact:true})).toBeDisabled();
});
test("new template and secondary configuration survive refresh",async ({page}) => {
  await page.goto("/admin/templates"); await page.getByRole("button",{name:"ایجاد قالب",exact:true}).click();
  await page.getByLabel("عنوان قالب جدید").fill("قالب شریک نمونه"); await page.getByRole("button",{name:"ایجاد پیش‌نویس",exact:true}).click();
  await expect(page.getByRole("heading",{name:/قالب شریک نمونه/})).toBeVisible();
  await expect(page.locator(".admin-requirement-list tbody tr")).toHaveCount(12);
  await page.getByRole("navigation").getByRole("link",{name:"برندینگ",exact:true}).click();
  await page.getByLabel("نام نمایشی بیمه‌گر").fill("بیمه‌گر نمونه دوم"); await page.getByRole("button",{name:"ذخیره تنظیمات نمونه"}).click();
  await expect(page.getByText("تنظیمات نمونه ذخیره شد.")).toBeVisible(); await page.reload();
  await expect(page.getByLabel("نام نمایشی بیمه‌گر")).toHaveValue("بیمه‌گر نمونه دوم");
  await page.getByRole("navigation").getByRole("link",{name:"وب‌هوک‌ها",exact:true}).click();
  await page.getByRole("checkbox").click(); await expect(page.getByRole("checkbox")).toBeChecked(); await expect(page.getByText("وضعیت وب‌هوک نمونه ذخیره شد.")).toBeVisible(); await page.reload();
  await expect(page.getByRole("checkbox")).toBeChecked();
});
for(const [width,height] of [[1024,768],[1280,800],[1440,960],[1920,1080]]) {
  test("bounded usable editor at "+width+"x"+height,async ({page}) => {
    await page.setViewportSize({width,height}); await draft(page);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth && document.documentElement.scrollHeight<=innerHeight)).toBe(true);
    await expect(page.getByRole("button",{name:"پیش‌نمایش راهنما"})).toBeInViewport();
    await expect(page.locator(".admin-sidebar")).toBeInViewport();
    const wrap=page.locator(".admin-requirement-list .admin-table-wrap"); await wrap.evaluate(e=>e.scrollLeft=-1000);
    expect(await wrap.evaluate(e=>e.scrollWidth<=e.clientWidth || Math.abs(e.scrollLeft)>0)).toBe(true);
    await page.getByRole("button",{name:"ویرایش شماره شاسی",exact:true}).scrollIntoViewIfNeeded();
    await page.getByRole("button",{name:"ویرایش شماره شاسی",exact:true}).click();
    await expect(page.getByLabel("عنوان تصویر")).toHaveValue("شماره شاسی");
  });
}
test("reviewed Admin screenshot states at 1440x960",async ({page}) => {
  await page.goto("/admin"); await expect(page.getByRole("heading",{name:"داشبورد",exact:true})).toBeVisible(); await page.evaluate(()=>document.fonts.ready);
  await expect(page).toHaveScreenshot("admin-overview.png");
  await page.goto("/admin/templates"); await expect(page.getByRole("link",{name:"مشاهده قالب",exact:true})).toBeVisible();
  await expect(page).toHaveScreenshot("admin-template-list.png");
  await published(page); await expect(page).toHaveScreenshot("admin-published-detail.png");
  await page.getByRole("button",{name:"ایجاد / بازکردن پیش‌نویس"}).click(); await expect(page.getByLabel("عنوان تصویر")).toBeEnabled();
  await expect(page).toHaveScreenshot("admin-draft-editor.png");
  await page.getByRole("button",{name:"ویرایش نمای مستقیم جلو با پلاک",exact:true}).click();
  await expect(page.getByLabel("عنوان تصویر")).toHaveValue("نمای مستقیم جلو با پلاک"); await expect(page).toHaveScreenshot("admin-selected-requirement.png");
  await page.getByLabel("عنوان تصویر").fill(""); await page.getByRole("button",{name:"ذخیره پیش‌نویس",exact:true}).click();
  await expect(page.locator(".admin-main [role=alert]")).toBeVisible(); await expect(page).toHaveScreenshot("admin-validation-error.png");
  await page.getByLabel("عنوان تصویر").fill("نمای مستقیم جلو با پلاک خوانا"); await save(page);
  await page.getByRole("button",{name:"انتشار نسخه جدید",exact:true}).click(); await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page).toHaveScreenshot("admin-publish-confirmation.png");
  await page.getByRole("button",{name:"تأیید انتشار",exact:true}).click(); await expect(page.getByLabel("عنوان تصویر")).toBeDisabled();
  await expect(page).toHaveScreenshot("admin-published-version.png");
  await page.getByRole("navigation").getByRole("link",{name:"دسترسی‌ها",exact:true}).click(); await expect(page.getByRole("heading",{name:"دسترسی‌ها",exact:true})).toBeVisible();
  await expect(page).toHaveScreenshot("admin-permissions.png");
});

test("section order, archived drafts and draft recovery preserve the publication",async ({page}) => {
  await draft(page); await page.getByRole("tab",{name:"تنظیمات کلی"}).click();
  await page.getByRole("button",{name:"انتقال بخش نمای راست به پایین",exact:true}).click(); await save(page); await page.reload();
  await page.getByRole("tab",{name:"تنظیمات کلی"}).click(); await expect(page.locator(".admin-settings li").first()).toContainText("نمای چپ");
  await page.getByRole("button",{name:"بایگانی پیش‌نویس",exact:true}).click();
  await page.getByRole("button",{name:"تأیید بایگانی",exact:true}).click(); await expect(page.getByText("این پیش‌نویس بایگانی شده است.")).toBeVisible();
  await page.getByLabel("نسخه قالب",{exact:true}).selectOption("body-image-guided:v1");
  await expect(page.getByRole("button",{name:"ایجاد / بازکردن پیش‌نویس"})).toBeEnabled();
  await page.getByRole("button",{name:"ایجاد / بازکردن پیش‌نویس"}).click();
  await expect(page.getByLabel("نسخه قالب",{exact:true})).toHaveValue("body-image-guided:v3");
});
test("recoverable Admin storage failure",async ({page}) => {
  await page.addInitScript(() => {
    const original=indexedDB.open.bind(indexedDB);
    const scope=window as Window & { adminStorageFailed?: boolean };
    scope.adminStorageFailed=true;
    indexedDB.open=(name:string,version?:number) => { if(name==="inspection-admin" && scope.adminStorageFailed) throw new Error("fixture storage failure"); return original(name,version); };
  });
  await page.goto("/admin"); await expect(page.getByText("اطلاعات مدیریت بارگذاری نشد. داده‌های محلی پاک نشده‌اند.")).toBeVisible();
  await page.evaluate(()=>{(window as Window & {adminStorageFailed?:boolean}).adminStorageFailed=false;});
  await page.getByRole("button",{name:"تلاش مجدد",exact:true}).click();
  await expect(page.getByRole("heading",{name:"داشبورد",exact:true})).toBeVisible();
});
test("image failure retains useful recovery without changing canonical assets",async ({page}) => {
  await page.route("**/_next/image*",route=>route.abort());
  await published(page);
  await expect(page.locator(".admin-large-guide").getByText("تصویر مرجع بارگذاری نشد.")).toBeVisible();
  await page.unroute("**/_next/image*");
  await page.locator(".admin-large-guide").getByRole("button",{name:"تلاش مجدد تصویر"}).click();
  await expect(page.getByRole("img",{name:"تصویر مرجع جلو ۴۵° راست",exact:true})).toBeVisible();
});
