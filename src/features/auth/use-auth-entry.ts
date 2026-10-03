"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { RepositoryError } from "@/lib/api/repositories";
import { useAuthContext } from "./auth-workflow-provider";
import { demoInvitationMobile } from "./config";

export function useAuthEntry() {
  const { repository, store } = useAuthContext();
  const router = useRouter();
  return useMutation({
    mutationFn: async (referralCode: string) => {
      const referral = await repository.validateReferral(referralCode);
      if (!referral.valid) throw new RepositoryError("INVALID_REFERRAL", "کد معرفی معتبر نیست. کد دریافتی را بررسی کنید.");
      const current = store.getState().workflow;
      if (current.stage === "challenge" && current.referralCode === referralCode && current.expiresAt > Date.now()) return current;
      const mobile = demoInvitationMobile;
      const challenge = await repository.requestOtp({ mobile, referralCode });
      return { stage: "challenge" as const, mobile, referralCode, resendAt: Date.now() + challenge.retryAfterSeconds * 1000,
        expiresAt: Date.parse(challenge.expiresAt), remainingAttempts: challenge.remainingAttempts };
    },
    onSuccess: (workflow) => { store.getState().setWorkflow(workflow); router.push("/verify"); },
  });
}
