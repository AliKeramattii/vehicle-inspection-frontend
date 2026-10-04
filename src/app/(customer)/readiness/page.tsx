import type { Metadata } from "next";
import { ReadinessScreen } from "@/features/readiness/readiness-screen";

export const metadata: Metadata = { title: "آمادگی بازدید", robots: { index: false } };
export default function ReadinessPage() { return <ReadinessScreen />; }
