/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export only for production builds (Firebase hosting)
  // In development, use dynamic rendering for better DX
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true
    }
  }),
  
  // Keep webpack config for all environments
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    return config
  },
}

module.exports = nextConfig 