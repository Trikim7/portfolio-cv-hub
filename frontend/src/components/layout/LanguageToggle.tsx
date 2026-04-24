'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const [language, setLanguage] = useState<string>('vi')
  const [isOpen, setIsOpen] = useState(false)

  // Initialize language from localStorage on client-side only
  useEffect(() => {
    const storedLang = localStorage.getItem('language') || 'vi'
    setLanguage(storedLang)
    i18n.changeLanguage(storedLang)
  }, [i18n])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
    i18n.changeLanguage(lang)
    setIsOpen(false)
  }

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ]

  const currentLang = languages.find(l => l.code === language) || languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
        title="Chọn ngôn ngữ / Select language"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2 transition-colors ${
                language === lang.code
                  ? 'bg-violet-50 text-violet-700 border-l-4 border-violet-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && <span className="ml-auto">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
