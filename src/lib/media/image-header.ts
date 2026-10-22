import type {ImageDimensions} from "./image-policy";
const four=(v:DataView,offset:number)=>String.fromCharCode(v.getUint8(offset),v.getUint8(offset+1),v.getUint8(offset+2),v.getUint8(offset+3));
function exifOrientation(v:DataView,start:number,end:number){
 try{if(start+14>end||four(v,start)!=="Exif")return 1;const t=start+6,le=v.getUint16(t)===0x4949;if(v.getUint16(t+2,le)!==42)return 1;const ifd=t+v.getUint32(t+4,le);if(ifd+2>end)return 1;const count=Math.min(v.getUint16(ifd,le),256);
 for(let i=0;i<count;i++){const p=ifd+2+i*12;if(p+12>end)break;if(v.getUint16(p,le)===0x0112&&v.getUint16(p+2,le)===3&&v.getUint32(p+4,le)===1){const value=v.getUint16(p+8,le);return value>=1&&value<=8?value:1;}}
 }catch{/* Malformed metadata is not trusted. */}return 1;
}
/** Bounded metadata inspection before allocating decoded pixels; not a server content validator. */
export function parseImageHeader(buffer:ArrayBuffer):ImageDimensions|undefined{
 const v=new DataView(buffer),n=v.byteLength;if(n<12)return;
 try{
  if(v.getUint16(0)===0xffd8){let p=2,orientation=1,dimensions:ImageDimensions|undefined;
   while(p+4<=n){if(v.getUint8(p)!==0xff)return;while(p<n&&v.getUint8(p)===0xff)p++;if(p>=n)break;const marker=v.getUint8(p++);if(marker===0xda||marker===0xd9)break;if(marker===1||marker>=0xd0&&marker<=0xd7)continue;const length=v.getUint16(p);if(length<2||p+length>n)return;const start=p+2,end=p+length;
    if(marker===0xe1)orientation=exifOrientation(v,start,end);
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)&&length>=8)dimensions={height:v.getUint16(start+1),width:v.getUint16(start+3),orientation};p=end;
   }return dimensions?{...dimensions,orientation}:undefined;
  }
  if(n>=24&&v.getUint32(0)===0x89504e47&&v.getUint32(4)===0x0d0a1a0a&&four(v,12)==="IHDR")return {width:v.getUint32(16),height:v.getUint32(20),orientation:1};
  if(four(v,0)==="RIFF"&&four(v,8)==="WEBP"&&n>=30){const kind=four(v,12);
   if(kind==="VP8X"){const flags=v.getUint8(20);if(flags&8)return;return {width:1+v.getUint8(24)+(v.getUint8(25)<<8)+(v.getUint8(26)<<16),height:1+v.getUint8(27)+(v.getUint8(28)<<8)+(v.getUint8(29)<<16),orientation:1,animated:Boolean(flags&2)};}
   if(kind==="VP8 "&&v.getUint8(23)===0x9d&&v.getUint8(24)===1&&v.getUint8(25)===0x2a)return {width:v.getUint16(26,true)&0x3fff,height:v.getUint16(28,true)&0x3fff,orientation:1};
   if(kind==="VP8L"&&v.getUint8(20)===0x2f){const bits=v.getUint32(21,true);return {width:1+(bits&0x3fff),height:1+((bits>>>14)&0x3fff),orientation:1};}
  }
 }catch{return;}
}
export async function readImageHeader(blob:Blob){return parseImageHeader(await blob.slice(0,256*1024).arrayBuffer());}
