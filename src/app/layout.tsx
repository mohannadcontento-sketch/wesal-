import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const felfelFont = localFont({
  src: '../fonts/Felfel.otf' as const,
  variable: '--font-felfel',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'وصال — مساحتك الآمنة للصحة النفسية',
  description: 'منصة عربية متكاملة للصحة النفسية — شارك، تفاعل، تواصل مع أطباء معتمدين.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#004346',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={felfelFont.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${felfelFont.className} antialiased min-h-screen bg-wesal-cream text-wesal-navy`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
