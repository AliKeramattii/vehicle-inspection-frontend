"use client";

import { useEffect, useState } from "react";
import { createMockCapabilityService, initialCapabilities, normalizeCapabilities, type CapabilityService } from "./capabilities";

const mockService = createMockCapabilityService();
export function useCapabilities(service: CapabilityService = mockService) {
  const [results, setResults] = useState(initialCapabilities);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    service.check(controller.signal).then((value) => {
      if (!controller.signal.aborted) setResults(normalizeCapabilities(value));
    }).catch(() => {
      if (!controller.signal.aborted) setResults(normalizeCapabilities([]));
    });
    return () => controller.abort();
  }, [service, attempt]);
  return { results, mode: service.mode, retry() { setResults(initialCapabilities()); setAttempt((value) => value + 1); } };
}
