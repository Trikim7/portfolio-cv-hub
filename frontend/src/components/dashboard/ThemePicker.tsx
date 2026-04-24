'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/services/api'
import { PortfolioTemplate } from '@/types'

interface ThemePickerProps {
  currentTemplateId: number | null | undefined
  onSaved?: (templateId: number | null) => void
}

export default function ThemePicker({ currentTemplateId, onSaved }: ThemePickerProps) {
  const { t } = useTranslation()
  const [templates, setTemplates] = useState<PortfolioTemplate[]>([])
  const [selected, setSelected] = useState<number | null>(currentTemplateId ?? null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    apiClient.getPublicTemplates().then(setTemplates).catch(() => {})
  }, [])

  useEffect(() => {
    setSelected(currentTemplateId ?? null)
  }, [currentTemplateId])

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiClient.setMyTemplate(selected)
      showToast(t('themePicker.saveSuccess'))
      onSaved?.(selected)
    } catch {
      showToast(t('themePicker.saveFailed'), false)
    } finally {
      setSaving(false)
    }
  }

  const changed = selected !== (currentTemplateId ?? null)

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm ${
          toast.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.ok ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      <p className="text-sm text-gray-500">{t('themePicker.subtitle')}</p>

      {templates.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">{t('themePicker.loading')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {templates.map(tpl => {
            const isSelected = selected === tpl.id
            const color = tpl.config_json?.primaryColor || '#3b5bdb'
            return (
              <button
                key={tpl.id}
                onClick={() => setSelected(tpl.id)}
                className={`relative text-left rounded-2xl border-2 overflow-hidden transition-all duration-200 hover:shadow-lg ${
                  isSelected ? 'border-blue-500 shadow-md ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="h-16 flex items-center px-4 gap-3" style={{ background: color }}>
                  <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xs">AV</div>
                  <div>
                    <div className="w-20 h-2 bg-white/70 rounded-full mb-1" />
                    <div className="w-14 h-1.5 bg-white/40 rounded-full" />
                  </div>
                </div>
                <div className="p-3 bg-gray-50 space-y-1.5">
                  <div className="w-full h-1.5 bg-gray-200 rounded-full" />
                  <div className="w-3/4 h-1.5 bg-gray-200 rounded-full" />
                  <div className="flex gap-1 mt-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-4 px-2 rounded-full text-[9px] flex items-center text-white font-bold"
                        style={{ background: color, opacity: 0.8 - i * 0.15 }}>skill</div>
                    ))}
                  </div>
                </div>
                <div className="px-3 pb-3 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-800">{tpl.name}</p>
                  <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{tpl.description}</p>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                    style={{ background: color }}>✓</div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {changed && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 shadow-sm"
        >
          {saving ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
          ) : '💾'}
          {saving ? t('themePicker.saving') : t('themePicker.save')}
        </button>
      )}
    </div>
  )
}
