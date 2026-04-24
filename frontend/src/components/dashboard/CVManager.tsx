'use client'

import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useProfileContext } from '@/hooks/ProfileContext'
import { Toast, useToast } from '@/components/Toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function CVManager() {
  const { t, i18n } = useTranslation()
  const { profile, uploadCV, setPrimaryCV, deleteCV } = useProfileContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { toast, showToast, closeToast } = useToast()

  const cvs = profile?.cvs || []

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { showToast(t('cvManager.pdfOnly'), 'error'); return }
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) { showToast(t('cvManager.fileTooLarge'), 'error'); return }
    setUploading(true)
    await uploadCV(file)
    setUploading(false)
    showToast(`${t('cvManager.uploadSuccess')} "${file.name}"`, 'success')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSetPrimary = async (cvId: number) => {
    await setPrimaryCV(cvId)
    showToast(t('cvManager.setPrimarySuccess'), 'success')
  }

  const handleDeleteCV = async (cvId: number) => {
    if (confirm(t('cvManager.deleteConfirm'))) {
      await deleteCV(cvId)
      showToast(t('cvManager.deleteSuccess'), 'success')
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-6">{t('cvManager.title')}</h2>

      <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          {t('cvManager.uploadLabel')}
        </label>
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            title={t('cvManager.chooseFile')}
          />
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              uploading 
                ? 'bg-amber-200 text-amber-800' 
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}>
              {t('cvManager.chooseFile')}
            </div>
            <span className="text-sm text-gray-500">
              {fileInputRef.current?.files?.[0]?.name || t('cvManager.noFileChosen')}
            </span>
          </div>
        </div>
        {uploading && <p className="text-sm text-amber-700 mt-2 animate-pulse">{t('cvManager.uploading')}</p>}
      </div>

      <div className="space-y-3">
        {cvs.length === 0 ? (
          <p className="text-gray-500 italic">{t('cvManager.noCV')}</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3">{t('cvManager.total')} {cvs.length} {t('cvManager.totalCV')}</p>
            {cvs.map((cv) => (
              <div
                key={cv.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border ${
                  cv.is_primary ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-gray-900 truncate">{cv.file_name}</p>
                    {cv.is_primary && (
                      <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">
                        {t('cvManager.primaryBadge')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {cv.file_size ? `${(cv.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'} •{' '}
                    {new Date(cv.created_at).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {cv.file_path && (
                    <a
                      href={`${API_URL}/api/candidate/cvs/view/${cv.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-semibold"
                    >
                      {t('cvManager.viewCV')}
                    </a>
                  )}
                  {!cv.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(cv.id)}
                      className="px-3 py-1.5 bg-white border border-amber-400 text-amber-800 rounded-lg hover:bg-amber-50 text-sm font-semibold"
                    >
                      {t('cvManager.setPrimary')}
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteCV(cv.id)}
                    className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 text-sm font-semibold"
                  >
                    {t('cvManager.delete')}
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
