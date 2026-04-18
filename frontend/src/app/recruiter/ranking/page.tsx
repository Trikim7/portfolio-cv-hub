'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CandidateRanking from '@/components/recruiter/CandidateRanking'
import { useRecruiter } from '@/hooks/useRecruiter'
import { useAuth } from '@/hooks/AuthContext'

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Đang kiểm tra thông tin...</p>
        </div>
      </div>
    )
  }

  if (!ready) return null

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Ranking</h1>
            <p className="text-gray-600 mt-1">
              Chấm điểm 6 trục radar và xếp hạng ứng viên phù hợp với yêu cầu tuyển dụng.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/recruiter/search"
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              ← Tìm kiếm thường
            </Link>
            <Link
              href="/recruiter/dashboard"
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <CandidateRanking />
      </div>
    </div>
  )
}
