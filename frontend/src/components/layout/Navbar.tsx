'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/AuthContext'

export default function Navbar() {
  const router = useRouter()
  const { isLoggedIn, role, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('role')
    // Dispatch logout event to notify AuthContext
    window.dispatchEvent(new Event('logout'))
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Portfolio CV Hub
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 items-center">
            {!loading && isLoggedIn ? (
              <>
                {role === 'recruiter' ? (
                  <>
                    <Link href="/recruiter/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                      📊 Dashboard
                    </Link>
                    <Link href="/recruiter/search" className="text-gray-700 hover:text-blue-600 font-medium">
                      🔍 Tìm kiếm
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                      👤 Hồ sơ
                    </Link>
                    <Link href="/portfolio" className="text-gray-700 hover:text-blue-600 font-medium">
                      📁 Portfolio
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
                >
                  🚪 Đăng xuất
                </button>
              </>
            ) : !loading ? (
              <>
                <Link href="/register" className="text-gray-700 hover:text-blue-600 font-medium">
                  📝 Đăng ký
                </Link>
                <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">
                  🔐 Đăng nhập
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-2xl"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-4 border-t pt-4">
            {!loading && isLoggedIn ? (
              <>
                {role === 'recruiter' ? (
                  <>
                    <Link
                      href="/recruiter/dashboard"
                      className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                    >
                      📊 Dashboard
                    </Link>
                    <Link
                      href="/recruiter/search"
                      className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                    >
                      🔍 Tìm kiếm
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                      👤 Hồ sơ
                    </Link>
                    <Link href="/portfolio" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                      📁 Portfolio
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
                >
                  🚪 Đăng xuất
                </button>
              </>
            ) : !loading ? (
              <>
                <Link href="/register" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                  📝 Đăng ký
                </Link>
                <Link href="/login" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                  🔐 Đăng nhập
                </Link>
              </>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  )
}

