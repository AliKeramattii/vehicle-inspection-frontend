"use client";

import { useId, useRef, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlateInput, plateSegmentOrder } from "@/components/vehicle/plate-input";
import { Icon } from "@/components/ui/icon";
import { PrimaryButton } from "@/components/ui/button";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { InlineAlert } from "@/components/ui/status";
import type { Vehicle } from "@/types/domain";
import { PlateConfirmation, type PlateMode } from "./plate-confirmation";
import { VehicleDiscrepancyControl } from "./vehicle-discrepancy";
import { vehicleConfirmationSchema, type VehicleConfirmationInput } from "./vehicle-model";

export function VehicleForm({ vehicle, onConfirm, pending = false, error, canConfirm = true }: {
  vehicle: Vehicle; onConfirm: (values: VehicleConfirmationInput) => void; pending?: boolean; error?: string; canConfirm?: boolean;
}) {
  const [mode, setMode] = useState<PlateMode>("correct");
  const [alternate, setAlternate] = useState(false);
  const alternateId = useId();
  const firstInput = useRef<HTMLInputElement>(null);
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<VehicleConfirmationInput>({ resolver: zodResolver(vehicleConfirmationSchema), defaultValues: { plate: vehicle.plate } });
  const discrepancy = useWatch({ control, name: "discrepancy" });
  return <div className="vehicle-confirmation-surface">
    <PlateConfirmation plate={vehicle.plate} mode={mode} disabled={pending} onModeChange={(next) => {
      setMode(next); if (next === "correct") setValue("plate", vehicle.plate);
    }} />
    <form noValidate className="vehicle-confirmation-form" onSubmit={(event) => void handleSubmit((values) => { if (canConfirm && !pending && !alternate) onConfirm(values); }, (invalid) => {
      const key = plateSegmentOrder.find((segment) => invalid.plate?.[segment]);
      firstInput.current?.closest("fieldset")?.querySelector<HTMLElement>(`[name="${key ?? "firstTwoDigits"}"]`)?.focus();
    })(event)}>
      <section className="manual-plate" aria-labelledby="manual-plate-heading"><h2 id="manual-plate-heading"><Icon name="keyboard" size={22} />ورود دستی پلاک</h2><p>در صورت نیاز، پلاک را به صورت دستی وارد کنید.</p>
        <Controller name="plate" control={control} render={({ field }) => <PlateInput firstInputRef={firstInput} value={field.value} onChange={(next) => { if (mode === "correct") setMode("correction"); field.onChange(next); }} disabled={pending || mode !== "correction"}
          errors={{ firstTwoDigits: errors.plate?.firstTwoDigits?.message, letter: errors.plate?.letter?.message, threeDigits: errors.plate?.threeDigits?.message, regionDigits: errors.plate?.regionDigits?.message }} />} />
        <button type="button" className="alternate-plate-toggle" aria-expanded={alternate} aria-controls={alternateId} onClick={() => setAlternate((value) => !value)}><Icon name="info" size={19} />پلاک من فرمت متفاوتی دارد</button>
        <p id={alternateId} hidden={!alternate} className="alternate-plate-help">برای پلاک با فرمت متفاوت، با نماینده شرکت بیمه هماهنگ کنید.</p>
      </section>
      <VehicleDiscrepancyControl value={discrepancy} onChange={(value) => setValue("discrepancy", value, { shouldDirty: true })} disabled={pending} />
      {error && <InlineAlert tone="destructive">{error}</InlineAlert>}
      {!canConfirm && <InlineAlert>برای ادامه، ابتدا موقعیت بازدید را تأیید کنید.</InlineAlert>}
      <BottomStickyCTA className="identity-actions"><PrimaryButton type="submit" disabled={!canConfirm || alternate} loading={pending}>تأیید مشخصات و ادامه<Icon name="chevronForward" size={22} /></PrimaryButton></BottomStickyCTA>
    </form>
  </div>;
}
