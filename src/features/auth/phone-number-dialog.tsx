"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { mobileSchema } from "@/schemas/auth";
import { normalizeDigits } from "@/lib/utils/persian";
import { NativeDialog } from "@/components/ui/native-dialog";
import { TextInput } from "@/components/ui/text-input";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/status";

const schema = z.object({ mobile: z.string().transform(normalizeDigits).pipe(mobileSchema) });
type Form = z.infer<typeof schema>;
export function PhoneNumberDialog({ mobile, pending, error, onSave, onDismiss }: {
  mobile: string; pending: boolean; error?: string; onSave: (mobile: string) => Promise<void>; onDismiss: () => void;
}) {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { mobile } });
  return <NativeDialog title="ویرایش شماره موبایل" onDismiss={pending ? () => undefined : onDismiss}>
    <form noValidate className="space-y-4" onSubmit={handleSubmit(async (values) => {
      if (values.mobile === mobile) { setError("mobile", { message: "شماره جدید را وارد کنید." }, { shouldFocus: true }); return; }
      await onSave(values.mobile);
    })}>
      <TextInput label="شماره موبایل" type="tel" inputMode="tel" autoComplete="tel-national" dir="ltr" autoFocus
        error={errors.mobile?.message} disabled={pending} {...register("mobile")} />
      {error && <InlineAlert tone="destructive">{error}</InlineAlert>}
      <div className="flex gap-2"><PrimaryButton type="submit" loading={pending} className="flex-1">ذخیره و ارسال کد</PrimaryButton>
        <SecondaryButton disabled={pending} onClick={onDismiss}>انصراف</SecondaryButton></div>
    </form>
  </NativeDialog>;
}
