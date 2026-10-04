"use client";

import { IranianPlate } from "@/components/vehicle/iranian-plate";
import { Icon } from "@/components/ui/icon";
import type { IranianPlate as Plate } from "@/types/domain";

export type PlateMode = "correct" | "correction";
export function PlateConfirmation({ plate, mode, onModeChange, disabled }: {
  plate: Plate; mode: PlateMode; onModeChange: (mode: PlateMode) => void; disabled?: boolean;
}) {
  return <section className="plate-confirmation" aria-labelledby="plate-heading">
    <h2 id="plate-heading"><Icon name="plate" size={24} />پلاک خودرو</h2><p>لطفاً پلاک خودروی خود را بررسی کنید.</p>
    <IranianPlate plate={plate} />
    <div className="plate-choices" role="group" aria-label="تأیید پلاک خودرو">
      <button type="button" aria-pressed={mode === "correct"} disabled={disabled} className="plate-correct" onClick={() => onModeChange("correct")}><Icon name="check" size={21} />درست است</button>
      <button type="button" aria-pressed={mode === "correction"} disabled={disabled} className="plate-correction" onClick={() => onModeChange("correction")}><Icon name="edit" size={18} />پلاک اشتباه است، اصلاح می‌کنم</button>
    </div>
  </section>;
}
