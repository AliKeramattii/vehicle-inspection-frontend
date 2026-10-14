"use client";
import dynamic from "next/dynamic";
import {Component,useCallback,useState,useSyncExternalStore,type ReactNode} from "react";
import {useQuery} from "@tanstack/react-query";
import {VehiclePhotoNavigator,type VehiclePhotoNavigatorProps} from "@/features/photography/vehicle-photo-navigator";
import {photoRequirementEntry} from "@/features/photography/photography-model";
import {EvidenceSymbol} from "@/features/photography/evidence-symbol";
import {indexedDBUploadQueue} from "@/features/upload/queue-repository";
import {uploadQueryKey} from "@/features/upload/upload-runtime";
import {photoNamespace} from "@/lib/media/photo-store";
import {toPersianDigits as fa} from "@/lib/utils/persian";
import {markerEvidence,fixedMarkerPosition} from "./marker-state";
import {MarkerGuidance} from "./marker-guidance";
import {Icon} from "@/components/ui/icon";
import {requirementView,type VehicleView} from "./vehicle-view-presets";
const Scene=dynamic(()=>import("./vehicle-3d-scene"),{ssr:false});
const subscribe=()=>()=>{};
const available=()=>process.env.NODE_ENV==="development"&&process.env.NEXT_PUBLIC_VEHICLE_3D_PREVIEW==="1"&&["localhost","127.0.0.1","[::1]"].includes(location.hostname);
class Boundary extends Component<{children:ReactNode;failed:()=>void},{error:boolean}>{
 state={error:false};static getDerivedStateFromError(){return{error:true};}componentDidCatch(){this.props.failed();}render(){return this.state.error?null:this.props.children;}
}
type Props=VehiclePhotoNavigatorProps&{inspectionId:string;bodyColor?:string;onSelect:(id:string)=>void};
export function OptionalVehicleNavigator(props:Props){const enabled=useSyncExternalStore(subscribe,available,()=>false);return enabled?<AuthorizedVehicleNavigator {...props}/>:<VehiclePhotoNavigator {...props}/>;}
function AuthorizedVehicleNavigator(props:Props){
 const enabled=true;
 const [mode,setMode]=useState<"2d"|"3d">("2d"),[visited,visit]=useState(false),[failed,fail]=useState(false),[ready,setReady]=useState(false),[reset,setReset]=useState(0);
 const [detail,setDetail]=useState<string>();
 const[chosen,setChosen]=useState<{id:string;view:VehicleView}>();
 const onFailure=useCallback(()=>{fail(true);setMode("2d");},[]),onReady=useCallback(()=>setReady(true),[]);
 const jobs=useQuery({queryKey:uploadQueryKey,queryFn:()=>indexedDBUploadQueue.list(),enabled:enabled&&visited,refetchInterval:enabled&&visited?1000:false});
 const view=chosen?.id===props.photo.id?chosen.view:requirementView(props.photo.id);
 const namespace=photoNamespace(props.inspectionId,props.template.templateId,props.template.templateVersion);
 const requirements=props.template.sections.flatMap(s=>s.photoRequirements);

 const active=mode==="3d"&&!failed;
 const scene=<div className="optional-vehicle-display">
  <div hidden={active&&ready}><VehiclePhotoNavigator {...props} controls={false}/></div>
  {visited&&!failed&&<div className="optional-vehicle-canvas photography-image" data-view={view} hidden={!active}><Boundary failed={onFailure}><Scene view={view} reset={reset} paint={props.bodyColor??"#E8EDF2"} onFailure={onFailure} onReady={onReady}/></Boundary></div>}
  {active&&!ready&&<p className="optional-model-loading" role="status">در حال آماده‌سازی مدل خودرو…</p>}
  {active&&ready&&<div className="fixed-inspection-markers" aria-label="دوازده نیازمندی تصویری">{requirements.map((photo,index)=>{
   const evidence=markerEvidence(photo,props.records,jobs.data??[],namespace),state=evidence.state,pos=fixedMarkerPosition(index),action=photoRequirementEntry(photo,props.records).action;
   return <button key={photo.id} type="button" className="vehicle-photo-marker fixed-inspection-marker" style={{left:pos.x+"%",top:pos.y+"%"}} data-requirement={photo.id} data-state={state} aria-pressed={props.photo.id===photo.id} aria-label={action+" "+photo.title+"، "+(evidence.captureComplete?"عکس ثبت شده":"عکس ثبت نشده")+"، "+evidence.upload} onClick={()=>{props.onSelect(photo.id);setChosen({id:photo.id,view:requirementView(photo.id)});setDetail(photo.id);}}><span aria-hidden="true">{state==="failed"?<Icon name="close" size={18}/>:<EvidenceSymbol state={state} number={fa(index+1)} size={18}/>}</span></button>;
  })}</div>}
 </div>;
 return <div className="optional-vehicle-navigator" data-mode={active?"3d":"2d"}>
 <div className="viewer-mode-switch" aria-label="نوع نمایش خودرو"><button type="button" aria-pressed={!active} onClick={()=>setMode("2d")}>2D</button><button type="button" aria-pressed={active} disabled={failed} onClick={()=>{visit(true);setMode("3d");}}>3D</button><small>آزمایش محلی؛ مجوز تجاری تأیید نشده</small></div>
 <VehiclePhotoNavigator {...props} scene={scene} onView={(section,id)=>{const views:Record<string,VehicleView>={front:"front",rear:"rear",left:"left",right:"right",roof:"top"};setChosen({id:id??props.photo.id,view:views[section]??"front-right"});}} onReset={()=>{setReset(n=>n+1);setChosen(undefined);props.onReset();}}/>
 {active&&detail===props.photo.id&&<MarkerGuidance photo={props.photo} records={props.records} evidence={markerEvidence(props.photo,props.records,jobs.data??[],namespace)} onDismiss={()=>setDetail(undefined)} onActivate={()=>props.onActivate(props.photo.id)}/>}
 {failed&&<p className="optional-viewer-feedback" role="status">مدل سه‌بعدی در دسترس نیست؛ نمای دوبعدی فعال است.</p>}
 </div>;
}
