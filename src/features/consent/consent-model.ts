import { z } from "zod";

export const consentTermsVersion = "2026-10";
export const consentInputSchema = z.object({ accepted: z.literal(true), termsVersion: z.literal(consentTermsVersion) });
export type ConsentInput = z.infer<typeof consentInputSchema>;
export type ConsentReceipt = { inspectionId: string; accepted: true; termsVersion: string; acceptedAt: string };
export type ConsentState = { status: "editing"; accepted: boolean } | { status: "saving" } |
  { status: "failed"; accepted: boolean; message: string } | { status: "complete"; receipt: ConsentReceipt };
