import Image from "next/image";
import { useState } from "react";
import { ApplicationLogo } from "@/components/layout/application-logo";
import { vehicleHeroAssets } from "@/config/vehicle-assets";
import { contrast, type SiteSettings } from "@/config/site-settings.schema";

/** Validated draft assets are resolved by the editor. This preview never publishes or changes evidence. */
export function SettingsBrandPreview({ values, logo, hero }: {
  values: SiteSettings;
  logo?: string | null;
  hero?: string | null;
}) {
  const [failed, setFailed] = useState<string>();
  const [failedLogo, setFailedLogo] = useState<string>();
  const source = hero && failed !== hero ? hero : vehicleHeroAssets.landing;

  return <aside className="settings-brand-preview" aria-label="پیش‌نمایش برند کارگزاری">
    <div className="settings-preview-caption">
      <strong>نمای مشتری</strong><span>پیش‌نمایش زنده</span>
    </div>
    <div className="settings-preview-phone" style={{ background: values.theme.background, color: values.theme.onBackground }}>
      <div className="settings-preview-brand">
        <ApplicationLogo width={30} />
        <span>
          {logo && failedLogo !== logo && <Image src={logo} alt="لوگوی پیش‌نمایش" width={28} height={28}
            unoptimized onError={() => setFailedLogo(logo)} />}
          {values.identity.brokerageName}
        </span>
      </div>
      <div className="settings-preview-welcome">
        <small>{values.identity.appTitle}</small>
        <h3>بازدید آنلاین خودرو</h3><p>با راهنمای تصویری، قدم‌به‌قدم</p>
      </div>
      <div className="settings-preview-vehicle">
        <Image src={source} alt="پیش‌نمایش تصویر شروع بازدید" fill loading="eager" sizes="300px" unoptimized
          onError={() => { if (hero) setFailed(hero); }} />
      </div>
      <div className="settings-preview-task">
        <strong>کد معرفی / کد ارجاع</strong>
        <div className="settings-preview-cells" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => <span key={index} />)}
        </div>
        <span className="site-settings-preview-action" style={{ background: values.theme.primary, color: values.theme.onPrimary }}>
          شروع بازدید
        </span>
      </div>
    </div>
    <p className="settings-preview-contrast">
      کنتراست متن <bdi>{contrast(values.theme.primary, values.theme.onPrimary).toFixed(2)}:1</bdi>
    </p>
    <p>نشان برنامه ثابت است؛ نام، لوگو و رنگ‌های کارگزاری از پیش‌نویس می‌آیند. قالب و مدارک موجود تغییر نمی‌کنند.</p>
  </aside>;
}
