import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

test("development origins have identical landing, working HMR/assets, and fresh mock state", async ({ browser }, testInfo) => {
  test.setTimeout(90_000);
  const origins = (process.env.DEV_TEST_ORIGINS ?? "").split(",").filter(Boolean);
  expect(origins.length).toBeGreaterThanOrEqual(2);
  for (const [index, origin] of origins.entries()) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    try {
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
      page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      page.on("requestfailed", (request) => {
        if (request.failure()?.errorText !== "net::ERR_ABORTED") errors.push(`${request.failure()?.errorText} ${request.url()}`);
      });
      const hmrConnected = new Promise<void>((resolve, reject) => {
        page.on("websocket", (socket) => {
          if (!new URL(socket.url()).pathname.startsWith("/_next/hmr")) return;
          socket.on("framereceived", () => resolve());
          socket.on("socketerror", (error) => reject(new Error(`HMR ${origin}: ${error}`)));
        });
      });
      const response = await page.goto(origin);
      expect(response?.headers()["cache-control"]).toContain("no-cache");
      await hmrConnected;
      const referral = page.getByRole("textbox", { name: "کد معرفی / کد ارجاع" });
      await expect(referral).toHaveValue("");
      await referral.focus();
      await page.getByRole("heading", { name: "بازدید آنلاین خودرو در کمتر از ۱۵ دقیقه" }).click();
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const state = await page.evaluate(async () => ({
        local: Object.keys(localStorage), session: Object.keys(sessionStorage), cookies: document.cookie,
        workers: "serviceWorker" in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0,
        controller: "serviceWorker" in navigator ? navigator.serviceWorker.controller?.scriptURL ?? null : null,
        images: [...document.images].every((image) => image.complete && image.naturalWidth > 0 && new URL(image.currentSrc).origin === location.origin),
        font: document.fonts.check("16px vazirmatn"),
      }));
      expect(state).toEqual({ local: [], session: [], cookies: "", workers: 0, controller: null, images: true, font: true });
      const screenshot = await page.screenshot({ animations: "disabled", path: testInfo.outputPath(`landing-origin-${index + 1}.png`) });
      // Localhost is the source of truth for this run. Use Playwright's visual
      // comparator so harmless edge antialiasing is not mistaken for UI drift.
      if (index === 0) {
        const baseline = testInfo.snapshotPath("landing-origin-parity.png");
        await mkdir(dirname(baseline), { recursive: true });
        await writeFile(baseline, screenshot);
      } else {
        expect(screenshot).toMatchSnapshot("landing-origin-parity.png", { maxDiffPixels: 0 });
      }
      await testInfo.attach(`landing-origin-${index + 1}`, { body: screenshot, contentType: "image/png" });
      await referral.fill("A4K9P2");
      await page.getByRole("button", { name: "شروع بازدید" }).click();
      await expect(page).toHaveURL(`${origin}/verify`);
      await expect(page.locator(".otp-art img")).toBeVisible();
      await expect.poll(() => page.locator(".otp-art img").evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)).toBe(true);
      await page.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" }).fill("12345");
      await expect(page.getByRole("heading", { name: "قبل از شروع، آماده‌اید؟" })).toBeVisible();
      await expect(page).toHaveURL(`${origin}/readiness`);
      await page.reload();
      await expect(page.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" })).toHaveCount(0);
      await page.goto(origin);
      await expect(referral).toHaveValue("");
      expect(errors, `Browser errors at ${origin}`).toEqual([]);
    } finally { await context.close(); }
  }
});
