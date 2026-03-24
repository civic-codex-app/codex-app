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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
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
    <html lang="en" className={`${dmSans.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <head />
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('poli-theme');if(t==='dark'){document.documentElement.classList.add('dark')}else if(t==='light'){document.documentElement.classList.add('light')}else{var d=window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches;document.documentElement.classList.add(d?'dark':'light')}}catch(e){}})()`,
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
