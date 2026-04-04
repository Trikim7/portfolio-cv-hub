'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('role')
    
    if (token) {
      setIsLoggedIn(true)
      // Redirect based on role
      if (role === 'recruiter') {
        router.push('/recruiter/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    )
  }

  if (isLoggedIn) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center space-y-8">
        <div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            PORTFOLIO CV HUB
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Nền tảng kết nối ứng viên và nhà tuyển dụng. Quản lý portfolio và tìm kiếm nhân tài một cách dễ dàng.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-bold text-gray-800 mb-2">Hồ sơ chuyên nghiệp</h3>
            <p className="text-sm text-gray-600">Xây dựng hồ sơ hoàn chỉnh với thông tin cá nhân, kỹ năng, kinh nghiệm</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">📂</div>
            <h3 className="font-bold text-gray-800 mb-2">Quản lý portfolio</h3>
            <p className="text-sm text-gray-600">Thêm và quản lý dự án, CV của bạn dễ dàng</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="font-bold text-gray-800 mb-2">Chia sẻ công khai</h3>
            <p className="text-sm text-gray-600">Tạo link công khai để chia sẻ portfolio của nhà tuyển dụng</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition text-lg"
          >
            📝 Đăng ký
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition text-lg"
          >
            🔐 Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
