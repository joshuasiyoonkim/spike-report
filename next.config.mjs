/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "liquipedia.net",
      },
      {
        protocol: "https",
        hostname: "owcdn.net",
      },
      {
        protocol: "https",
        hostname: "www.hotspawn.com",
      },
    ],
  },
};

export default nextConfig;
