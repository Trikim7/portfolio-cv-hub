'use client'

import { Settings, Wrench } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5" />
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt Hệ thống</h1>
        </div>
        <p className="text-sm text-gray-500">Quản lý cấu hình hệ thống</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="flex justify-center mb-4 opacity-25">
          <Wrench className="w-12 h-12" />
        </div>
        <h2 className="text-lg font-semibold text-gray-400 mb-2">Chức năng đang phát triển</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Tính năng cài đặt hệ thống sẽ được cập nhật trong phiên bản tiếp theo.
        </p>
      </div>
    </div>
  )
}
