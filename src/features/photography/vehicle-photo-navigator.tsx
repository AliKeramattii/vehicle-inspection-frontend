import { vehicleViewAssets } from "@/config/vehicle-assets";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { toPersianDigits as fa } from "@/lib/utils/persian";
import type { LocalPhoto } from "@/lib/media/photo-store";
import type { PhotographyTemplate, PhotoRequirement, InspectionSectionId } from "@/schemas/photography";
import { PhotoImage } from "./photo-image";
import { findRequirement, photoRequirementEntry, photographyStateLabels, photographyVisualState } from "./photography-model";
import { artworkForRequirement, vehiclePhotoControls } from "./vehicle-photo-config";
import { EvidenceSymbol } from "./evidence-symbol";

export type VehiclePhotoNavigatorProps = { template: PhotographyTemplate; photo: PhotoRequirement; sectionId: InspectionSectionId; records: readonly LocalPhoto[]; onActivate: (id:string)=>void; onSection: (id:InspectionSectionId)=>string|void; onReset:()=>void; controls?:boolean; scene?:ReactNode; onView?:(id:InspectionSectionId,requirementId:string|void)=>void };
export function VehiclePhotoNavigator({ template, photo, sectionId, records, onActivate, onSection, onReset, controls = true, scene, onView }: VehiclePhotoNavigatorProps) {
  const artwork = artworkForRequirement(photo.id), requirements = template.sections.flatMap((section) => section.photoRequirements);
  return <section className="vehicle-photo-navigator" aria-label="انتخاب نما روی تصویر خودرو">
    {scene ?? <div className="vehicle-photo-scene">
    <div className="vehicle-photo-artwork" style={{ "--artwork-ratio": artwork.aspectRatio } as CSSProperties}>
      <PhotoImage src={photo.sampleImage} alt={`نمای راهنمای خودرو: ${photo.title}`} eager frame="vehicle-overview" />
      <div className="vehicle-photo-markers">{artwork.markers.map((marker) => {
        const target = findRequirement(template, marker.requirementId)?.photo;
        if (!target) return null;
        const state = photographyVisualState(target, records), selected = target.id === photo.id;
        const { action } = photoRequirementEntry(target, records);
        return <button key={target.id} type="button" className="vehicle-photo-marker" data-requirement={target.id} data-state={state} aria-pressed={selected}
          aria-label={`${action} ${target.title}، ${photographyStateLabels[state]}`} onClick={() => onActivate(target.id)} style={{ left: `${marker.x}%`, top: `${marker.y}%` }}>
          <span aria-hidden="true"><EvidenceSymbol state={state} number={fa(requirements.indexOf(target) + 1)} size={18} /></span>
        </button>;
      })}</div>
    </div>
    </div>
    }
    {controls && <nav className="vehicle-photo-controls" aria-label="نماهای خودرو"><button type="button" aria-label="بازنشانی به نمای بعدی" onClick={onReset}><Icon name="resetView" size={20} /><span>بازنشانی</span></button>
      {vehiclePhotoControls.map((control) => <button type="button" key={control.sectionId} aria-label={`نمای خودرو: ${control.title}`} aria-pressed={sectionId === control.sectionId} onClick={() => { const id=onSection(control.sectionId); onView?.(control.sectionId,id); }}><Image src={vehicleViewAssets[control.sectionId === "roof" ? "top" : control.sectionId]} alt="" width={34} height={25}/><span>{control.title}</span></button>)}
    </nav>}
  </section>;
}
