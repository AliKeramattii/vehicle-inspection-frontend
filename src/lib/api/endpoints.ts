const segment = (id: string) => encodeURIComponent(id);
// Contracts only. No HTTP implementation is enabled in bootstrap.
export const endpoints = {
  auth: { validateReferral: "/api/referrals/validate", requestOtp: "/api/auth/otp/request", verifyOtp: "/api/auth/otp/verify", me: "/api/me" },
  inspections: {
    create: "/api/inspections",
    detail: (id: string) => `/api/inspections/${segment(id)}`,
    status: (id: string) => `/api/inspections/${segment(id)}/status`,
    capturePlan: (id: string) => `/api/inspections/${segment(id)}/capture-plan`,
  },
} as const;
