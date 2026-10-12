import { useId } from 'react';
/** Visual orbit guide only. Percent must come from verified external orbit tracking,
 * never inferred from video elapsed time. Pass null when no tracker is connected. */
export function OrbitProgressGuide({ progress, demo }: { progress: number | null; demo: boolean }) {
  const filterId = useId().replace(/:/g, '');
  const radius = 172;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.max(0, Math.min(1, (progress ?? 0) / 100));
  const angle = (130 + fraction * 360) * Math.PI / 180;
  const cx = 200, cy = 225;
  const dotX = cx + radius * Math.cos(angle);
  const dotY = cy + radius * Math.sin(angle);
  return <div className="orbit-area" aria-label={progress === null ? 'راهنمای حرکت ۳۶۰ درجه' : `پیشرفت تأییدشده ${progress} درصد`}>
    <svg className="main-orbit" viewBox="0 0 400 450" aria-hidden="true">
      <defs><filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter></defs>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#D7E3EC" strokeWidth="4" strokeDasharray="8 11" opacity=".65" />
      {progress !== null && <>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#1687FF" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${fraction * circumference} ${circumference}`} transform={`rotate(130 ${cx} ${cy})`} filter={`url(#${filterId})`} />
        <circle cx={dotX} cy={dotY} r="9" fill="white" stroke="#E7F3FF" strokeWidth="3" />
      </>}
    </svg>
    <div className="orbit-progress-badge" dir="rtl">{progress === null ? 'راهنمای ۳۶۰°' : `${new Intl.NumberFormat('fa-IR').format(progress)}٪`}{demo && <span className="screen-reader-only">نمونه نمایشی</span>}</div>
    <div className="mini-orbit">
      <svg viewBox="0 0 190 190" aria-hidden="true" className="mini-orbit-ring">
        <circle cx="95" cy="95" r="76" fill="none" stroke="#A5B2C2" strokeWidth="3" strokeDasharray="7 7" opacity=".7" />
        <path d="M94 19A76 76 0 0 1 168 116" fill="none" stroke="#218BFF" strokeWidth="5" strokeLinecap="round" />
        <path d="m163 102 6 16 7-14" fill="none" stroke="#218BFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <img src="/images/inspection-360/top-view-car.webp" alt="نمای بالای خودرو و مسیر حرکت دور آن" width="92" height="92" draggable="false" />
    </div>
  </div>;
}
