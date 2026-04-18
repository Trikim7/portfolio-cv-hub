'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import SocialLoginButtons from '@/components/auth/SocialLoginButtons'

export default function LoginPage() {
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, password)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-14">
          <div className="flex items-center justify-between mb-10">
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
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Chào mừng trở lại</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Đăng nhập tài khoản</h1>
          <p className="text-white/70 text-sm mt-2">Hệ thống sẽ tự động điều hướng theo vai trò của bạn.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="flex-1 flex items-start justify-center px-4 -mt-8">
        <div className="w-full max-w-md">
          {oauthError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
              <strong className="block mb-1">
                Đăng nhập {oauthError.provider || 'bằng mạng xã hội'} thất bại
              </strong>
              <span className="break-words">{oauthError.error}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition shadow-sm"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <SocialLoginButtons disabled={loading} />

            <p className="text-center text-sm text-gray-500 mt-6">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Là Admin?{' '}
            <Link href="/login" className="hover:text-gray-600 underline">
              Đăng nhập tại đây
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
