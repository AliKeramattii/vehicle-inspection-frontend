import type { Coordinates, LocationFix } from "./location-adapter";
export type NeshanMap = {
 on(event:string,callback:()=>void):void; off(event:string,callback:()=>void):void;
 getCenter():{lat:number;lng:number}; easeTo(options:{center:[number,number];zoom?:number}):void;
 remove():void; resize():void;
 addSource(id:string,value:unknown):void; addLayer(value:unknown):void;
 getSource(id:string):{setData(data:unknown):void}|undefined;
};
type SDK={Map:(new(options:Record<string,unknown>)=>NeshanMap)&{mapTypes:{neshanVector:string}}};
declare global {interface Window {nmp_mapboxgl?:SDK}}
let loading:Promise<SDK>|undefined;
/** Official browser SDK loaded only for an explicitly configured public web-map key. */
export function loadNeshan():Promise<SDK>{
 if(window.nmp_mapboxgl)return Promise.resolve(window.nmp_mapboxgl);
 if(loading)return loading;
 loading=new Promise<SDK>((resolve,reject)=>{
  const css=document.createElement("link");css.rel="stylesheet";css.href="https://static.neshan.org/sdk/mapboxgl/v1.13.2/neshan-sdk/v1.1.3/index.css";document.head.append(css);
  const script=document.createElement("script");script.src="https://static.neshan.org/sdk/mapboxgl/v1.13.2/neshan-sdk/v1.1.3/index.js";script.async=true;
  script.onload=()=>window.nmp_mapboxgl?resolve(window.nmp_mapboxgl):reject(new Error("Map SDK unavailable"));
  script.onerror=()=>{script.remove();css.remove();loading=undefined;reject(new Error("Map SDK unavailable"));};document.head.append(script);
 }).catch(error=>{loading=undefined;throw error;});return loading!;
}
export async function createNeshan(container:HTMLElement,center:Coordinates,key:string){
 const sdk=await loadNeshan();return new sdk.Map({container,center:[center.longitude,center.latitude],zoom:16,mapType:sdk.Map.mapTypes.neshanVector,mapKey:key,poi:false,traffic:false,trackResize:true});
}
export interface DeviceLocationService {locate():Promise<LocationFix>}
export const browserLocationService:DeviceLocationService={
 locate:()=>new Promise((resolve,reject)=>{
  if(!navigator.geolocation){reject(new Error("موقعیت‌یابی در این مرورگر پشتیبانی نمی‌شود."));return;}
  navigator.geolocation.getCurrentPosition(p=>resolve({latitude:p.coords.latitude,longitude:p.coords.longitude,accuracyMeters:p.coords.accuracy}),
   e=>reject(new Error(e.code===1?"اجازه دسترسی به موقعیت داده نشد. تنظیمات مرورگر را بررسی کنید.":"دریافت موقعیت ممکن نشد. دوباره تلاش کنید.")),{enableHighAccuracy:true,timeout:15000,maximumAge:30000});
 })
};
/** Private reverse-geocoding credentials belong to a future backend adapter. */
export interface ReverseGeocoder {address(coordinates:Coordinates):Promise<string|undefined>}
export const unavailableReverseGeocoder:ReverseGeocoder={address:async()=>undefined};
export function accuracyPolygon(fix:LocationFix){
 const points=Array.from({length:65},(_,i)=>{const a=i/64*Math.PI*2;return [fix.longitude+Math.cos(a)*fix.accuracyMeters/(111320*Math.cos(fix.latitude*Math.PI/180)),fix.latitude+Math.sin(a)*fix.accuracyMeters/111320];});
 return {type:"Feature",properties:{},geometry:{type:"Polygon",coordinates:[points]}};
}
