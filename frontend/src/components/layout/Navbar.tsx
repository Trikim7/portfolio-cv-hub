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
    window.dispatchEvent(new Event('logout'))
    router.push('/')
  }

  const renderNavLinks = (mobile = false) => {
    const linkClass = mobile
      ? 'block text-gray-700 hover:text-blue-600 font-medium py-2'
      : 'text-gray-700 hover:text-blue-600 font-medium'

    if (!isLoggedIn) {
      return (
        <>
          <Link href="/register" className={linkClass}>📝 Đăng ký</Link>
          <Link href="/login" className={linkClass}>🔐 Đăng nhập</Link>
        </>
      )
    }

    if (role === 'admin') {
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

    if (role === 'recruiter') {
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
    <nav className={`${role === 'admin' ? 'bg-gray-900' : 'bg-white'} shadow-md sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className={`text-2xl font-bold ${role === 'admin' ? 'text-purple-400' : 'text-blue-600'}`}>
            {role === 'admin' ? '🛡️ Admin Panel' : 'Portfolio CV Hub'}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 items-center">
            {!loading && (
              <div className={`flex gap-6 items-center ${role === 'admin' ? '[&_a]:text-gray-300 [&_a:hover]:text-purple-400' : ''}`}>
                {renderNavLinks(false)}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden text-2xl ${role === 'admin' ? 'text-white' : ''}`}
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
