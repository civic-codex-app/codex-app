import type { Metadata, Viewport } from 'next'
import { DM_Sans, Instrument_Serif } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Codex — Political Directory',
  description:
    'Biographies, official websites, campaign links, and donation pages for current U.S. politicians and candidates.',
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/favicon.ico', sizes: '48x48' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Codex',
  },
  openGraph: {
    type: 'website',
    siteName: 'Codex',
    title: 'Codex — Political Directory',
    description:
      'Biographies, official websites, campaign links, and donation pages for current U.S. politicians and candidates.',
    images: [{ url: '/api/og?title=Codex&subtitle=Civic Engagement Platform', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Codex — Political Directory',
    description:
      'Biographies, official websites, campaign links, and donation pages for current U.S. politicians and candidates.',
    images: ['/api/og?title=Codex&subtitle=Civic Engagement Platform'],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('codex-theme');if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.add('light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
