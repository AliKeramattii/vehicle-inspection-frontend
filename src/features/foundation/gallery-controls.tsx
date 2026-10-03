"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PrimaryButton, SecondaryButton, IconButton } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Checkbox } from "@/components/ui/checkbox";
import { InlineAlert } from "@/components/ui/status";
import { Icon } from "@/components/ui/icon";

const formSchema = z.object({ name: z.string().trim().min(2, "نام باید حداقل ۲ حرف داشته باشد.") });
type GalleryForm = z.infer<typeof formSchema>;
export function GalleryControls() {
  const [saved, setSaved] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<GalleryForm>({
    resolver: zodResolver(formSchema), defaultValues: { name: "" },
  });
  return <form noValidate onSubmit={handleSubmit(() => setSaved(true))} className="space-y-4">
    <TextInput label="نام نمونه" placeholder="نام را وارد کنید" hint="حداقل ۲ حرف وارد کنید." autoComplete="off"
      error={errors.name?.message} {...register("name", { onChange: () => setSaved(false) })} />
    <TextInput label="شناسه نمونه" dir="ltr" defaultValue="BDI-8F31K2" readOnly hint="شناسه‌ها از چپ به راست نمایش داده می‌شوند." />
    <TextInput label="ورودی غیرفعال" defaultValue="غیرفعال" disabled />
    <Checkbox label="نمایش نمونه انتخاب" name="sample-choice" />
    <div className="flex flex-wrap gap-2">
      <PrimaryButton type="submit">ثبت نمونه<Icon name="check" size={18} /></PrimaryButton>
      <SecondaryButton onClick={() => { reset(); setSaved(false); }}>پاک کردن</SecondaryButton>
      <IconButton aria-label="راهنمای نمونه" aria-expanded={helpVisible} aria-controls="sample-help"
        onClick={() => setHelpVisible((visible) => !visible)}><Icon name="help" /></IconButton>
    </div>
    <p id="sample-help" hidden={!helpVisible} className="text-sm leading-7 text-muted">نام نمونه را وارد کنید و دکمه ثبت را بزنید.</p>
    {saved && <InlineAlert tone="success">نمونه با موفقیت ثبت شد.</InlineAlert>}
    <div className="flex flex-wrap gap-2 border-t border-border pt-4">
      <PrimaryButton loading>در حال ثبت</PrimaryButton><SecondaryButton disabled>دکمه غیرفعال</SecondaryButton>
    </div>
  </form>;
}
