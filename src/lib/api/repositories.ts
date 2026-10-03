import type { AuthSession, OtpChallenge, OtpRequest, OtpVerification, ReferralValidation } from "@/types/auth";
import type { CapturePlan, Inspection } from "@/types/domain";

export interface AuthRepository {
  validateReferral(code: string): Promise<ReferralValidation>;
  requestOtp(input: OtpRequest): Promise<OtpChallenge>;
  verifyOtp(input: OtpVerification): Promise<AuthSession>;
}
export interface InspectionRepository {
  getInspection(id: string): Promise<Inspection>;
  getCapturePlan(inspectionId: string): Promise<CapturePlan>;
}
export type RepositoryErrorCode = "NOT_FOUND" | "INVALID_REFERRAL" | "OTP_NOT_REQUESTED" | "OTP_EXPIRED" | "OTP_INVALID" | "OTP_LOCKED" | "OTP_RESEND_TOO_SOON";
export type RepositoryErrorDetails = { remainingAttempts?: number; retryAfterSeconds?: number };
export class RepositoryError extends Error {
  constructor(public readonly code: RepositoryErrorCode, message: string, public readonly details: RepositoryErrorDetails = {}) {
    super(message); this.name = "RepositoryError";
  }
}
