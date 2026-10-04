"use client";

import { useId, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { PrimaryButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { InlineAlert } from "@/components/ui/status";
import type { InspectionRepository } from "@/lib/api/repositories";
import { useAuthContext, useAuthWorkflow } from "@/features/auth/auth-workflow-provider";
import { consentTermsVersion, type ConsentState } from "./consent-model";

export function ConsentForm({ repository, inspectionId }: { repository: InspectionRepository; inspectionId: string | null }) {
  const [accepted, setAccepted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const termsId = useId();
  const submission = useMutation({ mutationFn: () => {
    if (!accepted || !inspectionId) throw new Error("برای ادامه، کد معرفی و شماره موبایل خود را تأیید کنید.");
    return repository.recordConsent(inspectionId, { accepted: true, termsVersion: consentTermsVersion });
  } });
  const state: ConsentState = submission.isSuccess ? { status: "complete", receipt: submission.data } : submission.isPending ? { status: "saving" } : submission.isError ? { status: "failed", accepted, message: submission.error.message } : { status: "editing", accepted };
  if (state.status === "complete") return <section className="consent-complete" role="status"><Icon name="shield" size={43} /><h2>رضایت شما ثبت شد.</h2><p>آمادگی و رضایت بازدید تکمیل شد.</p><Link href="/readiness">بازگشت به آمادگی</Link></section>;
  return <form className="consent-form" onSubmit={(event) => { event.preventDefault(); if (accepted && !submission.isPending) submission.mutate(); }}>
    <div className="consent-controls">
      <button type="button" className="consent-terms-toggle" aria-expanded={expanded} aria-controls={termsId} onClick={() => setExpanded((value) => !value)}>
        <Icon name="terms" size={23} /><span>مشاهده متن کامل شرایط</span><span className="terms-chevron" data-expanded={expanded}><Icon name="down" size={20} /></span>
      </button>
      <div id={termsId} hidden={!expanded} className="consent-terms"><h3>شرایط بازدید و پردازش اطلاعات</h3><p>تصاویر و ویدیوهای خودرو، موقعیت تقریبی، زمان ثبت و مشخصات فنی فایل‌ها برای بررسی و تهیه گزارش بازدید استفاده می‌شوند. فقط اطلاعات مرتبط با همین خدمت را ثبت کنید.</p><p>اطلاعات برای بررسی در اختیار افراد مجاز مرتبط با بازدید قرار می‌گیرد. برای پرسش درباره حریم خصوصی یا درخواست اصلاح اطلاعات، با نماینده شرکت بیمه تماس بگیرید.</p><p>نسخه شرایط: <bdi dir="ltr">{consentTermsVersion}</bdi></p></div>
      <div className="consent-checkbox"><Checkbox checked={accepted} disabled={submission.isPending} onChange={(event) => { setAccepted(event.target.checked); submission.reset(); }} label="شرایط بازدید و پردازش اطلاعات را خواندم و می‌پذیرم." /></div>
      {state.status === "failed" && <InlineAlert tone="destructive">{state.message}</InlineAlert>}
      {accepted && !inspectionId && <InlineAlert><Link href="/">برای ثبت رضایت، ابتدا شماره موبایل را تأیید کنید.</Link></InlineAlert>}
    </div>
    <BottomStickyCTA className="preparation-actions consent-actions"><PrimaryButton type="submit" disabled={!accepted || !inspectionId} loading={submission.isPending}>تأیید و ادامه<Icon name="chevronForward" size={20} /></PrimaryButton></BottomStickyCTA>
  </form>;
}
export function ConsentWorkflow() {
  const { inspection } = useAuthContext();
  const workflow = useAuthWorkflow();
  return <ConsentForm repository={inspection} inspectionId={workflow.stage === "verified" ? workflow.inspectionId : null} />;
}
