import { resolveVehicleGuide, vehicleGuideAssets, vehicleIdentificationAssets } from "@/config/vehicle-assets";
import type { PhotoRequirement } from "@/schemas/photography";

export const vehicleIdentificationGuides = [
  { id: "pillar", title: "پیشنهاد ۱: کد درج شده بر روی ستون کنار درب راننده (اکثر خودروهای خارجی)", shortTitle: "ستون کنار درب راننده", src: vehicleIdentificationAssets.pillar,
    instructions: ["درِ راننده را باز کنید و برچسب روی ستون کنار در را پیدا کنید.", "تمام متن و کد روی برچسب داخل کادر باشد.", "روی نوشته‌ها فوکوس کنید؛ بازتاب نور نباید کد را بپوشاند."] },
  { id: "engine", title: "پیشنهاد ۲: کد درج شده بر روی دیواره موتور (اکثر خودروهای داخلی)", shortTitle: "دیواره موتور", src: vehicleIdentificationAssets.engine,
    instructions: ["خودرو را خاموش و کاپوت را ایمن باز کنید؛ از تماس با قطعات داغ خودداری کنید.", "کد حک‌شده روی دیواره موتور را کامل در کادر بگیرید.", "روی تمام حروف و اعداد فوکوس کنید؛ گوشی را ثابت نگه دارید."] },
  { id: "seat", title: "پیشنهاد ۳: شماره شاسی درج شده در زیر صندلی راننده یا شاگرد (برخی خودروهای خارجی)", shortTitle: "زیر صندلی", src: vehicleIdentificationAssets.seat,
    instructions: ["خودرو متوقف باشد؛ کد زیر صندلی راننده یا شاگرد را پیدا کنید.", "بدون پوشاندن شماره، نور کافی به محل برسانید.", "تمام حروف و اعداد را از نزدیک و بدون تاری ثبت کنید."] },
  { id: "windshield", title: "پیشنهاد ۴: شماره شاسی درج شده در حاشیه شیشه جلو خودرو (برخی خودروهای خارجی)", shortTitle: "حاشیه شیشه جلو", src: vehicleIdentificationAssets.windshield,
    instructions: ["کد در حاشیه پایین شیشه جلو را پیدا کنید.", "زاویه گوشی را طوری تنظیم کنید که انعکاس شیشه روی کد نباشد.", "تمام شماره و نوشته‌های کنارش خوانا و داخل کادر باشند."] },
] as const;
export type IdentificationGuide = typeof vehicleIdentificationGuides[number];
export function hasIdentificationChoices(photo: PhotoRequirement) {
  // Exact built-in samples cover pinned templates without rewriting their saved configuration.
  return Boolean(photo.choice) || [vehicleGuideAssets["spec-plate"].src, vehicleGuideAssets["chassis-number"].src].some(src => src === resolveVehicleGuide(photo.sampleImage));
}
export function identificationPhoto(photo: PhotoRequirement, choice?: IdentificationGuide): PhotoRequirement {
  return choice ? { ...photo, title: photo.choice ? `${photo.title} · ${choice.shortTitle}` : photo.title, sampleImage: choice.src, instructions: [...choice.instructions], guidanceTopics: ["text", "focus", "glare"], distance: "۳۰ سانتی‌متر", height: "هم‌سطح کد" } : photo;
}
