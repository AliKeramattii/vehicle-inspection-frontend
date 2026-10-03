"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { referralCodeSchema } from "@/schemas/auth";
import { ReferralCodeInput } from "@/components/ui/referral-code-input";
import { PrimaryButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAuthEntry } from "./use-auth-entry";
import { useAuthWorkflow } from "./auth-workflow-provider";

const schema = z.object({ referralCode: referralCodeSchema });
type Form = z.infer<typeof schema>;
export function ReferralForm() {
  const entry = useAuthEntry();
  const workflow = useAuthWorkflow();
  const { control, handleSubmit, setFocus, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema),
    defaultValues: { referralCode: workflow.stage === "challenge" ? workflow.referralCode : "" } });
  useEffect(() => { if (entry.isError) setFocus("referralCode"); }, [entry.isError, setFocus]);
  return <form noValidate className="referral-panel" onSubmit={handleSubmit(({ referralCode }) => entry.mutate(referralCode))}>
    <div className="referral-label"><span className="referral-icon"><Icon name="referral" size={24} /></span>
      <div><h2>کد معرفی / کد ارجاع</h2><p id="referral-hint">کد شش‌رقمی دریافتی از شرکت بیمه را وارد کنید.</p></div>
    </div>
    <Controller control={control} name="referralCode" render={({ field }) => <ReferralCodeInput {...field}
      onChange={(code) => { field.onChange(code); entry.reset(); }} disabled={entry.isPending}
      describedBy="referral-hint" error={errors.referralCode?.message ?? (entry.isError ? entry.error.message : undefined)} />} />
    <PrimaryButton type="submit" loading={entry.isPending} className="entry-primary-button">
      شروع بازدید<span className="cta-arrow"><Icon name="chevronForward" size={20} /></span>
    </PrimaryButton>
  </form>;
}
