"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { SecondaryButton } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/status";

export type PhotoFrame = "automotive-hero" | "vehicle-overview" | "exterior-guide" | "interior-guide" | "technical-closeup" | "captured-evidence" | "comparison";

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
export function PhotoImage({ src, blob, alt, className = "", eager = false, sizes = "(max-width: 480px) 100vw, 480px", frame = "exterior-guide", retry = true }: { src?: string; blob?: Blob; alt: string; className?: string; eager?: boolean; sizes?: string; frame?: PhotoFrame; retry?: boolean }) {
  const url = useBlobUrl(blob), image = blob ? url : src;
  return <ImageFrame key={image ?? "loading"} image={image} alt={alt} className={className} eager={eager} sizes={sizes} frame={frame} retry={retry} local={Boolean(blob)} />;
}

function ImageFrame({ image, alt, className, eager, sizes, frame, retry, local }: { image?: string; alt: string; className: string; eager: boolean; sizes: string; frame: PhotoFrame; retry: boolean; local: boolean }) {
  const [failed, setFailed] = useState(false), [attempt, setAttempt] = useState(0), [ratio, setRatio] = useState(4 / 3);
  return <div className={`photography-image ${className}`} data-frame={frame} style={{ "--photo-ratio": ratio } as CSSProperties}>
    {failed ? <div className="photo-image-failure"><InlineAlert tone="warning" role="alert">تصویر قابل نمایش نیست.</InlineAlert>{retry && <SecondaryButton onClick={() => { setFailed(false); setAttempt((value) => value + 1); }}>تلاش دوباره</SecondaryButton>}</div> : image ?
      <Image key={attempt} src={image} alt={alt} fill sizes={sizes} loading={eager ? "eager" : "lazy"} unoptimized={local}
        onLoad={(event) => { const img = event.currentTarget; if (img.naturalWidth && img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight); }} onError={() => setFailed(true)} /> :
      <div className="photo-image-loading" role="status">در حال آماده‌سازی تصویر…</div>}
  </div>;
}
