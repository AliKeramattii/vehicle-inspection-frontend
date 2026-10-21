"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { RepositoryError } from "@/lib/api/repositories";
import { useAuthContext, useAuthWorkflow } from "./auth-workflow-provider";

import { lifecycleRepository } from "@/features/inspection-status/lifecycle-repository";
import { customerEntryDestination } from "@/features/inspection-status/status-service";
import { saveMockVerifiedSession } from "@/features/identity/source-context";

export function useOtpVerification() {
  const router = useRouter();
  const { repository, store, source } = useAuthContext();
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
    onSuccess: async () => {
      const current = store.getState().workflow;
      if (current.stage === "challenge") {
        const scope = await source.resolve(), record = await lifecycleRepository.register(scope);
        const destination = await customerEntryDestination(scope, record.inspectionId);
        saveMockVerifiedSession(scope, record.inspectionId);
        store.getState().setWorkflow({ stage: "verified", mobile: scope.mobile, inspectionId: record.inspectionId });
        router.replace(destination);
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
    mutationFn: async () => {
      const current = store.getState().workflow;
      if (current.stage !== "challenge") throw new RepositoryError("OTP_NOT_REQUESTED", "ابتدا کد تأیید را درخواست کنید.");
      const mobile = current.mobile;
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
