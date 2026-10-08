"use client";
import { createContext, useContext, useEffect, useState, useSyncExternalStore, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { indexedDBUploadQueue, subscribeQueue } from "./queue-repository";
import { durableUploadMedia } from "./media-source";
import { createMockUploadTransport } from "./mock-upload-transport";
import { UploadCoordinator } from "./upload-coordinator";

export const uploadQueryKey = ["upload-queue"] as const;
const Runtime = createContext<{ coordinator: UploadCoordinator; online: boolean; error?: string; resume: () => void } | undefined>(undefined);
const subscribeNetwork = (listener: () => void) => { window.addEventListener("online", listener); window.addEventListener("offline", listener); return () => { window.removeEventListener("online", listener); window.removeEventListener("offline", listener); }; };
export function UploadRuntime({ children }: { children: ReactNode }) {
  const cache = useQueryClient(), online = useSyncExternalStore(subscribeNetwork, () => navigator.onLine, () => true);
  const [error, setError] = useState<string>();
  const [coordinator] = useState(() => new UploadCoordinator(indexedDBUploadQueue, durableUploadMedia, createMockUploadTransport(), `tab-${crypto.getRandomValues(new Uint32Array(4)).join("-")}`, Date.now, setError));
  const resume = useCallback(() => { setError(undefined); coordinator.wake(); }, [coordinator]);
  useEffect(() => {
    coordinator.start(navigator.onLine);
    const unsubscribe = subscribeQueue(() => { void cache.invalidateQueries({ queryKey: uploadQueryKey }); });
    const hide = () => { void coordinator.stop(); }, show = () => coordinator.start(navigator.onLine);
    window.addEventListener("pagehide", hide); window.addEventListener("pageshow", show);
    return () => { unsubscribe(); window.removeEventListener("pagehide", hide); window.removeEventListener("pageshow", show); void coordinator.stop(); };
  }, [cache, coordinator]);
  useEffect(() => { coordinator.setOnline(online); }, [coordinator, online]);
  return <Runtime.Provider value={{ coordinator, online, error, resume }}>{children}</Runtime.Provider>;
}
export function useUploadRuntime() { const runtime = useContext(Runtime); if (!runtime) throw new Error("UploadRuntime is missing"); return runtime; }
