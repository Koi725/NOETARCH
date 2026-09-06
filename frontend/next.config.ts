import type { NextConfig } from "next";

// Note: `agentRules` was previously set here but is NOT a recognized Next.js config key
// (injected by external tooling). Next 16 surfaces unrecognized config keys as a dev-mode
// "Issue" — removing it clears that. Keep only valid options.
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
