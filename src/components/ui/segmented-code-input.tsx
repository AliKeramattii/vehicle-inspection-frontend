"use client";

import { useId, useRef, useState, type Ref } from "react";
import { cn } from "@/lib/utils/cn";
import { normalizeCode, toPersianDigits } from "@/lib/utils/persian";

export type SegmentedCodeInputProps = {
  value: string; onChange: (value: string) => void; onBlur?: () => void;
  label: string; error?: string; describedBy?: string; disabled?: boolean;
  autoFocus?: boolean; name?: string; ref?: Ref<HTMLInputElement>;
};
type Props = SegmentedCodeInputProps & { length: number; numeric?: boolean; persianDigits?: boolean };

export function SegmentedCodeInput({ value, onChange, onBlur, label, error, describedBy,
  disabled, autoFocus, name, ref, length, numeric = false, persianDigits = false }: Props) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [selection, setSelection] = useState(0);
  const active = Math.min(selection, length - 1);
  return <div>
    <label htmlFor={id} className="sr-only">{label}</label>
    <div className={cn("code-control", numeric && "code-control-otp")} dir="ltr">
      <div className="code-cells" aria-hidden="true">
        {Array.from({ length }, (_, index) => <span key={index} data-active={focused && index === active ? "true" : undefined}
          className={cn("code-cell", error && "code-cell-error", disabled && "opacity-60")}>
          {persianDigits ? toPersianDigits(value[index] ?? "") : value[index]}
        </span>)}
      </div>
      <input id={id} ref={(node) => {
        input.current = node;
        if (typeof ref === "function") ref(node); else if (ref) ref.current = node;
      }} name={name} type="text" dir="ltr" inputMode={numeric ? "numeric" : "text"}
        autoComplete={numeric ? "one-time-code" : "off"} autoCapitalize={numeric ? "off" : "characters"}
        spellCheck={false} maxLength={length} value={value} disabled={disabled} autoFocus={autoFocus}
        aria-invalid={error ? true : undefined}
        aria-describedby={[describedBy, error ? `${id}-error` : undefined].filter(Boolean).join(" ") || undefined}
        className="code-native-input"
        onChange={(event) => {
          const normalized = normalizeCode(event.target.value, length, numeric);
          setSelection(Math.min(event.target.selectionStart ?? normalized.length, length - 1));
          onChange(normalized);
        }}
        onPaste={(event) => {
          event.preventDefault();
          const code = normalizeCode(event.clipboardData.getData("text"), length, numeric);
          event.currentTarget.value = code;
          event.currentTarget.setSelectionRange(code.length, code.length);
          setSelection(code.length);
          onChange(code);
        }}
        onFocus={(event) => { setFocused(true); setSelection(event.target.selectionStart ?? value.length); }}
        onBlur={() => { setFocused(false); onBlur?.(); }}
        onSelect={(event) => setSelection(event.currentTarget.selectionStart ?? 0)}
        onPointerDown={(event) => {
          if (disabled) return;
          event.preventDefault();
          const bounds = event.currentTarget.getBoundingClientRect();
          const index = bounds.width === 0 ? 0 : Math.max(0, Math.min(Math.floor((event.clientX - bounds.left) / (bounds.width / length)), value.length, length - 1));
          input.current?.focus();
          input.current?.setSelectionRange(index, Math.min(index + 1, value.length));
          setSelection(index);
        }} />
    </div>
    {error && <p id={`${id}-error`} role="alert" className="mt-2 text-xs leading-5 text-destructive">{error}</p>}
  </div>;
}
