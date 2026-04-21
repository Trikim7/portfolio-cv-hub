'use client'

import { useState } from 'react'
import Link from 'next/link'
import RegisterForm from '@/components/auth/RegisterForm'
import RecruiterRegisterForm from '@/components/auth/RecruiterRegisterForm'

export default function RegisterPage() {
  const [role, setRole] = useState<'candidate' | 'recruiter' | null>(null)

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
                href="/login"
                className="bg-white/10 hover:bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium transition ring-1 ring-white/20"
              >
                Đăng nhập
              </Link>
            </div>
            <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Đăng ký</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Bạn là ai?</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <button
              onClick={() => setRole('candidate')}
              className="group bg-white border border-gray-200 rounded-2xl p-6 text-left hover:border-blue-400 hover:shadow-md transition"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Ứng viên
              </p>
              <h2 className="mt-2 text-xl font-bold text-gray-900">Tôi tìm việc</h2>
              <p className="mt-2 text-sm text-gray-600">
                Tạo hồ sơ, quản lý portfolio và nhận lời mời từ các doanh nghiệp.
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-blue-700 group-hover:translate-x-1 transition">
                Đăng ký ứng viên →
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
                Đăng ký công ty để tìm kiếm ứng viên và gửi lời mời.
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-purple-700 group-hover:translate-x-1 transition">
                Đăng ký doanh nghiệp →
              </span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-8">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-blue-700 font-semibold hover:underline">
              Đăng nhập
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
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Đăng ký</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {role === 'candidate' ? 'Ứng viên' : 'Doanh nghiệp'}
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {role === 'candidate' ? <RegisterForm /> : <RecruiterRegisterForm />}
        </div>
      </div>
    </div>
  )
}
