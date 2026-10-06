# Initial Frontend Domain Model

Phase 04 customer photography uses `PhotographyTemplate` / `InspectionSection` / `PhotoRequirement`
from `schemas/photography.ts`: seven sections and twelve required photos in the current configurable
template, stable sample/requirement IDs, status, instructions and quality labels. Legacy flat
CapturePlan slots are derived from the same configuration. Local draft/accepted blobs belong to
PhotoStore rather than the server inspection entity or Zustand. Future optional 3D nodes map to
these same requirements; production customer photography has no mesh/GLB dependency.

Use these as domain concepts, not necessarily exact API DTOs.

```ts
export type InspectionStatus =
  | "draft"
  | "capturing"
  | "uploading"
  | "readyToSubmit"
  | "queuedForReview"
  | "underReview"
  | "additionalEvidenceRequired"
  | "approved"
  | "rejected";

export type EvidenceState =
  | "local"
  | "queued"
  | "uploading"
  | "processing"
  | "uploaded"
  | "verified"
  | "failed"
  | "retakeRequired";

export type CaptureCategory =
  | "body"
  | "cabin"
  | "engineChassis";

export interface IranianPlate {
  firstTwoDigits: string;
  letter: string;
  threeDigits: string;
  regionDigits: string;
}

export interface Vehicle {
  make: string;
  model: string;
  year: number;
  colorName: string;
  colorHex?: string;
  vinMasked: string;
  plate: IranianPlate;
  odometerKm?: number;
}

export interface CaptureSlot {
  code: string;
  title: string;
  category: CaptureCategory;
  required: boolean;
  guideAvailable: boolean;
  distanceMeters?: number;
  phoneHeight?: "waist" | "headlight" | "chest" | "custom";
  cameraOrientation?: "portrait" | "landscape";
  viewpoint?: string;
  highlightNodes: string[];
}

export interface Evidence {
  id: string;
  shotCode: string;
  mediaType: "image" | "video360";
  state: EvidenceState;
  thumbnailUrl?: string;
  remoteUrl?: string;
  capturedAt?: string;
}

export interface InspectionLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  formattedAddress: string;
  buildingNumber?: string;
  unitFloor?: string;
  parkingDescription?: string;
}
```
