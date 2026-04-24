'use client'

import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import LanguageToggle from '@/components/layout/LanguageToggle'

export default function WaitingApprovalPage() {
  const router = useRouter()
  const { t } = useTranslation()

  const handleGoHome = () => {
    // Xóa session → navbar sẽ hiện giao diện public thay vì recruiter links
    localStorage.removeItem('access_token')
    localStorage.removeItem('role')
    window.dispatchEvent(new Event('logout'))
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
              {t('waitingApproval.businessLabel')}
            </p>
            <LanguageToggle />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            {t('waitingApproval.pageTitle')}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900">{t('waitingApproval.accountPending')}</h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            {t('waitingApproval.pendingDesc')}
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900">{t('waitingApproval.nextSteps')}</h3>
          <ol className="mt-3 space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>{t('waitingApproval.step1')}</li>
            <li>{t('waitingApproval.step2')}</li>
            <li>{t('waitingApproval.step3')}</li>
          </ol>
        </section>

        <section className="rounded-2xl border border-purple-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6">
          <h3 className="font-semibold text-purple-900">{t('waitingApproval.afterApproval')}</h3>
          <ul className="mt-3 text-sm text-gray-800 space-y-1.5">
            <li>• {t('waitingApproval.feature1')}</li>
            <li>• {t('waitingApproval.feature2')}</li>
            <li>• {t('waitingApproval.feature3')}</li>
            <li>• {t('waitingApproval.feature4')}</li>
          </ul>
        </section>

        <div className="flex justify-center">
          <button
            onClick={handleGoHome}
            className="px-8 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            {t('waitingApproval.goHome')}
          </button>
        </div>
      </div>
    </div>
  )
}
