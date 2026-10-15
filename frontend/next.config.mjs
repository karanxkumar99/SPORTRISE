/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabling strict mode duplicate renders accelerates development by 2x
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "sportrise.onrender.com",
      },
      {
        protocol: "https",
        hostname: "*.onrender.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  // Configure rewrites fallback to backend API
  async rewrites() {
    const backendTarget =
      process.env.BACKEND_INTERNAL_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://sportrise.onrender.com/api/:path*"
        : "http://localhost:5000/api/:path*");

    return [
      {
        source: "/api-proxy/:path*",
        destination: backendTarget,
      },
    ];
  },
};

export default nextConfig;
