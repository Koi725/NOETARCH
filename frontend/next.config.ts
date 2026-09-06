import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next.js 16 auto-generates AGENTS.md / CLAUDE.md via `next dev`
  // (node_modules/next/dist/server/lib/generate-agent-files.js) and re-adds them every run —
  // this is the source of the dev-overlay "1 Issue" and of unwanted agent files. `false`
  // disables that generation. NOTE: this repo maintains its own governance AGENTS.md/CLAUDE.md
  // at the repo root; Next must not manage or overwrite them.
  agentRules: false,
};

export default nextConfig;
