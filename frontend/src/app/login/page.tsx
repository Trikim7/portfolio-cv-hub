'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Portfolio CV Hub</h1>
          <p className="text-blue-300 mt-2 text-sm">Nền tảng kết nối ứng viên và nhà tuyển dụng</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Đăng nhập</h2>

          {error && (
            <div className="mb-5 p-3 bg-red-500/20 border border-red-400/40 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-blue-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-blue-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition text-sm select-none"
                >
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 mt-2"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-blue-300/60 text-xs">hoặc</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* Register links */}
          <div className="space-y-2 text-center text-sm">
            <p className="text-blue-200">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-blue-400 hover:text-white font-medium transition-colors">
                Đăng ký ứng viên
              </Link>
            </p>
            <p className="text-blue-200">
              Là nhà tuyển dụng?{' '}
              <Link href="/recruiter/register" className="text-blue-400 hover:text-white font-medium transition-colors">
                Đăng ký doanh nghiệp
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-blue-400/50 text-xs mt-6">
          Hệ thống sẽ tự động điều hướng dựa theo vai trò tài khoản của bạn.
        </p>
      </div>
    </div>
  )
}
