import type { Server } from "node:http";
import type { EventEmitter } from "node:events";
export type DevelopmentService = {name: string; port: number; server: Server};
export class ServiceStartupError extends Error { constructor(service: string, port: number, error: unknown); code: string; service: string; port: number; }
export function closeServices(services: DevelopmentService[]): Promise<void>;
export function startServices(services: DevelopmentService[], options?: {signals?: Pick<EventEmitter, "on" | "removeListener">; reportError?: (error: ServiceStartupError) => void}): Promise<{stop: () => Promise<void>}>;
