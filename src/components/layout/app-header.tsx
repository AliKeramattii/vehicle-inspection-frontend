import type {ReactNode} from "react";
import {CoBranding} from "./co-branding";
export function AppHeader({actions}:{partnerName?:string;actions?:ReactNode}) { return <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border px-4 py-3"><CoBranding compact/>{actions}</header>; }
