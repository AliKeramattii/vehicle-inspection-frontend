import type {Page} from "@playwright/test";
/** Let the browser resolve LAB/variable serialization instead of assuming an RGB spelling. */
export async function semanticColor(page:Page,token:string,scope="body"){
 return page.locator(scope).first().evaluate((root,token)=>{const probe=document.createElement("span");probe.style.color="var("+token+")";root.append(probe);const color=getComputedStyle(probe).color;probe.remove();return color;},token);
}
export async function semanticHex(page:Page,token:string){
 return page.evaluate(token=>{const probe=document.createElement("span");probe.style.color="var("+token+")";document.body.append(probe);const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d")!;ctx.fillStyle=getComputedStyle(probe).color;ctx.fillRect(0,0,1,1);probe.remove();return "#"+[...ctx.getImageData(0,0,1,1).data].slice(0,3).map(v=>v.toString(16).padStart(2,"0")).join("");},token);
}

export type ContrastCheck={label:string;foreground:string;background:string;ratio:number;minimum:number};
export async function roleContrast(page:Page,scope:string){
 return page.locator(scope).first().evaluate(root=>{
  const probe=document.createElement("span"),canvas=document.createElement("canvas");canvas.width=canvas.height=1;const ctx=canvas.getContext("2d",{willReadFrequently:true})!;root.append(probe);
  const rgb=(name:string)=>{probe.style.color="var(--color-"+name+")";ctx.clearRect(0,0,1,1);ctx.fillStyle=getComputedStyle(probe).color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].slice(0,3);};
  const luminance=(rgb:number[])=>{const c=rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
  const pairs:[string,string,number][]=[["ink","background",4.5],["ink","surface",4.5],["muted","surface",4.5],["muted","surface-soft",4.5],["on-primary","primary",4.5],["on-primary","primary-hover",4.5],["primary-ink","primary-soft",4.5],["accent-ink","accent-soft",4.5],["on-accent","accent",4.5],["selected","selected-soft",4.5],["information","information-soft",4.5],["success-ink","success-soft",4.5],["warning-ink","warning-soft",4.5],["destructive-ink","destructive-soft",4.5],["on-status","pending",4.5],["focus","background",3],["focus","surface",3],["control-border","surface",3],["control-border","surface-soft",3],["focus","surface-soft",3],["on-status","success",3],["on-status","warning",3],["map-ink","surface",4.5],["media-ink","media-canvas",4.5],["media-muted","media-canvas",4.5],["media-error","media-canvas",4.5]];
  const checks=pairs.map(([foreground,background,minimum])=>{const a=luminance(rgb(foreground)),b=luminance(rgb(background));return{label:foreground+" / "+background,foreground,background,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),minimum};});probe.remove();return checks;
 });
}

/** Actual visible UI text, composed over ancestor surfaces. Media pixels/disabled UI
 * are explicitly excluded; those are manually reviewed and have separate role checks. */
export async function visibleTextContrast(page:Page){
 return page.evaluate(()=>{
  const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d",{willReadFrequently:true})!;canvas.width=canvas.height=1;
  const rgba=(value:string)=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=value;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];};
  const blend=(front:number[],back:number[])=>{const a=front[3]/255;return [0,1,2].map(i=>front[i]*a+back[i]*(1-a)).concat(255);};
  const luminance=(rgb:number[])=>{const c=rgb.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
  const rows:{text:string;selector:string;ratio:number;minimum:number;color:string;background:number[]}[]=[];
  for(const element of document.querySelectorAll<HTMLElement>("h1,h2,h3,p,small,label,a,button,input,select,textarea,.upload-status,.review-evidence-state,.admin-avatar")){
   const box=element.getBoundingClientRect(),style=getComputedStyle(element);if(box.width===0||box.height===0||box.bottom<=0||box.top>=innerHeight||box.left>=innerWidth||box.right<=0||style.visibility!=="visible"||style.opacity==="0"||element.matches(":disabled,[aria-disabled=true]"))continue;
   if(element.closest(".photography-image,.recorder-live,.camera-preview,.plate-flag,[aria-hidden=true]"))continue;
   const text=(element instanceof HTMLInputElement||element instanceof HTMLTextAreaElement)?element.value||element.placeholder:(element.textContent??"").trim();if(!text)continue;
   let background=[255,255,255,255];const chain:Element[]=[];for(let node:Element|null=element;node;node=node.parentElement)chain.unshift(node);for(const node of chain)background=blend(rgba(getComputedStyle(node).backgroundColor),background);
   const color=(element instanceof HTMLInputElement||element instanceof HTMLTextAreaElement)&&!element.value&&element.placeholder?getComputedStyle(element,"::placeholder").color:style.color;
   const foreground=blend(rgba(color),background),a=luminance(foreground),b=luminance(background);const large=parseFloat(style.fontSize)>=24||parseFloat(style.fontSize)>=18.66&&parseInt(style.fontWeight)>=700;
   rows.push({text:text.slice(0,90),selector:element.tagName.toLowerCase()+"."+[...element.classList].slice(0,2).join("."),ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),minimum:large?3:4.5,color,background});
  }return rows;
 });
}
