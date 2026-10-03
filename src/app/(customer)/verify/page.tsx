import type { Metadata } from "next";
import { OtpScreen } from "@/features/auth/otp-screen";
export const metadata: Metadata = { title: "تأیید شماره موبایل", robots: { index: false, follow: false } };
export default function VerifyPage() { return <OtpScreen />; }
