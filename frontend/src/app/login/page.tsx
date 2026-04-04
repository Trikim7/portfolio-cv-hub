'use client'

import { useState } from 'react'
import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'
import RecruiterLoginForm from '@/components/auth/RecruiterLoginForm'

export default function LoginPage() {
  const [role, setRole] = useState<'candidate' | 'recruiter' | null>(null)

  if (role === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-lg shadow-xl max-w-2xl w-full text-center space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🔐 Đăng nhập</h1>
            <p className="text-gray-600 text-lg">Bạn là ai?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Candidate Option */}
            <button
              onClick={() => setRole('candidate')}
              className="p-8 border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition group"
            >
              <div className="text-5xl mb-4">👤</div>
              <h2 className="text-2xl font-bold text-blue-600 mb-2 group-hover:text-blue-700">
                Ứng viên
              </h2>
              <p className="text-gray-600">
                Đăng nhập để quản lý hồ sơ, portfolio và xem lời mời tuyển dụng
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
              <p className="text-gray-600">
                Đăng nhập để tìm kiếm ứng viên và gửi lời mời tuyển dụng
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

        {role === 'candidate' ? <LoginForm /> : <RecruiterLoginForm />}
      </div>
    </div>
  )
}
