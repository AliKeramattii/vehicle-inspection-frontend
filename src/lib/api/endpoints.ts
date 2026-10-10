const segment = (id: string) => encodeURIComponent(id);
// Contracts only. No HTTP implementation is enabled in bootstrap.
export const endpoints = {
  auth: { validateReferral: "/api/referrals/validate", requestOtp: "/api/auth/otp/request", verifyOtp: "/api/auth/otp/verify", me: "/api/me" },
  inspections: {
    create: "/api/inspections",
    detail: (id: string) => `/api/inspections/${segment(id)}`,
    status: (id: string) => `/api/inspections/${segment(id)}/status`,
    summary: (id: string) => `/api/inspections/${segment(id)}/summary`,
    submit: (id: string) => `/api/inspections/${segment(id)}/submit`,
    capturePlan: (id: string) => `/api/inspections/${segment(id)}/capture-plan`,
    consent: (id: string) => `/api/inspections/${segment(id)}/consent`,
    location: (id: string) => `/api/inspections/${segment(id)}/location`,
    vehicle: (id: string) => `/api/inspections/${segment(id)}/vehicle`,
    plate: (id: string) => `/api/inspections/${segment(id)}/vehicle/plate`,
  },
} as const;
