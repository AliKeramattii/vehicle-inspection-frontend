"use client";
import {usePathname} from "next/navigation";
import {InspectionJourneyHeader} from "@/components/inspection/inspection-journey-header";
import {inspectionRoutes} from "@/features/inspection/inspection-routes";
import {mockInspectionReference} from "@/mocks/fixtures";
export function CaptureJourneyHeader({inspectionId}:{inspectionId:string}){
 const guide=/\/photo\/[^/]+\/guide$/.test(usePathname());
 return <InspectionJourneyHeader current="capture" backHref={inspectionRoutes.vehicle(inspectionId)} referenceCode={guide?undefined:mockInspectionReference}/>;
}
