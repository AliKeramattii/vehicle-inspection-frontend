"use client";
import { useSyncExternalStore } from "react";
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
/** Tab-scoped presentation preference only. No evidence/capture state lives here. */
export function useIdentificationGuide(photo: PhotoRequirement, inspectionId: string, scope = "capture") {
  const key = JSON.stringify(["identification-guide-v1", inspectionId, scope, photo.id]);
  const selectedId = useSyncExternalStore(subscribe, () => read(key), () => null);
  const required = hasIdentificationChoices(photo);
  const choice = required ? vehicleIdentificationGuides.find(option => option.id === selectedId) : undefined;
  function select(value: string | null) {
    if (value !== null && !vehicleIdentificationGuides.some(option => option.id === value)) return;
    if (value === null) memory.delete(key); else memory.set(key, value);
    try { if (value === null) sessionStorage.removeItem(key); else sessionStorage.setItem(key, value); } catch { /* Keep this tab's preference usable if storage is disabled. */ }
    window.dispatchEvent(new Event(eventName));
  }
  return { required, choice, select, photo: identificationPhoto(photo, choice) };
}
