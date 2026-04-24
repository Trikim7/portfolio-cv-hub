import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import viTranslations from '@/locales/vi.json'
import enTranslations from '@/locales/en.json'

const resources = {
  vi: { translation: viTranslations },
  en: { translation: enTranslations },
}

// Get stored language from localStorage, default to 'vi'
const getStoredLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'vi'
  }
  return 'vi'
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(),
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
  })

export default i18n
