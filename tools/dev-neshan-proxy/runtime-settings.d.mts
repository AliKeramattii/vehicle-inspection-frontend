import type { Server } from "node:http";
export function createRuntimeSettingsServer(options: {
  path: string;
  port?: number;
  origins?: string[];
  report?: (configuration: { tenantId: string; mapEnabled: boolean; webMapConfigured: boolean; reverseGeocoding: string }) => void;
}): Promise<Server>;
