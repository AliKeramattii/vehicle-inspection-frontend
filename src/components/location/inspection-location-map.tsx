"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {Icon} from "@/components/ui/icon";
import {SecondaryButton} from "@/components/ui/button";
import type {InspectionLocation} from "@/types/domain";
import {LocationServiceError,type InspectionLocationAdapter,type LocationFix} from "@/lib/map/location-adapter";
import {accuracyPolygon,browserLocationService,createNeshan,type NeshanMap,type DeviceLocationService} from "@/lib/map/neshan-adapter";
export function InspectionLocationMap({location,onChange,adapter,service=browserLocationService,mapKey=process.env.NEXT_PUBLIC_NESHAN_MAP_KEY}:{
 location:InspectionLocation;onChange:(next:InspectionLocation)=>void;adapter?:InspectionLocationAdapter;service?:DeviceLocationService;mapKey?:string;
}){
 const mounted=useRef(true);
 const host=useRef<HTMLDivElement>(null),map=useRef<NeshanMap|undefined>(undefined),latest=useRef({location,onChange}),currentFix=useRef<LocationFix|undefined>(undefined),locateMove=useRef(false);
 const [state,setState]=useState<"unconfigured"|"loading"|"ready"|"error">(mapKey?"loading":"unconfigured"),[error,setError]=useState<string>(),[fix,setFix]=useState<LocationFix>(),[locating,setLocating]=useState(false),[generation,retry]=useState(0);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 const drawFix=useCallback((instance:NeshanMap,current:LocationFix)=>{
  try{
   const data=accuracyPolygon(current),source=instance.getSource("device-accuracy");
   if(source)source.setData(data);
   else{instance.addSource("device-accuracy",{type:"geojson",data});instance.addLayer({id:"device-accuracy",type:"fill",source:"device-accuracy",paint:{"fill-color":"#2563EB","fill-opacity":.12}});}
   const position={type:"Feature",properties:{},geometry:{type:"Point",coordinates:[current.longitude,current.latitude]}},point=instance.getSource("device-position");
   if(point)point.setData(position);
   else{instance.addSource("device-position",{type:"geojson",data:position});instance.addLayer({id:"device-position",type:"circle",source:"device-position",paint:{"circle-radius":6,"circle-color":"#2563EB","circle-stroke-color":"#FFFFFF","circle-stroke-width":2}});}
  }catch{setError("نمایش دقت GPS ممکن نشد. مختصات واقعی دریافت‌شده محفوظ است.");}
 },[]);
 useEffect(()=>{latest.current={location,onChange};},[location,onChange]);
 useEffect(()=>{
  if(!mapKey||!host.current)return;
  let active=true,owned:NeshanMap|undefined;
  void createNeshan(host.current,latest.current.location,mapKey).then(instance=>{
   owned=instance;if(!active){instance.remove();return;}map.current=instance;
   const move=()=>{if(!active)return;if(locateMove.current){locateMove.current=false;return;}const c=instance.getCenter();latest.current.onChange({...latest.current.location,latitude:c.lat,longitude:c.lng,accuracyMeters:0});};
   instance.on("moveend",move);instance.on("load",()=>{if(active){setState("ready");if(currentFix.current)drawFix(instance,currentFix.current);}});instance.on("error",()=>{if(active){setState("error");setError("بارگذاری نقشه ممکن نشد. کلید و اتصال اینترنت را بررسی کنید.");}});
  }).catch(()=>{if(active){setState("error");setError("نقشه در دسترس نیست. تنظیمات و اتصال اینترنت را بررسی کنید.");}});
  return()=>{active=false;owned?.remove();map.current=undefined;};
 },[mapKey,generation,drawFix]);
 async function locate(){
  if(locating)return;setLocating(true);setError(undefined);
  try{const current=adapter?await adapter.locate():await service.locate();if(!mounted.current)return;setFix(current);currentFix.current=current;latest.current.onChange({...latest.current.location,...current});if(map.current){drawFix(map.current,current);locateMove.current=true;map.current.easeTo({center:[current.longitude,current.latitude],zoom:17});}}
  catch(cause){if(!mounted.current)return;setError(cause instanceof LocationServiceError?({denied:"دسترسی به موقعیت داده نشده است",unavailable:"موقعیت در دسترس نیست",unsupported:"موقعیت در این دستگاه پشتیبانی نمی‌شود"}[cause.code]):cause instanceof Error?cause.message:"دریافت موقعیت ممکن نشد.");}finally{if(mounted.current)setLocating(false);}
 }
 return <section className="neshan-location-map" aria-label="انتخاب موقعیت بازدید">
  <div ref={host} className="neshan-map-canvas" aria-label="نقشه نشان"/>
  {state!=="ready"&&<div className="neshan-map-message" role="status"><Icon name="mapPin" size={36}/><strong>{state==="loading"?"در حال بارگذاری نقشه…":state==="unconfigured"?"نقشه هنوز پیکربندی نشده است":"نقشه در دسترس نیست"}</strong><p>{state==="unconfigured"?"کلید عمومی نقشه نشان باید در تنظیمات نصب ثبت شود. مختصات انتخابی محفوظ است.":error}</p>{state==="error"&&<SecondaryButton onClick={()=>{setState("loading");retry(v=>v+1);}}>تلاش دوباره</SecondaryButton>}</div>}
  {state==="ready"&&<span className="neshan-center-pin" aria-label="نقطه انتخابی بازدید"><Icon name="mapPin" size={42}/></span>}
  <output dir="ltr" className="neshan-coordinates">{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</output>
  <button type="button" className="neshan-locate" aria-label="بازگشت به موقعیت من" disabled={locating} onClick={()=>void locate()}><Icon name="locate" size={24}/></button>
  {locating&&<p role="status">در حال یافتن موقعیت…</p>}
  {fix&&<output className="neshan-accuracy" role="status">دقت GPS ± {Math.round(fix.accuracyMeters).toLocaleString("fa-IR")} متر</output>}
  {error&&state!=="error"&&<p className="neshan-location-error" role="alert">{error}</p>}
 </section>;
}
