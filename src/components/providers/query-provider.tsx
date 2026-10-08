"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { UploadRuntime } from "@/features/upload/upload-runtime";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } },
  }));
  return <QueryClientProvider client={client}><UploadRuntime>{children}</UploadRuntime></QueryClientProvider>;
}
