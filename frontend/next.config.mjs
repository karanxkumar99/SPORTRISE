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
    ],
  },
  // Configure rewrites to backend API during development
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
