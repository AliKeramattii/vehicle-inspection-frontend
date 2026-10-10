import { Icon } from "@/components/ui/icon";
import type { EvidenceRequest } from "./request-model";

export function AdditionalTimeline({ request, submittedAt }: { request: EvidenceRequest; submittedAt: string }) {
  const supplemental = Boolean(request.receipt);
  const steps = [{ label: "ارسال اولیه", state: "completed", time: submittedAt }, { label: "درخواست مدارک تکمیلی", state: "completed", time: request.requestedAt }, { label: "ارسال مدارک تکمیلی", state: supplemental ? "completed" : "current", time: request.receipt?.submittedAt }, { label: "در انتظار بررسی مجدد", state: supplemental ? "current" : "upcoming" }, { label: "اعلام نتیجه", state: "upcoming" }];
  return <ol className="additional-timeline" aria-label="مراحل بررسی مدارک تکمیلی">{steps.map((step) => <li key={step.label} data-state={step.state} aria-current={step.state === "current" ? "step" : undefined}><span aria-hidden="true">{step.state === "completed" && <Icon name="check" size={16} />}</span><b>{step.label}</b>{step.time && <time dateTime={step.time}>{new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric", timeZone: "Asia/Tehran" }).format(new Date(step.time))}</time>}</li>)}</ol>;
}
