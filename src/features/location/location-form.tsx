"use client";

import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InspectionLocationMap } from "@/components/location/inspection-location-map";
import { TextInput } from "@/components/ui/text-input";
import { Icon } from "@/components/ui/icon";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { InlineAlert } from "@/components/ui/status";
import { developmentLocationAdapter, isGpsMatched, type InspectionLocationAdapter } from "@/lib/map/location-adapter";
import type { InspectionLocation } from "@/types/domain";
import { locationFormSchema, type LocationFormValues } from "./location-model";

export function LocationForm({ initialLocation, onConfirm, pending = false, error, canConfirm = true, adapter = developmentLocationAdapter }: {
  initialLocation: InspectionLocation; onConfirm: (location: InspectionLocation) => void; pending?: boolean; error?: string; canConfirm?: boolean; adapter?: InspectionLocationAdapter;
}) {
  const [editing, setEditing] = useState(false);
  const editButton = useRef<HTMLButtonElement>(null);
  const { register, handleSubmit, control, setValue, setFocus, formState: { errors } } = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema), defaultValues: { ...initialLocation, buildingNumber: initialLocation.buildingNumber ?? "", unitFloor: initialLocation.unitFloor ?? "", parkingDescription: initialLocation.parkingDescription ?? "" },
  });
  const location = useWatch({ control }) as LocationFormValues;
  const matched = isGpsMatched(location, adapter.initialLocation);
  return <form className="location-form" noValidate onSubmit={handleSubmit((values) => { if (canConfirm && !pending) onConfirm(values); })}>
    <InspectionLocationMap adapter={adapter} location={location} onChange={(next) => {
      setValue("latitude", next.latitude, { shouldDirty: true }); setValue("longitude", next.longitude, { shouldDirty: true }); setValue("accuracyMeters", next.accuracyMeters);
    }} />
    <section className="address-panel" aria-labelledby="address-heading">
      <span className="address-panel-handle" aria-hidden="true" />
      <div className="address-heading"><h2 id="address-heading"><Icon name="mapPin" size={23} />آدرس شناسایی‌شده</h2>
        <SecondaryButton className="address-edit" aria-expanded={editing} onClick={(event) => { editButton.current = event.currentTarget; setEditing((value) => !value); if (!editing) requestAnimationFrame(() => setFocus("formattedAddress")); }}><span><Icon name="edit" size={17} />ویرایش</span></SecondaryButton>
      </div>
      {editing ? <div className="address-edit-field"><TextInput label="آدرس بازدید" error={errors.formattedAddress?.message} disabled={pending} {...register("formattedAddress")} />
        <button type="button" onClick={() => { setEditing(false); editButton.current?.focus(); }}>پایان ویرایش آدرس</button></div> : <p className="detected-address">{location.formattedAddress}</p>}
      <div className="address-gps-status" data-matched={matched} role="status"><Icon name={matched ? "check" : "info"} size={22} />{matched ? "موقعیت شما با GPS تطبیق داده شد" : "نقطه انتخابی را روی نقشه بررسی کنید"}</div>
      <div className="address-fields">
        <TextInput label="شماره پلاک ساختمان" inputMode="numeric" error={errors.buildingNumber?.message} disabled={pending} {...register("buildingNumber")} />
        <TextInput label="طبقه / واحد (اختیاری)" error={errors.unitFloor?.message} disabled={pending} {...register("unitFloor")} />
        <TextInput label="توضیحات محل پارک (اختیاری)" className="parking-input" error={errors.parkingDescription?.message} disabled={pending} {...register("parkingDescription")} />
      </div>
      {error && <InlineAlert tone="destructive">{error}</InlineAlert>}
      {!canConfirm && <InlineAlert>برای ادامه، ابتدا شماره موبایل و رضایت بازدید را تأیید کنید.</InlineAlert>}
      <BottomStickyCTA className="identity-actions"><PrimaryButton type="submit" disabled={!canConfirm} loading={pending}>تأیید این موقعیت<Icon name="readinessTick" size={23} /></PrimaryButton></BottomStickyCTA>
    </section>
  </form>;
}
