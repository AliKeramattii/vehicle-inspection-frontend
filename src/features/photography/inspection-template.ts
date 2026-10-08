import { photographyTemplateSchema, type PhotoRequirement, type InspectionSection } from "@/schemas/photography";
import type { CapturePlan, CaptureCategory } from "@/types/domain";

const exteriorChecks = ["واضح", "نور مناسب", "خودرو کامل در کادر"];
function photo(id: string, title: string, description: string, instructions: string[], extra: Partial<PhotoRequirement> = {}): PhotoRequirement {
  return { id, title, description, instructions, sampleImage: `/assets/inspection/photo-guides/${id}.webp`,
    required: true, status: "pending", checks: exteriorChecks, distance: "۳ متر", height: "کمر", orientation: "landscape", guidanceTopics: ["frame", "distance", "angle"], ...extra };
}
function side(side: "راست" | "چپ", direction: "right" | "left") {
  return [
    photo(`front-45-${direction}`, `جلو ۴۵° ${side}`, `جلوی خودرو و سمت ${side} به صورت کامل دیده شود.`,
      [`جلوی خودرو و سمت ${side} به طور کامل داخل کادر باشد.`, "حدود ۳ متر از خودرو فاصله بگیرید.", `از زاویه ۴۵ درجه سمت ${side} عکس بگیرید.`]),
    photo(`back-45-${direction}`, `عقب ۴۵° ${side}`, `عقب خودرو و سمت ${side} به صورت کامل دیده شود.`,
      [`تمام قسمت عقب و سمت ${side} خودرو داخل کادر باشد.`, "خودرو را از زاویه ۴۵ درجه ثبت کنید.", "در نور کافی و بدون سایه شدید عکاسی کنید."], { guidanceTopics: ["frame", "angle", "glare"] }),
  ];
}
const sections: InspectionSection[] = [
  { id: "right", title: "نمای راست", order: 1, photoRequirements: side("راست", "right") },
  { id: "left", title: "نمای چپ", order: 2, photoRequirements: side("چپ", "left") },
  { id: "front", title: "جلو", order: 3, photoRequirements: [photo("front-plate", "نمای مستقیم جلو با پلاک",
    "یک عکس مستقیم از نمای جلوی خودرو بگیرید، به طوری که پلاک کاملاً مشخص و خوانا باشد.",
    ["مستقیم روبه‌روی خودرو بایستید؛ خودرو وسط کادر باشد.", "نمای کامل جلو را بدون برش و زاویه شدید ثبت کنید.", "پلاک بدون بازتاب نور و کاملاً خوانا باشد."], { height: "چراغ‌ها", guidanceTopics: ["angle", "frame", "text"], checks: ["واضح", "نور مناسب", "پلاک خوانا است"] })] },
  { id: "rear", title: "عقب", order: 4, photoRequirements: [photo("rear-plate", "نمای مستقیم عقب با پلاک",
    "یک عکس مستقیم از نمای عقب خودرو بگیرید، به طوری که پلاک کاملاً مشخص و خوانا باشد.",
    ["مستقیم پشت خودرو بایستید؛ خودرو وسط کادر باشد.", "تمام نمای عقب بدون برش و زاویه شدید داخل کادر باشد.", "پلاک کاملاً خوانا و بدون بازتاب باشد."], { height: "چراغ‌ها", guidanceTopics: ["angle", "frame", "text"], checks: ["واضح", "نور مناسب", "پلاک خوانا است"] })] },
  { id: "cabin", title: "کابین", order: 5, photoRequirements: [
    photo("odometer-on", "کیلومترشمار", "خودرو را روشن کنید و تصویری واضح از کیلومترشمار بگیرید.",
      ["خودرو را روشن و در حالت توقف نگه دارید.", "تمام صفحه کیلومترشمار در کادر باشد.", "عدد کیلومتر خوانا باشد؛ از بازتاب نور جلوگیری کنید."], { distance: "نزدیک", height: "داشبورد", guidanceTopics: ["ignition", "frame", "glare"], checks: ["واضح", "نور مناسب", "عدد کیلومتر خوانا است"] }),
    photo("driver-interior", "نمای داخل کابین از سمت راننده", "از سمت راننده تصویری بگیرید که فضای داخلی خودرو به صورت واضح دیده شود.",
      ["درِ سمت راننده را باز کنید.", "فرمان، داشبورد و صندلی‌ها دیده شوند.", "خیلی نزدیک نشوید؛ فضای داخلی کامل دیده شود."], { distance: "۱ متر", height: "درِ راننده", guidanceTopics: ["interior", "frame", "distance"], checks: ["واضح", "نور مناسب", "کابین کامل در کادر"] }),
  ] },
  { id: "engine-details", title: "موتور و مشخصات", order: 6, photoRequirements: [
    photo("engine-bay", "محفظه موتور", "کاپوت را باز کنید و یک تصویر کامل و واضح از محفظه موتور بگیرید.",
      ["خودرو متوقف باشد؛ کاپوت را کاملاً و ایمن باز کنید.", "تمام محفظه موتور دیده شود.", "گوشی ثابت و تصویر بدون تاری باشد."], { distance: "۱ متر", height: "سینه", guidanceTopics: ["hood", "frame", "steady"], checks: ["واضح", "نور مناسب", "محفظه کامل در کادر"] }),
    photo("spec-plate", "پلاک مشخصات خودرو", "یک تصویر نزدیک و واضح از پلاک مشخصات خودرو ثبت کنید.",
      ["از نزدیک روی پلاک مشخصات فوکوس کنید.", "تمام متن پلاک داخل کادر باشد.", "نوشته‌ها خوانا و بدون بازتاب نور باشند."], { distance: "۳۰ سانتی‌متر", height: "هم‌سطح پلاک", guidanceTopics: ["text", "frame", "glare"], checks: ["واضح", "نور مناسب", "اطلاعات قابل خواندن است"] }),
    photo("chassis-number", "شماره شاسی", "از شماره شاسی حک‌شده روی بدنه خودرو یک تصویر نزدیک و کاملاً واضح بگیرید.",
      ["شماره شاسی حک‌شده روی بدنه را کامل نشان دهید.", "روی تمام حروف و اعداد فوکوس کنید.", "نوشته‌ها واضح و بدون بازتاب شدید نور باشند."], { distance: "۳۰ سانتی‌متر", height: "هم‌سطح شماره", guidanceTopics: ["text", "focus", "glare"], checks: ["واضح", "نور مناسب", "اطلاعات قابل خواندن است"] }),
  ] },
  { id: "roof", title: "سقف", order: 7, photoRequirements: [photo("car-roof", "نمای سقف", "تمام سطح سقف خودرو را در تصویر نشان دهید.",
    ["از موقعیتی ایمن، گوشی را بالاتر بگیرید.", "بیشترین سطح سقف و گوشه‌های اصلی در کادر باشند.", "برای عکاسی روی خودرو نایستید."], { distance: "۱ متر", height: "بالاتر از سقف", guidanceTopics: ["roof", "frame", "steady"], checks: ["واضح", "نور مناسب", "سقف کامل در کادر"] })] },
];
export const inspectionPhotographyTemplate = photographyTemplateSchema.parse({ templateId: "body-image-guided", templateVersion: 1, sections,
  captureRequirements: { odometerRequirementId: "odometer-on", video360Required: true } });

// Compatibility adapter for existing foundation/future viewer consumers; no duplicate metadata.
export function templateCapturePlan(): CapturePlan {
  const shots = inspectionPhotographyTemplate.sections.flatMap((section) => section.photoRequirements.map((photo) => ({
    code: photo.id, title: photo.title, category: (section.id === "cabin" ? "cabin" : section.id === "engine-details" ? "engineChassis" : "body") as CaptureCategory,
    required: photo.required, guideAvailable: true, highlightNodes: photo.semanticNodes ?? [],
  })));
  return { ...inspectionPhotographyTemplate, totalRequired: shots.filter((shot) => shot.required).length, shots };
}
