'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CandidateSearch from '@/components/recruiter/CandidateSearch'
import { useRecruiter } from '@/hooks/useRecruiter'
import { useAuth } from '@/hooks/AuthContext'
import { PageShell } from '@/components/layout/DashboardShell'
import { useTranslation } from 'react-i18next'

export default function RecruiterSearchPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { role, loading: authLoading } = useAuth()
  const { fetchCompanyProfile, loading: recruiterLoading } = useRecruiter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      if (authLoading) return
      if (!role) {
        router.push('/')
        return
      }
      if (role !== 'recruiter') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('role')
        router.push('/')
        return
      }
      try {
        const companyData = await fetchCompanyProfile()
        if (companyData && companyData.status === 'pending') {
          router.push('/recruiter/waiting-approval')
          return
        }
        setIsAuthorized(true)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('role')
        router.push('/')
      }
    }
    checkAuth()
  }, [role, authLoading, fetchCompanyProfile, router])

  if (authLoading || recruiterLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-600">{t('common.checkingInfo')}</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) return null

  return (
    <PageShell
      accent="purple"
      title={t('search.pageTitle')}
      subtitle={t('search.pageSubtitle')}
      backHref="/recruiter/dashboard"
      backLabel="Dashboard"
      headerAction={
        <Link
          href="/recruiter/ranking"
          className="bg-white text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-xl text-sm font-semibold transition shadow"
        >
          {t('search.switchToRanking')}
        </Link>
      }
    >
      <CandidateSearch />
    </PageShell>
  )
}
