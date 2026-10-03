"use client";

import { SegmentedCodeInput, type SegmentedCodeInputProps } from "./segmented-code-input";
type Props = Omit<SegmentedCodeInputProps, "label"> & { label?: string; onComplete: (code: string) => void };
export function OTPInput({ onChange, onComplete, value, ...props }: Props) {
  return <SegmentedCodeInput {...props} label={props.label ?? "کد تأیید پنج‌رقمی"} length={5} numeric persianDigits value={value}
    onChange={(code) => { onChange(code); if (code.length === 5 && code !== value) onComplete(code); }} />;
}
