"use client";
import { useState } from "react";
import Image from "next/image";
import { RotateCw } from "lucide-react";
import { vehicleViewAssets } from "@/config/vehicle-assets";
import "./walkaround-preview.css";

/** A supplied, commercially cleared 4–5s sedan orbit clip can replace the static path guide.
 * No restricted model, fabricated reconstruction or still-photo ghost is loaded here. */
export function WalkaroundPreview({ clip }: { clip?: string }) {
  const [invalid, setInvalid] = useState(false);
  return <figure className="walkaround-instruction-preview">
    {clip && !invalid ? <video src={clip} controls playsInline preload="metadata" poster={vehicleViewAssets.top}
      aria-label="نمونه حرکت یک دور کامل اطراف خودرو" onError={() => setInvalid(true)}
      onLoadedMetadata={event => { const duration=event.currentTarget.duration; if (!Number.isFinite(duration) || duration < 4 || duration > 5) setInvalid(true); }} /> :
      <div className="walkaround-path"><Image src={vehicleViewAssets.top} alt="نمای بالای خودرو برای راهنمای مسیر حرکت" fill sizes="(max-width:480px) 85vw, 430px"/><span aria-hidden="true"><RotateCw size={30}/></span></div>}
    <figcaption>از جلو شروع کنید؛ با فاصله ثابت، یک دور کامل دور خودرو حرکت کنید.</figcaption>
  </figure>;
}
