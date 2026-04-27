'use client'

import { useTranslation } from 'react-i18next'
import { I18nText } from '@/types'

const tryParseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

const unwrapI18nString = (value: string): string => {
  let current: unknown = value

  for (let i = 0; i < 4; i++) {
    if (typeof current === 'string') {
      const trimmed = current.trim()
      if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) return trimmed
      const parsed = tryParseJson(trimmed)
      if (parsed === current) return trimmed
      current = parsed
      continue
    }

    if (current && typeof current === 'object' && !Array.isArray(current)) {
      const record = current as Record<string, unknown>
      if (typeof record.vi === 'string') {
        current = record.vi
        continue
      }
      if (typeof record.en === 'string') {
        current = record.en
        continue
      }
      const first = Object.values(record).find((v) => typeof v === 'string')
      if (typeof first === 'string') {
        current = first
        continue
      }
    }
    break
  }

  return typeof current === 'string' ? current : ''
}

/**
 * Hook để resolve i18n text (JSONB từ backend) theo ngôn ngữ hiện tại.
 *
 * Backend lưu các field như `bio`, `description` dưới dạng JSONB:
 *   { "vi": "Mô tả tiếng Việt", "en": "English description" }
 *
 * Hook này sẽ:
 * 1. Trả về text theo ngôn ngữ hiện tại (i18n.language)
 * 2. Fallback sang ngôn ngữ khác nếu không có
 * 3. Nếu là string thuần (legacy), trả về nguyên bản
 */
export function useI18nText() {
  const { i18n } = useTranslation()

  const resolveText = (value: I18nText): string => {
    if (!value) return ''
    if (typeof value === 'string') return unwrapI18nString(value)

    const lang = i18n.language || 'vi'

    // Thử ngôn ngữ hiện tại trước
    if (value[lang]) return unwrapI18nString(value[lang])

    // Fallback: vi → en → bất kỳ key nào có giá trị
    const fallbackOrder = lang === 'vi' ? ['vi', 'en'] : ['en', 'vi']
    for (const fb of fallbackOrder) {
      if (value[fb]) return unwrapI18nString(value[fb])
    }

    // Cuối cùng lấy value đầu tiên có nội dung
    const first = Object.values(value).find(v => typeof v === 'string' && v) || ''
    return typeof first === 'string' ? unwrapI18nString(first) : ''
  }

  return resolveText
}
