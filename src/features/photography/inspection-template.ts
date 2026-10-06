import { photographyTemplateSchema, type PhotoRequirement, type InspectionSection } from "@/schemas/photography";
import type { CapturePlan, CaptureCategory } from "@/types/domain";

const exteriorChecks = ["واضح", "نور مناسب", "خودرو کامل در کادر"];
function photo(id: string, title: string, description: string, instructions: string[], extra: Partial<PhotoRequirement> = {}): PhotoRequirement {
  return { id, title, description, instructions, sampleImage: `/assets/inspection/photo-guides/${id}.webp`,
    required: true, status: "pending", checks: exteriorChecks, distance: "۳ متر", height: "کمر", orientation: "landscape", ...extra };
}
function side(side: "راست" | "چپ", direction: "right" | "left") {
  return [
    photo(`front-45-${direction}`, `جلو ۴۵° ${side}`, `جلوی خودرو و سمت ${side} به صورت کامل دیده شود.`,
      ["خودرو را کامل داخل کادر قرار دهید.", "حدود ۳ متر از خودرو فاصله بگیرید.", `از زاویه ۴۵ درجه سمت ${side} عکس بگیرید.`]),
    photo(`back-45-${direction}`, `عقب ۴۵° ${side}`, `عقب خودرو و سمت ${side} به صورت کامل دیده شود.`,
      [`تمام قسمت عقب و سمت ${side} خودرو داخل کادر باشد.`, "خودرو را از زاویه ۴۵ درجه ثبت کنید.", "در نور کافی و بدون سایه شدید عکاسی کنید."]),
  ];
}
const sections: InspectionSection[] = [
  { id: "right", title: "نمای راست", order: 1, photoRequirements: side("راست", "right") },
  { id: "left", title: "نمای چپ", order: 2, photoRequirements: side("چپ", "left") },
  { id: "front", title: "جلو", order: 3, photoRequirements: [photo("front-plate", "نمای مستقیم جلو با پلاک",
    "یک عکس مستقیم از نمای جلوی خودرو بگیرید، به طوری که پلاک کاملاً مشخص و خوانا باشد.",
    ["روبه‌روی خودرو بایستید؛ خودرو در مرکز کادر باشد.", "نمای کامل جلو را بدون برش ثبت کنید.", "پلاک بدون بازتاب نور و کاملاً خوانا باشد."], { height: "چراغ‌ها", checks: ["واضح", "نور مناسب", "پلاک خوانا است"] })] },
  { id: "rear", title: "عقب", order: 4, photoRequirements: [photo("rear-plate", "نمای مستقیم عقب با پلاک",
    "یک عکس مستقیم از نمای عقب خودرو بگیرید، به طوری که پلاک کاملاً مشخص و خوانا باشد.",
    ["مستقیم پشت خودرو بایستید.", "تمام نمای عقب داخل کادر باشد.", "پلاک کاملاً خوانا و بدون بازتاب باشد."], { height: "چراغ‌ها", checks: ["واضح", "نور مناسب", "پلاک خوانا است"] })] },
  { id: "cabin", title: "کابین", order: 5, photoRequirements: [
    photo("odometer-on", "کیلومترشمار", "خودرو را روشن کنید و تصویری واضح از کیلومترشمار بگیرید.",
      ["خودرو را روشن و در حالت توقف نگه دارید.", "تمام صفحه کیلومترشمار در کادر باشد.", "عدد کیلومتر خوانا باشد؛ از بازتاب نور جلوگیری کنید."], { distance: "نزدیک", height: "داشبورد", checks: ["واضح", "نور مناسب", "عدد کیلومتر خوانا است"] }),
    photo("driver-interior", "نمای داخل کابین از سمت راننده", "از سمت راننده تصویری بگیرید که فضای داخلی خودرو به صورت واضح دیده شود.",
      ["درِ سمت راننده را باز کنید.", "فرمان، داشبورد و صندلی‌ها دیده شوند.", "در نور کافی، گوشی را ثابت نگه دارید."], { distance: "۱ متر", checks: ["واضح", "نور مناسب", "کابین کامل در کادر"] }),
  ] },
  { id: "engine-details", title: "موتور و مشخصات", order: 6, photoRequirements: [
    photo("engine-bay", "محفظه موتور", "کاپوت را باز کنید و یک تصویر کامل و واضح از محفظه موتور بگیرید.",
      ["خودرو متوقف باشد؛ کاپوت را ایمن باز کنید.", "تمام محفظه موتور دیده شود.", "تصویر واضح و بدون سایه شدید باشد."], { distance: "۱ متر", height: "سینه", checks: ["واضح", "نور مناسب", "محفظه کامل در کادر"] }),
    photo("spec-plate", "پلاک مشخصات خودرو", "یک تصویر نزدیک و واضح از پلاک مشخصات خودرو ثبت کنید.",
      ["پلاک مشخصات را پیدا کنید.", "تمام پلاک داخل کادر باشد.", "نوشته‌ها خوانا و بدون بازتاب نور باشند."], { distance: "۳۰ سانتی‌متر", height: "هم‌سطح پلاک", checks: ["واضح", "نور مناسب", "اطلاعات قابل خواندن است"] }),
    photo("chassis-number", "شماره شاسی", "از شماره شاسی حک‌شده روی بدنه خودرو یک تصویر نزدیک و کاملاً واضح بگیرید.",
      ["شماره حک‌شده روی بدنه را پیدا کنید.", "تمام حروف و اعداد در کادر باشند.", "نوشته‌ها واضح و بدون بازتاب نور باشند."], { distance: "۳۰ سانتی‌متر", height: "هم‌سطح شماره", checks: ["واضح", "نور مناسب", "اطلاعات قابل خواندن است"] }),
  ] },
  { id: "roof", title: "سقف", order: 7, photoRequirements: [photo("car-roof", "نمای سقف", "تمام سطح سقف خودرو را در تصویر نشان دهید.",
    ["از موقعیتی ایمن، گوشی را بالاتر بگیرید.", "تمام سطح سقف داخل کادر باشد.", "برای عکاسی روی خودرو نایستید."], { distance: "۱ متر", height: "بالاتر از سقف", checks: ["واضح", "نور مناسب", "سقف کامل در کادر"] })] },
];
export const inspectionPhotographyTemplate = photographyTemplateSchema.parse({ templateId: "body-image-guided", templateVersion: 1, sections });

// Compatibility adapter for existing foundation/future viewer consumers; no duplicate metadata.
export function templateCapturePlan(): CapturePlan {
  const shots = inspectionPhotographyTemplate.sections.flatMap((section) => section.photoRequirements.map((photo) => ({
    code: photo.id, title: photo.title, category: (section.id === "cabin" ? "cabin" : section.id === "engine-details" ? "engineChassis" : "body") as CaptureCategory,
    required: photo.required, guideAvailable: true, highlightNodes: photo.semanticNodes ?? [],
  })));
  return { ...inspectionPhotographyTemplate, totalRequired: shots.filter((shot) => shot.required).length, shots };
}
