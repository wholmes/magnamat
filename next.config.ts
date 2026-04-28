import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next 15.5 defaults this on; it can throw "not in React Client Manifest" when
  // .next is corrupt or multiple dev servers race — disable for stabler local dev.
  experimental: {
    devtoolSegmentExplorer: false,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
