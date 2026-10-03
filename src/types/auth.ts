export type ReferralValidation = { valid: false } | {
  valid: true; partnerId: string; partnerName: string; referralOwnerName: string;
};
export type OtpRequest = { mobile: string; referralCode: string };
export type OtpChallenge = { expiresAt: string; retryAfterSeconds: number };
export type OtpVerification = { mobile: string; code: string };
export type AuthSession = { verified: true; isNewUser: boolean; inspectionId: string };
