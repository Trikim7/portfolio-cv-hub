'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Toast, useToast } from '@/components/Toast'
import {
  Building2, Rocket, Paintbrush, AlignLeft,
  Check, FileText, Code2, RefreshCw,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type Template = 'traditional' | 'modern' | 'creative' | 'minimal'
type Locale = 'vi' | 'en'
type ExportFormat = 'pdf' | 'html'

function TemplateIcon({ id, className }: { id: string; className?: string }) {
  const cls = className ?? 'w-5 h-5'
  if (id === 'building') return <Building2 className={cls} />
  if (id === 'rocket') return <Rocket className={cls} />
  if (id === 'brush') return <Paintbrush className={cls} />
  return <AlignLeft className={cls} />
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('access_token') ||
    null
  )
}

export default function CVGeneratorPanel() {
  const { t } = useTranslation()
  const [template, setTemplate] = useState<Template>('modern')
  const [locale, setLocale] = useState<Locale>('vi')
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const { toast, showToast, closeToast } = useToast()

  const TEMPLATES = [
    { id: 'traditional' as Template, name: 'Traditional', description: t('cvGenerator.templateTraditional'), icon: 'building', color: 'text-slate-800', border: 'border-slate-800', bg: 'bg-slate-50' },
    { id: 'modern' as Template,      name: 'Modern',      description: t('cvGenerator.templateModern'),      icon: 'rocket',   color: 'text-blue-600',  border: 'border-blue-500',  bg: 'bg-blue-50' },
    { id: 'creative' as Template,    name: 'Creative',    description: t('cvGenerator.templateCreative'),    icon: 'brush',    color: 'text-purple-600',border: 'border-purple-500',bg: 'bg-purple-50' },
    { id: 'minimal' as Template,     name: 'Minimal',     description: t('cvGenerator.templateMinimal'),     icon: 'minimal',  color: 'text-gray-700',  border: 'border-gray-400',  bg: 'bg-gray-50' },
  ]

  const fetchPreview = useCallback(async () => {
    const token = getAuthToken()
    if (!token) {
      setPreviewHtml(`<p style="padding:20px;color:#888;">${t('cvGenerator.loginRequired')}</p>`)
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
    } catch {
      showToast(t('cvGenerator.loadPreviewError'), 'error')
      setPreviewHtml(`<p style="padding:20px;color:#c00;">${t('cvGenerator.previewError')}</p>`)
    } finally {
      setLoadingPreview(false)
    }
  }, [template, locale, t]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchPreview() }, [fetchPreview])

  const handleDownload = async (fmt: ExportFormat) => {
    const token = getAuthToken()
    if (!token) { showToast(t('cvGenerator.loginToDownload'), 'error'); return }
    setDownloading(true)
    try {
      const res = await fetch(
        `${API_URL}/api/cv/generate?template=${template}&locale=${locale}&format=${fmt}`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const ext = fmt === 'pdf' ? 'pdf' : 'html'
      const filename = `cv_${template}_${locale}.${ext}`
      const a = document.createElement('a')
      a.href = url; a.download = filename
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
      showToast(`${t('cvGenerator.downloadSuccess')} ${fmt.toUpperCase()}!`, 'success')
    } catch (err: any) {
      showToast(err.message || t('cvGenerator.downloadError'), 'error')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow">
        <h2 className="text-xl font-bold mb-1">{t('cvGenerator.title')}</h2>
        <p className="text-blue-100 text-sm">{t('cvGenerator.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Config */}
        <div className="lg:col-span-1 space-y-5">
          {/* Template selector */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              {t('cvGenerator.chooseTemplate')}
            </h3>
            <div className="space-y-3">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  id={`cv-template-${tpl.id}`}
                  onClick={() => setTemplate(tpl.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${template === tpl.id
                    ? `${tpl.border} ${tpl.bg} shadow-sm`
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <TemplateIcon id={tpl.icon} className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${template === tpl.id ? tpl.color : 'text-gray-800'}`}>{tpl.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{tpl.description}</p>
                  </div>
                  {template === tpl.id && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Locale selector */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
              {t('cvGenerator.cvLanguage')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(['vi', 'en'] as const).map((l) => (
                <button
                  key={l}
                  id={`cv-locale-${l}`}
                  onClick={() => setLocale(l)}
                  className={`py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${locale === l
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  {l === 'vi' ? 'VI — Tiếng Việt' : 'EN — English'}
                </button>
              ))}
            </div>
          </div>

          {/* Download */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
              {t('cvGenerator.download')}
            </h3>
            <div className="space-y-2">
              <button
                id="cv-download-pdf"
                onClick={() => handleDownload('pdf')}
                disabled={downloading || loadingPreview}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
              >
                {downloading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block" /> : <FileText className="w-4 h-4" />}
                {t('cvGenerator.downloadPDF')}
              </button>
              <button
                id="cv-download-html"
                onClick={() => handleDownload('html')}
                disabled={downloading || loadingPreview}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700 border border-gray-300 rounded-xl font-semibold text-sm transition-all"
              >
                <Code2 className="w-4 h-4" />
                {t('cvGenerator.downloadHTML')}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">{t('cvGenerator.cvFromData')}</p>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-gray-500 font-mono">cv_{template}_{locale}.pdf</span>
              </div>
              <div className="flex items-center gap-2">
                {loadingPreview && <span className="text-xs text-blue-500 animate-pulse">{t('cvGenerator.loadingPreview')}</span>}
                <button
                  id="cv-refresh-preview"
                  onClick={fetchPreview}
                  disabled={loadingPreview}
                  className="text-xs text-gray-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition"
                  title={t('cvGenerator.refresh')}
                >
                  <RefreshCw className="w-3.5 h-3.5 inline" /> {t('cvGenerator.refresh')}
                </button>
              </div>
            </div>

            <div className="relative" style={{ minHeight: '600px' }}>
              {loadingPreview && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                    <p className="text-sm text-gray-500">{t('cvGenerator.renderingCV')}</p>
                  </div>
                </div>
              )}
              {previewHtml ? (
                <iframe srcDoc={previewHtml} sandbox="allow-same-origin allow-scripts" title="CV Preview" className="w-full border-0" style={{ height: '750px' }} />
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-400">
                  <div className="text-center">
                    <div className="flex justify-center mb-3"><FileText className="w-12 h-12 text-gray-300" /></div>
                    <p className="text-sm">{t('cvGenerator.previewPlaceholder')}</p>
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
