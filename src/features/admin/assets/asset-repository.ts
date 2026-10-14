import { allowed, type AdminActor } from "../model";
import { openSiteSettingsDb } from "@/config/site-settings-db";
import { validateBrandingFile, type ImageMetadata, type ImageFilePolicy } from "./asset-validation";
export type AssetBinding = { contextKey: string; tenantId: string };
export type LocalBrandingAsset = ImageMetadata & AssetBinding & { id: string; reference: string; blob: Blob; byteSize: number; createdAt: string; originalName: string };
export interface BrandingAssetStore { add(asset: LocalBrandingAsset): Promise<void>; read(id: string): Promise<LocalBrandingAsset | undefined> }
export class IndexedDbBrandingAssets implements BrandingAssetStore {
  async add(asset: LocalBrandingAsset) {
    const db = await openSiteSettingsDb();
    return new Promise<void>((resolve, reject) => { const tx = db.transaction("branding-assets", "readwrite"); tx.objectStore("branding-assets").add(asset, asset.id);
      tx.oncomplete = () => { db.close(); resolve(); }; tx.onabort = tx.onerror = () => { db.close(); reject(new Error("ذخیره تصویر روی این دستگاه انجام نشد.")); }; });
  }
  async read(id: string) {
    const db = await openSiteSettingsDb();
    return new Promise<LocalBrandingAsset | undefined>((resolve, reject) => { const tx = db.transaction("branding-assets"), request = tx.objectStore("branding-assets").get(id);
      tx.oncomplete = () => { db.close(); resolve(request.result); }; tx.onabort = tx.onerror = () => { db.close(); reject(new Error("خواندن تصویر محلی ممکن نشد.")); }; });
  }
}
export class MemoryBrandingAssets implements BrandingAssetStore {
  private records = new Map<string, LocalBrandingAsset>();
  async add(asset: LocalBrandingAsset) { if (this.records.has(asset.id)) throw new Error("Asset identity already exists"); this.records.set(asset.id, { ...asset }); }
  async read(id: string) { const asset = this.records.get(id); return asset && { ...asset }; }
}
export function localAssetId(reference: string, tenantId: string) {
  const match = reference.match(/^\/__local-branding\/([a-z][a-z0-9-]{1,47})\/([a-f0-9-]{36})\.(png|jpg|webp|ico)$/);
  return match?.[1] === tenantId ? match[2] : undefined;
}
export class BrandingAssetRepository {
  constructor(private store: BrandingAssetStore = new IndexedDbBrandingAssets(), private validate = validateBrandingFile, private id = () => crypto.randomUUID()) {}
  async upload(actor: AdminActor, binding: AssetBinding, file: File, policy: ImageFilePolicy, signal?: AbortSignal) {
    if (!allowed(actor.role, "branding")) throw new Error("فقط مدیر سایت اجازه انتخاب تصویر برند را دارد.");
    const metadata = await this.validate(file, policy, signal); signal?.throwIfAborted();
    const id = this.id(), reference = "/__local-branding/" + binding.tenantId + "/" + id + "." + metadata.format;
    const asset: LocalBrandingAsset = { ...binding, ...metadata, id, reference, blob: new Blob([file], { type: metadata.mimeType }), byteSize: file.size, originalName: file.name, createdAt: new Date().toISOString() };
    await this.store.add(asset); signal?.throwIfAborted(); return asset;
  }
  async resolve(binding: AssetBinding, reference: string) {
    const id = localAssetId(reference, binding.tenantId); if (!id) return undefined;
    const asset = await this.store.read(id);
    return asset?.contextKey === binding.contextKey && asset.tenantId === binding.tenantId && asset.reference === reference ? asset : undefined;
  }
}
