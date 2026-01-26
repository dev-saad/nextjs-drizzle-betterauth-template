import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 // typedRoutes: true,
 logging: {
  fetches: {
   fullUrl: true,
  },
 },
 typescript: {
  tsconfigPath: "tsconfig.json",
 },
 experimental: {
  typedEnv: true,
  serverActions: {
   bodySizeLimit: "2mb",
  },
 },
 images: {
  remotePatterns: [
   {
    protocol: "https",
    hostname: "pub-8fcb9dbc328f4bbbb8a37d698d3d2482.r2.dev",
   },
   {
    protocol: "https",
    hostname: "img.freepik.com",
   },
  ],
 },
 /* config options here */
};

export default nextConfig;
