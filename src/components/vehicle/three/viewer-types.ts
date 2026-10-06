import type { CaptureSlot } from "@/types/domain";
import type { VehicleNode } from "@/lib/vehicle/semantic-nodes";
import type { VehicleModelSource, VehicleView } from "@/lib/vehicle/viewer-config";

export type VehicleSceneProps = {
  bodyColor: string; view: VehicleView; resetKey: number; slots: readonly CaptureSlot[];
  selectedCode: string; highlightNodes: readonly VehicleNode[]; onSelect: (code: string) => void;
  model?: VehicleModelSource;
};
