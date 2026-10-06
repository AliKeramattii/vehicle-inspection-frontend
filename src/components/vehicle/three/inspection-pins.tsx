import type { RefObject } from "react";
import { resolveSemanticNodes } from "@/lib/vehicle/semantic-nodes";
import { shotState } from "@/lib/vehicle/inspection-state";
import { InspectionPin } from "./inspection-pin";
import type { VehicleSceneProps } from "./viewer-types";

export function InspectionPins({ slots, selectedCode, onSelect, layerRef }: Pick<VehicleSceneProps, "slots" | "selectedCode" | "onSelect"> & { layerRef: RefObject<HTMLDivElement | null> }) {
  return <div ref={layerRef} className="inspection-pin-layer">{slots.map((shot, index) => {
    const node = resolveSemanticNodes(shot.highlightNodes)[0];
    if (!node) return null;
    return <div key={shot.code} data-pin-code={shot.code} className="projected-pin-anchor">
      <InspectionPin code={shot.code} title={shot.title} index={index + 1} state={shotState(shot, selectedCode)} selected={shot.code === selectedCode} onSelect={() => onSelect(shot.code)} />
    </div>;
  })}</div>;
}
