"use client";
import { PhotographyWorkflow } from "@/features/photography/photography-workflow";
import { Vehicle3DViewer } from "./vehicle-3d-viewer";
import "./vehicle-3d.css";

export function VehiclePreviewWorkflow({ inspectionId }: { inspectionId: string }) {
  return <PhotographyWorkflow inspectionId={inspectionId} view={{ kind: "overview" }} overviewNavigator={Vehicle3DViewer} />;
}
