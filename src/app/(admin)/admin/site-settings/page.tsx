import type {Metadata} from "next";
import {SiteSettingsPage} from "@/features/admin/site-settings-page";
export const metadata:Metadata={title:"تنظیمات سایت"};
export default function Page(){return <SiteSettingsPage/>;}
