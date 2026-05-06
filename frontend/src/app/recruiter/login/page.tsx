'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

// Redirect to the unified login page
export default function RecruiterLoginRedirect() {
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-500 text-sm">
        <span className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        <span className="sr-only">{t('common.loading')}</span>
      </div>
    </div>
  )
}
