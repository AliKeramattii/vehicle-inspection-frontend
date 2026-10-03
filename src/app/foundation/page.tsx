import type { Metadata } from "next";
import { FoundationGallery } from "@/features/foundation/foundation-gallery";

export const metadata: Metadata = { title: "اجزای رابط کاربری", robots: { index: false, follow: false } };
export default function FoundationPage() { return <FoundationGallery />; }
