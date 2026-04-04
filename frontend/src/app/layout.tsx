import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import { AuthProvider } from '@/hooks/AuthContext'

export const metadata: Metadata = {
  title: 'PORTFOLIO CV HUB',
  description: 'Platform quản lý portfolio và CV cho ứng viên',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className="bg-gray-50">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
