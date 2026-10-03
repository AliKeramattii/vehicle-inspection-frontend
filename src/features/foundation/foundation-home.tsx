import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { PageHeader } from "@/components/layout/page-header";
import { InlineAlert } from "@/components/ui/status";
import { Icon } from "@/components/ui/icon";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";

export function FoundationHome() {
  return <>
    <AppHeader partnerName="بیمه نمونه" />
    <main id="main-content" tabIndex={-1} className="flex-1 space-y-6 px-5 py-10">
      <div className="flex size-16 items-center justify-center rounded-card bg-blue-50 text-primary"><Icon name="car" size={36} /></div>
      <PageHeader title="پایه سامانه بازدید خودرو" description="پیش‌نمایش اجزای مشترک برای بازدید آنلاین خودرو" />
      <InlineAlert>این نسخه پیش‌نمایش است. مراحل بازدید در نسخه‌های بعدی اضافه می‌شوند.</InlineAlert>
      <p className="text-sm leading-8 text-muted">اجزای رابط کاربری برای نمایش فارسی، استفاده با موبایل و دسترسی با صفحه‌کلید آماده شده‌اند.</p>
    </main>
    <BottomStickyCTA><Link href="/foundation" className="flex min-h-12 items-center justify-center gap-2 rounded-control bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
      مشاهده اجزای رابط کاربری<Icon name="forward" size={20} />
    </Link></BottomStickyCTA>
  </>;
}
