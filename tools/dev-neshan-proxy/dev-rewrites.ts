import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
export function developmentNeshanRewrites(phase: string, env: Record<string, string | undefined>) {
  if (phase !== PHASE_DEVELOPMENT_SERVER || env.DEV_NESHAN_ENABLED !== "1") return {};
  const port = (value: string | undefined, fallback: number) => {
    const parsed = Number(value ?? fallback);
    if (!Number.isInteger(parsed) || parsed < 1024 || parsed > 65535) throw new Error("Invalid development Neshan port.");
    return parsed;
  };
  const reverse = port(env.DEV_NESHAN_PROXY_PORT, 8787), settings = port(env.DEV_NESHAN_SETTINGS_PORT, 8788);
  if (reverse === settings) throw new Error("Development Neshan ports must differ.");
  return { rewrites: async () => ({
    beforeFiles: [
      { source: "/site-bootstrap.json", destination: `http://127.0.0.1:${settings}/site-bootstrap.json` },
      { source: "/api/public/site-settings", destination: `http://127.0.0.1:${settings}/api/public/site-settings` },
      { source: "/api/maps/reverse", destination: `http://127.0.0.1:${reverse}/api/maps/reverse` },
    ], afterFiles: [], fallback: [],
  }) };
}
