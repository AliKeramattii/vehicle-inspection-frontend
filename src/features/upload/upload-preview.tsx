"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { durableUploadMedia } from "./media-source";
import type { UploadJob } from "./upload-model";

/** Decode only visible photos, shrink to a thumbnail and release the bitmap/full Blob reference. */
export function UploadPreview({ job }: { job: UploadJob }) {
  const element = useRef<HTMLDivElement>(null), [url, setUrl] = useState<string>(), [failed, setFailed] = useState(false);
  const { namespace, evidenceKind, localBlobKey, revision, byteSize, mimeType } = job;
  useEffect(() => {
    if (evidenceKind !== "photo" || !element.current) return;
    let active = true, imageUrl: string | undefined, loaded = false;
    const load = async () => {
      if (loaded) return; loaded = true;
      try {
        const blob = await durableUploadMedia.read({ namespace, evidenceKind, localBlobKey, revision, byteSize, mimeType });
        if (!active) return;
        const bitmap = await createImageBitmap(blob, { resizeWidth: 144, resizeQuality: "medium" });
        try {
          if (!active) return;
          const canvas = document.createElement("canvas"); canvas.width = bitmap.width; canvas.height = bitmap.height;
          canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
          const thumbnail = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.75));
          if (active && thumbnail) { imageUrl = URL.createObjectURL(thumbnail); setUrl(imageUrl); }
        } finally { bitmap.close(); }
      } catch { if (active) setFailed(true); }
    };
    const observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) { observer.disconnect(); void load(); } });
    observer.observe(element.current);
    return () => { active = false; observer.disconnect(); if (imageUrl) URL.revokeObjectURL(imageUrl); };
  }, [namespace, evidenceKind, localBlobKey, revision, byteSize, mimeType]);
  return <div className="upload-preview" ref={element}>{url ? <Image src={url} width={72} height={56} unoptimized alt="" /> : <Icon name={job.evidenceKind === "video-360" ? "video" : "camera"} size={26} />}{failed && <span className="sr-only">پیش‌نمایش در دسترس نیست</span>}</div>;
}
