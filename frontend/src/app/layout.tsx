import type { Metadata } from 'next'
import { Geist, Geist_Mono, Be_Vietnam_Pro } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/app/providers'

// UI chính (Sans)
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'latin-ext'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  display: 'swap',
})

// Font code / Price / UI Mono
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

// Font heading Brand Việt Nam
const beVietnam = Be_Vietnam_Pro({
  variable: '--font-be-vietnam',
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ecommerce App',
  description: 'Welcome to the Ecommerce App built with Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='vi' suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${beVietnam.variable} antialiased bg-white text-gray-900`}
      >
        {/* Strip browser-extension-injected attributes (e.g. Bitdefender's bis_skin_checked) before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.querySelectorAll('[bis_skin_checked]').forEach(function(el) {
                  el.removeAttribute('bis_skin_checked');
                });
              } catch(e) {}
            `,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
