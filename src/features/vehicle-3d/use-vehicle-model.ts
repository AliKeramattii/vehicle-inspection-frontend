import { useEffect, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { Group } from "three";
import { disposeVehicle, prepareVehicle } from "./model-lifecycle";
import { vehicleModelConfig } from "./vehicle-model-config";

export type LoadedVehicle = { root: Group; downloadMs: number; parseMs: number; byteSize: number };
export function useVehicleModel(url: string, onFailure: () => void) {
  const [model, setModel] = useState<LoadedVehicle>();
  useEffect(() => {
    const controller = new AbortController(); let resource: Group | undefined;
    void (async () => {
      const start = performance.now(), response = await fetch(url, { signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error("Model unavailable");
      const bytes = await response.arrayBuffer(), downloaded = performance.now();
      const gltf = await new GLTFLoader().parseAsync(bytes, "/");
      resource = gltf.scene;
      if (controller.signal.aborted) { disposeVehicle(resource); resource = undefined; return; }
      prepareVehicle(resource, vehicleModelConfig.defaultPaint);
      setModel({ root: resource, downloadMs: downloaded - start, parseMs: performance.now() - downloaded, byteSize: bytes.byteLength });
    })().catch(() => { if (!controller.signal.aborted) onFailure(); });
    return () => { controller.abort(); if (resource) disposeVehicle(resource); };
  }, [url, onFailure]);
  return model;
}
