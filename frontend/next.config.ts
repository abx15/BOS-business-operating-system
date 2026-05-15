import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* reactCompiler: true, // Optional: only if using React 19 compiler */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
