import { describe, expect, it } from "vitest";
import { createMockAuthRepository } from "@/mocks/auth-repository";
import { createMockInspectionRepository } from "@/mocks/inspection-repository";
import { capturePlanFixture, inspectionFixture, mockInspectionId } from "@/mocks/fixtures";
import { capturePlanSchema, inspectionLocationSchema, vehicleSchema } from "@/schemas/domain";
import { adaptInspection } from "@/lib/api/adapters/inspection";
import { endpoints } from "@/lib/api/endpoints";
import { cn } from "@/lib/utils/cn";

const otpRequest = { mobile: "09121234567", referralCode: "A4K9P2" };
describe("mock auth boundary", () => {
  it("normalizes referral codes and discriminates unknown codes", async () => {
    const auth = createMockAuthRepository();
    expect(await auth.validateReferral(" a4k9p2 ")).toMatchObject({ valid: true, partnerId: "partner_demo" });
    expect(await auth.validateReferral("XXXXXX")).toEqual({ valid: false });
  });
  it("rejects invalid input and unrecognized referrals", async () => {
    const auth = createMockAuthRepository();
    await expect(auth.requestOtp({ ...otpRequest, mobile: "123" })).rejects.toThrow();
    await expect(auth.requestOtp({ ...otpRequest, referralCode: "XXXXXX" })).rejects.toMatchObject({ code: "INVALID_REFERRAL" });
  });
  it("requires a challenge, verifies once, and isolates repository instances", async () => {
    const auth = createMockAuthRepository();
    const verify = { mobile: otpRequest.mobile, code: "12345" };
    await expect(auth.verifyOtp(verify)).rejects.toMatchObject({ code: "OTP_NOT_REQUESTED" });
    await auth.requestOtp(otpRequest);
    await expect(createMockAuthRepository().verifyOtp(verify)).rejects.toMatchObject({ code: "OTP_NOT_REQUESTED" });
    expect(await auth.verifyOtp(verify)).toEqual({ verified: true, isNewUser: false, inspectionId: mockInspectionId });
    await expect(auth.verifyOtp(verify)).rejects.toMatchObject({ code: "OTP_NOT_REQUESTED" });
  });
  it("expires the challenge after two minutes", async () => {
    let time = Date.parse("2026-10-04T00:00:00Z");
    const auth = createMockAuthRepository(() => time);
    expect(await auth.requestOtp(otpRequest)).toEqual({ expiresAt: "2026-10-04T00:02:00.000Z", retryAfterSeconds: 60, remainingAttempts: 3 });
    time += 120_000;
    await expect(auth.verifyOtp({ mobile: otpRequest.mobile, code: "12345" })).rejects.toMatchObject({ code: "OTP_EXPIRED" });
  });
  it("rejects incorrect codes and locks after three failures", async () => {
    const auth = createMockAuthRepository();
    await auth.requestOtp(otpRequest);
    for (let i = 0; i < 3; i++) await expect(auth.verifyOtp({ mobile: otpRequest.mobile, code: "99999" })).rejects.toMatchObject({ code: "OTP_INVALID" });
    await expect(auth.verifyOtp({ mobile: otpRequest.mobile, code: "12345" })).rejects.toMatchObject({ code: "OTP_LOCKED" });
  });
});
describe("inspection contracts", () => {
  it("returns domain values with no shared mutable fixtures", async () => {
    const repository = createMockInspectionRepository();
    const inspection = await repository.getInspection(mockInspectionId);
    expect(inspection).not.toHaveProperty("vehicleDetails");
    if (inspection.vehicle) inspection.vehicle.model = "changed";
    expect((await repository.getInspection(mockInspectionId)).vehicle?.model).toBe("اسپورتیج");
    const plan = await repository.getCapturePlan(mockInspectionId);
    plan.shots[0].highlightNodes.push("changed");
    expect((await repository.getCapturePlan(mockInspectionId)).shots[0].highlightNodes).not.toContain("changed");
  });
  it("rejects missing inspections for both reads", async () => {
    const repository = createMockInspectionRepository();
    await expect(repository.getInspection("missing")).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(repository.getCapturePlan("missing")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  it("rejects malformed transport data instead of leaking it into UI", () => {
    expect(() => adaptInspection({ inspectionId: "demo", status: "unknown" })).toThrow();
  });
  it("validates required counts and unique shot codes", () => {
    expect(capturePlanSchema.safeParse(capturePlanFixture).success).toBe(true);
    expect(capturePlanSchema.safeParse({ ...capturePlanFixture, totalRequired: 14 }).success).toBe(false);
    expect(capturePlanSchema.safeParse({ ...capturePlanFixture, shots: [capturePlanFixture.shots[0], capturePlanFixture.shots[0]] }).success).toBe(false);
  });
  it("rejects invalid geographic coordinates and formatted numeric transport values", () => {
    expect(inspectionLocationSchema.safeParse({ latitude: 91, longitude: 51, accuracyMeters: 8, formattedAddress: "تهران" }).success).toBe(false);
    expect(vehicleSchema.safeParse({ ...inspectionFixture.vehicleDetails, odometerKm: 48320 }).success).toBe(true);
    expect(vehicleSchema.safeParse({ ...inspectionFixture.vehicleDetails, odometerKm: "۴۸۳۲۰" }).success).toBe(false);
  });
});
it("merges RTL-safe Tailwind overrides", () => {
  expect(cn("px-4 ps-2", false, "px-6", { "text-sm": true })).toBe("px-6 text-sm");
});
it("encodes endpoint identifiers as a single path segment", () => {
  expect(endpoints.inspections.capturePlan("a/b?c")).toBe("/api/inspections/a%2Fb%3Fc/capture-plan");
});
