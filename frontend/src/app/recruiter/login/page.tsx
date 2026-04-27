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
      <p className="text-gray-500 text-sm">{t('common.loading')}</p>
    </div>
  )
}
