'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/services/api'
import { CandidateAnalytics } from '@/types'
import { Eye, Mail, TrendingUp, Users } from 'lucide-react'

function StatBox({
  value, label, sub, icon: Icon, tone,
}: {
  value: number | string
  label: string
  sub: string
  icon: React.FC<{ className?: string }>
  tone: 'blue' | 'emerald' | 'violet' | 'amber'
}) {
  const colors = {
    blue:    { bg: 'bg-blue-50',    border: 'border-blue-100',    text: 'text-blue-900',    sub: 'text-blue-600',    icon: 'text-blue-500'    },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-900', sub: 'text-emerald-600', icon: 'text-emerald-500' },
    violet:  { bg: 'bg-violet-50',  border: 'border-violet-100',  text: 'text-violet-900',  sub: 'text-violet-600',  icon: 'text-violet-500'  },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-100',   text: 'text-amber-900',   sub: 'text-amber-600',   icon: 'text-amber-500'   },
  }
  const c = colors[tone]

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5 flex items-start gap-4`}>
      <div className={`mt-0.5 ${c.icon}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold uppercase tracking-wide ${c.sub}`}>{label}</p>
        <p className={`mt-1 text-3xl font-extrabold ${c.text}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className={`text-xs mt-1 ${c.sub}`}>{sub}</p>
      </div>
    </div>
  )
}

export default function AnalyticsDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<CandidateAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    apiClient.getCandidateAnalytics()
      .then(data => { if (mounted) { setStats(data); setError(null) } })
      .catch(() => { if (mounted) setError(t('analytics.fetchError')) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [t])

  const tips = [
    { icon: Users,       tip: t('analytics.tip1'), done: true },
    { icon: TrendingUp,  tip: t('analytics.tip2'), done: false },
    { icon: Eye,         tip: t('analytics.tip3'), done: true },
    { icon: Mail,        tip: t('analytics.tip4'), done: false },
  ]

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="h-28 rounded-xl bg-gray-100" />
      ))}
    </div>
  )

  if (error) return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
  )

  return (
    <div className="space-y-6">
      {/* Main stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatBox
          value={stats?.total_views ?? 0}
          label={t('analytics.portfolioViews')}
          sub={t('analytics.portfolioViewsSub')}
          icon={Eye}
          tone="blue"
        />
        <StatBox
          value={stats?.total_invitations ?? 0}
          label={t('analytics.invitationsReceived')}
          sub={t('analytics.invitationsReceivedSub')}
          icon={Mail}
          tone="emerald"
        />
      </div>

      {/* Tips section */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-800">{t('analytics.tipsTitle')}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tips.map((item, i) => (
            <div key={i} className={`flex items-start gap-2.5 p-3 rounded-lg text-sm ${item.done ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
              <item.icon className={`w-4 h-4 mt-0.5 shrink-0 ${item.done ? 'text-green-500' : 'text-gray-400'}`} />
              <span>{item.tip}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        {t('analytics.realtimeNote')}
      </p>
    </div>
  )
}
