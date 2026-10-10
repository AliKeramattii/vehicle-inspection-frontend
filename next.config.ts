import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

// Next 16 also checks the Origin of HMR WebSocket upgrades. Allow this machine's
// actual addresses, not every host on the network, and never bake in a LAN IP.
const developmentOrigins = Object.values(networkInterfaces()).flatMap((addresses) =>
  (addresses ?? []).filter((address) => address.family === "IPv4").map((address) => address.address),
);

const nextConfig: NextConfig = {
  devIndicators: false,
  // Restricted local prototype assets must never enter production server deployment traces.
  outputFileTracingExcludes: { "/*": ["./references/assets/3d/**/*", "./.agent/vehicle-3d/**/*", "./public/assets/models/*.glb"] },
  ...(process.env.NODE_ENV !== "production" ? { allowedDevOrigins: developmentOrigins } : {}),
};

export default nextConfig;
