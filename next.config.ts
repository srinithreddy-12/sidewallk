import type { NextConfig } from "next";

/**
 * `next dev` and `next build` both default to `.next/`. Running them
 * concurrently against the same directory corrupts the dev server's
 * webpack cache (hit this directly during development: the UI silently
 * stopped responding to clicks). Next sets NODE_ENV itself — "development"
 * for `next dev`, "production" for `next build`/`next start` — so this
 * splits the output directory without needing a second script or flag.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
