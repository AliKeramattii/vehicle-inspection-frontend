"use client";
import {createContext,useContext,useState,type ReactNode} from "react";
import Link from "next/link";
import {AppViewport} from "@/components/layout/app-viewport";
import {CoBranding} from "@/components/layout/co-branding";
import type {OperationsActor} from "./model";
const Context=createContext<OperationsActor>({id:"reviewer-demo",role:"reviewer"});
export function useReviewerActor(){return useContext(Context);}
export function ReviewerShell({children}:{children:ReactNode}){
 const[id,setId]=useState("reviewer-demo");
 return <Context.Provider value={{id,role:"reviewer"}}><AppViewport className="reviewer-root"><header className="reviewer-topbar"><CoBranding compact/><Link href="/reviewer">صف بررسی</Link><label>هویت نمونه<select aria-label="کارشناس نمونه" value={id} onChange={e=>setId(e.target.value)}><option value="reviewer-demo">علی محمدی</option><option value="reviewer-sara">سارا رضایی</option></select></label><span>کارشناس</span></header><main id="main-content" tabIndex={-1} className="reviewer-main">{children}</main></AppViewport></Context.Provider>;
}
