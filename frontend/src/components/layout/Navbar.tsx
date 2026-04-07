'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/AuthContext'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoggedIn, role, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Admin navbar only shows on /admin/* pages
  const isAdminPage = pathname.startsWith('/admin')
  const effectiveRole = (role === 'admin' && !isAdminPage) ? null : role
  const effectiveLoggedIn = (role === 'admin' && !isAdminPage) ? false : isLoggedIn

  const handleLogout = async () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('role')
    window.dispatchEvent(new Event('logout'))
    router.push('/')
  }

  const renderNavLinks = (mobile = false) => {
    const hoverColor = effectiveRole === 'admin' ? 'hover:text-purple-600' : 'hover:text-blue-600';
    const linkClass = mobile
      ? `block text-gray-700 ${hoverColor} font-medium py-2 transition-colors`
      : `text-gray-700 ${hoverColor} font-medium transition-colors`;

    if (!effectiveLoggedIn) {
      const showHome = pathname === '/login' || pathname === '/register'
      return (
        <>
          {showHome && <Link href="/" className={linkClass}>🏠 Trang chủ</Link>}
          <Link href="/register" className={linkClass}>📝 Đăng ký</Link>
          <Link href="/login" className={linkClass}>🔐 Đăng nhập</Link>
        </>
      )
    }

    if (effectiveRole === 'admin') {
      return (
        <>
          <Link href="/admin/dashboard" className={linkClass}>📊 Dashboard</Link>
          <Link href="/admin/users" className={linkClass}>👥 Người dùng</Link>
          <Link href="/admin/companies" className={linkClass}>🏢 Doanh nghiệp</Link>
          <button
            onClick={handleLogout}
            className={mobile
              ? 'w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition'
              : 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition'
            }
          >
            🚪 Đăng xuất
          </button>
        </>
      )
    }

    if (effectiveRole === 'recruiter') {
      return (
        <>
          <Link href="/recruiter/dashboard" className={linkClass}>📊 Dashboard</Link>
          <Link href="/recruiter/search" className={linkClass}>🔍 Tìm kiếm</Link>
          <button
            onClick={handleLogout}
            className={mobile
              ? 'w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition'
              : 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition'
            }
          >
            🚪 Đăng xuất
          </button>
        </>
      )
    }

    // candidate
    return (
      <>
        <Link href="/dashboard" className={linkClass}>👤 Hồ sơ</Link>
        <Link href="/portfolio" className={linkClass}>📁 Portfolio</Link>
        <button
          onClick={handleLogout}
          className={mobile
            ? 'w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition'
            : 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition'
          }
        >
          🚪 Đăng xuất
        </button>
      </>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href={effectiveRole === 'admin' ? '/admin/dashboard' : '/'} className="text-2xl font-extrabold text-blue-600">
            {effectiveRole === 'admin' ? '🛡️ Admin Panel' : 'Portfolio CV Hub'}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 items-center">
            {!loading && (
              <div className={`flex gap-6 items-center ${effectiveRole === 'admin' ? '[&_a]:text-gray-700 [&_a:hover]:text-purple-600' : ''}`}>
                {renderNavLinks(false)}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-2xl text-gray-800"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-4 border-t pt-4">
            {!loading && renderNavLinks(true)}
          </div>
        )}
      </div>
    </nav>
  )
}
