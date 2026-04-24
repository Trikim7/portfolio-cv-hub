'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/services/api'
import { CandidateAnalytics } from '@/types'

export default function CandidateStatsCard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<CandidateAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchStats = async () => {
      try {
        const data = await apiClient.getCandidateAnalytics()
        if (!mounted) return
        setStats(data)
        setError(null)
      } catch (err: unknown) {
        if (!mounted) return
        if (axios.isAxiosError(err) && typeof err.response?.data?.detail === 'string') {
          setError(err.response.data.detail)
        } else {
          setError(t('analytics.fetchStatsError'))
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchStats()
    return () => { mounted = false }
  }, [t])

  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">{t('analytics.statsTitle')}</h2>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
          <div className="h-24 rounded-xl bg-gray-100" />
          <div className="h-24 rounded-xl bg-gray-100" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">{t('analytics.totalViews')}</p>
            <p className="mt-2 text-3xl font-extrabold text-blue-900">{(stats?.total_views ?? 0).toLocaleString()}</p>
            <p className="text-xs text-blue-700 mt-1">{t('analytics.totalViewsSub')}</p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">{t('analytics.totalInvitations')}</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900">{(stats?.total_invitations ?? 0).toLocaleString()}</p>
            <p className="text-xs text-emerald-700 mt-1">{t('analytics.totalInvitationsSub')}</p>
          </div>
        </div>
      )}
    </section>
  )
}