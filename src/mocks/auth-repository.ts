import { RepositoryError, type AuthRepository } from "@/lib/api/repositories";
import { otpRequestSchema, otpVerificationSchema, referralCodeSchema } from "@/schemas/auth";
import { mockInspectionId, mockOtpCode, mockReferralCode } from "./fixtures";

// Each factory owns its challenges. Never share this mock as a production session service.
export function createMockAuthRepository(now: () => number = Date.now, resendAfterSeconds = 60): AuthRepository {
  const challenges = new Map<string, { expiresAt: number; attempts: number; resendAt: number }>();
  return {
    async validateReferral(code) {
      if (referralCodeSchema.parse(code) !== mockReferralCode) return { valid: false };
      return { valid: true, partnerId: "partner_demo", partnerName: "بیمه نمونه", referralOwnerName: "نمایندگی نمونه" };
    },
    async requestOtp(input) {
      const request = otpRequestSchema.parse(input);
      if (request.referralCode !== mockReferralCode) throw new RepositoryError("INVALID_REFERRAL", "کد معرفی معتبر نیست.");
      const previous = challenges.get(request.mobile);
      if (previous && now() < previous.resendAt) {
        throw new RepositoryError("OTP_RESEND_TOO_SOON", "برای ارسال مجدد کمی صبر کنید.", { retryAfterSeconds: Math.ceil((previous.resendAt - now()) / 1000) });
      }
      const expiresAt = now() + 120_000;
      challenges.set(request.mobile, { expiresAt, attempts: 0, resendAt: now() + resendAfterSeconds * 1000 });
      return { expiresAt: new Date(expiresAt).toISOString(), retryAfterSeconds: resendAfterSeconds, remainingAttempts: 3 };
    },
    async verifyOtp(input) {
      const request = otpVerificationSchema.parse(input);
      const challenge = challenges.get(request.mobile);
      if (!challenge) throw new RepositoryError("OTP_NOT_REQUESTED", "ابتدا کد تأیید را درخواست کنید.");
      if (now() >= challenge.expiresAt) throw new RepositoryError("OTP_EXPIRED", "مهلت کد تأیید تمام شده است.");
      if (challenge.attempts >= 3) throw new RepositoryError("OTP_LOCKED", "کد تازه درخواست کنید.", { remainingAttempts: 0 });
      if (request.code !== mockOtpCode) {
        challenge.attempts += 1;
        throw new RepositoryError("OTP_INVALID", "کد تأیید نادرست است.", { remainingAttempts: 3 - challenge.attempts });
      }
      challenges.delete(request.mobile);
      return { verified: true, isNewUser: false, inspectionId: mockInspectionId };
    },
  };
}
