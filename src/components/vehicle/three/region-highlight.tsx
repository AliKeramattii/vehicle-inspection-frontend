import type { VehicleNode } from "@/lib/vehicle/semantic-nodes";

export function RegionHighlight({ node, highlighted }: { node: VehicleNode; highlighted: readonly VehicleNode[] }) {
  return <meshStandardMaterial color={highlighted.includes(node) ? "#2563eb" : "#ffffff"} transparent
    opacity={highlighted.includes(node) ? .2 : 0} depthWrite={false} roughness={.5} polygonOffset polygonOffsetFactor={-1} />;
}
