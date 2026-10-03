"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconButton } from "./button";
import { Icon } from "./icon";

export function NativeDialog({ title, onDismiss, children }: { title: string; onDismiss: () => void; children: ReactNode }) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    element?.querySelector<HTMLInputElement>("input:not([disabled])")?.focus();
    return () => element?.close();
  }, []);
  return <dialog ref={dialog} aria-labelledby={id} className="entry-dialog" onCancel={(event) => { event.preventDefault(); onDismiss(); }}>
    <div className="mb-5 flex items-center justify-between gap-3"><h2 id={id} className="text-lg font-bold">{title}</h2>
      <IconButton aria-label="بستن" onClick={onDismiss}><Icon name="close" /></IconButton>
    </div>{children}
  </dialog>;
}
