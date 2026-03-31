import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/app/providers'

// Typography: Functional Voice (Inter)
const fontInter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
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
        className={`${fontInter.variable} font-sans antialiased bg-white text-gray-900`}
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
