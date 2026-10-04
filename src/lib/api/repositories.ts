import type { AuthSession, OtpChallenge, OtpRequest, OtpVerification, ReferralValidation } from "@/types/auth";
import type { CapturePlan, Inspection, InspectionLocation, Vehicle } from "@/types/domain";
import type { ConsentInput, ConsentReceipt } from "@/features/consent/consent-model";
import type { VehicleConfirmationInput, VehicleConfirmationReceipt } from "@/features/vehicle/vehicle-model";

export interface AuthRepository {
  validateReferral(code: string): Promise<ReferralValidation>;
  requestOtp(input: OtpRequest): Promise<OtpChallenge>;
  verifyOtp(input: OtpVerification): Promise<AuthSession>;
}
export interface InspectionRepository {
  getInspection(id: string): Promise<Inspection>;
  getCapturePlan(inspectionId: string): Promise<CapturePlan>;
  recordConsent(inspectionId: string, input: ConsentInput): Promise<ConsentReceipt>;
  saveLocation(inspectionId: string, location: InspectionLocation): Promise<InspectionLocation>;
  getVehicle(inspectionId: string): Promise<Vehicle | null>;
  confirmVehicle(inspectionId: string, input: VehicleConfirmationInput): Promise<VehicleConfirmationReceipt>;
}
export type RepositoryErrorCode = "NOT_FOUND" | "CONSENT_REQUIRED" | "LOCATION_REQUIRED" | "INVALID_REFERRAL" | "OTP_NOT_REQUESTED" | "OTP_EXPIRED" | "OTP_INVALID" | "OTP_LOCKED" | "OTP_RESEND_TOO_SOON";
export type RepositoryErrorDetails = { remainingAttempts?: number; retryAfterSeconds?: number };
export class RepositoryError extends Error {
  constructor(public readonly code: RepositoryErrorCode, message: string, public readonly details: RepositoryErrorDetails = {}) {
    super(message); this.name = "RepositoryError";
  }
}
