"use client";
import dynamic from "next/dynamic";
import { Component, useCallback, useState, useSyncExternalStore, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { VehiclePhotoNavigator, type VehiclePhotoNavigatorProps } from "@/features/photography/vehicle-photo-navigator";
import { vehiclePhotoControls } from "@/features/photography/vehicle-photo-config";
import { contextualRequirements } from "./vehicle-anchor-map";
import { adaptiveQuality, modelVariant, vehicleModelConfig, type VehicleQuality } from "./vehicle-model-config";
import { requirementView, type VehicleView } from "./vehicle-view-presets";
import type { VehicleRenderMetrics } from "./vehicle-3d-scene";
import { vehicleGraphicsCapability } from "./graphics-capability";

const Scene = dynamic(() => import("./vehicle-3d-scene"), { ssr: false });
class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed:false };
  static getDerivedStateFromError() { return { failed:true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
const views = { front:"front",rear:"rear",left:"left",right:"right",roof:"top" } as const;
const subscribeDevice = () => () => {};
const serverQuality = () => undefined;
const deviceQuality = () => adaptiveQuality(window.innerWidth, (navigator as Navigator & { deviceMemory?: number }).deviceMemory);
const deviceGraphics = () => vehicleGraphicsCapability(typeof WebGL2RenderingContext !== "undefined").status === "ready";
export function Vehicle3DViewer(props: VehiclePhotoNavigatorProps & { bodyColor?: string }) {
  const [mode,setMode] = useState<"3d"|"2d">("3d"), [failed,setFailed] = useState(false), [ready,setReady] = useState(false);
  const adaptive = useSyncExternalStore(subscribeDevice,deviceQuality,serverQuality);
  const graphics = useSyncExternalStore(subscribeDevice,deviceGraphics,serverQuality);
  const [chosenQuality,setQuality] = useState<VehicleQuality>(), [chosenView,setView] = useState<{ id: string; view: VehicleView }>();
  // A preset override belongs only to the current selection. Discard it when a card/category
  // selects another requirement, so revisiting the old card restores its photographic angle.
  if (chosenView && chosenView.id !== props.photo.id) setView(undefined);
  const quality = chosenQuality ?? adaptive, view = chosenView?.id === props.photo.id ? chosenView.view : requirementView(props.photo.id);
  const [generation,retry] = useState(0), [metrics,setMetrics] = useState<VehicleRenderMetrics>();
  const [showMarkers,setShowMarkers] = useState(true);
  const failure = useCallback(()=>{setFailed(true);setReady(false);},[]);
  const rendered = useCallback((value:VehicleRenderMetrics)=>{setMetrics(value);setReady(true);},[]);
  const unsupported = graphics === false;
  const actual3d = mode==="3d"&&!failed&&!unsupported;
  return <section className="vehicle-3d-preview" aria-label="پیش‌نمایش آزمایشی خودرو" data-mode={actual3d?"3d":"2d"} data-ready={ready} data-view={view}>
    <p className="vehicle-preview-notice">پیش‌نمایش محلی • مجوز استفاده تجاری تأیید نشده است</p>
    <div className="vehicle-preview-display">
      <div className="vehicle-preview-poster" hidden={actual3d&&ready}><VehiclePhotoNavigator {...props} controls={false} /></div>
      {actual3d&&quality&&<div className="vehicle-preview-canvas" key={`${quality}:${generation}`}><SceneBoundary onFailure={failure}><Scene {...props} view={view} url={`/api/development/vehicle-model/${modelVariant(quality)}`} reduced={quality==="reduced"} paint={props.bodyColor ?? vehicleModelConfig.defaultPaint} showMarkers={showMarkers} onFailure={failure} onReady={rendered} /></SceneBoundary></div>}
      {!ready&&actual3d&&<p className="vehicle-preview-loading" role="status">آماده‌سازی مدل خودرو…</p>}
    </div>
    <nav className="vehicle-photo-controls" aria-label="نماهای خودرو">
      <button type="button" aria-label={actual3d?"نمای دوبعدی":"نمای سه‌بعدی"} disabled={unsupported} aria-pressed={!actual3d} onClick={()=>{setMode(actual3d?"2d":"3d");setReady(false);if(!actual3d){setFailed(false);retry(value=>value+1);}}}><Icon name="carFront" size={22}/><span dir="ltr">{actual3d?"2D":"3D"}</span></button>
      <button type="button" aria-label="بازنشانی به نمای بعدی" onClick={()=>{props.onReset();setView(undefined);}}><Icon name="resetView" size={20}/><span>بازنشانی</span></button>
      {vehiclePhotoControls.map(control=><button type="button" key={control.sectionId} aria-label={`نمای خودرو: ${control.title}`} aria-pressed={view===views[control.sectionId as keyof typeof views]} onClick={()=>{const id = props.onSection(control.sectionId);setView({id:id??props.photo.id,view:views[control.sectionId as keyof typeof views]});}}><Icon name={control.icon} size={22}/><span>{control.title}</span></button>)}
    </nav>
    {failed&&<p className="vehicle-preview-feedback" role="status">نمای دوبعدی فعال است. مدل سه‌بعدی در دسترس نیست.<button type="button" onClick={()=>{setFailed(false);setMode("3d");retry(value=>value+1);}}>تلاش مجدد</button></p>}
    {unsupported&&<p className="vehicle-preview-feedback" role="status">این دستگاه از نمای سه‌بعدی پشتیبانی نمی‌کند. نمای دوبعدی فعال است.</p>}
    {contextualRequirements.includes(props.photo.id as typeof contextualRequirements[number])&&<p className="vehicle-preview-feedback">جزئیات این عکس در مدل نشان داده نمی‌شود؛ از تصویر راهنما استفاده کنید.<button type="button" onClick={()=>props.onActivate(props.photo.id)}>مشاهده راهنمای عکس</button></p>}
    <details className="vehicle-preview-tools"><summary>تنظیمات و اطلاعات پیش‌نمایش</summary><label>کیفیت مدل<select aria-label="کیفیت مدل" value={quality} onChange={event=>{setQuality(event.target.value as VehicleQuality);setReady(false);setFailed(false);}}><option value="mobile">موبایل</option><option value="desktop">دسکتاپ</option><option value="reduced">کم‌مصرف</option><option value="original">مدل اصلی برای مقایسه</option></select></label>
      <label><input type="checkbox" checked={showMarkers} onChange={event=>setShowMarkers(event.target.checked)} />نمایش نقاط بازدید</label>
      <output data-testid="vehicle-render-metrics" dir="ltr">{metrics?JSON.stringify(metrics):""}</output>
      <p dir="ltr">{vehicleModelConfig.source} · {vehicleModelConfig.license}</p>
    </details>
  </section>;
}
