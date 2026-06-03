import type { Metadata } from 'next'
import Script from 'next/script'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'misremates.com.mx — Vende tus remates con tu propia tienda',
    template: '%s | misremates.com.mx',
  },
  description:
    'Crea tu tienda online de remates en minutos. Publica productos, comparte tu tienda y vende por WhatsApp o con pagos en línea.',
  keywords: ['remates', 'ventas', 'marketplace', 'tienda online', 'México'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://misremates.com.mx'),
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
  openGraph: {
    siteName: 'misremates.com.mx',
    locale: 'es_MX',
    type: 'website',
    images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'misremates.com.mx' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LRW8TCK4NM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LRW8TCK4NM');
          `}
        </Script>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
