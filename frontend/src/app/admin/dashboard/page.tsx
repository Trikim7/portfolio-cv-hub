'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api'
import { DashboardStats, AdminCompany } from '@/types'
import {
  Users, Clock, FolderOpen, Handshake,
  Activity, ClipboardList, Settings, Zap,
  Info, Check, X, CheckCircle, AlertCircle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// â”€â”€â”€ Lucide icon helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  users:         Users,
  clock:         Clock,
  folder:        FolderOpen,
  handshake:     Handshake,
  chart:         Activity,
  list:          ClipboardList,
  settings:      Settings,
  lightning:     Zap,
  info:          Info,
  check:         Check,
  x:             X,
  'check-circle': CheckCircle,
  error:         AlertCircle,
}

function AdminIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name]
  if (!Icon) return null
  return <Icon className={className ?? 'w-5 h-5'} />
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pendingCompanies, setPendingCompanies] = useState<AdminCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [statsData, companiesData] = await Promise.all([
        apiClient.getAdminStats(),
        apiClient.getAdminCompanies({ status: 'pending', page_size: 5 }),
      ])
      setStats(statsData)
      setPendingCompanies(companiesData.companies)
    } catch (err: any) {
      setError(err.response?.data?.detail || t('common.error'))
      if (err.response?.status === 403 || err.response?.status === 401) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  const handleStatusChange = async (companyId: number, newStatus: string) => {
    setActionLoading(companyId)
    try {
      await apiClient.updateCompanyStatus(companyId, newStatus)
      await fetchData()
    } catch (err: any) {
      alert(err.response?.data?.detail || t('common.error'))
    } finally {
      setActionLoading(null)
    }
  }

  const today = new Date().toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-slate-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{t('admin.loadingDashboard')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <AdminIcon name="error" className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 text-lg font-medium">{error}</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: t('admin.totalUsers'),
      value: stats?.total_users ?? 0,
      sub: `${stats?.total_candidates ?? 0} ${t('admin.candidates')} · ${stats?.total_recruiters ?? 0} ${t('admin.recruiters')}`,
      icon: 'users', iconBg: 'bg-blue-100 text-blue-600', border: 'border-l-blue-500',
    },
    {
      label: t('admin.pendingCompanies'),
      value: stats?.pending_companies ?? 0,
      sub: `${stats?.total_companies ?? 0} ${t('admin.totalCompanies')}`,
      icon: 'clock', iconBg: 'bg-amber-100 text-amber-600', border: 'border-l-amber-500',
    },
    {
      label: t('admin.publicPortfolios'),
      value: stats?.public_profiles ?? 0,
      sub: stats && stats.total_candidates > 0
        ? `${Math.round((stats.public_profiles / stats.total_candidates) * 100)}${t('admin.ofCandidates')}`
        : `0${t('admin.ofCandidates')}`,
      icon: 'folder', iconBg: 'bg-green-100 text-green-600', border: 'border-l-green-500',
    },
    {
      label: t('admin.totalConnections'),
      value: stats?.total_invitations ?? 0,
      sub: t('admin.totalInvitations'),
      icon: 'handshake', iconBg: 'bg-purple-100 text-purple-600', border: 'border-l-purple-500',
    },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <AdminIcon name="chart" className="w-5 h-5 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">
            {t('admin.dashboardTitle')}
          </h1>
        </div>
        <p className="text-gray-500 text-sm capitalize">{today}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-xl border border-gray-200 border-l-4 ${card.border} p-5 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                <AdminIcon name={card.icon} className="w-5 h-5" />
              </div>
              <span className="text-3xl font-extrabold text-gray-900">{card.value.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}</span>
            </div>
            <p className="text-sm font-semibold text-gray-700">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Pending companies table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AdminIcon name="list" className="w-5 h-5 text-gray-700" />
              {t('admin.pendingApproval')}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {pendingCompanies.length > 0
                ? `${pendingCompanies.length} ${t('admin.companiesWaiting')}`
                : t('admin.noNewRequests')}
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/companies?status=pending')}
            className="mt-3 sm:mt-0 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            {t('admin.viewAll')}
          </button>
        </div>

        {pendingCompanies.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <AdminIcon name="check-circle" className="w-10 h-10 mx-auto mb-3 text-green-400" />
            <p className="font-medium">{t('admin.allHandled')}</p>
            <p className="text-sm mt-1">{t('admin.noPendingCompanies')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.companyName')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.email')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.registeredDate')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.status')}</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold">
                          {c.company_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{c.company_name}</p>
                          {c.location && <p className="text-xs text-gray-400">{c.location}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.email || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(c.created_at).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                        {t('admin.pending')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleStatusChange(c.id, 'approved')}
                          disabled={actionLoading === c.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          <AdminIcon name="check" className="w-3.5 h-3.5" /> {t('admin.approve')}
                        </button>
                        <button
                          onClick={() => handleStatusChange(c.id, 'rejected')}
                          disabled={actionLoading === c.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <AdminIcon name="x" className="w-3.5 h-3.5" /> {t('admin.reject')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions grid */}
      <div className="grid md:grid-cols-2 gap-5 mt-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AdminIcon name="lightning" className="w-4 h-4 text-gray-600" />
            {t('admin.quickActions')}
          </h3>
          <div className="space-y-2">
            {[
              { label: t('admin.viewPendingCompanies'), href: '/admin/companies?status=pending', color: 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100' },
              { label: t('admin.manageCandidates'), href: '/admin/users', color: 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100' },
              { label: t('admin.viewAllCompanies'), href: '/admin/companies', color: 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100' },
            ].map((a) => (
              <button
                key={a.href}
                onClick={() => router.push(a.href)}
                className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${a.color}`}
              >
                <span>{a.label}</span>
                <span className="opacity-50">→</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AdminIcon name="info" className="w-4 h-4 text-gray-600" />
            {t('admin.systemInfo')}
          </h3>
          <div className="space-y-3">
            {[
              { label: t('admin.version'), value: 'MVP 1.0', style: 'text-gray-700 bg-gray-100' },
              { label: t('admin.database'), value: t('admin.dbConnected'), style: 'text-green-700 bg-green-50' },
              { label: t('admin.publicProfileRate'), value: stats && stats.total_candidates > 0 ? `${Math.round((stats.public_profiles / stats.total_candidates) * 100)}%` : '0%', style: 'text-gray-700 bg-gray-100' },
              { label: t('admin.invitationsPerCandidate'), value: stats && stats.total_candidates > 0 ? (stats.total_invitations / stats.total_candidates).toFixed(1) : '0', style: 'text-purple-700 bg-purple-50' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${item.style}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
