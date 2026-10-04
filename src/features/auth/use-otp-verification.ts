"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { RepositoryError } from "@/lib/api/repositories";
import { useAuthContext, useAuthWorkflow } from "./auth-workflow-provider";

export function useOtpVerification() {
  const router = useRouter();
  const { repository, store } = useAuthContext();
  const workflow = useAuthWorkflow();
  const [code, setCode] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const verifying = useRef(false);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const verification = useMutation({
    mutationFn: async (value: string) => {
      const current = store.getState().workflow;
      if (current.stage !== "challenge") throw new RepositoryError("OTP_NOT_REQUESTED", "ابتدا کد تأیید را درخواست کنید.");
      return repository.verifyOtp({ mobile: current.mobile, code: value });
    },
    onSuccess: (session) => {
      const current = store.getState().workflow;
      if (current.stage === "challenge") {
        store.getState().setWorkflow({ stage: "verified", mobile: current.mobile, inspectionId: session.inspectionId });
        router.replace("/readiness");
      }
    },
    onError: (error) => {
      const current = store.getState().workflow;
      if (current.stage === "challenge" && error instanceof RepositoryError && error.details.remainingAttempts !== undefined) {
        store.getState().setWorkflow({ ...current, remainingAttempts: error.details.remainingAttempts });
      }
      setCode("");
    },
    onSettled: () => { verifying.current = false; },
  });
  const request = useMutation({
    mutationFn: async (mobile: string) => {
      const current = store.getState().workflow;
      if (current.stage !== "challenge") throw new RepositoryError("OTP_NOT_REQUESTED", "ابتدا کد تأیید را درخواست کنید.");
      const challenge = await repository.requestOtp({ mobile, referralCode: current.referralCode });
      return { ...current, mobile, resendAt: Date.now() + challenge.retryAfterSeconds * 1000,
        expiresAt: Date.parse(challenge.expiresAt), remainingAttempts: challenge.remainingAttempts };
    },
    onSuccess: (challenge) => { store.getState().setWorkflow(challenge); setCode(""); verification.reset(); },
  });
  const secondsRemaining = workflow.stage === "challenge" ? Math.max(0, Math.ceil((workflow.resendAt - now) / 1000)) : 0;
  const expired = workflow.stage === "challenge" && now >= workflow.expiresAt;
  function complete(value: string) {
    if (verifying.current || workflow.stage !== "challenge" || workflow.remainingAttempts === 0 || expired || request.isPending) return;
    verifying.current = true;
    verification.mutate(value);
  }
  return { workflow, code, setCode, complete, verification, request, secondsRemaining, expired };
}
