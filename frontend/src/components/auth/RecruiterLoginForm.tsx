'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/services/api'
import { Toast, useToast } from '@/components/Toast'
import { useAuth } from '@/hooks/AuthContext'

// Helper function to decode JWT and extract role
const decodeToken = (token: string): { role?: string } => {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch {
    return {}
  }
}

export default function RecruiterLoginForm() {
  const router = useRouter()
  const { checkAuth } = useAuth()
  const { toast, showToast, closeToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      showToast('Vui lòng điền đầy đủ thông tin', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.loginRecruiter(email, password)
      console.log('✓ Login response:', response)
      localStorage.setItem('access_token', response.access_token)
      // Extract role from token and save to localStorage
      const decoded = decodeToken(response.access_token)
      localStorage.setItem('role', decoded.role || 'recruiter')
      console.log('✓ Token and role saved to localStorage:', decoded.role || 'recruiter')
      
      // Notify AuthContext to update
      checkAuth()
      
      showToast('✓ Đăng nhập thành công!', 'success')
      
      // Small delay to ensure state updates before navigation
      setTimeout(() => {
        router.push('/recruiter/dashboard')
      }, 100)
    } catch (err: any) {
      console.error('✗ Login error:', err)
      showToast(err.response?.data?.detail || 'Đăng nhập thất bại', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Đăng nhập Doanh nghiệp</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="company@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="text-green-600 hover:underline">
          Đăng ký tại đây
        </Link>
      </p>

      {toast && <Toast {...toast} onClose={closeToast} />}
    </div>
  )
}
