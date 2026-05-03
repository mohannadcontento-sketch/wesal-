import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'وصال — مجتمع الصحة النفسية',
  description: 'مجتمع عربي للصحة النفسية — شارك، تفاعل، تواصل مع أطباء. مساحتك الآمنة للصحة النفسية.',
  keywords: ['صحة نفسية', 'مجتمع عربي', 'أطباء نفسيين', 'دعم نفسي', 'وصال'],
  openGraph: {
    title: 'وصال — مجتمع الصحة النفسية',
    description: 'مساحتك الآمنة للصحة النفسية. شارك وتواصل مع أطباء موثوقين.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1B6B6B',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#1B6B6B" />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans text-sm selection:bg-primary selection:text-primary-foreground pb-[80px]">
        {children}
      </body>
    </html>
  )
}
