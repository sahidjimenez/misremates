import type { Metadata } from 'next'
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
