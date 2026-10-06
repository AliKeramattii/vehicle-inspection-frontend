import type { LocalPhoto } from "@/lib/media/photo-store";
import type { PhotoRequirement } from "@/schemas/photography";
import { PhotoImage } from "./photo-image";
import { photographyStateLabels, photographyVisualState } from "./photography-model";

export function PhotographyShotCard({ photo, records, selected, onSelect }: { photo: PhotoRequirement; records: readonly LocalPhoto[]; selected: boolean; onSelect: () => void }) {
  const state = photographyVisualState(photo, records), record = records.find((record) => record.requirementId === photo.id);
  return <button type="button" className="photography-shot-card" data-state={state} data-requirement={photo.id} aria-pressed={selected} aria-label={`${photo.title}، ${photographyStateLabels[state]}`} onClick={onSelect}>
    <PhotoImage src={photo.sampleImage} blob={record?.draft?.blob ?? record?.blob} alt="" sizes="84px" />
    <span className="shot-state-icon" aria-hidden="true">{state === "complete" ? "✓" : state === "attention" ? "↻" : "•"}</span>
    <strong>{photo.title}</strong><small>{state === "attention" ? "بررسی مجدد" : photographyStateLabels[state]}</small>
  </button>;
}
