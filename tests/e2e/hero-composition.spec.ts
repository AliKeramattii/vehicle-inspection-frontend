import { test, expect, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { chooseDemoLocation } from "./location-helpers";
import { snapshotReady } from "./photography-helpers";
import { submissionWorkflow } from "./submission-helpers";
import { defaultSiteSettings } from "../../src/config/site-settings.defaults";

const phase = process.env.HERO_REVIEW ?? "after";
const folder = ".agent/reference-review/hero-composition/" + phase;
const viewports = [[320, 568], [360, 800], [390, 844], [430, 932], [768, 1024], [1440, 960], [844, 390]] as const;
const roles = { landing: "landing", otp: "otp", readiness: "readiness", consent: "consent", introduction: "referral", summary: "referral", receipt: "submission" } as const;
type Screen = keyof typeof roles;
const actions: Record<Screen, string> = {
 landing: ".referral-panel .entry-primary-button", otp: ".otp-edit-number", readiness: ".preparation-actions button",
 consent: ".consent-actions button", introduction: ".identity-actions button", summary: ".submission-actions button", receipt: ".receipt-actions button",
};
const errors = new WeakMap<Page, string[]>();

async function capture(page: Page, screen: Screen, width: number, height: number, name: string = screen) {
 await page.setViewportSize({ width, height });
 await expect(page.locator('[data-customer-hero="' + roles[screen] + '"] img')).toBeVisible();
 await page.locator('main').evaluate(el => el.scrollTop = 0);
 await expect(async () => { await snapshotReady(page); }).toPass({ timeout: 10000 });
 await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
 const result = await page.evaluate(() => ({
  document: [document.documentElement.scrollWidth, document.documentElement.scrollHeight], viewport: [innerWidth, innerHeight],
 }));
 await writeFile(folder + "/" + name + "-" + width + "x" + height + ".json", JSON.stringify(result, null, 2));
 await page.screenshot({ path: folder + "/" + name + "-" + width + "x" + height + ".png" });
 if (phase === "before") return;
 expect(result.document, name + " document bounds").toEqual(result.viewport);
 for (const frame of await page.locator('[data-customer-hero]').all()) {
  const image = frame.locator('img');
  expect(await image.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(await image.evaluate(el => getComputedStyle(el).objectFit)).toBe('contain');
  expect(await frame.evaluate(el => {
   const box = el.getBoundingClientRect(), img = el.querySelector('img')!.getBoundingClientRect();
   return img.left >= box.left - 1 && img.right <= box.right + 1 && img.top >= box.top - 1 && img.bottom <= box.bottom + 1;
  })).toBe(true);
 }
 for (const [copy, media] of [
  ['.landing-intro', '.landing-art'], ['.otp-intro', '.otp-art'], ['.consent-intro', '.consent-hero'],
  ['.readiness-hero-copy', '.readiness-hero [data-customer-hero]'], ['.vehicle-summary-details', '.vehicle-summary-art'],
  ['.receipt-intro', '.receipt-content > [data-customer-hero]'],
 ]) {
  if (await page.locator(copy).count() && await page.locator(media).count()) {
   const text = (await page.locator(copy).boundingBox())!, image = (await page.locator(media).boundingBox())!;
   expect(image.y, copy + " must precede media").toBeGreaterThanOrEqual(text.y + text.height + 7);
  }
 }
 const action = page.locator(actions[screen]).last();
 await action.scrollIntoViewIfNeeded();
 await expect(action).toBeInViewport();
 const hit = (await action.boundingBox())!;
 expect(hit.height).toBeGreaterThanOrEqual(44);
 if (screen === 'landing') {
  const input = (await page.locator('.code-control').boundingBox())!;
  expect(hit.y).toBeGreaterThanOrEqual(input.y + input.height);
 }
 await page.locator('main').evaluate(el => el.scrollTop = 0);
}
async function sizes(page: Page, screen: Screen) {
 for (const [width, height] of viewports) await capture(page, screen, width, height);
 await page.setViewportSize({ width: 390, height: 844 });
 // Enlarge actual text, including pixel-based roles, without altering production styles.
 const css = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>('h1,h2,h3,p,label,button,a,summary,bdi,span')).map((el, i) => {
  el.dataset.heroText = String(i); const style = getComputedStyle(el), line = parseFloat(style.lineHeight);
  return '[data-hero-text="' + i + '"]{font-size:' + parseFloat(style.fontSize) * 1.25 + 'px!important;' + (Number.isFinite(line) ? 'line-height:' + line * 1.25 + 'px!important;' : '') + '}';
 }).join(''));
 const enlarged = await page.addStyleTag({ content: css });
 await capture(page, screen, 390, 844, screen + '-text125');
 await enlarged.evaluate(el => el.parentNode?.removeChild(el));
 await page.evaluate(() => document.querySelectorAll<HTMLElement>('[data-hero-text]').forEach(el => delete el.dataset.heroText));
}
async function enterVehicle(page: Page) {
 await page.getByRole('checkbox').check();
 await page.getByRole('button', { name: 'تأیید و ادامه' }).click();
 await chooseDemoLocation(page);
 await page.getByRole('button', { name: 'تأیید این موقعیت' }).click();
 await expect(page.locator('.vehicle-summary-render')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
 await mkdir(folder, { recursive: true });
 await page.route('**/site-bootstrap.json', r => r.fulfill({ json: { schemaVersion: 1, tenantId: 'demo', apiBaseUrl: '/api', siteSettingsEndpoint: '/api/public/site-settings', settingsSource: 'mock' } }));
 const messages: string[] = []; errors.set(page, messages);
 page.on('pageerror', e => messages.push(e.message));
 page.on('console', m => { if (m.type() === 'error') messages.push(m.text()); });
 page.on('response', r => { if (r.status() >= 400) messages.push(r.status() + ' ' + new URL(r.url()).pathname); });
});
test.afterEach(({ page }) => expect(errors.get(page)).toEqual([]));

