"use client";

import { useEffect, useId, useRef, type RefObject, type KeyboardEvent, type ClipboardEvent } from "react";
import { iranianPlateLetters, iranianPlateSchema } from "@/schemas/domain";
import type { IranianPlate } from "@/types/domain";
import { normalizeCode, normalizeDigits, toPersianDigits } from "@/lib/utils/persian";
import { SegmentedCodeInput } from "@/components/ui/segmented-code-input";

export type PlateDraft = { firstTwoDigits: string; letter: string; threeDigits: string; regionDigits: string };
export const plateSegmentOrder = ["firstTwoDigits", "letter", "threeDigits", "regionDigits"] as const;
export function parsePastedPlate(text: string): IranianPlate | null {
  const normalized = normalizeDigits(text).replace(/ي/g, "ی").replace(/[-،]/g, " ").trim();
  const match = normalized.match(/^(\d{2})\s*(الف|[بجدسصطعقلمنوهی])\s*(\d{3})\s*(?:ایران\s*)?(\d{2})$/);
  if (!match) return null;
  const result = iranianPlateSchema.safeParse({ firstTwoDigits: match[1], letter: match[2], threeDigits: match[3], regionDigits: match[4] });
  return result.success ? result.data : null;
}
export function PlateInput({ value, onChange, disabled = false, errors = {}, firstInputRef }: {
  value: PlateDraft; onChange: (plate: PlateDraft) => void; disabled?: boolean; errors?: Partial<Record<keyof PlateDraft, string>>; firstInputRef?: RefObject<HTMLInputElement | null>;
}) {
  const id = useId();
  const first = useRef<HTMLInputElement>(null), letter = useRef<HTMLSelectElement>(null), main = useRef<HTMLInputElement>(null), region = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!disabled) first.current?.focus(); }, [disabled]);
  const fields = [first, letter, main, region];
  const keydown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !event.currentTarget.value && index > 0) fields[index - 1].current?.focus();
  };
  const paste = (event: ClipboardEvent) => {
    const plate = parsePastedPlate(event.clipboardData.getData("text"));
    if (plate) { event.preventDefault(); onChange(plate); region.current?.focus(); }
  };
  const numeric = (key: "firstTwoDigits" | "threeDigits" | "regionDigits", index: number, length: number, label: string) => <input
    ref={index === 0 ? (element) => { first.current = element; if (firstInputRef) firstInputRef.current = element; } : index === 2 ? main : region} aria-label={label} dir="ltr" inputMode="numeric" autoComplete="off" type="text"
    name={key} value={toPersianDigits(value[key])} disabled={disabled} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `${id}-${key}` : undefined}
    onPaste={paste} onKeyDown={(event) => keydown(event, index)} onChange={(event) => {
      const next = normalizeCode(event.target.value, length, true);
      onChange({ ...value, [key]: next });
      if (next.length === length && next !== value[key] && index < 3) fields[index + 1].current?.focus();
    }} />;
  return <fieldset className="plate-input" disabled={disabled}>
    <legend className="sr-only">ورود دستی پلاک خودرو</legend>
    <div className="plate-input-segments" dir="ltr">
      <div className="plate-numeric plate-two"><SegmentedCodeInput name="firstTwoDigits" ref={(element) => { first.current = element; if (firstInputRef) firstInputRef.current = element; }} label="دو رقم اول پلاک" length={2} numeric persianDigits autoComplete="off" value={value.firstTwoDigits} disabled={disabled}
        invalid={Boolean(errors.firstTwoDigits)} describedBy={errors.firstTwoDigits ? `${id}-firstTwoDigits` : undefined} onPaste={paste} onKeyDown={(event) => keydown(event, 0)}
        onChange={(next) => { onChange({ ...value, firstTwoDigits: next }); if (next.length === 2 && next !== value.firstTwoDigits) letter.current?.focus(); }} /></div>
      <select name="letter" ref={letter} aria-label="حرف پلاک" value={value.letter} dir="rtl" onChange={(event) => onChange({ ...value, letter: event.target.value })} onPaste={paste}
        aria-invalid={Boolean(errors.letter)} aria-describedby={errors.letter ? `${id}-letter` : undefined}>
        {iranianPlateLetters.map((character) => <option key={character} value={character}>{character}</option>)}
      </select>
      <div className="plate-numeric plate-three"><SegmentedCodeInput name="threeDigits" ref={main} label="سه رقم اصلی پلاک" length={3} numeric persianDigits autoComplete="off" value={value.threeDigits} disabled={disabled}
        invalid={Boolean(errors.threeDigits)} describedBy={errors.threeDigits ? `${id}-threeDigits` : undefined} onPaste={paste} onKeyDown={(event) => keydown(event, 2)}
        onChange={(next) => { onChange({ ...value, threeDigits: next }); if (next.length === 3 && next !== value.threeDigits) region.current?.focus(); }} /></div>
      <label className="plate-region-input"><span>ایران</span>{numeric("regionDigits", 3, 2, "دو رقم کد ایران")}</label>
    </div>
    {plateSegmentOrder.map((key) => errors[key] && <p key={key} id={`${id}-${key}`} className="plate-field-error">{errors[key]}</p>)}
  </fieldset>;
}
