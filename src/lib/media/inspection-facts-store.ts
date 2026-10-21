import type {InspectionLocation,Vehicle} from "@/types/domain";
import type {ConsentReceipt} from "@/features/consent/consent-model";

export type Facts={inspectionId:string;location?:InspectionLocation;vehicle?:Vehicle;consent?:ConsentReceipt};
function open():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{let abandoned=false;const request=indexedDB.open("inspection-confirmed-facts",1);request.onupgradeneeded=()=>request.result.createObjectStore("facts",{keyPath:"inspectionId"});request.onsuccess=()=>{if(abandoned){request.result.close();return;}request.result.onversionchange=()=>request.result.close();resolve(request.result);};request.onerror=()=>reject(new Error("ذخیره مشخصات بازدید ممکن نشد."));request.onblocked=()=>{abandoned=true;reject(new Error("صفحه‌های دیگر را ببندید و دوباره تلاش کنید."));};});}
export async function readFacts(id:string):Promise<Facts|undefined>{
 if(typeof indexedDB==="undefined")return undefined;
 const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction("facts"),read=tx.objectStore("facts").get(id);tx.oncomplete=()=>{db.close();resolve(read.result);};tx.onabort=tx.onerror=()=>{db.close();reject(new Error("خواندن مشخصات بازدید ممکن نشد."));};});
}
export async function saveFacts(id:string,value:Omit<Facts,"inspectionId">){
 if(typeof indexedDB==="undefined")return;
 const db=await open();return new Promise<void>((resolve,reject)=>{const tx=db.transaction("facts","readwrite"),store=tx.objectStore("facts"),read=store.get(id);read.onsuccess=()=>store.put({...read.result,...value,inspectionId:id});tx.oncomplete=()=>{db.close();resolve();};tx.onabort=tx.onerror=()=>{db.close();reject(new Error("ذخیره مشخصات بازدید ممکن نشد."));};});
}
