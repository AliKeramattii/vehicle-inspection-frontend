import {InspectionJourneyHeader} from "@/components/inspection/inspection-journey-header";
import {inspectionRoutes} from "@/features/inspection/inspection-routes";
export function CaptureJourneyHeader({inspectionId}:{inspectionId:string}){
 return <InspectionJourneyHeader current="capture" backHref={inspectionRoutes.vehicle(inspectionId)}/>;
}
