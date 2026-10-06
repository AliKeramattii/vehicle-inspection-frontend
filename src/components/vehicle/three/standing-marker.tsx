import type { VehicleView } from "@/lib/vehicle/viewer-config";
import { viewConfig } from "@/lib/vehicle/viewer-config";

export function StandingMarker({ view }: { view: VehicleView }) {
  return <group position={viewConfig[view].standing} rotation={[-Math.PI / 2, 0, 0]}>
    <mesh><circleGeometry args={[.6, 48]} /><meshBasicMaterial color="#2563eb" transparent opacity={.15} depthWrite={false} /></mesh>
    <mesh position={[0, 0, .003]}><ringGeometry args={[.59, .615, 48]} /><meshBasicMaterial color="#ffffff" transparent opacity={.9} depthWrite={false} /></mesh>
    {[-.13, .13].map((x) => <mesh key={x} position={[x, 0, .006]} scale={[.08, .18, 1]}><circleGeometry args={[1, 16]} /><meshBasicMaterial color="#2563eb" transparent opacity={.65} depthWrite={false} /></mesh>)}
  </group>;
}
