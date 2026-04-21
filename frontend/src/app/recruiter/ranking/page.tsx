'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CandidateRanking from '@/components/recruiter/CandidateRanking'
import { useRecruiter } from '@/hooks/useRecruiter'
import { useAuth } from '@/hooks/AuthContext'
import { PageShell } from '@/components/layout/DashboardShell'

export default function RecruiterRankingPage() {
  const router = useRouter()
  const { role, loading: authLoading } = useAuth()
  const { fetchCompanyProfile, loading: recruiterLoading } = useRecruiter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const check = async () => {
      if (authLoading) return
      if (!role) {
        router.push('/')
        return
      }
      if (role !== 'recruiter') {
        router.push('/')
        return
      }
      try {
        const company = await fetchCompanyProfile()
        if (company && company.status === 'pending') {
          router.push('/recruiter/waiting-approval')
          return
        }
        setReady(true)
      } catch {
        router.push('/')
      }
    }
    check()
  }, [role, authLoading, fetchCompanyProfile, router])

  if (authLoading || recruiterLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-600">Đang kiểm tra thông tin...</p>
        </div>
      </div>
    )
  }

  if (!ready) return null

  return (
    <PageShell
      accent="purple"
      title="AI Ranking"
      subtitle="Xếp hạng ứng viên theo JD"
      backHref="/recruiter/dashboard"
      backLabel="Về Dashboard"
      headerAction={
        <Link
          href="/recruiter/search"
          className="bg-white/10 hover:bg-white/20 backdrop-blur ring-1 ring-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition"
        >
          Tìm kiếm thường
        </Link>
      }
    >
      <CandidateRanking />
    </PageShell>
  )
}
