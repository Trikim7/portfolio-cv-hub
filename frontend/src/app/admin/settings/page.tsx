'use client'

export default function AdminSettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">⚙️ Cài đặt Hệ thống</h1>
        <p className="text-sm text-gray-500">Quản lý cấu hình hệ thống</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="text-5xl mb-4 opacity-30">🔧</div>
        <h2 className="text-lg font-semibold text-gray-400 mb-2">Chức năng đang phát triển</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Tính năng cài đặt hệ thống sẽ được cập nhật trong phiên bản tiếp theo.
        </p>
      </div>
    </div>
  )
}
