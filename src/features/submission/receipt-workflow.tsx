"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { InlineAlert } from "@/components/ui/status";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { useSubmissionRecord } from "./use-submission-record";
import { SubmissionLoading } from "./submission-loading";
import { useEvidenceRequests } from "@/features/additional-evidence/use-evidence-requests";
import { additionalRoutes, requestActive } from "@/features/additional-evidence/request-model";
import { AdditionalTimeline } from "@/features/additional-evidence/additional-timeline";
import "@/features/additional-evidence/additional-evidence.css";

export function ReceiptWorkflow({ inspectionId }: { inspectionId: string }) {
  const record = useSubmissionRecord(inspectionId), router = useRouter(), [copied, setCopied] = useState(false);
  const requests = useEvidenceRequests(inspectionId), latest = requests.data?.[0];
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const host = window as Window & { requestAdditionalEvidence?: (fixture?: "two-photo" | "one-photo" | "video" | "mixed") => Promise<string> };
    host.requestAdditionalEvidence = async (fixture) => (await import("@/features/additional-evidence/request-fixtures")).activateDevelopmentRequest(inspectionId, fixture);
    return () => { delete host.requestAdditionalEvidence; };
  }, [inspectionId]);
  const receipt = record.data?.receipt;
  useEffect(() => { if (!record.isPending && !record.error && !receipt) router.replace(inspectionRoutes.summary(inspectionId)); }, [record.isPending, record.error, receipt, router, inspectionId]);
  if (record.error) return <div className="submission-recovery"><InlineAlert tone="destructive">{record.error.message}</InlineAlert><SecondaryButton onClick={() => void record.refetch()}>تلاش مجدد</SecondaryButton></div>;
  if (!receipt) return <SubmissionLoading />;
  return <div className="receipt-route">
    <div className="receipt-content">
      <Image className="receipt-hero" src="/illustrations/success/inspection-submitted.svg" alt="خودرو با نشان تأیید ارسال" width={240} height={180} unoptimized preload />
      <h2>بازدید با موفقیت ارسال شد</h2><p className="receipt-intro">کارشناسان نتیجه بازدید را بررسی خواهند کرد.</p>
      {requests.error && <InlineAlert tone="warning">خواندن درخواست‌های کارشناس ممکن نشد.<SecondaryButton onClick={() => void requests.refetch()}>تلاش مجدد</SecondaryButton></InlineAlert>}
      {latest && <section className="additional-receipt-notice"><h3>{requestActive(latest) ? "مدارک تکمیلی مورد نیاز است" : "مدارک تکمیلی ارسال شدند"}</h3><p>{requestActive(latest) ? "کارشناس برای ادامه بررسی، تصاویر جدیدی درخواست کرده است." : "مدارک جدید برای بررسی مجدد ارسال شدند."}</p><Link href={additionalRoutes.list(inspectionId, latest.id)}>{requestActive(latest) ? "مشاهده درخواست" : "مشاهده رسید مدارک تکمیلی"}<Icon name="chevronForward" size={20} /></Link></section>}
      <section className="receipt-reference" aria-label="کد پیگیری"><div><span>کد پیگیری</span><bdi dir="ltr">{receipt.reference}</bdi></div><SecondaryButton onClick={() => { if (navigator.clipboard) void navigator.clipboard.writeText(receipt.reference).then(() => setCopied(true)).catch(() => setCopied(false)); }} aria-label="کپی کد پیگیری"><Icon name="copy" size={21} />{copied ? "کپی شد" : "کپی"}</SecondaryButton></section>
      <div className="receipt-eta"><Icon name="clock" size={25} /><span>زمان تقریبی بررسی: <strong>کمتر از ۲ ساعت</strong></span></div>
      <p className="receipt-estimate">زمان اعلام‌شده، برآورد این نسخه آزمایشی است.</p>
      {latest ? <AdditionalTimeline request={latest} submittedAt={receipt.submittedAt} /> : <ol className="receipt-timeline" aria-label="مراحل بررسی بازدید"><li data-state="completed"><span><Icon name="readinessTick" size={21} /></span><b>ارسال شد</b><time dateTime={receipt.submittedAt}>{new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tehran" }).format(new Date(receipt.submittedAt))}</time></li><li data-state="current" aria-current="step"><span /><b>در صف بررسی</b><small>در انتظار کارشناس</small></li><li data-state="upcoming"><span /><b>اعلام نتیجه</b><small>پس از بررسی</small></li></ol>}
      <div className="receipt-notice"><Icon name="info" size={22} /><p>می‌توانید بعداً با همین لینک، وضعیت بازدید را مشاهده کنید.</p></div>
    </div>
    <BottomStickyCTA className="submission-actions receipt-actions"><PrimaryButton onClick={() => router.push("/")}>بازگشت به بیمه‌گر<Icon name="forward" size={22} /></PrimaryButton><p>در نسخه آزمایشی، به صفحه شروع بازمی‌گردید.</p><Link className="sr-only" href={inspectionRoutes.receipt(inspectionId)}>وضعیت بازدید</Link></BottomStickyCTA>
  </div>;
}
