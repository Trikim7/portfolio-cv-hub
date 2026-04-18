'use client'

import Link from 'next/link'

export default function WaitingApprovalPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-white/90 hover:text-white font-bold text-lg tracking-tight">
              Portfolio CV Hub
            </Link>
            <Link
              href="/recruiter/login"
              className="bg-white/10 hover:bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium transition ring-1 ring-white/20"
            >
              Đăng nhập
            </Link>
          </div>
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Doanh nghiệp</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Chờ duyệt</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900">Tài khoản đang chờ xác nhận</h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Thông tin công ty của bạn đã được gửi tới quản trị viên. Quá trình duyệt thường
            mất 1–2 ngày làm việc.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900">Các bước tiếp theo</h3>
          <ol className="mt-3 space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>Admin kiểm tra thông tin công ty</li>
            <li>Xác minh các chi tiết đăng ký</li>
            <li>Phê duyệt và kích hoạt tài khoản</li>
          </ol>
        </section>

        <section className="rounded-2xl border border-purple-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6">
          <h3 className="font-semibold text-purple-900">Sau khi được duyệt, bạn có thể</h3>
          <ul className="mt-3 text-sm text-gray-800 space-y-1.5">
            <li>• Tìm kiếm ứng viên</li>
            <li>• Gửi lời mời làm việc</li>
            <li>• So sánh hồ sơ ứng viên</li>
            <li>• Quản lý thông tin công ty</li>
          </ul>
        </section>

        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 text-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Trang chủ
          </Link>
          <Link
            href="/recruiter/login"
            className="flex-1 text-center px-4 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
