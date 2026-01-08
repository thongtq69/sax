import type { Metadata } from 'next'
import { Lora } from 'next/font/google'
import './globals.css'
import { SiteLayout } from '@/components/site/SiteLayout'
import { SessionProvider } from '@/components/providers/SessionProvider'

const lora = Lora({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora'
})

export const metadata: Metadata = {
  title: 'James Sax Corner - Wind Instrument Specialists',
  description: 'Family-owned wind instrument specialists since 1985. Expert advice, professional setup, and personalized service for students, educators, and professionals.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={lora.className}>
        <SessionProvider>
          <SiteLayout>{children}</SiteLayout>
        </SessionProvider>
      </body>
    </html>
  )
}
