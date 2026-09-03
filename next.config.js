/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    // `domains` is deprecated in favour of remotePatterns. `unoptimized: true`
    // was also set, which disabled the whole block; with it removed, next/image
    // actually resizes and serves WebP.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "yt3.ggpht.com" },
      // Google account avatars.
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Placeholder avatars on the signed-out profile preview.
      { protocol: "https", hostname: "picsum.photos" },
    ],
    formats: ["image/webp"],
    minimumCacheTTL: 60,
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  serverExternalPackages: ["@prisma/client"],
};

module.exports = nextConfig;
