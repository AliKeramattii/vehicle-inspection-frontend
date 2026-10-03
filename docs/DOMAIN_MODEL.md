# Initial Frontend Domain Model

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
