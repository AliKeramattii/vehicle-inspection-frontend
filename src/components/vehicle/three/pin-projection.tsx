import { useMemo, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { nodeAnchors, resolveSemanticNodes } from "@/lib/vehicle/semantic-nodes";
import type { CaptureSlot } from "@/types/domain";
import { layoutInspectionPins } from "@/lib/vehicle/pin-layout";

export function PinProjection({ slots, layerRef, selectedCode }: { slots: readonly CaptureSlot[]; layerRef: RefObject<HTMLDivElement | null>; selectedCode: string }) {
  const anchors = useMemo(() => slots.flatMap((slot) => {
    const node = resolveSemanticNodes(slot.highlightNodes)[0];
    return node ? [{ code: slot.code, position: new Vector3(...nodeAnchors[node]), projected: new Vector3() }] : [];
  }), [slots]);
  useFrame(({ camera, size }) => {
    const layer = layerRef.current;
    if (!layer) return;
    const projected = anchors.map((anchor) => {
      anchor.projected.copy(anchor.position).project(camera);
      return { code: anchor.code, x: (anchor.projected.x + 1) * size.width / 2, y: (-anchor.projected.y + 1) * size.height / 2 };
    });
    const positions = layoutInspectionPins(projected, size.width, size.height, selectedCode);
    for (const anchor of positions) {
      const element = [...layer.children].find((child) => child instanceof HTMLElement && child.dataset.pinCode === anchor.code);
      if (!(element instanceof HTMLElement)) continue;
      element.style.transform = `translate(${anchor.x}px, ${anchor.y}px) translate(-50%, -50%)`;
      element.style.visibility = "visible";
    }
  });
  return null;
}
