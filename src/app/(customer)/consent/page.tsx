import type { Metadata } from "next";
import { ConsentScreen } from "@/features/consent/consent-screen";

export const metadata: Metadata = { title: "رضایت و حریم خصوصی", robots: { index: false } };
export default function ConsentPage() { return <ConsentScreen />; }
