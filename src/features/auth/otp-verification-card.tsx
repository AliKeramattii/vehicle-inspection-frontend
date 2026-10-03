"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { OTPInput } from "@/components/ui/otp-input";
import { Icon } from "@/components/ui/icon";
import { InlineAlert } from "@/components/ui/status";
import { SecondaryButton } from "@/components/ui/button";
import { maskMobile, toPersianDigits, formatCountdown } from "@/lib/utils/persian";
import { useOtpVerification } from "./use-otp-verification";
import { PhoneNumberDialog } from "./phone-number-dialog";

export function OtpVerificationCard() {
  const otp = useOtpVerification();
  const [editing, setEditing] = useState(false);
  const editButton = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const { workflow } = otp;
  const busy = otp.verification.isPending || otp.request.isPending;
  useEffect(() => {
    if (!editing && !busy && (otp.request.isSuccess || otp.verification.isError)) input.current?.focus();
  }, [editing, busy, otp.request.isSuccess, otp.verification.isError]);
  function dismiss() { setEditing(false); requestAnimationFrame(() => editButton.current?.focus()); }
  if (workflow.stage === "idle") return <section className="otp-panel otp-missing">
    <InlineAlert>برای دریافت کد تأیید، ابتدا کد معرفی خود را وارد کنید.</InlineAlert>
    <Link href="/" className="entry-return-link">بازگشت به شروع بازدید<Icon name="back" size={18} /></Link>
  </section>;
  if (workflow.stage === "verified") return <section className="otp-panel otp-success">
    <span className="otp-success-icon"><Icon name="check" size={44} /></span>
    <h2>شماره موبایل تأیید شد.</h2><p>تأیید شماره با موفقیت انجام شد.</p>
    <InlineAlert tone="success">این مرحله تکمیل شد. مراحل بعدی بازدید به‌زودی در دسترس خواهند بود.</InlineAlert>
    <Link href="/" className="entry-return-link">بازگشت<Icon name="back" size={18} /></Link>
  </section>;
  const locked = workflow.remainingAttempts === 0;
  return <section className="otp-panel" aria-label="تأیید کد ارسالی">
    <p className="otp-number-label">کد ارسال شده به شماره</p>
    <p className="otp-masked-number"><bdi dir="ltr">{toPersianDigits(maskMobile(workflow.mobile))}</bdi></p>
    <OTPInput name="otp" ref={input} value={otp.code} autoFocus disabled={busy || locked || otp.expired}
      describedBy="otp-completion-hint" onChange={(code) => { otp.setCode(code); otp.verification.reset(); }} onComplete={otp.complete}
      error={otp.verification.isError ? otp.verification.error.message : undefined} />
    <p id="otp-completion-hint" className="otp-completion-hint">
      {otp.verification.isPending ? "در حال تأیید شماره موبایل…" : "پس از تکمیل کد، تأیید به صورت خودکار انجام می‌شود."}
      <Icon name="check" size={19} />
    </p>
    {otp.expired && <InlineAlert tone="warning">مهلت کد تمام شده است. کد تازه درخواست کنید.</InlineAlert>}
    {locked && <InlineAlert tone="warning">فرصت‌ها تمام شد. پس از پایان زمان، کد تازه درخواست کنید.</InlineAlert>}
    <div className="otp-resend-area">
      {otp.secondsRemaining > 0 ? <p className="otp-countdown" aria-label={`ارسال مجدد تا ${formatCountdown(otp.secondsRemaining)}`}>
        ارسال مجدد تا <bdi dir="ltr">{formatCountdown(otp.secondsRemaining)}</bdi><Icon name="clock" size={19} />
      </p> : <SecondaryButton loading={otp.request.isPending} disabled={otp.verification.isPending}
        onClick={() => otp.request.mutate(workflow.mobile)}>ارسال مجدد کد<Icon name="clock" size={19} /></SecondaryButton>}
      <p className="otp-attempts"><Icon name="shield" size={16} />{toPersianDigits(workflow.remainingAttempts)} بار فرصت باقی مانده است.</p>
      {!editing && otp.request.isError && <InlineAlert tone="destructive">{otp.request.error.message}</InlineAlert>}
    </div>
    <button type="button" ref={editButton} className="otp-edit-number" disabled={busy}
      onClick={() => { otp.request.reset(); setEditing(true); }}><Icon name="edit" size={19} />ویرایش شماره موبایل</button>
    {editing && <PhoneNumberDialog mobile={workflow.mobile} pending={otp.request.isPending}
      error={otp.request.isError ? otp.request.error.message : undefined} onDismiss={dismiss}
      onSave={async (mobile) => {
        try { await otp.request.mutateAsync(mobile); setEditing(false); }
        catch { /* Query exposes repository errors in the dialog; keep it open for correction. */ }
      }} />}
  </section>;
}
