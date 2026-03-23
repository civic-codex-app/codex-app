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
    background_color: '#050505',
    theme_color: '#050505',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
