"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NativeDialog } from "@/components/ui/native-dialog";
import { TextInput } from "@/components/ui/text-input";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { vehicleDiscrepancySchema, type VehicleDiscrepancy } from "./vehicle-model";

function DiscrepancyDialog({ value, onSave, onDismiss }: { value?: VehicleDiscrepancy; onSave: (value: VehicleDiscrepancy) => void; onDismiss: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<VehicleDiscrepancy>({ resolver: zodResolver(vehicleDiscrepancySchema), defaultValues: value ?? { field: "model", description: "" } });
  return <NativeDialog title="مغایرت مشخصات خودرو" onDismiss={onDismiss}>
    <form className="vehicle-discrepancy-form" noValidate onSubmit={(event) => { event.stopPropagation(); void handleSubmit(onSave)(event); }}>
      <label>مشخصات دارای مغایرت<select {...register("field")}><option value="model">برند / مدل خودرو</option><option value="year">سال ساخت</option><option value="color">رنگ بدنه</option><option value="vin">شماره شاسی</option></select></label>
      <TextInput label="توضیح مغایرت" error={errors.description?.message} {...register("description")} />
      <div><PrimaryButton type="submit">ثبت توضیح</PrimaryButton><SecondaryButton onClick={onDismiss}>انصراف</SecondaryButton></div>
    </form>
  </NativeDialog>;
}
export function VehicleDiscrepancyControl({ value, onChange, disabled }: { value?: VehicleDiscrepancy; onChange: (value: VehicleDiscrepancy) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => { setOpen(false); requestAnimationFrame(() => trigger.current?.focus()); };
  return <><button ref={trigger} type="button" className="vehicle-discrepancy-trigger" disabled={disabled} onClick={() => setOpen(true)}><Icon name="discrepancy" size={23} />{value ? "توضیح مغایرت ثبت شد؛ ویرایش" : "مشخصات دیگری مغایرت دارد"}<Icon name="chevronForward" size={19} /></button>
    {open && createPortal(<DiscrepancyDialog value={value} onSave={(next) => { onChange(next); close(); }} onDismiss={close} />, document.body)}</>;
}
