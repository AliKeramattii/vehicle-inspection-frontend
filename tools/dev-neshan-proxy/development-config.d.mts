export class DevelopmentConfigurationError extends Error {}
export function readDevelopmentOptions(env: Record<string, string | undefined>, args?: string[]): {reversePort: number; settingsPort: number; origins: string[]};
