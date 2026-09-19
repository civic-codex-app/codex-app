import type { Metadata, Viewport } from 'next'
import { DM_Sans, Instrument_Serif } from 'next/font/google'
import Script from 'next/script'
import { VercelAnalytics } from '@/components/analytics/vercel-analytics'
import { getSiteSettings } from '@/lib/utils/site-settings'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  const fullTitle = `${s.site_name} | ${s.site_tagline}`
  const ogImageUrl = `/api/og?title=${encodeURIComponent(s.site_name)}&subtitle=${encodeURIComponent(s.site_tagline)}`

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    title: fullTitle,
    description: s.site_description,
    icons: {
      icon: [{ url: '/favicon.ico', sizes: '48x48' }],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: s.site_name,
    },
    openGraph: {
      type: 'website',
      siteName: s.site_name,
      title: s.og_title,
      description: s.og_description,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: s.og_title,
      description: s.og_description,
      images: [ogImageUrl],
    },
  }
}

export const viewport: Viewport = {
  // One value, matching the light default, because the app no longer follows
  // the OS. A media-split themeColor would paint the browser chrome dark for
  // anyone whose phone is in dark mode while the page itself is light.
  // useTheme rewrites this meta tag after hydration for whoever has chosen
  // dark, so the split only ever mattered before the first frame anyway.
  themeColor: '#FAFAF8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // data-scroll-behavior tells Next it may disable the smooth scrolling
    // declared in globals.css while a route transition runs. Without it Next
    // cannot, so every navigation's scroll-to-top and every Back restore is
    // an animated glide rather than an instant placement. Next warns about
    // this in development.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <head />
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            // Light is the product default. A first-time visitor gets light
            // whatever their phone is set to; only an explicit choice through
            // the theme toggle, which is what writes poli-theme, turns the app
            // dark. This used to fall back to prefers-color-scheme, so anyone
            // whose device was in dark mode saw a dark app they had never asked
            // for and could not tell was a default.
            //
            // Both halves of the decision have to agree. This script runs
            // before first paint so the class is on <html> when the first
            // pixels are drawn; lib/hooks/use-theme.ts repeats it after
            // hydration for the store. If the two ever disagree the page
            // changes colour a moment after it loads.
            __html: `(function(){try{var t=localStorage.getItem('poli-theme');document.documentElement.classList.add(t==='dark'?'dark':'light')}catch(e){document.documentElement.classList.add('light')}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Poli',
              url: 'https://getpoli.app',
              description: 'Look up any U.S. politician and see where they stand on the issues that matter to you. Stances, voting records, campaign finance, and elections for 8,000+ officials.',
            }),
          }}
        />
        {children}
        <VercelAnalytics />
      </body>
    </html>
  )
}
