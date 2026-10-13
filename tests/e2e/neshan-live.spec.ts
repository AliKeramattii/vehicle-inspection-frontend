import { test, expect, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

test.skip(process.env.NESHAN_LIVE_CHECK !== "1", "Explicit authorized live-provider check only.");
const folder = ".agent/reference-review/neshan-live";
const diagnostics = new WeakMap<Page,()=>Promise<void>>();
test.afterEach(async ({page}) => {await diagnostics.get(page)?.();diagnostics.delete(page);});
/** Wait for visible base imagery, never count empty overlays or a single successful tile as coverage. */
async function expectBaseCoverage(page: Page) {
  await expect.poll(() => page.locator('[data-neshan-layer="base"]').evaluateAll(layers => {
    const layer = layers[0], host = layer?.closest(".leaflet-container");
    if (!layer || !host) return { complete: false, covered: false };
    const bounds = host.getBoundingClientRect();
    const tiles = Array.from(layer.querySelectorAll("img")).map(image => ({ image, rect: image.getBoundingClientRect() }))
      .filter(({ rect }) => rect.right > bounds.left && rect.left < bounds.right && rect.bottom > bounds.top && rect.top < bounds.bottom);
    const decoded = tiles.filter(({ image }) => image.complete && image.naturalWidth >= 256 && image.classList.contains("leaflet-tile-loaded"));
    let covered = true;
    for (let y = bounds.top + 1; y < bounds.bottom; y += 32) for (let x = bounds.left + 1; x < bounds.right; x += 32)
      if (!decoded.some(({ rect }) => x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom)) covered = false;
    return { complete: tiles.length > 0 && decoded.length === tiles.length, covered };
  }), { message: "All visible base tiles decode and cover the map; optional 204 overlays are excluded." }).toEqual({ complete: true, covered: true });
  await expect(page.locator(".neshan-tile-warning")).not.toBeVisible();
}

test("real provider tiles, real address, manual edit and durable confirmation", async ({ page, context }) => {
  await mkdir(folder, { recursive: true });
  const provider: { status: number; host: string; type: string; contentType: string }[] = [];
  const failed: { host: string; reason: string | undefined }[] = [];
  page.on("requestfailed", r => failed.push({host:new URL(r.url()).hostname,reason:r.failure()?.errorText}));
  diagnostics.set(page, () => writeFile(folder+"/live-diagnostics.json",JSON.stringify({provider,failed,errors},null,2)));
  const errors: string[] = [], lookupWarnings: string[] = [];
  const clean = (s: string) => s.replace(/(?:web|service)\.[A-Za-z0-9._-]+/g, "[REDACTED]");
  page.on("pageerror", error => errors.push(clean(error.message)));
  page.on("console", message => {
    if (message.type() !== "error") return;
    const text=clean(message.text()), source=message.location().url;
    if (source.includes("/api/maps/reverse") && text.startsWith("Failed to load resource")) lookupWarnings.push(text);
    else errors.push(text);
  });
  page.on("response", response => {
    const url = new URL(response.url());
    if (url.hostname.includes("neshan")) provider.push({ status: response.status(), host: url.hostname, type:response.request().resourceType(), contentType:response.headers()["content-type"] ?? "" });
  });
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 35.699739, longitude: 51.338097, accuracy: 7 });
  await page.goto("/");
  await page.getByRole("textbox", { name: "کد معرفی / کد ارجاع" }).fill("A4K9P2");
  await page.getByRole("button", { name: "شروع بازدید" }).click();
  await page.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" }).fill("12345");
  await page.getByRole("button", { name: "همه چیز آماده است" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(page).toHaveURL(/\/location$/);
  const locationUrl = page.url();
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect.poll(() => provider.filter(r => /^tile\d+\.neshan\.org$/.test(r.host) && r.status === 200 && r.type === "image" && r.contentType.includes("image/png")).length).toBeGreaterThan(0);
  await expect.poll(() => page.locator("img.leaflet-tile").evaluateAll(images => images.filter(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth >= 256).length)).toBeGreaterThan(0);
  await expect(page.getByRole("button", { name: "تأیید این موقعیت" })).toBeDisabled();
  const pin = page.locator(".neshan-center-pin");
  await expectBaseCoverage(page);
  await page.screenshot({path:folder+"/initial-live.png"});
  await expect(pin).toBeVisible({timeout:15000});
  const original = await pin.boundingBox();
  await page.locator(".leaflet-container").click({ position: { x: 160, y: 170 } });
  const address = page.getByRole("textbox", { name: "آدرس موقعیت خودرو" });
  const resolveAddress = async () => {
    const retry=page.getByRole("button",{name:"تلاش مجدد آدرس‌یابی"});
    const confirm=page.getByRole("button",{name:"تأیید این موقعیت"});
    await expect.poll(async()=>await confirm.isEnabled()||await retry.isVisible()).toBe(true);
    if(await retry.isVisible()) await retry.click(); // One real UI retry, never substitute a mock address.
    await expect(confirm).toBeEnabled();
    await expect(address).not.toHaveValue("");
  };
  await resolveAddress();
  await expectBaseCoverage(page);
  expect(await address.inputValue()).not.toContain("آدرس آزمایشی");
  await page.locator(".leaflet-container").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".location-coordinate-values")).not.toContainText("—");
  await page.getByRole("button", { name: "بازگشت به موقعیت من" }).click();
  await expect(page.locator(".location-coordinate-values")).toContainText("35.6997390");
  await expect(page.locator(".location-coordinate-values")).toContainText("51.3380970");
  await expect(address).toHaveValue(/تهران/);
  await resolveAddress();
  await expect(page.locator(".location-source-status")).toContainText("۷ متر");
  await page.locator(".leaflet-control-zoom-in").click();
  expect((await pin.boundingBox())!.x).toBeCloseTo(original!.x, 0);
  for (const [width,height] of [[360,800],[390,844],[430,932],[1440,960]]) {
    await page.setViewportSize({ width, height }); await page.evaluate(() => document.fonts.ready);
    await expectBaseCoverage(page);
    await page.screenshot({ path: folder + "/location-real-" + width + ".png" });
    expect(await page.evaluate(() => [document.documentElement.scrollWidth,document.documentElement.scrollHeight])).toEqual([width,height]);
    const button = await page.getByRole("button", { name: "تأیید این موقعیت" }).boundingBox();
    expect(button!.y + button!.height).toBeLessThanOrEqual(height+1);
  }
  await page.setViewportSize({width:390,height:844});
  await address.fill("تهران، بزرگراه جناح، ورودی پارکینگ بازدید");
  await page.getByRole("button", { name: "تأیید این موقعیت" }).click();
  await expect(page).toHaveURL(/\/vehicle$/);
  await page.goto(locationUrl);
  await expect(address).toHaveValue("تهران، بزرگراه جناح، ورودی پارکینگ بازدید");
  await expectBaseCoverage(page);
  await page.reload();
  await expectBaseCoverage(page);
  await expect(address).toHaveValue("تهران، بزرگراه جناح، ورودی پارکینگ بازدید");
  await expect(page.locator(".location-coordinate-values")).toContainText("35.6997390");
  const saved = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve,reject) => { const open=indexedDB.open("inspection-confirmed-facts",1);open.onsuccess=()=>resolve(open.result);open.onerror=()=>reject(open.error); });
    const value = await new Promise<{location:{latitude:number;longitude:number;formattedAddress:string;selectionSource:string;accuracyMeters:number;recordedAt:string}}>((resolve,reject)=>{ const tx=db.transaction("facts");const read=tx.objectStore("facts").get("insp_demo");tx.oncomplete=()=>resolve(read.result);tx.onerror=()=>reject(tx.error); });
    db.close();return value.location;
  });
  expect(saved).toMatchObject({latitude:35.699739,longitude:51.338097,selectionSource:"gps",accuracyMeters:7,formattedAddress:"تهران، بزرگراه جناح، ورودی پارکینگ بازدید"});
  expect(Number.isNaN(Date.parse(saved.recordedAt))).toBe(false);
  // Full navigation/refresh intentionally resets mock auth. Summary rendering is covered
  // through the existing authenticated deterministic workflow, never bypass its guard.
  expect(errors).toEqual([]);
  expect(provider.filter(r => ![200,204].includes(r.status))).toEqual([]);
  await writeFile(folder+"/live-result.json", JSON.stringify({ locationUrl, tileResponses:provider, errors, lookupWarnings, gps:"browser deterministic permission fixture; reverse/tiles real", persistence:"manual address and GPS metadata survive refresh in canonical inspection facts; summary separately covered by authenticated workflow" },null,2));
});
