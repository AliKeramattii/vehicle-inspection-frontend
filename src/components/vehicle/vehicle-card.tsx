import { CustomerHeroArtwork } from "@/components/layout/customer-hero-artwork";
import type { Vehicle } from "@/types/domain";
import { toPersianDigits } from "@/lib/utils/persian";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return <section className="vehicle-summary" aria-label="مشخصات خودروی شما">
    <div className="vehicle-summary-details"><p>خودروی شما</p><h2>{vehicle.make} {vehicle.model}</h2><p className="vehicle-year">مدل {toPersianDigits(vehicle.year)}</p>
      <div className="vehicle-color"><span>رنگ بدنه</span><p><i style={{ backgroundColor: vehicle.colorHex ?? "#b5bac1" }} aria-hidden="true" />{vehicle.colorName}</p></div>
      <div className="vehicle-vin"><span>شماره شاسی (VIN)</span><bdi dir="ltr">{vehicle.vinMasked}</bdi></div>
    </div>
    <CustomerHeroArtwork role="referral" className="vehicle-summary-art" imageClassName="vehicle-summary-render" />
  </section>;
}
