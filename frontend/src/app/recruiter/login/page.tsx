'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/services/api'
import { Toast, useToast } from '@/components/Toast'
import { useAuth } from '@/hooks/AuthContext'

export default function RecruiterLoginPage() {
  const router = useRouter()
  const { checkAuth } = useAuth()
  const { toast, showToast, closeToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      showToast('Vui lòng điền email và mật khẩu', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.login(email, password)
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('token_type', response.token_type)
      localStorage.setItem('role', response.user.role)
      checkAuth()
      window.dispatchEvent(new Event('login'))
      showToast('Đăng nhập thành công!', 'success')
      setTimeout(() => router.push('/recruiter/dashboard'), 300)
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Đăng nhập thất bại', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-white/90 hover:text-white font-bold text-lg tracking-tight">
              Portfolio CV Hub
            </Link>
            <Link
              href="/recruiter/register"
              className="bg-white/10 hover:bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium transition ring-1 ring-white/20"
            >
              Đăng ký
            </Link>
          </div>
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Doanh nghiệp</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Đăng nhập</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="company@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6 pt-6 border-t border-gray-100">
            Chưa có tài khoản?{' '}
            <Link href="/recruiter/register" className="text-purple-700 font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>

          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl text-sm">
            <p className="font-semibold text-purple-800 mb-1">Quy trình:</p>
            <p className="text-gray-700">
              Đăng ký doanh nghiệp → Chờ admin duyệt → Đăng nhập để dùng dashboard.
            </p>
          </div>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={closeToast} />}
    </div>
  )
}
