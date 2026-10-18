"use client";
import { useEffect, useState } from "react";
import { BrandingAssetRepository, type AssetBinding } from "./asset-repository";
/** Blob URLs are view-owned and never stored in Site Settings or localStorage. */
export function useBrandingAsset(reference: string | null | undefined, binding: AssetBinding) {
  const local = Boolean(reference?.startsWith("/__local-branding/"));
  const [resolved, setResolved] = useState<{ key: string; reference: string; url?: string; error?: string }>();
  const { contextKey, tenantId } = binding;
  useEffect(() => {
    if (!local || !reference) return;
    let active = true, owned: string | undefined;
    void new BrandingAssetRepository().resolve({ contextKey, tenantId }, reference).then(asset => {
      if (!active) return;
      if (!asset) { setResolved({ key: contextKey, reference, error: "تصویر محلی در این مرورگر پیدا نشد." }); return; }
      owned = URL.createObjectURL(asset.blob); setResolved({ key: contextKey, reference, url: owned });
    }).catch(() => { if (active) setResolved({ key: contextKey, reference, error: "خواندن تصویر محلی ممکن نشد." }); });
    return () => { active = false; if (owned) URL.revokeObjectURL(owned); };
  }, [local, reference, contextKey, tenantId]);
  const current = resolved?.key === contextKey && resolved.reference === reference ? resolved : undefined;
  return { url: local ? current?.url : reference || undefined, loading: local && !current, error: current?.error };
}
