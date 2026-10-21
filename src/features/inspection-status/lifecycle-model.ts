import { legacyMockSourceRequestId, type CustomerSourceContext } from "@/features/identity/source-context";
import type { IranianPlate } from "@/types/domain";

export const lifecycleStates = ["DRAFT", "UPLOAD_PENDING", "SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED", "REJECTED", "REVIEW_APPROVED", "FORWARD_PENDING", "FORWARDED", "FORWARD_FAILED"] as const;
export type InspectionLifecycle = typeof lifecycleStates[number];
export const lifecycleLabels: Record<InspectionLifecycle, string> = {
  DRAFT: "بازدید ناتمام", UPLOAD_PENDING: "در انتظار ارسال فایل‌ها", SUBMITTED: "در صف بررسی", UNDER_REVIEW: "در حال بررسی کارشناس",
  CHANGES_REQUESTED: "نیاز به اصلاح", REJECTED: "بازدید تأیید نشد", REVIEW_APPROVED: "تأیید کارشناس",
  FORWARD_PENDING: "در انتظار ارسال به کارگزاری", FORWARDED: "ارسال به کارگزاری تأیید شد", FORWARD_FAILED: "ارسال به کارگزاری تکمیل نشد",
};
export const lifecycleCopy: Record<InspectionLifecycle, string> = {
 DRAFT: "بازدید قبلی شما محفوظ است؛ از همان مرحله ادامه دهید.", UPLOAD_PENDING: "مدارک روی دستگاه محفوظ‌اند. ارسال فایل‌های باقیمانده را ادامه دهید.",
 SUBMITTED: "مدارک ارسال شده و در صف بررسی هستند.", UNDER_REVIEW: "کارشناس در حال بررسی مدارک شماست.",
 CHANGES_REQUESTED: "فقط موارد مشخص‌شده را اصلاح کنید؛ سایر مدارک و کد پیگیری حفظ می‌شوند.",
 REJECTED: "دلیل کارشناس را بخوانید. شروع بازدید جدید با انتخاب شما انجام می‌شود و مدارک باید دوباره ثبت شوند.",
 REVIEW_APPROVED: "کارشناس بازدید را تأیید کرده است؛ هنوز تأیید ارسال به سامانه کارگزاری دریافت نشده است.",
 FORWARD_PENDING: "بازدید تأیید شده است؛ ارسال اطلاعات به سامانه کارگزاری در انتظار تأیید دریافت است.",
 FORWARDED: "اطلاعات بازدید بررسی و تأیید شده و سامانه کارگزاری دریافت آن را تأیید کرده است.",
 FORWARD_FAILED: "بازدید بررسی شده است، اما ارسال به کارگزاری تکمیل نشده است. نیازی به عکاسی دوباره نیست.",
};
export type VehicleCorrectionValue = { field: "plate"; value: IranianPlate } | { field: "color"; value: string } | { field: "modelYear"; value: number };
export type VehicleFieldCorrection = {
 id: string; field: VehicleCorrectionValue["field"]; customerReason: string; requestedAt: string; requestedBy: string;
 state: "requested" | "submitted" | "approved"; proposal?: VehicleCorrectionValue; submittedAt?: string; reviewedAt?: string; reviewedBy?: string;
};
export const fieldCorrectionLabels = { plate: "پلاک خودرو", color: "رنگ بدنه", modelYear: "سال ساخت" } as const;
/** Customer-safe projection. Internal notes and endpoint credentials are deliberately absent. */
export type CustomerInspectionStatus = {
 inspectionId: string; tenantId: string; subjectId: string; trackingCode: string; mobile: string; sourceRequestId?: string;
 status: InspectionLifecycle; updatedAt: string; source: "mock" | "backend";
 customerExplanation?: string; previousAttemptId?: string; resumeHref?: string;
 corrections: VehicleFieldCorrection[]; forwarding?: { phase: "ready" | "sending" | "retrying" | "acknowledged" | "failed"; acknowledgedAt?: string; acknowledgementId?: string };
};
export type SourceInspectionIndex = { ownerKey: string; inspectionId: string };
export type LifecycleWorkspace = { records: CustomerInspectionStatus[]; identities: SourceInspectionIndex[] };
export const emptyLifecycleWorkspace = (): LifecycleWorkspace => ({ records: [], identities: [] });
export function ownsInspection(scope: CustomerSourceContext, record: CustomerInspectionStatus) { return scope.tenantId === record.tenantId && scope.subjectId === record.subjectId && scope.sourceRequestId === (record.sourceRequestId ?? legacyMockSourceRequestId); }
export function safeResumeHref(id: string, href?: string) {
 if (href === "/readiness" || href === "/consent") return href;
 const prefix = `/inspection/${encodeURIComponent(id)}/`;
 return href?.startsWith(prefix) && !/[?#\\]/.test(href) && /^(location|vehicle|capture(?:\/.*)?|upload|review)$/.test(href.slice(prefix.length)) && !href.includes("..") ? href : "/readiness";
}

export const forwardingPhaseLabels = {ready:"آماده ارسال به کارگزاری",sending:"در حال ارسال به کارگزاری",retrying:"در حال تلاش دوباره برای ارسال به کارگزاری",acknowledged:"دریافت توسط کارگزاری تأیید شد",failed:"ارسال به کارگزاری ناموفق بود"} as const;

/** Late mock reconciliation cannot reopen a final case. Backend still needs version/CAS checks. */
export const fieldCorrectionsLocked = (status: InspectionLifecycle) => ["REJECTED", "REVIEW_APPROVED", "FORWARD_PENDING", "FORWARD_FAILED", "FORWARDED"].includes(status);
export function reviewProjectionAllowed(current: InspectionLifecycle, next: InspectionLifecycle) {
 if (current === "REJECTED" || current === "FORWARDED") return next === current;
 if (fieldCorrectionsLocked(current)) return ["REVIEW_APPROVED", "FORWARD_PENDING", "FORWARD_FAILED", "FORWARDED"].includes(next) && !(current !== "REVIEW_APPROVED" && next === "REVIEW_APPROVED");
 return true;
}
