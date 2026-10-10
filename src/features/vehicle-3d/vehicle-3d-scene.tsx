"use client";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { Box3, Color, Mesh, MeshPhysicalMaterial, PerspectiveCamera, PMREMGenerator, Vector3, type Object3D } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { OrbitControls as Controls } from "three-stdlib";
import { toPersianDigits as fa } from "@/lib/utils/persian";
import { EvidenceSymbol } from "@/features/photography/evidence-symbol";
import { findRequirement, photographyStateLabels, photographyVisualState, photoRequirementEntry } from "@/features/photography/photography-model";
import type { VehiclePhotoNavigatorProps } from "@/features/photography/vehicle-photo-navigator";
import { vehicleAnchors } from "./vehicle-anchor-map";
import { vehicleViewPresets, type VehicleView } from "./vehicle-view-presets";
import { useVehicleModel, type LoadedVehicle } from "./use-vehicle-model";
import { vehicleModelConfig } from "./vehicle-model-config";
import { applyVehiclePaint } from "./model-lifecycle";
import { boundsCorners, keepVehicleInFrame } from "./camera-framing";

export type VehicleRenderMetrics = { downloadMs: number; parseMs: number; byteSize: number; calls: number; triangles: number; textures: number; geometries: number; fps: number; renderer: string };
type Props = VehiclePhotoNavigatorProps & { view: VehicleView; url: string; reduced: boolean; paint: string; showMarkers?: boolean; onFailure: () => void; onReady: (metrics: VehicleRenderMetrics) => void };
function Studio() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const generator = new PMREMGenerator(gl), room = new RoomEnvironment(), target = generator.fromScene(room, .04);
    // R3F owns this imperative Three scene; the environment is a GPU resource, not React state.
    // eslint-disable-next-line react-hooks/immutability
    scene.environment = target.texture;
    room.dispose(); generator.dispose();
    return () => { scene.environment = null; target.dispose(); };
  }, [gl, scene]);
  return <><color attach="background" args={["#f0f4f7"]} /><hemisphereLight args={["#ffffff", "#b8c4d0", 2]} /><directionalLight position={[4,7,-4]} intensity={2} /><directionalLight position={[-4,4,3]} intensity={1} />
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.012,0]}><planeGeometry args={[200,200]} /><meshBasicMaterial color="#f0f4f7" toneMapped={false} /></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.004,0]} scale={[1.04,2.1,1]}><circleGeometry args={[1,48]} /><meshBasicMaterial color="#bcc8d1" transparent opacity={.18} depthWrite={false} /></mesh></>;
}
function Camera({ view, root }: { view: VehicleView; root?: Object3D }) {
  const controls = useRef<Controls>(null), { camera, invalidate } = useThree();
  const corners=useMemo(()=>root?boundsCorners(new Box3().setFromObject(root)):[],[root]);
  useEffect(() => { camera.position.set(...vehicleViewPresets[view]); controls.current?.target.set(0,.8,0); controls.current?.update(); invalidate(); }, [view, camera, invalidate]);
  useFrame(()=>{if(camera instanceof PerspectiveCamera && controls.current && keepVehicleInFrame(camera,corners,controls.current.target,10)){controls.current.update();invalidate();}});
  return <OrbitControls ref={controls} makeDefault target={[0,.8,0]} enableDamping={false} enablePan={false} minDistance={5.1} maxDistance={10} minPolarAngle={.01} maxPolarAngle={Math.PI/2-.06} />;
}
function Vehicle({ model, props }: { model: LoadedVehicle; props: Props }) {
  const { gl } = useThree(), metricsSent = useRef(false), frames = useRef(0), start = useRef(0);
  const anchor = vehicleAnchors.find(anchor => anchor.requirementId === props.photo.id);
  const requirementIds = useMemo(() => props.template.sections.flatMap(section => section.photoRequirements.map(photo => photo.id)), [props.template]);
  useEffect(() => {
    applyVehiclePaint(model.root, props.paint);
    const region = props.showMarkers !== false ? anchor?.region : undefined;
    model.root.traverse(object => {
      if (!(object instanceof Mesh)) return;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (material instanceof MeshPhysicalMaterial) {
          const selected = object.userData.inspectionRegion === region && !!region;
          material.emissive.copy(material.userData.baseEmissive as Color);
          material.emissiveIntensity = material.userData.baseEmissiveIntensity as number;
          if (selected) { material.emissive.lerp(new Color("#2563eb"), .15); material.emissiveIntensity = Math.max(.15, material.emissiveIntensity); }
        }
      }
    });
  }, [model, anchor, props.showMarkers, props.paint]);
  // Only measure a finite warm-up window, then return to demand rendering.
  useFrame(state => {
    if (metricsSent.current) return;
    if (!start.current) start.current = performance.now();
    frames.current += 1;
    const elapsed = performance.now() - start.current;
    if (elapsed >= 1000 && frames.current > 2) {
      metricsSent.current = true;
      const debug = gl.getContext().getExtension("WEBGL_debug_renderer_info");
      props.onReady({ downloadMs: model.downloadMs, parseMs: model.parseMs, byteSize: model.byteSize, calls: gl.info.render.calls, triangles: gl.info.render.triangles, textures: gl.info.memory.textures, geometries: gl.info.memory.geometries, fps: (frames.current-1)*1000/elapsed, renderer: debug ? String(gl.getContext().getParameter(debug.UNMASKED_RENDERER_WEBGL)) : "unavailable" });
    } else state.invalidate();
  });
  return <><primitive object={model.root} dispose={null} />
    {props.showMarkers !== false && anchor?.standing && <mesh rotation={[-Math.PI/2,0,0]} position={[...anchor.standing]}><ringGeometry args={[.24,.34,48]} /><meshBasicMaterial color="#2563eb" transparent opacity={.25} depthWrite={false} /></mesh>}
    {props.showMarkers !== false && vehicleAnchors.map(marker => {
      const target = findRequirement(props.template, marker.requirementId)?.photo;
      if (!target) return null;
      const state = photographyVisualState(target, props.records), action = photoRequirementEntry(target, props.records).action;
      // Show only near-facing anchors. Html occlusion handles the body as the view rotates.
      return <WorldMarker key={target.id} point={marker.point} facing={marker.facing}>
        <button type="button" className="vehicle-photo-marker vehicle-world-marker" data-requirement={target.id} data-state={state} aria-pressed={props.photo.id===target.id} aria-label={`${action} ${target.title}، ${photographyStateLabels[state]}`} onClick={event=>{event.stopPropagation();props.onActivate(target.id);}} onPointerDown={event=>event.stopPropagation()}>
          <span aria-hidden="true"><EvidenceSymbol state={state} number={fa(requirementIds.indexOf(target.id)+1)} size={18} /></span>
        </button></WorldMarker>;
    })}</>;
}
export default function Vehicle3DScene(props: Props) {
  const model = useVehicleModel(props.url, props.onFailure);
  return <Canvas dpr={[1,props.reduced?1:vehicleModelConfig.maxDpr]} frameloop="demand" camera={{ position:[...vehicleViewPresets[props.view]], fov:37, near:.1, far:100 }} gl={{ antialias:!props.reduced, powerPreference: "low-power", alpha:false }} onCreated={({gl})=>{
    // Canvas owns context teardown. Explicit event listener cleanup is handled by the bridge below.
    gl.setClearColor(new Color("#f0f4f7"));
  }}><ContextLifecycle onFailure={props.onFailure} /><Studio /><Camera view={props.view} root={model?.root} />{model && <Vehicle model={model} props={props} />}</Canvas>;
}
function WorldMarker({ point, facing, children }: { point: readonly [number,number,number]; facing: readonly [number,number,number]; children: React.ReactNode }) {
  const element = useRef<HTMLDivElement>(null);
  const normal = useMemo(()=>new Vector3(...facing),[facing]);
  const position = useMemo(()=>new Vector3(...point),[point]);
  const direction = useMemo(()=>new Vector3(),[]);
  useFrame(({camera})=>{if(element.current) element.current.hidden=normal.dot(direction.copy(camera.position).sub(position))<=0;});
  return <Html position={[...point]} center occlude zIndexRange={[20,1]} style={{pointerEvents:"none"}}><div className="vehicle-world-marker-wrap" ref={element}>{children}</div></Html>;
}
function ContextLifecycle({ onFailure }: { onFailure: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    canvas.addEventListener("webglcontextlost", lost);
    return () => { canvas.removeEventListener("webglcontextlost", lost); gl.renderLists.dispose(); };
  }, [gl, onFailure]);
  return null;
}
