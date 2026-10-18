"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconButton } from "./button";
import { X } from "lucide-react";

export function NativeDialog({ title, onDismiss, children, className = "" }: { className?: string; title: string; onDismiss: () => void; children: ReactNode }) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element?.showModal();
    element?.querySelector<HTMLElement>('input:not([disabled]):not([type="hidden"]):not([hidden]), textarea:not([disabled]), select:not([disabled])')?.focus();
    return () => {
      element?.close();
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={dialog} aria-labelledby={id} className={"entry-dialog " + className} onCancel={(event) => { event.preventDefault(); onDismiss(); }}>
    <div className="mb-5 flex items-center justify-between gap-3"><h2 id={id} className="text-lg font-bold">{title}</h2>
      <IconButton aria-label="بستن" onClick={onDismiss}><X size={22} aria-hidden="true" /></IconButton>
    </div>{children}
  </dialog>;
}
