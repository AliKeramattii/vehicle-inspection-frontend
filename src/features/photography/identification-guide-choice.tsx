"use client";
import { PhotoImage } from "./photo-image";
import { vehicleIdentificationGuides } from "./vehicle-identification-guides";
import "./vehicle-guidance.css";

export function IdentificationGuideChoice({ onSelect }: { onSelect: (id: string) => void }) {
  return <section className="identification-choices" aria-labelledby="identification-choice-title">
    <h3 id="identification-choice-title">محل کد را انتخاب کنید</h3>
    <p>فقط یک عکس از یکی از این چهار محل لازم است. محلی را انتخاب کنید که کد خودرو در آن قابل مشاهده است.</p>
    <div className="identification-options">{vehicleIdentificationGuides.map(option => <button type="button" key={option.id} onClick={() => onSelect(option.id)} data-guide-option={option.id}>
      <PhotoImage src={option.src} alt="" frame="technical-closeup" retry={false} sizes="(max-width: 480px) 42vw, 220px" eager />
      <span>{option.title}</span>
    </button>)}</div>
  </section>;
}
