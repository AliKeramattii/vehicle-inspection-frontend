import { useEffect, useRef, type ComponentRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { viewConfig, type VehicleView } from "@/lib/vehicle/viewer-config";

export function VehicleCamera({ view, resetKey }: { view: VehicleView; resetKey: number }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const camera = useThree((state) => state.camera), invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    camera.position.set(...viewConfig[view].camera).multiplyScalar(.76);
    camera.up.set(0, 1, 0);
    controls.current?.target.set(0, .45, 0);
    camera.lookAt(0, .45, 0);
    controls.current?.update(); invalidate();
  }, [camera, invalidate, view, resetKey]);
  return <OrbitControls ref={controls} makeDefault enablePan={false} enableDamping={false} minDistance={5} maxDistance={12}
    minPolarAngle={.01} maxPolarAngle={Math.PI / 2 - .03} target={[0, .45, 0]} onChange={() => invalidate()} />;
}
