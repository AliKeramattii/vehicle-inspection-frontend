"use client";
import { useRef, useState, useSyncExternalStore } from "react";
import type { PhotoRequirement } from "@/schemas/photography";
import { hasIdentificationChoices, identificationPhoto, vehicleIdentificationGuides } from "./vehicle-identification-guides";

const eventName = "inspection-guidance-choice";
const memory = new Map<string, string>();
function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  return () => window.removeEventListener(eventName, callback);
}
function read(key: string) {
  try { return sessionStorage.getItem(key); } catch { return memory.get(key) ?? null; }
}
export type GuideSelection = { id?: string; onSelect: (id: string | undefined) => Promise<void> };
/** Tab preference is only a transient projection; captured and accepted choices live on durable evidence. */
export function useIdentificationGuide(photo: PhotoRequirement, inspectionId: string, scope = "capture", durable?: GuideSelection) {
  const key = JSON.stringify(["identification-guide-v1", inspectionId, scope, photo.id]);
  const latest = useRef(0), tail = useRef(Promise.resolve());
  const [error,setError] = useState<string>();
  const selectedId = useSyncExternalStore(subscribe, () => read(key), () => null);
  const required = hasIdentificationChoices(photo);
  const choice = required ? vehicleIdentificationGuides.find(option => option.id === (durable ? durable.id : selectedId)) : undefined;
  async function select(value: string | null) {
    if (value !== null && !vehicleIdentificationGuides.some(option => option.id === value)) return;
    const attempt = ++latest.current;
    setError(undefined);
    // Serialize durable preferences; a slow old selection must not overtake a newer click.
    const task = tail.current.then(async () => { await durable?.onSelect(value ?? undefined); });
    tail.current = task.catch(() => undefined);
    try { await task; } catch (cause) { if (attempt === latest.current) setError(cause instanceof Error ? cause.message : "ذخیره انتخاب ممکن نشد."); return; }
    if (attempt !== latest.current) return;
    memory.set(key, value ?? "");
    try { sessionStorage.setItem(key, value ?? ""); } catch { /* Keep this tab's preference usable if storage is disabled. */ }
    window.dispatchEvent(new Event(eventName));
  }
  return { required, choice, select, error, photo: identificationPhoto(photo, choice) };
}
