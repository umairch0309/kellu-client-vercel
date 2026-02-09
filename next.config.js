/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack filesystem cache disabled to avoid internal server errors from corrupted cache (ENOENT, Failed to restore task data).
  // Re-enable for faster dev restarts once stable: turbopackFileSystemCacheForDev: true
  experimental: {},
}

module.exports = nextConfig

