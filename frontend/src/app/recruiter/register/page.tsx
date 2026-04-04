'use client'

import RecruiterRegisterForm from '@/components/auth/RecruiterRegisterForm'

export default function RecruiterRegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Portfolio CV Hub</h1>
          <p className="text-gray-600">Đăng ký doanh nghiệp tuyển dụng</p>
        </div>
        
        <RecruiterRegisterForm />
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Bạn đã có tài khoản?{' '}
            <a href="/login" className="text-blue-600 font-semibold hover:underline">
              Đăng nhập
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
