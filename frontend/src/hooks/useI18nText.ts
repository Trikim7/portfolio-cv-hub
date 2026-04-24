'use client'

import { useTranslation } from 'react-i18next'
import { I18nText } from '@/types'

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
    if (typeof value === 'string') return value

    const lang = i18n.language || 'vi'

    // Thử ngôn ngữ hiện tại trước
    if (value[lang]) return value[lang]

    // Fallback: vi → en → bất kỳ key nào có giá trị
    const fallbackOrder = lang === 'vi' ? ['vi', 'en'] : ['en', 'vi']
    for (const fb of fallbackOrder) {
      if (value[fb]) return value[fb]
    }

    // Cuối cùng lấy value đầu tiên có nội dung
    return Object.values(value).find(v => typeof v === 'string' && v) || ''
  }

  return resolveText
}
