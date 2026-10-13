import type { Server } from "node:http";
export function assertDevelopment(): void;
export function localAccess(request: import("node:http").IncomingMessage, response: import("node:http").ServerResponse, port: number, origins: string[]): boolean;
export function createReverseServer(options: { key: string; port?: number; origins?: string[]; fetcher?: typeof fetch; timeoutMs?: number; limit?: number; now?: () => number; report?: (value: {upstreamStatus: number}) => void }): Server;
