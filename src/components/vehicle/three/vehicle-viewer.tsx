"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useRef, useState, type ReactNode } from "react";
import { VehicleFallback2D } from "./vehicle-fallback-2d";
import { ViewerControls } from "./viewer-controls";
import { InspectionPins } from "./inspection-pins";
import { viewConfig } from "@/lib/vehicle/viewer-config";
import type { VehicleSceneProps } from "./viewer-types";
const VehicleScene = dynamic(() => import("./vehicle-scene"), { ssr: false, loading: () => <span className="viewer-loading" role="status">آماده‌سازی نمای سه‌بعدی…</span> });

class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export function VehicleViewer({ mode, available, checking = false, onMode, onView, onReset, children, ...scene }: VehicleSceneProps & {
  mode: "3d" | "2d"; available: boolean; checking?: boolean; onMode: (mode: "3d" | "2d") => void;
  onView: (view: VehicleSceneProps["view"]) => void; onReset: () => void; children?: ReactNode;
}) {
  const [failed, setFailed] = useState(false), [rendered, setRendered] = useState(false);
  const pinLayer = useRef<HTMLDivElement>(null);
  const fail = useCallback(() => setFailed(true), []), ready = useCallback(() => setRendered(true), []);
  const canUse3d = available && !failed;
  const actualMode = mode === "3d" && canUse3d ? "3d" : "2d";
  const fallback = <VehicleFallback2D {...scene} />;
  return <section className="vehicle-viewer" aria-label="نمای خودرو و نقاط بازدید" data-mode={actualMode} data-view={scene.view} data-rendered={actualMode === "3d" ? rendered : true}>
    {children}
    <div className="vehicle-scene-stage">{actualMode === "3d" ? <SceneErrorBoundary fallback={fallback} onFailure={fail}><VehicleScene {...scene} pinLayer={pinLayer} onFailure={fail} onReady={ready} /><InspectionPins slots={scene.slots} selectedCode={scene.selectedCode} onSelect={scene.onSelect} layerRef={pinLayer} /></SceneErrorBoundary> : fallback}</div>
    <ViewerControls mode={actualMode} view={scene.view} canUse3d={canUse3d} onMode={onMode} onView={onView} onReset={onReset} />
    <p className="viewer-mode-status" role="status">{checking ? "بررسی نمایش خودرو…" : actualMode === "2d" ? canUse3d ? "نمای دوبعدی" : "نمای دوبعدی فعال است" : "نمای سه‌بعدی"}</p>
    <p className="standing-guidance">از این زاویه عکاسی کنید <span className="sr-only">: {viewConfig[scene.view].label}</span></p>
  </section>;
}
