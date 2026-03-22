import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  workboxOptions: {
    runtimeCaching: [
      {
        // Cache page navigations (HTML) with network-first strategy
        urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
        handler: 'NetworkFirst' as const,
        options: {
          cacheName: 'pages',
          expiration: { maxEntries: 50, maxAgeSeconds: 300 },
          networkTimeoutSeconds: 3,
        },
      },
      {
        // Cache API responses with stale-while-revalidate
        urlPattern: /\/api\/(politicians|search)/,
        handler: 'StaleWhileRevalidate' as const,
        options: {
          cacheName: 'api-responses',
          expiration: { maxEntries: 100, maxAgeSeconds: 300 },
        },
      },
      {
        // Cache images aggressively
        urlPattern: /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i,
        handler: 'CacheFirst' as const,
        options: {
          cacheName: 'images',
          expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
        },
      },
    ],
  },
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.cloudflare.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Static assets (icons, fonts)
        source: '/(favicon|icon-|apple-touch)(.*)\\.(ico|png|svg)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // OG images — cache for 1 hour
        source: '/api/og',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' },
        ],
      },
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  turbopack: {},
}

export default withPWA(nextConfig)
