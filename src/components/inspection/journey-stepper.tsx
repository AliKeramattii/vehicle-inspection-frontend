import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "@/components/ui/icon";

export type JourneyStage = { id: string; label: string; state: "upcoming" | "current" | "completed" | "error" };
export function JourneyStepper({ stages, completedIcon = "check" }: { stages: readonly JourneyStage[]; completedIcon?: IconName }) {
  return <nav aria-label="مراحل بازدید"><ol className="flex">
    {stages.map((stage, index) => <li key={stage.id} aria-current={stage.state === "current" ? "step" : undefined}
      className="relative flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <span className={cn("z-10 flex size-7 items-center justify-center rounded-full border text-xs font-semibold",
        stage.state === "current" && "border-primary bg-primary text-white",
        stage.state === "completed" && "border-success bg-success text-white",
        stage.state === "error" && "border-warning bg-amber-50 text-amber-800",
        stage.state === "upcoming" && "border-border bg-surface text-muted")}>
        {stage.state === "completed" ? <Icon name={completedIcon} size={18} /> : stage.state === "error" ? <Icon name="warning" size={18} /> : (index + 1).toLocaleString("fa-IR")}
      </span>
      {index < stages.length - 1 && <span aria-hidden="true" className={cn("absolute start-1/2 top-3.5 h-px w-full bg-border", stage.state === "completed" && "bg-success")} />}
      <span className={cn("text-xs leading-5", stage.state === "current" ? "font-semibold text-primary" : "text-muted")}>{stage.label}</span>
      <span className="sr-only">{stage.state === "completed" ? "تکمیل شده" : stage.state === "error" ? "نیاز به بررسی" : stage.state === "upcoming" ? "مرحله بعدی" : "مرحله جاری"}</span>
    </li>)}
  </ol></nav>;
}
