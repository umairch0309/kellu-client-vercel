/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 16: persist Turbopack cache on disk for much faster dev restarts
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
}

module.exports = nextConfig

