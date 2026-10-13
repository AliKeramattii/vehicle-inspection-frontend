import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";
import { developmentNeshanRewrites } from "./tools/dev-neshan-proxy/dev-rewrites";

// Next 16 also checks the Origin of HMR WebSocket upgrades. Allow this machine's
// actual addresses, not every host on the network, and never bake in a LAN IP.
const developmentOrigins = Object.values(networkInterfaces()).flatMap((addresses) =>
  (addresses ?? []).filter((address) => address.family === "IPv4").map((address) => address.address),
);

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingExcludes: { "/*": ["./.agent/vehicle-3d/**/*", "./references/assets/3d/**/*", "./tools/dev-neshan-proxy/**/*"] },
  ...(process.env.NODE_ENV !== "production" ? { allowedDevOrigins: developmentOrigins } : {}),
};

const configure = (phase: string): NextConfig => ({ ...nextConfig, ...developmentNeshanRewrites(phase, process.env) });
export default configure;
