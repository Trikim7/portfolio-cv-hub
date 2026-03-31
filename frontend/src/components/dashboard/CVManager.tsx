'use client'

import { useState, useRef } from 'react'
import { useProfileContext } from '@/hooks/ProfileContext'
import { Toast, useToast } from '@/components/Toast'

export default function CVManager() {
  const { profile, uploadCV, setPrimaryCV, deleteCV } = useProfileContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { toast, showToast, closeToast } = useToast()

  const cvs = profile?.cvs || []

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      showToast('❌ Chỉ chấp nhận file PDF', 'error')
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      showToast('❌ File quá lớn, tối đa 5MB', 'error')
      return
    }

    setUploading(true)
    await uploadCV(file)
    setUploading(false)
    showToast(`✓ Đã tải lên CV "${file.name}"`, 'success')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSetPrimary = async (cvId: number) => {
    await setPrimaryCV(cvId)
    showToast('✓ Đã đặt làm CV chính', 'success')
  }

  const handleDeleteCV = async (cvId: number) => {
    if (confirm('Xóa CV này?')) {
      await deleteCV(cvId)
      showToast('✓ Đã xóa CV', 'success')
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">CV / Hồ sơ</h2>

      <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Tải lên CV (PDF)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
        />
        {uploading && <p className="text-sm text-orange-600 mt-2 animate-pulse">⏳ Đang tải lên...</p>}
      </div>

      <div className="space-y-3">
        {cvs.length === 0 ? (
          <p className="text-gray-500 italic">Chưa có CV nào.</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3">📋 Tổng {cvs.length} CV</p>
            {cvs.map((cv) => (
              <div
                key={cv.id}
                className={`flex items-center justify-between p-4 border rounded-lg transition hover:shadow-md ${
                  cv.is_primary ? 'border-orange-300 bg-orange-50' : 'border-orange-200 bg-white'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-bold text-gray-900">📄 {cv.file_name}</p>
                    {cv.is_primary && <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded font-semibold">⭐ CV chính</span>}
                  </div>
                  <p className="text-sm text-gray-600">
                    💾 {cv.file_size ? `${(cv.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'} • ⏰ {new Date(cv.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!cv.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(cv.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-semibold"
                    >
                      ⭐ Đặt chính
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteCV(cv.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-semibold"
                  >
                    ✕ Xóa
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {toast && <Toast {...toast} onClose={closeToast} />}
    </div>
  )
}
