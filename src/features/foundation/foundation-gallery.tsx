import { AppHeader } from "@/components/layout/app-header";
import { AppViewport } from "@/components/layout/app-viewport";
import { PageHeader } from "@/components/layout/page-header";
import { JourneyStepper, type JourneyStage } from "@/components/inspection/journey-stepper";
import { InlineAlert, StatusBadge } from "@/components/ui/status";
import { GalleryControls } from "./gallery-controls";
import { MockInspectionPreview } from "./mock-inspection-preview";

const stages: readonly JourneyStage[] = [
  { id: "location", label: "موقعیت", state: "completed" },
  { id: "vehicle", label: "خودرو", state: "current" },
  { id: "capture", label: "عکاسی", state: "upcoming" },
  { id: "submit", label: "ارسال", state: "upcoming" },
];
export function FoundationGallery() {
  return <AppViewport className="mx-auto max-w-[1120px] bg-surface">
    <AppHeader partnerName="بیمه نمونه" />
    <main id="main-content" tabIndex={-1} className="app-scroll space-y-6 p-4 sm:p-8">
      <PageHeader title="اجزای رابط کاربری" description="نمونه اجزای مشترک؛ پیش‌نمایش مرحله پایه" backHref="/foundation/preview" />
      <InlineAlert>این صفحه برای بررسی ظاهر و رفتار اجزای مشترک است.</InlineAlert>
      <div className="grid items-start gap-6 md:grid-cols-2">
        <section aria-labelledby="controls-title" className="space-y-5 rounded-card border border-border p-4 sm:p-5">
          <h2 id="controls-title" className="font-semibold">ورودی‌ها و دکمه‌ها</h2>
          <GalleryControls />
        </section>
        <div className="space-y-6">
          <section aria-labelledby="progress-title" className="space-y-5 rounded-card border border-border p-4 sm:p-5">
            <h2 id="progress-title" className="font-semibold">مراحل و وضعیت‌ها</h2>
            <JourneyStepper stages={stages} />
            <div className="flex flex-wrap gap-2">
              <StatusBadge>در صف</StatusBadge><StatusBadge tone="information">در حال بررسی</StatusBadge>
              <StatusBadge tone="success">تأیید شده</StatusBadge><StatusBadge tone="warning">نیاز به بررسی</StatusBadge>
              <StatusBadge tone="destructive">ناموفق</StatusBadge>
            </div>
            <InlineAlert tone="warning">نمونه پیام: تصویر باید خوانا باشد.</InlineAlert>
            <InlineAlert tone="destructive">نمونه خطا: دوباره تلاش کنید.</InlineAlert>
          </section>
          <section aria-labelledby="data-title" className="space-y-3 rounded-card border border-border p-4 sm:p-5">
            <h2 id="data-title" className="font-semibold">اطلاعات نمونه</h2>
            <MockInspectionPreview />
          </section>
        </div>
      </div>
    </main>
  </AppViewport>;
}
