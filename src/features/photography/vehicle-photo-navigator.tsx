import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import { toPersianDigits as fa } from "@/lib/utils/persian";
import type { LocalPhoto } from "@/lib/media/photo-store";
import type { PhotographyTemplate, PhotoRequirement, InspectionSectionId } from "@/schemas/photography";
import { PhotoImage } from "./photo-image";
import { findRequirement, photographyStateLabels, photographyVisualState } from "./photography-model";
import { artworkForRequirement, vehiclePhotoControls } from "./vehicle-photo-config";

export function VehiclePhotoNavigator({ template, photo, sectionId, records, onSelect, onSection, onReset }: {
  template: PhotographyTemplate; photo: PhotoRequirement; sectionId: InspectionSectionId; records: readonly LocalPhoto[];
  onSelect: (id: string) => void; onSection: (id: InspectionSectionId) => void; onReset: () => void;
}) {
  const artwork = artworkForRequirement(photo.id), requirements = template.sections.flatMap((section) => section.photoRequirements);
  return <section className="vehicle-photo-scene" aria-label="انتخاب نما روی تصویر خودرو">
    <div className="vehicle-photo-artwork" style={{ "--artwork-ratio": artwork.aspectRatio } as CSSProperties}>
      <PhotoImage src={photo.sampleImage} alt={`نمای راهنمای خودرو: ${photo.title}`} eager />
      <div className="vehicle-photo-markers">{artwork.markers.map((marker) => {
        const target = findRequirement(template, marker.requirementId)?.photo;
        if (!target) return null;
        const state = photographyVisualState(target, records), selected = target.id === photo.id;
        return <button key={target.id} type="button" className="vehicle-photo-marker" data-requirement={target.id} data-state={state} aria-pressed={selected}
          aria-label={`${target.title}، ${photographyStateLabels[state]}`} onClick={() => onSelect(target.id)} style={{ left: `${marker.x}%`, top: `${marker.y}%` }}>
          <span aria-hidden="true">{state === "complete" ? "✓" : state === "attention" ? "↻" : fa(requirements.indexOf(target) + 1)}</span>
        </button>;
      })}</div>
    </div>
    <nav className="vehicle-photo-controls" aria-label="نماهای خودرو"><button type="button" aria-label="بازنشانی به نمای بعدی" onClick={onReset}><Icon name="resetCamera" size={21} /><span>بازنشانی</span></button>
      {vehiclePhotoControls.map((control) => <button type="button" key={control.sectionId} aria-label={`نمای خودرو: ${control.title}`} aria-pressed={sectionId === control.sectionId} onClick={() => onSection(control.sectionId)}><Icon name={control.icon} size={22} /><span>{control.title}</span></button>)}
    </nav>
    <p className="vehicle-photo-context"><Icon name="camera" size={16} />{photo.title}</p>
  </section>;
}
