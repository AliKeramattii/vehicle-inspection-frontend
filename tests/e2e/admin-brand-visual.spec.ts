import { test, expect } from "@playwright/test";

test("reviewed Admin blue cyan surfaces at 1440x960", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Admin visual acceptance is desktop-first");
  await page.clock.setFixedTime(new Date("2026-10-18T06:30:00.000Z"));
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.route("**/site-bootstrap.json", route => route.fulfill({ json: { schemaVersion: 1, tenantId: "demo", apiBaseUrl: "/api", siteSettingsEndpoint: "/api/public/site-settings", settingsSource: "mock" } }));
  await page.addInitScript(() => { if (!localStorage.getItem("inspection-admin-theme")) localStorage.setItem("inspection-admin-theme", "light"); });
  for (const [route, name] of [["/admin", "dashboard"], ["/admin/site-settings", "site-settings"]]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: name === "dashboard" ? "داشبورد" : "تنظیمات سایت", exact: true })).toBeVisible();
    await expect(page.locator(".admin-loading")).toHaveCount(0);
    for (const dark of [false, true]) {
      await page.getByRole("switch", { name: "پوسته تیره" }).setChecked(dark);
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);
      await page.locator(".application-logo img:visible").evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode())));
      // Vehicle artwork is unrelated local work; full unmasked BEFORE/AFTER captures are retained separately.
      await expect(page).toHaveScreenshot("admin-brand-" + name + "-" + (dark ? "dark" : "light") + ".png", { mask: [page.locator(".settings-preview-vehicle")], maskColor: "#E2E8F0" });
    }
  }
});
