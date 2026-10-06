"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

function useBlobUrl(blob: Blob | undefined) {
  const [value, setValue] = useState<{ blob: Blob; url: string }>();
  useEffect(() => {
    if (!blob) return;
    let active = true, url: string | undefined;
    Promise.resolve().then(() => { if (active) { url = URL.createObjectURL(blob); setValue({ blob, url }); } });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [blob]);
  return value?.blob === blob ? value?.url : undefined;
}
export function PhotoImage({ src, blob, alt, className = "", eager = false, sizes = "(max-width: 480px) 100vw, 480px" }: { src?: string; blob?: Blob; alt: string; className?: string; eager?: boolean; sizes?: string }) {
  const url = useBlobUrl(blob), image = blob ? url : src;
  return <div className={`photography-image ${className}`}>{image ? <Image src={image} alt={alt} fill sizes={sizes} loading={eager ? "eager" : "lazy"} unoptimized={Boolean(blob)} /> : <div className="photo-image-loading" role="status">در حال آماده‌سازی تصویر…</div>}</div>;
}
