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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-lg shadow-xl max-w-3xl w-full text-center space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🔐 Đăng nhập
            </h1>
            <p className="text-gray-600 text-lg">Bạn là ai?</p>
          </div>

          {oauthError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-left">
              <strong className="block mb-1">
                Đăng nhập {oauthError.provider || 'bằng mạng xã hội'} thất bại
              </strong>
              <span className="break-words">{oauthError.error}</span>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Candidate Option */}
            <button
              onClick={() => setRole('candidate')}
              className="p-8 border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition group"
            >
              <div className="text-5xl mb-4">👤</div>
              <h2 className="text-2xl font-bold text-blue-600 mb-2 group-hover:text-blue-700">
                Ứng viên
              </h2>
              <p className="text-gray-600 text-sm">
                Quản lý hồ sơ, portfolio và xem lời mời tuyển dụng
              </p>
            </button>

            {/* Recruiter Option */}
            <button
              onClick={() => setRole('recruiter')}
              className="p-8 border-2 border-green-300 rounded-lg hover:bg-green-50 transition group"
            >
              <div className="text-5xl mb-4">🏢</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2 group-hover:text-green-700">
                Doanh nghiệp
              </h2>
              <p className="text-gray-600 text-sm">
                Tìm kiếm ứng viên và gửi lời mời tuyển dụng
              </p>
            </button>

            {/* Admin Option */}
            <button
              onClick={() => setRole('admin')}
              className="p-8 border-2 border-purple-300 rounded-lg hover:bg-purple-50 transition group"
            >
              <div className="text-5xl mb-4">🛡️</div>
              <h2 className="text-2xl font-bold text-purple-600 mb-2 group-hover:text-purple-700">
                Quản trị viên
              </h2>
              <p className="text-gray-600 text-sm">
                Quản lý hệ thống và duyệt doanh nghiệp
              </p>
            </button>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <p className="text-gray-600">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => setRole(null)}
          className="mb-6 text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
        >
          ← Quay lại chọn vai trò
        </button>

        {role === 'candidate' && <LoginForm />}
        {role === 'recruiter' && <RecruiterLoginForm />}
        {role === 'admin' && <AdminLoginForm />}
      </div>
    </div>
  )
}
