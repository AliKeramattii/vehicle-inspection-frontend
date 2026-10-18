import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { File as NodeFile } from "node:buffer";
import { validateImageMetadata, inspectImageBytes } from "@/features/admin/assets/asset-validation";
import { BrandingAssetRepository, MemoryBrandingAssets, localAssetId } from "@/features/admin/assets/asset-repository";
import { actors } from "@/features/admin/model";
import { siteSettingsSchema } from "@/config/site-settings.schema";
import { defaultSiteSettings } from "@/config/site-settings.defaults";
const png = new Uint8Array(readFileSync("public/images/auth/landing-suv.png"));
const policy = { favicon: false, maxBytes: 8 * 1024 * 1024 };
describe("bounded local branding assets", () => {
  it("identifies real approved PNG and WebP headers and dimensions", () => {
    expect(inspectImageBytes(png)).toMatchObject({ format: "png", mimeType: "image/png" });
    const webp = new Uint8Array(readFileSync("public/images/preparation/vehicle-inspection.webp"));
    expect(inspectImageBytes(webp)).toMatchObject({ format: "webp", mimeType: "image/webp" });
    expect(validateImageMetadata({ name: "logo.png", type: "image/png", size: png.length }, png, policy).width).toBeGreaterThan(0);
  });
  it.each(["payload.exe", "logo.svg", "logo.jpg"])("rejects executable, SVG or mismatched extension %s", name => {
    expect(() => validateImageMetadata({ name, type: "image/png", size: png.length }, png, policy)).toThrow();
  });
  it("rejects MIME spoofing, excess bytes, corrupt data and oversized dimensions before decoding", () => {
    expect(() => validateImageMetadata({ name: "x.png", type: "image/jpeg", size: png.length }, png, policy)).toThrow();
    expect(() => validateImageMetadata({ name: "x.png", type: "image/png", size: policy.maxBytes + 1 }, png, policy)).toThrow();
    expect(() => inspectImageBytes(new Uint8Array(30))).toThrow();
    const oversized = png.slice(0, 24); new DataView(oversized.buffer).setUint32(16, 100000);
    expect(() => validateImageMetadata({ name: "x.png", type: "image/png", size: 24 }, oversized, policy)).toThrow();
  });
  it("receipt image is additive and old Site Settings remain valid", () => {
    const settings = defaultSiteSettings("demo"); delete settings.images.submission;
    expect(siteSettingsSchema.safeParse(settings).success).toBe(true);
    settings.images.submission = "/__local-branding/demo/12345678-1234-1234-1234-123456789abc.png";
    expect(siteSettingsSchema.safeParse(settings).success).toBe(true);
  });
  it("persists immutable Blob references separately from settings, with actor and deployment isolation", async () => {
    const store = new MemoryBrandingAssets(), validate = vi.fn().mockResolvedValue({ format: "png", mimeType: "image/png", width: 20, height: 20 });
    const repo = new BrandingAssetRepository(store, validate, () => "12345678-1234-1234-1234-123456789abc");
    const file = new NodeFile([png], "logo.png", { type: "image/png" }) as unknown as File;
    const binding = { contextKey: "origin-a:demo", tenantId: "demo" };
    await expect(repo.upload(actors.reviewer, binding, file, policy)).rejects.toThrow(); expect(validate).not.toHaveBeenCalled();
    const saved = await repo.upload(actors["platform-admin"], binding, file, policy);
    expect(saved.reference).toMatch(/^\/__local-branding\/demo\//);
    expect((await repo.resolve(binding, saved.reference))?.id).toBe(saved.id);
    expect(await repo.resolve({ ...binding, contextKey: "origin-b:demo" }, saved.reference)).toBeUndefined();
    expect(await repo.resolve({ contextKey: "origin-a:other", tenantId: "other" }, saved.reference)).toBeUndefined();
    expect(localAssetId(saved.reference, "demo")).toBe(saved.id);
    expect(saved.reference).not.toContain("blob:"); expect(saved.reference).not.toContain("base64");
    await expect(repo.upload(actors["platform-admin"], binding, file, policy)).rejects.toThrow();
    expect((await repo.resolve(binding, saved.reference))?.id).toBe(saved.id);
  });
});
