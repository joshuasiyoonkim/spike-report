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
      {
        // Commenter avatars. Safe to pin to this single host because
        // profiles.avatar_url has a CHECK constraint anchored to it, so a
        // user cannot point it elsewhere via auth.updateUser metadata.
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
    ],
  },
};

export default nextConfig;
