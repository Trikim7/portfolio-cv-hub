'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/services/api'
import { Toast, useToast } from '@/components/Toast'

export default function RecruiterLoginPage() {
  const router = useRouter()
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
      showToast('✓ Đăng nhập thành công!', 'success')
      setTimeout(() => router.push('/recruiter/dashboard'), 1000)
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Đăng nhập thất bại', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2">🏢 Doanh nghiệp</h1>
        <p className="text-center text-gray-600 mb-6">Đăng nhập tài khoản recruiter</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📧 Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="company@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🔒 Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? '⏳ Đang xử lý...' : '✓ Đăng nhập'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            Chưa có tài khoản?{' '}
            <Link href="/recruiter/register" className="text-blue-600 font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Demo Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-semibold text-blue-700 mb-2">💡 Demo:</p>
          <p className="text-gray-700">
            Đăng ký recruiter → Chờ admin duyệt → Đăng nhập để xem dashboard
          </p>
        </div>

        {toast && <Toast {...toast} onClose={closeToast} />}
      </div>
    </div>
  )
}