test('customer hero composition through the real workflow at all target sizes', async ({ page }) => {
 test.setTimeout(240000);
 await page.goto('/'); await expect(page.getByLabel('کد معرفی / کد ارجاع')).toBeVisible(); await sizes(page, 'landing');
 await page.getByLabel('کد معرفی / کد ارجاع').fill('A4K9P2'); await page.getByRole('button', { name: 'شروع بازدید' }).click();
 await expect(page.getByLabel('کد تأیید پنج‌رقمی')).toBeVisible(); await sizes(page, 'otp');
 await page.getByLabel('کد تأیید پنج‌رقمی').fill('12345'); await expect(page.getByRole('button', { name: 'همه چیز آماده است' })).toBeEnabled();
 await sizes(page, 'readiness'); await expect(page.locator('.device-diagnostics li')).toHaveCount(4);
 await page.getByRole('button', { name: 'همه چیز آماده است' }).click(); await sizes(page, 'consent');
 await enterVehicle(page); await sizes(page, 'introduction');
 await submissionWorkflow(page); await sizes(page, 'summary');
 await page.getByRole('button', { name: 'ارسال برای بررسی', exact: true }).click(); await expect(page).toHaveURL(/submitted$/); await sizes(page, 'receipt');
});

for (const [shape, width, height] of [['standard', 1672, 941], ['portrait', 500, 800], ['square', 600, 600], ['wide', 1200, 400]] as const) {
 test('tenant ' + shape + ' heroes remain contained without changing configured assets', async ({ page }) => {
  test.setTimeout(120000);
  const settings = defaultSiteSettings('hero-test'), url = '/images/tenant-hero-' + shape + '.webp';
  settings.identity.brokerageName = 'کارگزاری بیمه همراه و پشتیبان شما';
  for (const key of Object.values(roles)) settings.images[key] = url;
  const image = await sharp('references/assets/new-vehicle/source/front-45-left.webp').resize(width, height, { fit: 'contain', background: '#ffffff' }).webp().toBuffer();
  await page.route('**' + url, r => r.fulfill({ contentType: 'image/webp', body: image }));
  await page.route('**/site-bootstrap.json', r => r.fulfill({ json: { schemaVersion: 1, tenantId: 'hero-test', apiBaseUrl: '/api', siteSettingsEndpoint: '/api/public/site-settings', settingsSource: 'api' } }));
  await page.route('**/api/public/site-settings', r => r.fulfill({ json: settings }));
  async function custom(screen: Screen, w = 390, h = 844) {
   await expect(page.locator('[data-customer-hero="' + roles[screen] + '"] img')).toHaveAttribute('src', new URL(url, page.url()).href);
   await capture(page, screen, w, h, 'tenant-' + shape + '-' + screen);
   if (phase !== 'before' && shape === 'standard' && screen !== 'otp') await expect(page).toHaveScreenshot('hero-' + screen + '.png');
  }
  await page.goto('/'); await custom('landing');
  await page.getByLabel('کد معرفی / کد ارجاع').fill('A4K9P2'); await page.getByRole('button', { name: 'شروع بازدید' }).click(); await custom('otp', 320, 568);
  await page.getByLabel('کد تأیید پنج‌رقمی').fill('12345'); await expect(page.getByRole('button', { name: 'همه چیز آماده است' })).toBeEnabled(); await custom('readiness');
  await page.getByRole('button', { name: 'همه چیز آماده است' }).click(); await custom('consent'); await enterVehicle(page); await custom('introduction');
  await submissionWorkflow(page); await page.getByRole('button', { name: 'ارسال برای بررسی', exact: true }).click(); await expect(page).toHaveURL(/submitted$/); await custom('receipt');
 });
}

test('image loading reserves the final landing frame and form position', async ({ page }) => {
 let release!: () => void; const hold = new Promise<void>(resolve => release = resolve);
 await page.route('**/_next/image?**', async route => { if (decodeURIComponent(route.request().url()).includes('/hero/landing-vehicle.webp')) await hold; await route.continue(); });
 await page.goto('/', { waitUntil: 'domcontentloaded' }); await expect(page.getByLabel('کد معرفی / کد ارجاع')).toBeVisible();
 const frame = page.locator('[data-customer-hero="landing"]'), panel = page.locator('.referral-panel');
 await expect(frame).toBeVisible(); await page.evaluate(() => document.fonts.ready);
 const before = [await frame.boundingBox(), await panel.boundingBox()]; release(); await snapshotReady(page);
 expect([await frame.boundingBox(), await panel.boundingBox()]).toEqual(before);
});
