import type { IncomingMessage, ServerResponse } from "node:http";
export type DevelopmentIdentity = {instanceId: string; workspaceId: string; revision: string; origins: string[]};
export const healthPath: string;
export function developmentIdentity(options: {origins: string[]; reversePort: number; settingsPort: number}): Promise<DevelopmentIdentity>;
export function respondHealth(request: IncomingMessage, response: ServerResponse, service: string, identity?: DevelopmentIdentity): boolean;
export function inspectExistingPair(options: {reversePort: number; settingsPort: number; identity: DevelopmentIdentity}): Promise<{
  reusable: boolean; reason: string; recognized: {service: string; port: number; pid: number; sameWorkspace: boolean}[];
}>;
