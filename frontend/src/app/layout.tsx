import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import { AuthProvider } from '@/hooks/AuthContext'
import { I18nProvider } from '@/providers/I18nProvider'

export const metadata: Metadata = {
  title: 'PORTFOLIO CV HUB',
  description: 'Portfolio and CV management platform for candidates and recruiters',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <I18nProvider>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
