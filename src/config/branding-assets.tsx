"use client";
import Image, {getImageProps, type ImageProps} from "next/image";
import { useState, useEffect, type ReactNode } from "react";
import { useOptionalRuntimeSite } from "./site-settings.provider";
export const brandingAssets={
  landing:{src:"/images/auth/landing-suv.png",fit:"cover"},
  referral:{src:"/images/auth/landing-suv.png",fit:"cover"},
  otp:{src:"/images/auth/otp-phone-shield.png",fit:"cover"},
  readiness:{src:"/images/preparation/vehicle-inspection.webp",fit:"cover"},
  consent:{src:"/images/preparation/consent-hero.webp",fit:"contain"},
} as const;
export type BrandingAssetRole=keyof typeof brandingAssets;
export function BrandingImage({role,alt,...props}:{role:BrandingAssetRole}&Omit<ImageProps,"src">) {
  const site=useOptionalRuntimeSite(),override=(role==="landing"?site?.settings.images.landing??site?.settings.images.referral:site?.settings.images[role]);
  const [failed,setFailed]=useState<string>();
  const src=override&&failed!==override?override:brandingAssets[role].src;
  return <Image {...props} alt={alt} src={src} unoptimized={Boolean(override&&src===override)} onError={()=>{if(override)setFailed(override);}} />;
}
export function useBrandingBackground(role:BrandingAssetRole) {
  const site=useOptionalRuntimeSite(), candidate=site?.settings.images[role];
  const [failed,setFailed]=useState<string>();
  const override=candidate!==failed?candidate:null;
  useEffect(()=>{if(!candidate)return;const probe=new window.Image();probe.onerror=()=>setFailed(candidate);probe.src=candidate;return()=>{probe.onerror=null;};},[candidate]);
  if(override)return 'url('+JSON.stringify(override)+')';
  const {props:{srcSet=""}}=getImageProps({src:brandingAssets[role].src,alt:"",width:480,height:237});
  return 'image-set('+srcSet.split(", ").map(source=>{const[url,density]=source.split(" ");return 'url("'+url+'") '+density;}).join(", ")+')';
}
export function RuntimeBrokerName({fallback}:{fallback:ReactNode}) {
  const site=useOptionalRuntimeSite();
  return <>{site?site.settings.identity.brokerageName:fallback}</>;
}
export function RuntimeLogo({fallback,width=31,height=35}:{fallback:ReactNode;width?:number;height?:number}) {
  const src=useOptionalRuntimeSite()?.settings.identity.logo;const[failed,setFailed]=useState<string>();
  return src&&src!==failed?<Image src={src} alt="" className="runtime-logo" width={width} height={height} unoptimized onError={()=>setFailed(src)}/>:fallback;
}

export function BrandingBackground({role,className,label,children}:{role:BrandingAssetRole;className:string;label:string;children:ReactNode}) {const backgroundImage=useBrandingBackground(role);return <section className={className} aria-label={label} style={{backgroundImage}}>{children}</section>;}
