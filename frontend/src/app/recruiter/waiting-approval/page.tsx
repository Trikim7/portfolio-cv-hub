'use client'

import Link from 'next/link'

export default function WaitingApprovalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-6">
        <div className="text-6xl">⏳</div>
        
        <h1 className="text-2xl font-bold text-gray-800">Chờ xác nhận</h1>
        
        <p className="text-gray-600">
          Công ty của bạn đang chờ Admin xác nhận. Quá trình này thường mất 1-2 ngày làm việc.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
          <p className="font-semibold text-yellow-800">📋 Các bước tiếp theo:</p>
          <ul className="text-left text-sm text-gray-700 space-y-2">
            <li>✓ Admin sẽ kiểm tra thông tin công ty</li>
            <li>✓ Xác minh các chi tiết đăng ký</li>
            <li>✓ Phê duyệt và kích hoạt tài khoản</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 Sau khi được duyệt, bạn sẽ có thể:
          </p>
          <ul className="text-left text-sm text-gray-700 mt-2 space-y-1">
            <li>• Tìm kiếm ứng viên</li>
            <li>• Gửi lời mời làm việc</li>
            <li>• So sánh hồ sơ ứng viên</li>
            <li>• Quản lý thông tin công ty</li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">Email xác nhận sẽ được gửi tới:</p>
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="font-mono text-sm text-gray-800">Kiểm tra email (bao gồm mục spam)</p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 space-y-2">
          <p className="text-sm text-gray-600">Muốn làm gì tiếp?</p>
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
            >
              🏠 Trang chủ
            </Link>
            <Link
              href="/recruiter/login"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              🔄 Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
