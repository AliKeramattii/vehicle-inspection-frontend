import type { InspectionDto } from "@/lib/api/adapters/inspection";
import type { CapturePlan } from "@/types/domain";

export const mockInspectionId = "insp_demo";
export const mockInspectionReference = "BDI-8F31K2";
export const mockReferralCode = "A4K9P2";
export const mockOtpCode = "12345";
export const inspectionFixture: InspectionDto = {
  inspectionId: mockInspectionId, status: "draft", locationDetails: null, evidenceItems: [],
  vehicleDetails: { make: "کیا", model: "اسپورتیج", year: 2023, colorName: "نقره‌ای متالیک", colorHex: "#b5bac1",
    vinMasked: "NAAP******3F56", plate: { firstTwoDigits: "45", letter: "ب", threeDigits: "723", regionDigits: "11" } },
};
// A deliberately small bootstrap fixture, not the current customer photography template.
export const capturePlanFixture: CapturePlan = {
  templateId: "bootstrap-sample", templateVersion: 1, totalRequired: 2,
  shots: [
    { code: "sample-front", title: "نمای جلو با پلاک", category: "body", required: true, guideAvailable: true,
      distanceMeters: 3, phoneHeight: "waist", cameraOrientation: "portrait", viewpoint: "front", highlightNodes: ["Plate_Front", "Body_Main"] },
    { code: "sample-odometer", title: "کیلومترشمار", category: "cabin", required: true, guideAvailable: true, highlightNodes: [] },
  ],
};
