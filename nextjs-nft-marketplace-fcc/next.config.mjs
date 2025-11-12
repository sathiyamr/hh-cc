/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ skip linting during build
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ skip type-checking during build
  },
  output: "export",
  trailingSlash: true, // ensures /about → /about/index.html
  assetPrefix: "./", // make JS/CSS paths relative (important for IPFS)
  basePath: "",
};

export default nextConfig;
