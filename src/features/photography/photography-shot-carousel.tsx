"use client";

import { useEffect, useRef } from "react";
import type { LocalPhoto } from "@/lib/media/photo-store";
import type { PhotoRequirement } from "@/schemas/photography";
import { PhotographyShotCard } from "./photography-shot-card";

export function PhotographyShotCarousel({ photos, records, selectedId, onSelect }: { photos: readonly PhotoRequirement[]; records: readonly LocalPhoto[]; selectedId: string; onSelect: (id: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => { container.current?.querySelector<HTMLElement>('[aria-pressed="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" }); }, [selectedId]);
  return <div ref={container} className="photography-shot-carousel" role="group" aria-label="عکس‌های مورد نیاز">{photos.map((photo) => <PhotographyShotCard key={photo.id} photo={photo} records={records} selected={photo.id === selectedId} onSelect={() => onSelect(photo.id)} />)}</div>;
}
