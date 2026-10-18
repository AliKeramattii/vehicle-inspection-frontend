"use client";

import { notifyManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { SiteSettingsProvider } from "@/config/site-settings.provider";
import { UploadRuntime } from "@/features/upload/upload-runtime";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => {
    // Public configuration resolves from I/O, without depending on a timer tick.
    notifyManager.setScheduler(queueMicrotask);
    return new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } },
    });
  });
  return <QueryClientProvider client={client}><SiteSettingsProvider><UploadRuntime>{children}</UploadRuntime></SiteSettingsProvider></QueryClientProvider>;
}
