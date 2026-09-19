import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

/**
 * NOT CURRENTLY IN EFFECT.
 *
 * @ducanh2912/next-pwa is a webpack plugin — it imports workbox-webpack-plugin
 * and installs itself through the `webpack` hook. This project builds with
 * Turbopack (see `turbopack: {}` below; the build banner reads "Next.js 16.2.1
 * (Turbopack)"), so that hook never runs and no service worker is emitted.
 * Verified against a production build: /sw.js and /workbox-default.js both
 * 404, and no client chunk references `serviceWorker`.
 *
 * So everything in runtimeCaching below is dead configuration. It is kept, and
 * corrected, because reading it as live is worse than not having it: the
 * navigation rule used to match authenticated routes, which WOULD have cached
 * /dashboard and /admin HTML for 300s had the plugin ever run.
 *
 * Consequences worth knowing: there is no offline support, and Chrome will not
 * offer to install the app (an installable PWA needs a fetch handler, not just
 * a manifest — /manifest.json does serve). Restoring it means either moving
 * the build off Turbopack or switching to a Turbopack-compatible generator
 * such as Serwist. That is a product decision, not a cleanup.
 */
const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  workboxOptions: {
    runtimeCaching: [
      {
        // Page navigations, EXCEPT anything behind auth.
        //
        // This rule used to match every navigation, so an authenticated
        // /dashboard or /admin document sat in the cache for 300s. It is
        // NetworkFirst, so it only surfaced when the network failed or passed
        // the 3s timeout — but in that window a signed-out person on a shared
        // device could be served the previous user's page. Personalised HTML
        // must never enter a shared cache.
        urlPattern: ({ request, url }: { request: Request; url: URL }) =>
          request.mode === 'navigate' &&
          !/^\/(dashboard|account|following|onboarding|admin|ballot-scorecard|api)(\/|$)/.test(url.pathname),
        handler: 'NetworkFirst' as const,
        options: {
          cacheName: 'pages',
          expiration: { maxEntries: 50, maxAgeSeconds: 300 },
          networkTimeoutSeconds: 3,
        },
      },
      {
        // Next's client-side RSC payloads were matched by nothing: they are
        // fetches, not navigations. A stale one hydrating into a mismatched
        // route is a nasty intermittent bug, so this is short-lived and
        // network-first with a tight timeout.
        urlPattern: ({ url }: { url: URL }) => url.searchParams.has('_rsc'),
        handler: 'NetworkFirst' as const,
        options: {
          cacheName: 'rsc',
          expiration: { maxEntries: 100, maxAgeSeconds: 120 },
          networkTimeoutSeconds: 2,
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
        // The R2 bucket behind its custom domain. Photos moved here from
        // pub-*.r2.dev, which Cloudflare rate-limits and does not intend for
        // production traffic.
        protocol: 'https',
        hostname: 'cdn.getpoli.app',
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
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Security headers on all routes
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },
        ],
      },
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
    // staleTimes.dynamic is deliberately NOT set.
    //
    // Setting it to 30 looked like a free win — it stops the client refetching
    // a dynamic route you were just on. It is not free. staleTimes is global,
    // so it also covers the 5 force-dynamic pages under app/(dashboard) and
    // the 18 under app/admin, and a client-cached segment is served with NO
    // server request at all — which means proxy.ts never runs, and proxy.ts is
    // the only thing enforcing the /dashboard, /account, /following and /admin
    // redirects.
    //
    // Reproduced against Next 16.2.1: with dynamic:30, signing out in one tab
    // and then clicking a protected link in another produced zero network
    // requests and re-rendered the previous session's page, byte-identical.
    // With the default (0) the same click hit the server and redirected to
    // /login. Next changed this default from 30 to 0 in v15 for exactly this
    // reason.
    //
    // The benefit it was bought for — instant tab-bar switching — comes from
    // making those routes static instead, which is the right fix and does not
    // trade away redirect enforcement.
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  turbopack: {},
}

export default withPWA(nextConfig)
