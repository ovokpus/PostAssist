import type { NextConfig } from "next";

const nextConfig = {
  env: {
    // For Vercel deployment, API routes are handled by serverless functions
    // No need for hardcoded localhost URL
    API_BASE_URL: process.env.API_BASE_URL || '',
  },
  // Remove rewrites since Vercel handles API routing automatically
  // The /api routes will be handled by our serverless functions
}

export default nextConfig;
