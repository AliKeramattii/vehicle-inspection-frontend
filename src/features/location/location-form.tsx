
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InspectionLocationMap } from "@/components/location/inspection-location-map";
import { TextInput } from "@/components/ui/text-input";
import { TextArea } from "@/components/ui/text-area";
import { Icon } from "@/components/ui/icon";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { InlineAlert } from "@/components/ui/status";
import { MAX_LOCATION_ADDRESS_LENGTH, selectionSchema } from "@/lib/map/location-selection";
import type { DeviceLocationService, MapFactory } from "@/lib/map/neshan-adapter";
import type { ReverseGeocoder } from "@/lib/map/reverse-geocoder";
import type { InspectionLocation } from "@/types/domain";
import { locationDetailsSchema, locationFormSchema } from "./location-model";
import { useLocationDraft } from "./use-location-draft";
import "./location.css";

export function LocationForm({ initialLocation, onConfirm, pending = false, error, canConfirm = true, geocoder, service, factory }: {
  initialLocation?: InspectionLocation | null; onConfirm: (location: InspectionLocation) => void;
  pending?: boolean; error?: string; canConfirm?: boolean; geocoder?: ReverseGeocoder; service?: DeviceLocationService; factory?: MapFactory;
}) {
  const { controller, draft, config } = useLocationDraft(initialLocation, geocoder);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(locationDetailsSchema),
    defaultValues: { buildingNumber: initialLocation?.buildingNumber ?? "", unitFloor: initialLocation?.unitFloor ?? "", parkingDescription: initialLocation?.parkingDescription ?? "" },
  });
  const [manual, setManual] = useState({ latitude: "", longitude: "" }), [coordinateError, setCoordinateError] = useState<string>();
  const [addressTouched, setAddressTouched] = useState(false);
  const blocked = !draft.point ? "موقعیت خودرو را روی نقشه یا با «موقعیت من» انتخاب کنید." :
    !draft.address.trim() ? "آدرس موقعیت خودرو را وارد کنید." : draft.address.trim().length > MAX_LOCATION_ADDRESS_LENGTH ? "آدرس بیش از حد طولانی است؛ آن را کوتاه‌تر کنید." : !draft.addressCurrent ? "آدرس قبلی متعلق به نقطه دیگری است؛ آدرس این نقطه را تأیید یا ویرایش کنید." : undefined;
  const lookupMessage = draft.addressSource === "mock" ? "این آدرس نمونه آزمایشی است؛ آن را با محل واقعی خودرو تطبیق دهید." :
    draft.addressStatus === "loading" ? "در حال دریافت آدرس موقعیت…" :
    draft.addressStatus === "failed" ? "آدرس به‌صورت خودکار دریافت نشد. لطفاً آدرس را دستی وارد کنید." :
    draft.addressStatus === "suggested" ? "آدرس پیشنهادی دریافت شد؛ در صورت نیاز آن را اصلاح کنید." : undefined;
  return <form className="location-form neshan-picker-form" noValidate onSubmit={handleSubmit(values => {
    if (canConfirm && !pending && controller.canConfirm) onConfirm(locationFormSchema.parse(controller.confirmed(values)));
  })}>
    <div className="location-picker-content">
      <div className="location-instruction"><h1>موقعیت خودرو را مشخص کنید</h1><p>نقشه را جابه‌جا کنید تا نشانگر روی محل خودرو قرار بگیرد.</p></div>
      <InspectionLocationMap config={config} point={draft.point} onSelect={point => controller.select(point)} service={service} factory={factory} disabled={pending || !canConfirm} />
      <section className="address-panel" aria-labelledby="address-heading">
        <div className="address-heading"><h2 id="address-heading"><Icon name="mapPin" size={23} />جزئیات موقعیت خودرو</h2></div>
        <TextArea label="آدرس موقعیت خودرو" name="formattedAddress" maxLength={MAX_LOCATION_ADDRESS_LENGTH} rows={2} value={draft.address} disabled={pending}
          placeholder="پس از انتخاب نقطه، آدرس را وارد یا اصلاح کنید." aria-describedby="location-address-status"
          error={addressTouched && !draft.address.trim() ? "آدرس کامل بازدید را وارد کنید." : undefined}
          onFocus={() => controller.focusAddress(true)} onBlur={() => { controller.focusAddress(false); setAddressTouched(true); }}
          onChange={event => controller.editAddress(event.target.value)} />
        <div id="location-address-status" role="status">{lookupMessage || blocked}</div>
        {!draft.addressCurrent && draft.address.trim() && draft.point && <SecondaryButton className="location-address-use" onClick={() => controller.useAddressForPoint()}>این آدرس برای نقطه جدید درست است</SecondaryButton>}
        {draft.suggestion && <SecondaryButton className="location-address-use" onClick={() => controller.useSuggestion()}>استفاده از آدرس پیشنهادی</SecondaryButton>}
        {draft.addressStatus === "failed" && config.reverseGeocoding !== "unavailable" && <SecondaryButton className="location-address-use" onClick={() => controller.retryAddress()}>تلاش مجدد آدرس‌یابی</SecondaryButton>}
        <dl className="location-coordinate-values">
          <div><dt>عرض جغرافیایی</dt><dd dir="ltr">{draft.point?.latitude.toFixed(7) ?? "انتخاب نشده"}</dd></div>
          <div><dt>طول جغرافیایی</dt><dd dir="ltr">{draft.point?.longitude.toFixed(7) ?? "انتخاب نشده"}</dd></div>
        </dl>
        <p className="location-source-status">{draft.point?.selectionSource === "gps" ? draft.point.accuracyMeters !== null ? "دقت تقریبی مکان‌یابی: ±" + Math.round(draft.point.accuracyMeters).toLocaleString("fa-IR") + " متر" : "موقعیت دستگاه دریافت شد؛ دقت GPS در دسترس نیست." : draft.point ? "موقعیت دستی انتخاب شده است؛ دقت GPS به این نقطه نسبت داده نمی‌شود." : "هنوز نقطه‌ای انتخاب نشده است."}</p>
        {(!config.webMapKey || !config.enabled) && <details className="location-manual-coordinates"><summary>انتخاب دستی با مختصات</summary>
          <p>اگر مختصات محل خودرو را می‌دانید، آن‌ها را وارد کنید؛ مرکز پیش‌فرض نقشه انتخاب نمی‌شود.</p>
          <TextInput label="عرض جغرافیایی انتخابی" dir="ltr" inputMode="decimal" value={manual.latitude} onChange={event => setManual({ ...manual, latitude: event.target.value })} />
          <TextInput label="طول جغرافیایی انتخابی" dir="ltr" inputMode="decimal" value={manual.longitude} onChange={event => setManual({ ...manual, longitude: event.target.value })} />
          <SecondaryButton disabled={pending || !canConfirm} onClick={() => {
            const result = selectionSchema.safeParse({ latitude: manual.latitude.trim() ? Number(manual.latitude) : NaN, longitude: manual.longitude.trim() ? Number(manual.longitude) : NaN, selectionSource: "manual", accuracyMeters: null });
            if (!result.success) { setCoordinateError("عرض و طول جغرافیایی معتبر وارد کنید."); return; }
            setCoordinateError(undefined); controller.select(result.data);
          }}>انتخاب این مختصات</SecondaryButton>
          {coordinateError && <InlineAlert tone="destructive">{coordinateError}</InlineAlert>}
        </details>}
        <div className="address-fields">
          <TextInput label="شماره پلاک ساختمان" inputMode="numeric" error={errors.buildingNumber?.message} disabled={pending} {...register("buildingNumber")} />
          <TextInput label="طبقه / واحد (اختیاری)" error={errors.unitFloor?.message} disabled={pending} {...register("unitFloor")} />
          <TextInput label="توضیحات محل پارک (اختیاری)" error={errors.parkingDescription?.message} disabled={pending} {...register("parkingDescription")} />
        </div>
        {error && <InlineAlert tone="destructive">{error}</InlineAlert>}
        {!canConfirm && <InlineAlert>برای ادامه، ابتدا شماره موبایل و رضایت بازدید را تأیید کنید.</InlineAlert>}
      </section>
    </div>
    <BottomStickyCTA className="identity-actions location-picker-actions">
      {blocked && <p id="location-blocking-reason">{blocked}</p>}
      <PrimaryButton type="submit" disabled={!canConfirm || !controller.canConfirm} aria-describedby={blocked ? "location-blocking-reason" : undefined} loading={pending}>تأیید این موقعیت<Icon name="readinessTick" size={23} /></PrimaryButton>
    </BottomStickyCTA>
  </form>;
}
