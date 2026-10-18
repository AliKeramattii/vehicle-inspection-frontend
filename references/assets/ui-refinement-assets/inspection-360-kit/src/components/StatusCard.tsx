import { SvgIcon, type IconName } from './SvgIcon';
export function StatusCard({ label, icon, ok }: { label: string; icon: IconName; ok: boolean | null }) {
  return <div className="capture-status-card" title={ok === null ? 'وضعیت هنوز توسط حسگر یا سرویس بررسی نشده است' : undefined}>
    <span className={`status-marker ${ok === true ? 'success' : ok === false ? 'warning' : 'unknown'}`}>
      {ok === true ? '✓' : ok === false ? '!' : '—'}
    </span>
    <SvgIcon name={icon} size={28} />
    <span className="status-label">{label}</span>
  </div>;
}
