import { Icon } from "@/components/ui/icon";
import type { CustomerInspectionStatus } from "./lifecycle-model";
export function CustomerStatusTimeline({record}:{record:CustomerInspectionStatus}) {
 const reviewDone=["REJECTED","REVIEW_APPROVED","FORWARD_PENDING","FORWARD_FAILED","FORWARDED"].includes(record.status);
 const forwarded=record.status==="FORWARDED";
 return <ol className="receipt-timeline" aria-label="مراحل بررسی و ارسال به کارگزاری">
 <li data-state="completed"><span><Icon name="readinessTick" size={21}/></span><b>ارسال شد</b><small>مدارک محفوظ‌اند</small></li>
 <li data-state={reviewDone?"completed":"current"} aria-current={!reviewDone?"step":undefined}><span>{reviewDone&&<Icon name="readinessTick" size={21}/>}</span><b>{record.status==="REJECTED"?"بررسی و اعلام دلیل":"بررسی کارشناس"}</b><small>{reviewDone?"بررسی انجام شد":"در انتظار تصمیم نهایی"}</small></li>
 {record.status!=="REJECTED"&&<li data-state={forwarded?"completed":reviewDone?"current":"upcoming"} aria-current={reviewDone&&!forwarded?"step":undefined}><span>{forwarded&&<Icon name="readinessTick" size={21}/>}</span><b>ارسال به کارگزاری</b><small>{forwarded?"دریافت تأیید شد":record.status==="FORWARD_FAILED"?"نیاز به پیگیری ارسال":"تأیید دریافت نشده"}</small></li>}
 </ol>;
}
