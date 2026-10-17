import { test, expect, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { semanticHex } from "./color-helpers";
test.skip(process.env.NESHAN_LIVE_CHECK !== "1", "Explicit authorized real-provider recovery check only");
const folder = ".agent/reference-review/regression-recovery";
test.afterEach(async ({ page }, info) => { if (info.status !== info.expectedStatus) {
    await page.screenshot({ path: folder + "/failed-" + info.line + ".png" });
    await writeFile(folder + "/failed-" + info.line + ".json", JSON.stringify(await page.evaluate(() => ({ baseLayers: document.querySelectorAll('[data-neshan-layer="base"]').length, host: document.querySelector(".leaflet-container")?.getBoundingClientRect().toJSON(), tiles: [...document.querySelectorAll<HTMLImageElement>("img.leaflet-tile")].map(i => ({ loaded: i.complete, width: i.naturalWidth, base: !!i.closest('[data-neshan-layer="base"]'), rect: i.getBoundingClientRect().toJSON() })) })), null, 2));
} });
async function login(page: Page) { await page.goto("/"); await page.getByLabel("کد معرفی / کد ارجاع").fill("A4K9P2"); await page.getByRole("button", { name: "شروع بازدید" }).click(); await page.getByLabel("کد تأیید پنج‌رقمی").fill("12345"); await expect(page).toHaveURL(/readiness$/); }
async function coverage(page: Page) {
    await expect.poll(() => page.locator('[data-neshan-layer="base"]').evaluateAll(layers => {
        const host = layers[0]?.closest(".leaflet-container");
        if (!host)
            return false;
        const bounds = host.getBoundingClientRect();
        const tiles = [...layers[0].querySelectorAll("img")].filter(i => i.complete && i.naturalWidth >= 256 && i.classList.contains("leaflet-tile-loaded")).map(i => i.getBoundingClientRect());
        for (let y = bounds.top + 1; y < bounds.bottom; y += 32)
            for (let x = bounds.left + 1; x < bounds.right; x += 32)
                if (!tiles.some(t => x >= t.left && x < t.right && y >= t.top && y < t.bottom))
                    return false;
        return bounds.height > 250 && bounds.width > 300;
    }), { message: "Real decoded base imagery covers the visible map" }).toBe(true);
}
async function overflow(page: Page, width: number, height: number) { expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([width, height]); }
test("same live app: Emerald, blocked permission recovery, readiness to consent to real map", async ({ page, context }) => {
    await mkdir(folder, { recursive: true });
    await context.grantPermissions([]);
    const errors: string[] = [];
    page.on("pageerror", () => errors.push("page error"));
    await page.addInitScript(() => {
        const counts = { camera: 0, gps: 0 };
        (window as unknown as {
            readinessRequests: typeof counts;
        }).readinessRequests = counts;
        const media = navigator.mediaDevices;
        if (media?.getUserMedia) {
            const open = media.getUserMedia.bind(media);
            media.getUserMedia = async (constraints) => { counts.camera++; return open(constraints); };
        }
        if (navigator.geolocation) {
            const locate = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
            navigator.geolocation.getCurrentPosition = (...args) => { counts.gps++; return locate(...args); };
        }
    });
    await page.goto("/");
    await expect(page.getByLabel("کد معرفی / کد ارجاع")).toBeVisible();
    expect(await semanticHex(page, "--color-primary")).toBe("#007a55");
    await page.screenshot({ path: folder + "/landing-emerald-390.png" });
    await login(page);
    await expect(page.getByText(/دسترسی دوربین مسدود است/)).toBeVisible();
    await expect(page.getByRole("button", { name: "همه چیز آماده است" })).toBeDisabled();
    await page.getByRole("button", { name: "بررسی دوباره" }).click();
    await expect(page.getByText(/دسترسی دوربین مسدود است/)).toBeVisible();
    await page.screenshot({ path: folder + "/readiness-blocked-390.png" });
    await context.grantPermissions(["camera"]);
    await page.getByRole("button", { name: "بررسی دوباره" }).click();
    await expect(page.getByRole("button", { name: "همه چیز آماده است" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "بررسی دوباره" })).toHaveCount(0);
    await expect(page.locator('.device-diagnostics li').filter({ hasText: "موقعیت مکانی" })).toHaveAttribute("data-status", "permission-denied");
    expect(await page.evaluate(() => (window as unknown as {
        readinessRequests: {
            camera: number;
            gps: number;
        };
    }).readinessRequests)).toEqual({ camera: 0, gps: 0 });
    for (const [width, height] of [[360, 800], [390, 844], [430, 932]]) {
        await page.setViewportSize({ width, height });
        await overflow(page, width, height);
        await page.getByRole("button", { name: "همه چیز آماده است" }).scrollIntoViewIfNeeded();
        await page.screenshot({ path: folder + "/readiness-working-" + width + ".png" });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "همه چیز آماده است" }).click();
    await expect(page).toHaveURL(/consent$/);
    await page.screenshot({ path: folder + "/after-readiness-consent-390.png" });
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "تأیید و ادامه" }).click();
    await expect(page).toHaveURL(/location$/);
    await expect(page.locator(".neshan-location-map")).toHaveAttribute("data-map-state", "ready");
    await coverage(page);
    expect(await semanticHex(page, "--color-primary")).toBe("#007a55");
    const reverse = page.waitForResponse(r => new URL(r.url()).pathname === "/api/maps/reverse");
    await page.locator(".leaflet-container").click({ position: { x: 160, y: 170 } });
    const result = await reverse;
    expect(result.status()).toBe(200);
    expect(typeof (await result.json()).formatted_address).toBe("string");
    const address = page.getByLabel("آدرس موقعیت خودرو");
    await expect(address).toHaveValue(/[\u0600-\u06ff]/);
    for (const [width, height] of [[360, 800], [390, 844], [430, 932]]) {
        await page.setViewportSize({ width, height });
        await coverage(page);
        await overflow(page, width, height);
        await page.screenshot({ path: folder + "/map-real-" + width + ".png" });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await address.fill("تهران، ورودی پارکینگ بازدید");
    await page.getByRole("button", { name: "تأیید این موقعیت" }).click();
    await expect(page).toHaveURL(/vehicle$/);
    await page.goto("/inspection/insp_demo/location");
    await expect(address).toHaveValue("تهران، ورودی پارکینگ بازدید");
    await coverage(page);
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto("/admin/site-settings");
    await expect(page.getByLabel("نام کارگزاری")).toBeVisible();
    await page.getByRole("switch", { name: "پوسته تیره" }).check();
    await expect(page.locator("html")).toHaveAttribute("data-admin-theme", "dark");
    await page.screenshot({ path: folder + "/admin-emerald-dark-1440.png" });
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-admin-theme", "dark");
    await page.getByRole("switch", { name: "پوسته تیره" }).uncheck();
    await page.emulateMedia({ colorScheme: "light" });
    await page.getByRole("button", { name: "استفاده از پوسته دستگاه" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-admin-theme", "light");
    await page.screenshot({ path: folder + "/admin-emerald-light-1440.png" });
    await page.goto("/");
    await expect(page.getByLabel("کد معرفی / کد ارجاع")).toBeVisible();
    expect(await semanticHex(page, "--color-primary")).toBe("#007a55");
    expect(errors).toEqual([]);
    await writeFile(folder + "/joint-result.json", JSON.stringify({ origin: "http://localhost:3114", theme: "approved Emerald 700", permissionRecovery: "denied to granted then explicit recheck", automaticPermissionRequests: 0, journey: "readiness -> consent -> location -> vehicle", tiles: "real provider, complete visible base coverage", reverseHTTP: 200, persianAddress: true, persistence: true, adminLightDarkSystem: true, errors }, null, 2));
});
test("legacy untouched demo theme and partial null-key map recover together without editing durable records", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel("کد معرفی / کد ارجاع")).toBeVisible();
    const snapshot = await page.evaluate(async () => { const db = await new Promise<IDBDatabase>(resolve => { const r = indexedDB.open("inspection-site-settings", 2); r.onsuccess = () => resolve(r.result); }); let snapshot = ""; await new Promise<void>((resolve, reject) => { const tx = db.transaction("settings", "readwrite"), r = tx.objectStore("settings").openCursor(); r.onsuccess = () => { const cursor = r.result; if (!cursor)
        return; if (!String(cursor.key).startsWith("deployment-binding:")) {
        const v = cursor.value;
        v.revision = 1;
        v.audit = [];
        v.published.version = 1;
        v.published.theme = { primary: "#2563eb", secondary: "#64748b", background: "#f8fafc", neutral: "#e2e8f0", onPrimary: "#ffffff", onBackground: "#111827" };
        v.published.application.locationMap.webMapKey = null;
        v.published.application.locationMap.initialViewport.zoom = 14;
        v.draft = structuredClone(v.published);
        v.history = [structuredClone(v.published)];
        snapshot = JSON.stringify(v);
        cursor.update(v);
    } cursor.continue(); }; tx.oncomplete = () => resolve(); tx.onabort = () => reject(Error("fixture write failed")); }); db.close(); return snapshot; });
    await login(page);
    await expect(page.getByRole("button", { name: "همه چیز آماده است" })).toBeEnabled();
    expect(await semanticHex(page, "--color-primary")).toBe("#007a55");
    await page.getByRole("button", { name: "همه چیز آماده است" }).click();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "تأیید و ادامه" }).click();
    await coverage(page);
    await page.screenshot({ path: folder + "/legacy-reconciled-map-390.png" });
    expect(await page.evaluate(async (snapshot) => { const db = await new Promise<IDBDatabase>(resolve => { const r = indexedDB.open("inspection-site-settings", 2); r.onsuccess = () => resolve(r.result); }); const same = await new Promise<boolean>(resolve => { const tx = db.transaction("settings"), r = tx.objectStore("settings").getAll(); tx.oncomplete = () => resolve(r.result.some(v => JSON.stringify(v) === snapshot)); }); db.close(); return same; }, snapshot)).toBe(true);
});
