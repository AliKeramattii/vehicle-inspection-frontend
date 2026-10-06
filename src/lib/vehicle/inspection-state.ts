import type { CaptureSlot } from "@/types/domain";
// Experimental viewer presentation only. Customer photography has its own requirement statuses.
export type ShotState = "pending" | "selected" | "completed" | "retake";
export const shotStateLabels: Record<ShotState, string> = { pending: "منتظر", selected: "بعدی", completed: "انجام شد", retake: "تکرار شود" };
export function shotState(shot: CaptureSlot, selectedCode: string): ShotState {
  return shot.status === "completed" || shot.status === "retake" ? shot.status : shot.code === selectedCode ? "selected" : "pending";
}
