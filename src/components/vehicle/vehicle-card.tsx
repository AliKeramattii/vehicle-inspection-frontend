import Image from "next/image";
import type { Vehicle } from "@/types/domain";
import { toPersianDigits } from "@/lib/utils/persian";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return <section className="vehicle-summary" aria-label="مشخصات خودروی شما">
    <Image className="vehicle-summary-render" src="/images/vehicle/identity-suv.png" alt="خودروی شاسی‌بلند نقره‌ای در استودیوی روشن" width={1536} height={1024} sizes="(max-width: 480px) 70vw, 336px" preload />
    <div className="vehicle-summary-details"><p>خودروی شما</p><h2>{vehicle.make} {vehicle.model}</h2><p className="vehicle-year">مدل {toPersianDigits(vehicle.year)}</p>
      <div className="vehicle-color"><span>رنگ بدنه</span><p><i style={{ backgroundColor: vehicle.colorHex ?? "#b5bac1" }} aria-hidden="true" />{vehicle.colorName}</p></div>
      <div className="vehicle-vin"><span>شماره شاسی (VIN)</span><bdi dir="ltr">{vehicle.vinMasked}</bdi></div>
    </div>
  </section>;
}
