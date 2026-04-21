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
      showToast('Chỉ chấp nhận file PDF', 'error')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showToast('File quá lớn, tối đa 5MB', 'error')
      return
    }

    setUploading(true)
    await uploadCV(file)
    setUploading(false)
    showToast(`Đã tải lên CV "${file.name}"`, 'success')

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSetPrimary = async (cvId: number) => {
    await setPrimaryCV(cvId)
    showToast('Đã đặt làm CV chính', 'success')
  }

  const handleDeleteCV = async (cvId: number) => {
    if (confirm('Xóa CV này?')) {
      await deleteCV(cvId)
      showToast('Đã xóa CV', 'success')
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-6">CV / Hồ sơ</h2>

      <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Tải lên CV (PDF, tối đa 5MB)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
        />
        {uploading && (
          <p className="text-sm text-amber-700 mt-2 animate-pulse">Đang tải lên...</p>
        )}
      </div>

      <div className="space-y-3">
        {cvs.length === 0 ? (
          <p className="text-gray-500 italic">Chưa có CV nào.</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3">Tổng {cvs.length} CV</p>
            {cvs.map((cv) => (
              <div
                key={cv.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border ${
                  cv.is_primary
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-gray-900 truncate">{cv.file_name}</p>
                    {cv.is_primary && (
                      <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">
                        CV chính
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {cv.file_size ? `${(cv.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'} •{' '}
                    {new Date(cv.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {/* View/Download button — works for both Cloudinary URLs and local paths */}
                  {cv.file_path && (
                    <a
                      href={cv.file_path.startsWith('http') ? cv.file_path : `/api/candidate/cvs/${cv.id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-semibold"
                    >
                      Xem CV
                    </a>
                  )}
                  {!cv.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(cv.id)}
                      className="px-3 py-1.5 bg-white border border-amber-400 text-amber-800 rounded-lg hover:bg-amber-50 text-sm font-semibold"
                    >
                      Đặt chính
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteCV(cv.id)}
                    className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 text-sm font-semibold"
                  >
                    Xóa
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
