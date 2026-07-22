import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const isGithubPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  assetPrefix: isGithubPages ? "/ResolveHub/" : undefined,
  basePath: isGithubPages ? "/ResolveHub" : undefined,
  devIndicators: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },
  output: isGithubPages ? "export" : undefined,
  reactStrictMode: true,
  trailingSlash: isGithubPages,
  turbopack: {
    root: projectRoot
  }
};

export default nextConfig;
