import type { MetadataRoute } from 'next'
import { getSiteSettings } from '@/lib/utils/site-settings'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSiteSettings()

  return {
    name: `${s.site_name} | ${s.site_tagline}`,
    short_name: s.site_name,
    description: s.site_description,
    start_url: '/',
    display: 'standalone',
    // Light, to match the app's default theme. These two drive the installed
    // PWA's splash screen and its OS-level title bar, and neither can read
    // localStorage — a manifest is static. Left at #050505 they gave every
    // install a near-black splash that then opened a white app.
    background_color: '#FFFFFF',
    theme_color: '#FAFAF8',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
