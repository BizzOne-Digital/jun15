/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.storeorder.online",
      },
      {
        protocol: "https",
        hostname: "app1.restolabs.com",
      },
    ],
  },
};

export default nextConfig;
