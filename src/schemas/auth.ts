import { z } from "zod";

export const referralCodeSchema = z.string().trim().toUpperCase().regex(/^[A-Z0-9]{6}$/, "کد معرفی باید ۶ حرف یا رقم باشد.");
export const mobileSchema = z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر وارد کنید.");
export const otpRequestSchema = z.object({ mobile: mobileSchema, referralCode: referralCodeSchema });
export const otpVerificationSchema = z.object({ mobile: mobileSchema, code: z.string().regex(/^\d{5}$/, "کد تأیید باید ۵ رقم باشد.") });
