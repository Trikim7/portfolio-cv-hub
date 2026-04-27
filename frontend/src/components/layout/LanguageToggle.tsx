'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, ChevronDown } from 'lucide-react'

interface LanguageToggleProps {
  /** 'light' = white text on dark/gradient background (e.g. portfolio hero / sidebar)
   *  'dark'  = gray text on white background (default, navbar) */
  variant?: 'light' | 'dark'
  /** If true, dropdown opens upward (use when near bottom of screen, e.g. admin sidebar) */
  dropUp?: boolean
}

export default function LanguageToggle({ variant = 'dark', dropUp = false }: LanguageToggleProps) {
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

  const triggerClass =
    variant === 'light'
      ? 'w-full flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm border border-white/40 bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-all shadow-md'
      : 'flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium'

  // Dropdown position: open upward if dropUp, else downward
  const dropdownPositionClass = dropUp
    ? 'bottom-full mb-2 right-0'
    : 'top-full mt-2 right-0'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={triggerClass}
        title="Chọn ngôn ngữ / Select language"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ml-auto ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown — always white, z-[9999] to escape fixed sidebars / stacking contexts */}
      {isOpen && (
        <div className={`absolute ${dropdownPositionClass} w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] overflow-hidden`}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                language === lang.code
                  ? 'bg-violet-50 text-violet-700 border-l-4 border-violet-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && <span className="ml-auto text-violet-600">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
