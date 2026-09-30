import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      // Product photos uploaded to the public shop-images bucket.
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/shop-images/**",
            },
            // Post pictures for /contents.
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/content-images/**",
            },
          ]
        : []),
    ],
  },
  experimental: {
    serverActions: {
      // Product saves carry one image of up to 5MB plus the form fields.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
