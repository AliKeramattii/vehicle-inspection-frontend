/** Private, case-lifetime, bounded Blob cache. No object URLs or accepted originals are retained. */
export class ThumbnailCache {
 private entries=new Map<string,{promise:Promise<Blob>;bytes:number}>();
 constructor(private readonly maxBytes=2*1024*1024,private readonly maxEntries=16){}
 get size(){return this.entries.size;}
 clear(){this.entries.clear();}
 get(key:string,create:()=>Promise<Blob>):Promise<Blob>{
  const previous=this.entries.get(key);if(previous){this.entries.delete(key);this.entries.set(key,previous);return previous.promise;}
  const entry={promise:Promise.resolve().then(create),bytes:0};this.entries.set(key,entry);
  void entry.promise.then(blob=>{if(this.entries.get(key)!==entry)return;entry.bytes=blob.size;if(blob.size>this.maxBytes)this.entries.delete(key);this.trim();},()=>{if(this.entries.get(key)===entry)this.entries.delete(key);});this.trim();return entry.promise;
 }
 private trim(){while(this.entries.size>this.maxEntries||[...this.entries.values()].reduce((sum,item)=>sum+item.bytes,0)>this.maxBytes){const first=this.entries.keys().next().value;if(first===undefined)break;this.entries.delete(first);}}
}
