'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'
import RecruiterLoginForm from '@/components/auth/RecruiterLoginForm'
import AdminLoginForm from '@/components/auth/AdminLoginForm'

export default function LoginPage() {
  const [role, setRole] = useState<'candidate' | 'recruiter' | 'admin' | null>(null)
  const [oauthError, setOauthError] = useState<{ error: string; provider: string } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const err = params.get('error')
    if (!err) return
    setOauthError({ error: err, provider: params.get('provider') || '' })
    const url = new URL(window.location.href)
    url.searchParams.delete('error')
    url.searchParams.delete('provider')
    window.history.replaceState(null, '', url.pathname + url.search)
  }, [])

  if (role === null) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="text-white/90 hover:text-white font-bold text-lg tracking-tight">
                Portfolio CV Hub
              </Link>
              <Link
                href="/register"
                className="bg-white/10 hover:bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium transition ring-1 ring-white/20"
              >
                Đăng ký
              </Link>
            </div>
            <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Đăng nhập</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Bạn là ai?</h1>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {oauthError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
              <strong className="block mb-1">
                Đăng nhập {oauthError.provider || 'bằng mạng xã hội'} thất bại
              </strong>
              <span className="break-words">{oauthError.error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <button
              onClick={() => setRole('candidate')}
              className="group bg-white border border-gray-200 rounded-2xl p-6 text-left hover:border-blue-400 hover:shadow-md transition"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Ứng viên
              </p>
              <h2 className="mt-2 text-xl font-bold text-gray-900">Tôi tìm việc</h2>
              <p className="mt-2 text-sm text-gray-600">
                Quản lý hồ sơ, portfolio và nhận lời mời từ doanh nghiệp.
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-blue-700 group-hover:translate-x-1 transition">
                Tiếp tục →
              </span>
            </button>

            <button
              onClick={() => setRole('recruiter')}
              className="group bg-white border border-gray-200 rounded-2xl p-6 text-left hover:border-purple-400 hover:shadow-md transition"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-700">
                Doanh nghiệp
              </p>
              <h2 className="mt-2 text-xl font-bold text-gray-900">Tôi tuyển dụng</h2>
              <p className="mt-2 text-sm text-gray-600">
                Tìm kiếm ứng viên và xếp hạng bằng AI theo JD của bạn.
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-purple-700 group-hover:translate-x-1 transition">
                Tiếp tục →
              </span>
            </button>

            <button
              onClick={() => setRole('admin')}
              className="group bg-white border border-gray-200 rounded-2xl p-6 text-left hover:border-gray-400 hover:shadow-md transition"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Quản trị viên
              </p>
              <h2 className="mt-2 text-xl font-bold text-gray-900">Quản lý hệ thống</h2>
              <p className="mt-2 text-sm text-gray-600">
                Duyệt doanh nghiệp và giám sát người dùng.
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-gray-700 group-hover:translate-x-1 transition">
                Tiếp tục →
              </span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-8">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-blue-700 font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-white/90 hover:text-white font-bold text-lg tracking-tight">
              Portfolio CV Hub
            </Link>
            <button
              type="button"
              onClick={() => setRole(null)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium transition ring-1 ring-white/20"
            >
              Đổi vai trò
            </button>
          </div>
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Đăng nhập</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {role === 'candidate' && 'Ứng viên'}
            {role === 'recruiter' && 'Doanh nghiệp'}
            {role === 'admin' && 'Quản trị viên'}
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {role === 'candidate' && <LoginForm />}
          {role === 'recruiter' && <RecruiterLoginForm />}
          {role === 'admin' && <AdminLoginForm />}
        </div>
      </div>
    </div>
  )
}
