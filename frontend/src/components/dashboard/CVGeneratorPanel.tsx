'use client'

/**
 * CVGeneratorPanel — Phase 2: Auto-generate CV từ Portfolio data.
 *
 * Architecture:
 *   - Sidebar: chọn template (4 loại) + locale (VI/EN)
 *   - Preview pane: iframe hiển thị HTML từ GET /api/cv/preview
 *   - Actions: Download PDF / Download HTML
 */

import { useState, useEffect, useCallback } from 'react'
import { Toast, useToast } from '@/components/Toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ─── Types ────────────────────────────────────────────────────────────────────

type Template = 'traditional' | 'modern' | 'creative' | 'minimal'
type Locale = 'vi' | 'en'
type ExportFormat = 'pdf' | 'html'

interface TemplateInfo {
  id: Template
  name: string
  description: string
  icon: string
  color: string
  border: string
  bg: string
}

// ─── Template catalog ─────────────────────────────────────────────────────────

const TEMPLATES: TemplateInfo[] = [
  {
    id: 'traditional',
    name: 'Traditional',
    description: 'Chuyên nghiệp, phù hợp ngành tài chính/luật',
    icon: '🏛️',
    color: 'text-slate-800',
    border: 'border-slate-800',
    bg: 'bg-slate-50',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Hiện đại, nổi bật cho IT & startup',
    icon: '🚀',
    color: 'text-blue-600',
    border: 'border-blue-500',
    bg: 'bg-blue-50',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Sáng tạo, dành cho design & marketing',
    icon: '🎨',
    color: 'text-purple-600',
    border: 'border-purple-500',
    bg: 'bg-purple-50',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Tối giản, đọc nhanh cho mọi ngành',
    icon: '⬜',
    color: 'text-gray-700',
    border: 'border-gray-400',
    bg: 'bg-gray-50',
  },
]

// ─── Helper ───────────────────────────────────────────────────────────────────

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('access_token') ||
    null
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CVGeneratorPanel() {
  const [template, setTemplate] = useState<Template>('modern')
  const [locale, setLocale] = useState<Locale>('vi')
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const { toast, showToast, closeToast } = useToast()

  // ─── Fetch preview HTML ────────────────────────────────────────────────────

  const fetchPreview = useCallback(async () => {
    const token = getAuthToken()
    if (!token) {
      setPreviewHtml('<p style="padding:20px;color:#888;">Vui lòng đăng nhập để xem preview.</p>')
      return
    }

    setLoadingPreview(true)
    try {
      const res = await fetch(
        `${API_URL}/api/cv/preview?template=${template}&locale=${locale}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setPreviewHtml(data.html || '')
    } catch (err) {
      showToast('Không thể tải preview CV', 'error')
      setPreviewHtml('<p style="padding:20px;color:#c00;">Lỗi khi tải preview.</p>')
    } finally {
      setLoadingPreview(false)
    }
  }, [template, locale]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPreview()
  }, [fetchPreview])

  // ─── Download ──────────────────────────────────────────────────────────────

  const handleDownload = async (fmt: ExportFormat) => {
    const token = getAuthToken()
    if (!token) {
      showToast('Vui lòng đăng nhập', 'error')
      return
    }

    setDownloading(true)
    try {
      const res = await fetch(
        `${API_URL}/api/cv/generate?template=${template}&locale=${locale}&format=${fmt}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }

      // Trigger browser download
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const ext = fmt === 'pdf' ? 'pdf' : 'html'
      const filename = `cv_${template}_${locale}.${ext}`
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      showToast(`Đã tải xuống CV dạng ${fmt.toUpperCase()}!`, 'success')
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải xuống CV', 'error')
    } finally {
      setDownloading(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow">
        <h2 className="text-xl font-bold mb-1">Sinh CV tự động</h2>
        <p className="text-blue-100 text-sm">
          Sinh CV từ dữ liệu portfolio của bạn - chọn template, xem trước và tải xuống.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Config panel ──────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-5">
          {/* Template selector */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Chọn Template
            </h3>
            <div className="space-y-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  id={`cv-template-${t.id}`}
                  onClick={() => setTemplate(t.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${template === t.id
                    ? `${t.border} ${t.bg} shadow-sm`
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${template === t.id ? t.color : 'text-gray-800'}`}>
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{t.description}</p>
                  </div>
                  {template === t.id && (
                    <span className="text-green-500 text-lg flex-shrink-0">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Locale selector */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
              Ngôn ngữ CV
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(['vi', 'en'] as const).map((l) => (
                <button
                  key={l}
                  id={`cv-locale-${l}`}
                  onClick={() => setLocale(l)}
                  className={`py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${locale === l
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                >
                  {l === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
                </button>
              ))}
            </div>
          </div>

          {/* Download actions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
              Tải xuống
            </h3>
            <div className="space-y-2">
              <button
                id="cv-download-pdf"
                onClick={() => handleDownload('pdf')}
                disabled={downloading || loadingPreview}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
              >
                {downloading ? (
                  <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                ) : (
                  <span>📄</span>
                )}
                Tải PDF
              </button>
              <button
                id="cv-download-html"
                onClick={() => handleDownload('html')}
                disabled={downloading || loadingPreview}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700 border border-gray-300 rounded-xl font-semibold text-sm transition-all"
              >
                <span></span>
                Tải HTML
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              CV được tạo từ dữ liệu portfolio hiện tại
            </p>
          </div>
        </div>

        {/* ── Right: Live Preview ──────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Preview header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-gray-500 font-mono">
                  cv_{template}_{locale}.pdf
                </span>
              </div>
              <div className="flex items-center gap-2">
                {loadingPreview && (
                  <span className="text-xs text-blue-500 animate-pulse">Đang tải preview...</span>
                )}
                <button
                  id="cv-refresh-preview"
                  onClick={fetchPreview}
                  disabled={loadingPreview}
                  className="text-xs text-gray-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition"
                  title="Làm mới preview"
                >
                  🔄 Làm mới
                </button>
              </div>
            </div>

            {/* Preview area */}
            <div className="relative" style={{ minHeight: '600px' }}>
              {loadingPreview && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full" />
                    <p className="text-sm text-gray-500">Đang render CV...</p>
                  </div>
                </div>
              )}
              {previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  sandbox="allow-same-origin allow-scripts"
                  title="CV Preview"
                  className="w-full border-0"
                  style={{ height: '750px' }}
                />
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-400">
                  <div className="text-center">
                    <p className="text-4xl mb-3">📄</p>
                    <p className="text-sm">Preview sẽ hiển thị ở đây</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={closeToast} />}
    </div>
  )
}
