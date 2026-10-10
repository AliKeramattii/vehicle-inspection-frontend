import { test, expect, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import {
  requestedWorkflow,
  seedCandidates,
  requestRecord,
  requestedItem,
  installRequest,
  openRequest,
} from "./additional-evidence-helpers";
import { additionalRoutes } from "../../src/features/additional-evidence/request-model";
import { fixtureRequest } from "../../src/features/additional-evidence/request-fixtures";
import { snapshotReady } from "./photography-helpers";
import { mockRecorder } from "./capture-package-helpers";
import { setOnline, queueJobs } from "./upload-helpers";
import { submissionRecord } from "./submission-helpers";

const renders = ".agent/reference-review/phase08";
mkdirSync(renders, { recursive: true });
const errors = new Map<Page, string[]>();
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== "customer", "Customer mobile workflow");
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") messages.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      messages.push(`${response.status()} ${response.url()}`);
  });
  page.on("request", (request) => {
    if (/\.glb|three.*\.js/i.test(request.url()))
      messages.push("Production 3D resource");
  });
});
test.afterEach(({ page }) =>
  expect(errors.get(page) ?? [], "Console/page/resource failures").toEqual([]),
);
async function bounds(page: Page) {
  const result = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    body: document.body.scrollHeight,
    html: document.documentElement.scrollHeight,
    w: innerWidth,
    h: innerHeight,
  }));
  expect(result.width).toBe(result.w);
  expect(result.body).toBe(result.h);
  expect(result.html).toBe(result.h);
  await expect(page.locator(".additional-actions")).toBeInViewport();
}
async function visual(page: Page, name: string) {
  await snapshotReady(page);
  await page.screenshot({ path: `${renders}/${name}.png` });
  if (process.env.REVIEW_ADDITIONAL !== "1")
    await expect(page).toHaveScreenshot(`${name}.png`);
}
test("receipt notice and two-item request visual preserve reference and journey labels", async ({
  page,
}) => {
  const { request, original } = await requestedWorkflow(
    page,
    "two-photo",
    {},
    true,
  );
  await expect(
    page.getByText("کارشناس برای ادامه بررسی، تصاویر جدیدی درخواست کرده است."),
  ).toBeVisible();
  await page.getByRole("link", { name: "مشاهده درخواست", exact: true }).click();
  await bounds(page);
  await expect(requestedItem(page, "front")).toContainText("پلاک خوانا نیست.");
  await expect(requestedItem(page, "chassis")).toContainText(
    "لطفاً نزدیک‌تر و واضح‌تر عکاسی کنید.",
  );
  await expect(
    page.getByRole("button", { name: "ارسال مدارک تکمیلی", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("navigation", { name: "مراحل بازدید" }),
  ).toContainText("ارسال");
  await visual(page, "additional-evidence-two-items");
  expect(await submissionRecord(page)).toEqual(original);
  expect((await requestRecord(page, request.id)).items).toHaveLength(2);
});
test("one complete request visual keeps original twelve-photo progress and active reason", async ({
  page,
}) => {
  const { request, original } = await requestedWorkflow(page);
  await seedCandidates(page, request, 1);
  await bounds(page);
  await expect(page.locator(".additional-progress")).toContainText("۱ از ۲");
  await visual(page, "additional-evidence-one-complete");
  expect((await submissionRecord(page)).summary?.capture.images.total).toBe(12);
  expect(await submissionRecord(page)).toEqual(original);
});
test("reviewer reason persists in existing evidence review without quality checkboxes", async ({
  page,
}) => {
  const { request } = await requestedWorkflow(page);
  await seedCandidates(page, request, 1);
  await requestedItem(page, "front")
    .getByRole("link", { name: "بررسی مدرک جدید" })
    .click();
  await expect(page.getByRole("heading", { name: "بررسی عکس" })).toBeVisible();
  await expect(
    page.getByText("نیاز به عکاسی مجدد: پلاک خوانا نیست."),
  ).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expect(
    page.getByAltText("عکس شما: نمای مستقیم جلو با پلاک"),
  ).toBeVisible();
  await visual(page, "additional-evidence-reviewer-reason");
});
test("requested front plate guidance uses canonical sample and request-owned navigation", async ({
  page,
}) => {
  const { request } = await requestedWorkflow(page);
  await requestedItem(page, "front")
    .getByRole("link", { name: "عکاسی مجدد" })
    .click();
  await expect(page).toHaveURL(
    new RegExp(`${request.id}/photo/front-plate/guide$`),
  );
  await expect(
    page.getByText("نیاز به عکاسی مجدد: پلاک خوانا نیست."),
  ).toBeVisible();
  await visual(page, "additional-evidence-retake-guidance");
});
test("requested camera/review confirms and continues directly to the next requested requirement", async ({
  page,
}) => {
  await mockRecorder(page);
  const { request, original } = await requestedWorkflow(page);
  const originalJobs = (await queueJobs(page)).map((job) => job.id);
  await requestedItem(page, "front")
    .getByRole("link", { name: "عکاسی مجدد" })
    .click();
  await page.getByRole("link", { name: "باز کردن دوربین" }).click();
  await expect(page.getByText("کارشناس: پلاک خوانا نیست.")).toBeVisible();
  await page.getByRole("button", { name: "ثبت عکس", exact: true }).click();
  await expect(page.getByRole("heading", { name: "بررسی عکس" })).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await page
    .getByRole("button", { name: "تأیید و ادامه", exact: true })
    .click();
  await expect(page).toHaveURL(/\/photo\/chassis-number\/guide$/);
  await expect(
    page.getByText("نیاز به عکاسی مجدد: لطفاً نزدیک‌تر و واضح‌تر عکاسی کنید."),
  ).toBeVisible();
  await page.getByRole("link", { name: "باز کردن دوربین" }).click();
  await page.getByRole("button", { name: "ثبت عکس", exact: true }).click();
  await page
    .getByRole("button", { name: "تأیید و ادامه", exact: true })
    .click();
  await expect(page).toHaveURL(additionalRoutes.list("insp_demo", request.id));
  await expect(page.locator(".additional-progress")).toContainText("۲ از ۲");
  expect(await submissionRecord(page)).toEqual(original);
  expect(
    (await queueJobs(page)).filter((job) => originalJobs.includes(job.id)),
  ).toHaveLength(originalJobs.length);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const counters = window as Window & {
          photographyCameraCalls?: number;
          stoppedPhotoTracks?: number;
        };
        return counters.photographyCameraCalls === counters.stoppedPhotoTracks;
      }),
    )
    .toBe(true);
});
test("queued replacements block resubmission and persist across refresh", async ({
  page,
}) => {
  const { request } = await requestedWorkflow(page);
  await seedCandidates(page, request, 2, "queued");
  await expect(
    page.getByRole("button", { name: "ارسال مدارک تکمیلی" }),
  ).toBeDisabled();
  await page.reload();
  await expect(page.locator(".additional-progress")).toContainText("۲ از ۲");
  await expect(
    page.getByText("ابتدا ارسال فایل‌های جدید را کامل کنید."),
  ).toBeVisible();
});
test("new candidate confirmation cancels obsolete queued jobs while retaining original submission", async ({
  page,
}) => {
  await mockRecorder(page);
  const { request, original } = await requestedWorkflow(page, "one-photo");
  await seedCandidates(page, request, 1, "queued");
  const old = (await queueJobs(page)).find(
    (job) => job.requestId === request.id,
  )!;
  await requestedItem(page, "front")
    .getByRole("link", { name: "بررسی مدرک جدید" })
    .click();
  await page.getByRole("button", { name: "عکاسی مجدد", exact: true }).click();
  await page.getByRole("link", { name: "باز کردن دوربین" }).click();
  await page.getByRole("button", { name: "ثبت عکس", exact: true }).click();
  expect(
    (await queueJobs(page)).find((job) => job.id === old.id)?.current,
  ).toBe(true);
  await page
    .getByRole("button", { name: "تأیید و ادامه", exact: true })
    .click();
  await expect(page).toHaveURL(additionalRoutes.list("insp_demo", request.id));
  const jobs = await queueJobs(page);
  expect(jobs.find((job) => job.id === old.id)).toMatchObject({
    current: false,
    upload: "cancelled",
  });
  expect(
    jobs.filter((job) => job.requestId === request.id && job.current),
  ).toHaveLength(1);
  expect(await submissionRecord(page)).toEqual(original);
});
test("uploading visual exposes actual fixture byte progress", async ({
  page,
}) => {
  const { request } = await requestedWorkflow(page);
  await seedCandidates(page, request, 2, "uploading");
  await bounds(page);
  await expect(page.getByRole("progressbar")).toHaveCount(2);
  const percentage = Number(
    await page.getByRole("progressbar").first().getAttribute("aria-valuenow"),
  );
  expect(percentage).toBeGreaterThanOrEqual(44);
  expect(percentage).toBeLessThanOrEqual(45);
  await visual(page, "additional-evidence-uploading");
});
test("failed replacement uploads can retry together without original evidence loss", async ({
  page,
}) => {
  const { request, original } = await requestedWorkflow(page);
  await seedCandidates(page, request, 2, "failed");
  await bounds(page);
  await expect(page.getByRole("button", { name: "تلاش مجدد همه", exact: true })).toBeVisible();
  await visual(page, "additional-evidence-upload-failed");
  await page
    .getByRole("button", { name: "تلاش مجدد همه", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "ارسال مدارک تکمیلی", exact: true }),
  ).toBeEnabled();
  expect(await submissionRecord(page)).toEqual(original);
});
test("individual failed candidate retries through the same shared queue", async ({
  page,
}) => {
  const { request } = await requestedWorkflow(page, "one-photo");
  await seedCandidates(page, request, 1, "failed");
  await page
    .getByRole("button", { name: "تلاش مجدد برای نمای مستقیم جلو با پلاک" })
    .click();
  await expect(
    page.getByRole("button", { name: "ارسال مدارک تکمیلی", exact: true }),
  ).toBeEnabled();
  expect(
    (await queueJobs(page)).filter(
      (job) => job.requestId === request.id && job.current,
    ),
  ).toHaveLength(1);
});
test("mixed photo/video requests keep separate evidence kinds and requested ordering", async ({
  page,
}) => {
  await mockRecorder(page);
  await requestedWorkflow(page, "mixed");
  await page.getByRole("link", { name: "عکاسی مجدد", exact: true }).click();
  await page.getByRole("link", { name: "باز کردن دوربین" }).click();
  await page.getByRole("button", { name: "ثبت عکس", exact: true }).click();
  await page
    .getByRole("button", { name: "تأیید و ادامه", exact: true })
    .click();
  await expect(page).toHaveURL(/\/video\/record$/);
  await expect(
    page.getByRole("heading", { name: "ویدیوی ۳۶۰ درجه", exact: true }),
  ).toBeVisible();
});
test("native video selection remains available for a requested video when recorder is unsupported", async ({
  page,
}) => {
  await mockRecorder(page, true);
  const { original } = await requestedWorkflow(page, "video");
  await page.getByRole("link", { name: "ضبط مجدد", exact: true }).click();
  await page.getByRole("button", { name: "شروع ضبط", exact: true }).click();
  await expect(
    page.getByText(
      "ضبط مستقیم ویدیو در این مرورگر پشتیبانی نمی‌شود. از دوربین دستگاه استفاده کنید.",
    ),
  ).toBeVisible();
  await page
    .getByLabel("انتخاب یا ضبط ویدیو با دوربین دستگاه")
    .setInputFiles("tests/e2e/fixtures/walkaround.webm");
  await expect(
    page.getByRole("heading", { name: "بررسی ویدیو" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "تأیید و ذخیره" }),
  ).toBeEnabled();
  expect(await submissionRecord(page)).toEqual(original);
});
test("uncertain acknowledgement recovers on refresh without a second supplemental attempt", async ({
  page,
}) => {
  const { request } = await requestedWorkflow(page, "one-photo", {
    failure: "uncertain-once",
  });
  await seedCandidates(page, request, 1);
  await page
    .getByRole("button", { name: "ارسال مدارک تکمیلی", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "مدارک تکمیلی با موفقیت ارسال شد" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "مدارک تکمیلی با موفقیت ارسال شد" }),
  ).toBeVisible();
  expect((await requestRecord(page, request.id)).attemptCount).toBe(1);
});
test("a requested odometer photograph never unlocks the numeric odometer editor", async ({
  page,
}) => {
  const { request, original } = await requestedWorkflow(page, "one-photo");
  const job = original.summary!.jobs.find(
    (job) => job.requirementId === "odometer-on",
  )!;
  const changed = {
    ...request,
    items: [
      {
        id: "odo-photo",
        kind: "photo" as const,
        requirementId: "odometer-on",
        reviewerReason: "عدد در تصویر خوانا نیست.",
        originalEvidenceId: job.remoteEvidenceId ?? job.id,
      },
    ],
  };
  await installRequest(page, changed);
  await page.goto(
    additionalRoutes.photo("insp_demo", request.id, "odometer-on", "review"),
  );
  await expect(page.getByRole("heading", { name: "بررسی عکس" })).toBeVisible();
  await expect(page.locator('input[name="kilometers"]')).toHaveCount(0);
  expect((await submissionRecord(page)).summary?.odometer?.kilometers).toBe(
    48320,
  );
});
test("all binary uploads including processing are ready without pretending verification", async ({
  page,
}) => {
  const { request } = await requestedWorkflow(page);
  await seedCandidates(page, request, 2, "processing");
  await expect(page.getByText("در حال پردازش", { exact: true })).toHaveCount(2);
  await expect(
    page.getByRole("button", { name: "ارسال مدارک تکمیلی", exact: true }),
  ).toBeEnabled();
  await bounds(page);
  await visual(page, "additional-evidence-ready");
});
test("resubmitting visual prevents duplicate activation", async ({ page }) => {
  const { request } = await requestedWorkflow(page, "two-photo", {
    delayMs: 5000,
  });
  await seedCandidates(page, request, 2);
  await page
    .getByRole("button", { name: "ارسال مدارک تکمیلی", exact: true })
    .evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
  await expect(
    page.getByText("در حال ارسال مدارک تکمیلی برای بررسی…"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "ارسال مدارک تکمیلی", exact: true }),
  ).toBeDisabled();
  await bounds(page);
  await visual(page, "additional-evidence-resubmitting");
  expect((await requestRecord(page, request.id)).attemptCount).toBe(1);
});
test("resubmission confirmation and receipt status persist after refresh", async ({
  page,
}) => {
  const { request, original } = await requestedWorkflow(page);
  await seedCandidates(page, request, 2);
  await page
    .getByRole("button", { name: "ارسال مدارک تکمیلی", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "مدارک تکمیلی با موفقیت ارسال شد" }),
  ).toBeVisible();
  await bounds(page);
  await visual(page, "additional-evidence-resubmitted");
  const first = await requestRecord(page, request.id);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "مدارک تکمیلی با موفقیت ارسال شد" }),
  ).toBeVisible();
  expect((await requestRecord(page, request.id)).idempotencyKey).toBe(
    first.idempotencyKey,
  );
  expect(await submissionRecord(page)).toEqual(original);
  await page
    .getByRole("link", { name: "بازگشت به وضعیت بازدید", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "مشاهده رسید مدارک تکمیلی" }),
  ).toBeVisible();
  await expect(
    page.getByText("در انتظار بررسی مجدد", { exact: true }),
  ).toBeVisible();
});
test("resubmit failure retries the same durable identity and retains uploaded candidates", async ({
  page,
}) => {
  const { request } = await requestedWorkflow(page, "two-photo", {
    failure: "once",
  });
  await seedCandidates(page, request, 2);
  await page
    .getByRole("button", { name: "ارسال مدارک تکمیلی", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "تلاش مجدد", exact: true }),
  ).toBeEnabled();
  const first = await requestRecord(page, request.id);
  await page.getByRole("button", { name: "تلاش مجدد", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "مدارک تکمیلی با موفقیت ارسال شد" }),
  ).toBeVisible();
  const last = await requestRecord(page, request.id);
  expect(last.idempotencyKey).toBe(first.idempotencyKey);
  expect(last.attemptCount).toBe(2);
});
test("requested video reuses recorder/review and preserves accepted original through recording", async ({
  page,
}) => {
  await mockRecorder(page);
  const { request, original } = await requestedWorkflow(page, "video");
  await page.getByRole("link", { name: "ضبط مجدد", exact: true }).click();
  await expect(
    page.getByText(
      "نیاز به ضبط مجدد: یک دور کامل و پیوسته از خودرو دیده نمی‌شود.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "شروع ضبط", exact: true }).click();
  await expect(page.locator(".video-capture")).toHaveAttribute(
    "data-recording-state",
    "recording",
  );
  await expect(page.getByLabel("مدت ضبط")).not.toContainText("۰۰:۰۰");
  await page.getByRole("button", { name: "پایان ضبط", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "بررسی ویدیو" }),
  ).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  expect(await submissionRecord(page)).toEqual(original);
  await page
    .getByRole("button", { name: "تأیید و ذخیره", exact: true })
    .click();
  await expect(page).toHaveURL(additionalRoutes.list("insp_demo", request.id));
  await expect(page.locator(".additional-progress")).toContainText("۱ از ۱");
});
test("offline capture remains durable and resubmission waits for reconnect", async ({
  page,
}) => {
  await mockRecorder(page);
  const { request } = await requestedWorkflow(page, "one-photo");
  await setOnline(page, false);
  await page.getByRole("link", { name: "عکاسی مجدد", exact: true }).click();
  await page.getByRole("link", { name: "باز کردن دوربین" }).click();
  await page.getByRole("button", { name: "ثبت عکس", exact: true }).click();
  await page
    .getByRole("button", { name: "تأیید و ادامه", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "ارسال مدارک تکمیلی", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText("برای ارسال نهایی مدارک، اتصال اینترنت لازم است."),
  ).toBeVisible();
  await setOnline(page, true);
  await expect(
    page.getByRole("button", { name: "ارسال مدارک تکمیلی", exact: true }),
  ).toBeEnabled();
  expect((await requestRecord(page, request.id)).receipt).toBeUndefined();
});
test("unrequested and stale evidence routes fail closed while normal editable routes remain locked", async ({
  page,
}) => {
  const { request } = await requestedWorkflow(page);
  await page.goto(
    additionalRoutes.photo("insp_demo", request.id, "rear-plate", "camera"),
  );
  await expect(
    page.getByText("ویرایش این مدرک در درخواست کارشناس مجاز نیست."),
  ).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0);
  await page.goto(
    additionalRoutes.photo(
      "insp_demo",
      "stale-request",
      "front-plate",
      "review",
    ),
  );
  await expect(
    page.getByText("درخواست فعال و معتبری برای این بازدید پیدا نشد."),
  ).toBeVisible();
  await page.goto("/inspection/other/additional-evidence/" + request.id);
  await expect(
    page.getByText("درخواست فعال و معتبری برای این بازدید پیدا نشد."),
  ).toBeVisible();
  await page.goto("/inspection/insp_demo/capture/photo/odometer-on/review");
  await expect(page).toHaveURL(/\/submitted$/);
});
test("resubmitted request capture stays locked and subsequent rounds preserve history", async ({
  page,
}) => {
  const { request, original } = await requestedWorkflow(page, "one-photo");
  await seedCandidates(page, request, 1);
  await page
    .getByRole("button", { name: "ارسال مدارک تکمیلی", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "مدارک تکمیلی با موفقیت ارسال شد" }),
  ).toBeVisible();
  await page.goto(
    additionalRoutes.photo("insp_demo", request.id, "front-plate", "camera"),
  );
  await expect(
    page.getByText("این درخواست فعال نیست یا به این بازدید تعلق ندارد."),
  ).toBeVisible();
  const second = fixtureRequest(original, "video", 2);
  await installRequest(page, second);
  await openRequest(page, second);
  expect((await requestRecord(page, request.id)).receipt).toBeDefined();
  await expect(page.locator(".additional-card")).toHaveCount(1);
});
test("submitted receipt without eligible request safely rejects direct request navigation", async ({
  page,
}) => {
  await page.goto("/inspection/insp_demo/additional-evidence/nonexistent");
  await expect(
    page.getByText("درخواست فعال و معتبری برای این بازدید پیدا نشد."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "بازگشت به وضعیت بازدید" }),
  ).toHaveAttribute("href", "/inspection/insp_demo/review");
});
test("supplemental request viewport stays bounded at all customer sizes", async ({
  page,
}) => {
  await requestedWorkflow(page);
  for (const [width, height] of [
    [360, 800],
    [390, 844],
    [430, 932],
  ]) {
    await page.setViewportSize({ width, height });
    await bounds(page);
    const link = requestedItem(page, "front").getByRole("link", {
      name: "عکاسی مجدد",
    });
    const box = (await link.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await page.screenshot({
      path: `${renders}/request-${width}x${height}.png`,
    });
  }
  const link = requestedItem(page, "front").getByRole("link", {
    name: "عکاسی مجدد",
  });
  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/front-plate\/guide$/);
  for (const [width, height] of [
    [360, 800],
    [430, 932],
  ]) {
    await page.setViewportSize({ width, height });
    await expect(
      page.getByRole("link", { name: "باز کردن دوربین" }),
    ).toBeInViewport();
    await page.screenshot({ path: `${renders}/guide-${width}x${height}.png` });
  }
});
