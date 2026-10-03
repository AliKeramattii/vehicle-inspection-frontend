import { Icon } from "@/components/ui/icon";

export function EntryBranding({ verification = false }: { verification?: boolean }) {
  return <header className="entry-branding" aria-label="پلتفرم بازدید و شریک بیمه">
    <div className="entry-brand"><Icon name="platformCar" size={34} className="text-primary" />
      <div><p>{verification ? "بازدید آنلاین خودرو" : "پلتفرم بازدید"}</p><span>بازدید آنلاین خودرو</span></div>
    </div>
    <span className="entry-brand-divider" aria-hidden="true" />
    <div className="entry-brand entry-partner">
      <div><p>{verification ? "شرکت بیمه" : "شریک بیمه"}</p><span>همراه مطمئن شما</span></div>
      <svg aria-hidden="true" width="31" height="35" viewBox="0 0 31 35" fill="none">
        <path d="M15.5 1 2 6v10c0 8 5 14 13.5 18C24 30 29 24 29 16V6L15.5 1Z" fill="#2563EB" />
        <path d="m15.5 1 13.5 5v10c0 8-5 14-13.5 18V1Z" fill="#60A5FA" />
        <rect x="10" y="12" width="11" height="8" rx="2" fill="white" />
      </svg>
    </div>
  </header>;
}
