const runtimeCaching = require("next-pwa/cache");

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest\.json$/],
  scope: "/",
  sw: "service-worker.js",
  skipWaiting: true,
  disable: process.env.NODE_ENV !== "production",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // 🔴 IMPORTANT (add this)
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    domains: [
      "res.cloudinary.com",
      "i.postimg.cc",
      "img.youtube.com",
      "placehold.co",
      "images.unsplash.com",
    ],
  },

  i18n: {
    locales: ["en", "es", "fr", "de"],
    defaultLocale: "en",
  },

  async redirects() {
    return [
      { source: "/terms", destination: "/terms-and-conditions", permanent: true },
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/cancellation-policy", destination: "/return-refund-policy", permanent: true },
      { source: "/refund-policy", destination: "/return-refund-policy", permanent: true },
      { source: "/cancellation-and-refund-policy", destination: "/return-refund-policy", permanent: true },
      { source: "/shipping-and-delivery-policy", destination: "/shipping-delivery-policy", permanent: true },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;