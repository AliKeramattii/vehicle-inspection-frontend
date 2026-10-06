import { Icon } from "@/components/ui/icon";
import type { PhotographyVisualState } from "./photography-model";

/** State glyphs are decorative; their parent supplies the full accessible status. */
export function EvidenceSymbol({ state, number, size = 17 }: { state: PhotographyVisualState; number?: string; size?: number }) {
  return state === "pending" ? <>{number ?? "•"}</> : <Icon name={state === "complete" ? "evidenceCheck" : "retake"} size={size} />;
}
