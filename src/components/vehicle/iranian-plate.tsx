import type { IranianPlate as Plate } from "@/types/domain";
import { toPersianDigits } from "@/lib/utils/persian";

export function IranianPlate({ plate }: { plate: Plate }) {
  const label = `پلاک خودرو: ${toPersianDigits(plate.firstTwoDigits)} ${plate.letter} ${toPersianDigits(plate.threeDigits)}، ایران ${toPersianDigits(plate.regionDigits)}`;
  return <div className="iranian-plate" dir="ltr" role="img" aria-label={label}>
    <div className="plate-country" aria-hidden="true"><span className="plate-flag"><i /></span><span>IR<br />IRAN</span></div>
    <bdi>{toPersianDigits(plate.firstTwoDigits)}</bdi><span dir="rtl">{plate.letter}</span><bdi>{toPersianDigits(plate.threeDigits)}</bdi>
    <div className="plate-region"><span lang="fa">ایران</span><bdi>{toPersianDigits(plate.regionDigits)}</bdi></div>
  </div>;
}
