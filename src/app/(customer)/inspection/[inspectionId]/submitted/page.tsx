import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ReceiptWorkflow } from "@/features/submission/receipt-workflow";
import "@/features/photography/photography.css";
import "@/features/submission/submission.css";
export const metadata: Metadata = { title: "رسید ارسال بازدید" };
export default async function ReceiptPage({ params }: { params: Promise<{ inspectionId: string }> }) {
  const { inspectionId } = await params;
  return <main id="main-content" tabIndex={-1} className="photography-screen submission-screen receipt-screen"><header className="receipt-header"><div><Icon name="shield" size={31} /><h1>بازدید خودرو</h1></div><span>بیمه ملت</span><Link href="/" aria-label="بازگشت به شروع"><Icon name="chevronForward" size={24} /></Link></header><ReceiptWorkflow inspectionId={inspectionId} /></main>;
}
