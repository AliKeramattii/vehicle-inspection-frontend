import type {ReviewWorkspace} from "./model";
export interface ReviewPersistence{transact<T>(change:(workspace:ReviewWorkspace)=>T):Promise<T>}
export const emptyReviewWorkspace=():ReviewWorkspace=>({mode:"manual",reviewers:[{id:"reviewer-demo",name:"علی محمدی",active:true,capacity:5},{id:"reviewer-sara",name:"سارا رضایی",active:true,capacity:3}],cases:[],history:[]});
export class MemoryReviewPersistence implements ReviewPersistence{
 private workspace=emptyReviewWorkspace();private tail:Promise<unknown>=Promise.resolve();
 transact<T>(change:(w:ReviewWorkspace)=>T){const task=this.tail.then(()=>{const copy=structuredClone(this.workspace),result=change(copy);this.workspace=copy;return structuredClone(result);});this.tail=task.catch(()=>undefined);return task;}
}
export class IndexedDbReviewPersistence implements ReviewPersistence{
 constructor(private key="current") {}
 async transact<T>(change:(w:ReviewWorkspace)=>T):Promise<T>{
  const db=await new Promise<IDBDatabase>((resolve,reject)=>{let abandoned=false;const open=indexedDB.open("inspection-review-operations",1);open.onupgradeneeded=()=>open.result.createObjectStore("workspace");open.onsuccess=()=>{if(abandoned){open.result.close();return;}open.result.onversionchange=()=>open.result.close();resolve(open.result);};open.onerror=()=>reject(new Error("خواندن پرونده‌ها ممکن نشد."));open.onblocked=()=>{abandoned=true;reject(new Error("صفحه‌های دیگر را ببندید و دوباره تلاش کنید."));};});
  return new Promise((resolve,reject)=>{const tx=db.transaction("workspace","readwrite"),store=tx.objectStore("workspace"),read=store.get(this.key);let result:T,cause:unknown;
   read.onsuccess=()=>{try{const w:ReviewWorkspace=read.result??emptyReviewWorkspace();result=change(w);store.put(w,this.key);}catch(error){cause=error;tx.abort();}};
   tx.oncomplete=()=>{db.close();resolve(result);};tx.onerror=tx.onabort=()=>{db.close();reject(cause??new Error("ذخیره عملیات ممکن نشد. دوباره تلاش کنید."));};
  });
 }
}
