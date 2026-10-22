import {test,expect} from "@playwright/test";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import ts from "typescript";
const output=".agent/reference-review/performance",phase=process.env.PERF_PHASE??"diagnostic";
test("bounded namespace photo-list benchmark with actual IndexedDB",async({page})=>{
 await page.goto("/foundation");
 const code=ts.transpileModule(await readFile("src/lib/media/photo-store.ts","utf8"),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
 const result=await page.evaluate(async code=>{
  const url=URL.createObjectURL(new Blob([code],{type:"text/javascript"}));
  const photoModule=await import(/* webpackIgnore: true */ url) as {indexedDBPhotoStore:{list:(namespace:string)=>Promise<{namespace:string}[]>}};URL.revokeObjectURL(url);
  const database=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open("inspection-photos",1);r.onupgradeneeded=()=>r.result.createObjectStore("photos",{keyPath:"key"});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  const sample=await(await fetch("/assets/inspection-vehicle/photo-guides/front-45-right.webp")).blob();
  await new Promise<void>((ok,no)=>{const tx=database.transaction("photos","readwrite"),store=tx.objectStore("photos");for(let inspection=0;inspection<40;inspection++){const namespace=JSON.stringify(["benchmark-"+inspection,"template",1]);for(let photo=0;photo<12;photo++)store.put({key:JSON.stringify([namespace,"p"+photo]),namespace,requirementId:"p"+photo,status:"captured",blob:sample});}tx.oncomplete=()=>ok();tx.onerror=()=>no(tx.error);});database.close();
  const original=IDBObjectStore.prototype.getAll,reads:number[]=[];
  IDBObjectStore.prototype.getAll=function(...args:Parameters<IDBObjectStore["getAll"]>){const result=original.apply(this,args);if(this.name==="photos")result.addEventListener("success",()=>reads.push(result.result.length));return result;};
  const namespace=JSON.stringify(["benchmark-20","template",1]),times:number[]=[];let count=0;
  try{for(let i=0;i<7;i++){const t=performance.now(),rows=await photoModule.indexedDBPhotoStore.list(namespace);times.push(performance.now()-t);count=rows.length;if(rows.some(r=>r.namespace!==namespace))throw Error("Foreign namespace");}}finally{IDBObjectStore.prototype.getAll=original;}
  return {inspections:40,records:480,returned:count,recordReads:reads,timesMs:times,fixtureBlobBytes:sample.size};
 },code);
 expect(result.returned).toBe(12);expect(result.recordReads).toHaveLength(7);await mkdir(output,{recursive:true});await writeFile(`${output}/${phase}-indexeddb.json`,JSON.stringify(result,null,2));
});
