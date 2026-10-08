"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatOdometer, parseOdometer, type OdometerReading } from "./capture-package-model";

const schema = z.object({ reading: z.string().transform((value, context) => {
  try { return parseOdometer(value); } catch (error) { context.addIssue({ code: "custom", message: (error as Error).message }); return z.NEVER; }
}) });
export function OdometerField({ value, onSave, pending }: { value?: OdometerReading; onSave: (kilometers: number) => void; pending?: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { reading: value ? formatOdometer(value.kilometers) : "" } });
  return <form id="odometer-form" className="odometer-entry" onSubmit={handleSubmit(({ reading }) => onSave(reading))} noValidate>
    <label htmlFor="odometer-kilometers">کیلومتر فعلی</label>
    <div className="odometer-input"><input {...register("reading")} id="odometer-kilometers" inputMode="numeric" dir="ltr" autoComplete="off" placeholder="۴۸٬۳۲۰" aria-describedby={`odometer-help${errors.reading ? " odometer-error" : ""}`} aria-invalid={Boolean(errors.reading)} disabled={pending} /><span>km</span></div>
    <p id="odometer-help">عدد نمایش‌داده‌شده روی کیلومترشمار را وارد کنید.</p>
    {errors.reading && <p id="odometer-error" role="alert">{errors.reading.message}</p>}
  </form>;
}
