"use client";
import {useEffect,useMemo,useRef} from "react";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {OrbitControls} from "@react-three/drei";
import {PMREMGenerator,Box3,PerspectiveCamera,type Object3D} from "three";
import {RoomEnvironment} from "three/examples/jsm/environments/RoomEnvironment.js";
import type {OrbitControls as Controls} from "three-stdlib";
import {useVehicleModel,type LoadedVehicle} from "./use-vehicle-model";
import {applyVehiclePaint} from "./model-lifecycle";
import {vehicleViewPresets,type VehicleView} from "./vehicle-view-presets";
import {boundsCorners,keepVehicleInFrame} from "./camera-framing";
type Props={view:VehicleView;reset:number;paint:string;onFailure:()=>void;onReady:()=>void};
function Studio(){
 const{gl,scene}=useThree();
 useEffect(()=>{const generator=new PMREMGenerator(gl),room=new RoomEnvironment(),target=generator.fromScene(room,.04);
 // eslint-disable-next-line react-hooks/immutability
 scene.environment=target.texture;room.dispose();generator.dispose();return()=>{scene.environment=null;target.dispose();};},[gl,scene]);
 return <><color attach="background" args={["#F1F5F9"]}/><hemisphereLight args={["#FFFFFF","#B8C4D0",2]}/><directionalLight position={[4,7,-4]} intensity={2}/><directionalLight position={[-4,4,3]} intensity={1}/>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.012,0]}><planeGeometry args={[200,200]}/><meshBasicMaterial color="#F1F5F9" toneMapped={false}/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.004,0]} scale={[1.04,2.1,1]}><circleGeometry args={[1,48]}/><meshBasicMaterial color="#BCC8D1" transparent opacity={.18} depthWrite={false}/></mesh></>;
}
function Camera({view,reset,root}:{view:VehicleView;reset:number;root?:Object3D}){
 const corners=useMemo(()=>root?boundsCorners(new Box3().setFromObject(root)):[],[root]);
 const controls=useRef<Controls>(null),{camera,invalidate}=useThree();
 useEffect(()=>{camera.position.set(...vehicleViewPresets[view]);controls.current?.target.set(0,.8,0);controls.current?.update();invalidate();},[view,reset,camera,invalidate]);
 useFrame(()=>{if(camera instanceof PerspectiveCamera&&controls.current&&keepVehicleInFrame(camera,corners,controls.current.target,10)){controls.current.update();invalidate();}});
 return <OrbitControls ref={controls} makeDefault target={[0,.8,0]} enableDamping={false} enablePan={false} minDistance={4.6} maxDistance={10} minPolarAngle={.01} maxPolarAngle={Math.PI/2-.06}/>;
}
function Vehicle({model,paint,onReady}:{model:LoadedVehicle;paint:string;onReady:()=>void}){
 const{invalidate}=useThree(),sent=useRef(false);
 useEffect(()=>{applyVehiclePaint(model.root,paint);invalidate();},[model,paint,invalidate]);
 useFrame(()=>{if(!sent.current){sent.current=true;onReady();}});
 return <primitive object={model.root} dispose={null}/>;
}
function Lifecycle({onFailure}:{onFailure:()=>void}){
 const{gl}=useThree();useEffect(()=>{const lost=(e:Event)=>{e.preventDefault();onFailure();};gl.domElement.addEventListener("webglcontextlost",lost);return()=>{gl.domElement.removeEventListener("webglcontextlost",lost);gl.renderLists.dispose();};},[gl,onFailure]);return null;
}
export default function Vehicle3DScene(props:Props){
 const model=useVehicleModel("/api/development/vehicle-model/mobile",props.onFailure);
 return <Canvas dpr={[1,1.5]} frameloop="demand" camera={{position:[...vehicleViewPresets[props.view]],fov:37,near:.1,far:100}} gl={{antialias:true,powerPreference:"low-power",alpha:false}}>
 <Lifecycle onFailure={props.onFailure}/><Studio/><Camera view={props.view} reset={props.reset} root={model?.root}/>{model&&<Vehicle model={model} paint={props.paint} onReady={props.onReady}/>}</Canvas>;
}
