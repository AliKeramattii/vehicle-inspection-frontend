import Image from "next/image";
import type { ShotState } from "@/lib/vehicle/inspection-state";
import { shotStateLabels } from "@/lib/vehicle/inspection-state";
import { toPersianDigits } from "@/lib/utils/persian";

export function InspectionPin({ code, title, index, state, selected, onSelect }: {
  code: string; title: string; index: number; state: ShotState; selected: boolean; onSelect: () => void;
}) {
  return <button type="button" className="inspection-pin" data-state={state} aria-pressed={selected}
    aria-label={`نقطه ${code}، ${title}، ${shotStateLabels[state]}`} onClick={onSelect}>
    <Image src={`/icons/viewer-3d/inspection-pin-${state === "selected" ? "selected" : state}-blank.svg`} alt="" width={44} height={44} unoptimized />
    {(state === "pending" || state === "selected") && <span aria-hidden="true">{toPersianDigits(index)}</span>}
  </button>;
}
