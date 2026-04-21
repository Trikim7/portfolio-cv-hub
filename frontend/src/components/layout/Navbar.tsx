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

  const isAdminPage = pathname.startsWith('/admin')
  const isDashboardPage =
    pathname === '/dashboard' || pathname === '/recruiter/dashboard'
  const isPageShellPage =
    pathname === '/recruiter/search' || pathname === '/recruiter/ranking'
  // Public portfolio detail pages are standalone — no nav chrome needed
  const isPublicPortfolioPage = /^\/portfolio\/.+/.test(pathname)

  if (isAdminPage) return null
  if (isDashboardPage) return null
  if (isPageShellPage) return null
  if (isPublicPortfolioPage) return null

  const effectiveRole = role === 'admin' ? null : role
  const effectiveLoggedIn = role === 'admin' ? false : isLoggedIn

  const handleLogout = async () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('role')
    window.dispatchEvent(new Event('logout'))
    router.push('/')
  }

  const renderNavLinks = (mobile = false) => {
    const linkClass = mobile
      ? 'block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors'
      : 'text-gray-700 hover:text-blue-600 font-medium transition-colors'

    if (!effectiveLoggedIn) {
      const showHome = pathname === '/login' || pathname === '/register'
      return (
        <>
          {showHome && (
            <Link href="/" className={linkClass}>
              Trang chủ
            </Link>
          )}
          <Link href="/register" className={linkClass}>
            Đăng ký
          </Link>
          <Link href="/login" className={linkClass}>
            Đăng nhập
          </Link>
        </>
      )
    }

    if (effectiveRole === 'recruiter') {
      return (
        <>
          <Link href="/recruiter/dashboard" className={linkClass}>
            Dashboard
          </Link>
          <Link href="/recruiter/search" className={linkClass}>
            Tìm kiếm
          </Link>
          <Link href="/recruiter/ranking" className={linkClass}>
            AI Ranking
          </Link>
          <button
            onClick={handleLogout}
            className={
              mobile
                ? 'w-full px-4 py-2 text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 rounded-lg text-sm font-medium transition'
                : 'px-3 py-1.5 text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 rounded-lg text-sm font-medium transition'
            }
          >
            Đăng xuất
          </button>
        </>
      )
    }

    return (
      <>
        <Link href="/dashboard" className={linkClass}>
          Hồ sơ
        </Link>
        <Link href="/portfolio" className={linkClass}>
          Portfolio
        </Link>
        <button
          onClick={handleLogout}
          className={
            mobile
              ? 'w-full px-4 py-2 text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 rounded-lg text-sm font-medium transition'
              : 'px-3 py-1.5 text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 rounded-lg text-sm font-medium transition'
          }
        >
          Đăng xuất
        </button>
      </>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-extrabold text-blue-600 tracking-tight">
            Portfolio CV Hub
          </Link>

          <div className="hidden md:flex gap-6 items-center">
            {!loading && (
              <div className="flex gap-6 items-center">{renderNavLinks(false)}</div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-2xl text-gray-800"
            aria-label="Mở menu"
          >
            ≡
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-4 border-t pt-4">
            {!loading && renderNavLinks(true)}
          </div>
        )}
      </div>
    </nav>
  )
}
