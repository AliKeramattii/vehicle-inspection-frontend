"use client";

import { useEffect, Suspense, memo, type RefObject } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { nodeAnchors } from "@/lib/vehicle/semantic-nodes";
import { VehicleModel } from "./vehicle-model";
import { VehicleCamera } from "./vehicle-camera";
import { VehicleLighting } from "./vehicle-lighting";
import { PinProjection } from "./pin-projection";
import { StandingMarker } from "./standing-marker";
import type { VehicleSceneProps } from "./viewer-types";

function RendererLifecycle({ onFailure, onReady }: { onFailure: () => void; onReady: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    const frame = requestAnimationFrame(onReady);
    return () => { cancelAnimationFrame(frame); gl.domElement.removeEventListener("webglcontextlost", lost); };
  }, [gl, onFailure, onReady]);
  return null;
}
const SceneModel = memo(VehicleModel);
export default function VehicleScene({ onFailure, onReady, pinLayer, ...props }: VehicleSceneProps & { onFailure: () => void; onReady: () => void; pinLayer: RefObject<HTMLDivElement | null> }) {
  return <Canvas className="vehicle-canvas" dpr={[1, 1.5]} frameloop="demand" camera={{ fov: 35, near: .1, far: 40 }}
    gl={{ antialias: true, powerPreference: "low-power" }} fallback={<p role="status">نمای دوبعدی در حال آماده‌سازی است.</p>}>
    <RendererLifecycle onFailure={onFailure} onReady={onReady} /><VehicleLighting /><VehicleCamera view={props.view} resetKey={props.resetKey} />
    <Suspense fallback={null}><SceneModel source={props.model} bodyColor={props.bodyColor} highlightNodes={props.highlightNodes} /></Suspense>
    {/* Approximate semantic highlight anchors cover regions not modeled by the development shell. */}
    {props.highlightNodes.map((node) => <mesh key={node} position={nodeAnchors[node]} scale={[.43, .28, .43]}><sphereGeometry args={[1, 16, 12]} /><meshBasicMaterial color="#2563eb" transparent opacity={.14} depthWrite={false} /></mesh>)}
    <ContactShadows position={[0, -.01, 0]} opacity={.3} scale={10} blur={2} far={4} resolution={128} frames={1} />
    <StandingMarker view={props.view} /><PinProjection slots={props.slots} selectedCode={props.selectedCode} layerRef={pinLayer} />
  </Canvas>;
}
