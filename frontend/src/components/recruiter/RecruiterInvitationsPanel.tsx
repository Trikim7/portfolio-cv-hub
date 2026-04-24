'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/services/api'
import {
  Mail, User, CheckCircle, XCircle, Clock, AlertCircle,
  ExternalLink, RefreshCw, Trash2, Eye,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// ─── Types ────────────────────────────────────────────────────────────────────
interface DetailedInvitation {
  id: number
  job_title: string
  message?: string
  status: 'pending' | 'interested' | 'rejected' | 'withdrawn'
  created_at: string
  updated_at: string
  candidate?: {
    id: number
    full_name?: string
    headline?: string
    avatar_url?: string
    public_slug?: string
    is_public: boolean
  } | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { labelKey: 'invitations.statusPending',  bg: 'bg-amber-100',  text: 'text-amber-700',  icon: Clock },
  interested: { labelKey: 'invitations.statusInterested',       bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle },
  rejected:   { labelKey: 'invitations.statusRejected',    bg: 'bg-red-100',    text: 'text-red-700',    icon: XCircle },
  withdrawn:  { labelKey: 'invitations.statusWithdrawn',    bg: 'bg-gray-100',   text: 'text-gray-500',   icon: AlertCircle },
}

function StatusBadge({ status, t }: { status: DetailedInvitation['status'], t: any }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3 h-3" />
      {t(cfg.labelKey)}
    </span>
  )
}


function Avatar({ name, avatarUrl }: { name?: string; avatarUrl?: string }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="w-10 h-10 rounded-full object-cover" />
  }
  const initials = (name || 'UV').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
      {initials}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RecruiterInvitationsPanel() {
  const { t } = useTranslation()
  const [invitations, setInvitations] = useState<DetailedInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [withdrawing, setWithdrawing] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [filter, setFilter] = useState<'all' | DetailedInvitation['status']>('all')

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.getDetailedInvitations()
      setInvitations(data)
      setError(null)
    } catch {
      setError(t('invitations.loadError'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleWithdraw = async (id: number) => {
    if (!confirm(t('invitations.confirmWithdraw'))) return
    setWithdrawing(id)
    try {
      await apiClient.updateJobInvitation(id, 'withdrawn')
      setInvitations(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'withdrawn' } : inv))
      showToast(t('invitations.withdrawSuccess'), 'success')
    } catch {
      showToast(t('invitations.withdrawError'), 'error')
    } finally {
      setWithdrawing(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t('invitations.confirmDelete'))) return
    try {
      await apiClient.deleteJobInvitation(id)
      setInvitations(prev => prev.filter(inv => inv.id !== id))
      showToast(t('invitations.deleteSuccess'), 'success')
    } catch {
      showToast(t('invitations.deleteError'), 'error')
    }
  }

  const counts = {
    all:        invitations.length,
    pending:    invitations.filter(i => i.status === 'pending').length,
    interested: invitations.filter(i => i.status === 'interested').length,
    rejected:   invitations.filter(i => i.status === 'rejected').length,
    withdrawn:  invitations.filter(i => i.status === 'withdrawn').length,
  }

  const filtered = filter === 'all' ? invitations : invitations.filter(i => i.status === filter)

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900">{t('invitations.sentInvitations')}</h2>
          {counts.interested > 0 && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {counts.interested} {t('invitations.interested')}
            </span>
          )}
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </button>
      </div>

      {/* Stats summary row */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t('invitations.sent'),     value: counts.all,        color: 'bg-purple-50 border-purple-100 text-purple-700' },
            { label: t('invitations.statusPending'), value: counts.pending,  color: 'bg-amber-50 border-amber-100 text-amber-700' },
            { label: t('invitations.interested'),   value: counts.interested,  color: 'bg-green-50 border-green-100 text-green-700' },
            { label: t('invitations.statusRejected'),    value: counts.rejected,    color: 'bg-red-50 border-red-100 text-red-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`}>
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'all',        label: `${t('common.all')} (${counts.all})` },
          { key: 'pending',    label: `${t('invitations.pendingTab')} (${counts.pending})` },
          { key: 'interested', label: `${t('invitations.interested')} (${counts.interested})` },
          { key: 'rejected',   label: `${t('invitations.rejectedTab')} (${counts.rejected})` },
          { key: 'withdrawn',  label: `${t('invitations.withdrawnTab')} (${counts.withdrawn})` },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === tab.key ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-gray-100" />)}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">
            {filter === 'all' ? t('invitations.noInvitations') : t('invitations.noInvitationsFilter')}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {t('invitations.findCandidatesHint')}
          </p>
        </div>
      )}

      {/* Invitation cards */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(inv => {
            const cand = inv.candidate
            const portfolioHref = cand?.public_slug ? `/portfolio/${cand.public_slug}` : null
            const isWithdrawn = inv.status === 'withdrawn'

            return (
              <div key={inv.id}
                className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition ${isWithdrawn ? 'opacity-60' : ''}`}>

                <div className="flex items-start justify-between gap-3 flex-wrap">
                  {/* Candidate info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={cand?.full_name} avatarUrl={cand?.avatar_url} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {portfolioHref ? (
                          <Link href={portfolioHref} target="_blank" rel="noreferrer"
                            className="font-semibold text-gray-900 hover:text-purple-700 hover:underline transition-colors flex items-center gap-1">
                            {cand?.full_name || t('invitations.candidate')}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="font-semibold text-gray-900 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {cand?.full_name || t('invitations.candidate')}
                          </span>
                        )}
                        {!cand?.is_public && (
                          <span className="text-xs text-gray-400 italic">({t('invitations.notPublic')})</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{cand?.headline || t('invitations.noHeadline')}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t('invitations.sentOn')} {formatDate(inv.created_at)}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <StatusBadge status={inv.status} t={t} />
                </div>

                {/* Job title + message */}
                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-700">
                    {t('invitations.position')}: <span className="text-purple-700">{inv.job_title}</span>
                  </p>
                  {inv.message && (
                    <p className="mt-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border-l-2 border-purple-300">
                      {inv.message}
                    </p>
                  )}
                </div>

                {/* Response info for interested/rejected */}
                {(inv.status === 'interested' || inv.status === 'rejected') && (
                  <div className={`mt-3 flex items-center gap-2 text-xs font-medium rounded-lg px-3 py-2 ${
                    inv.status === 'interested'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {inv.status === 'interested'
                      ? <><CheckCircle className="w-3.5 h-3.5" /> {t('invitations.candidateResponded')}: <strong>{t('invitations.interested')}</strong> — {t('invitations.respondedOn')} {formatDate(inv.updated_at)}</>
                      : <><XCircle className="w-3.5 h-3.5" /> {t('invitations.candidateResponded')}: <strong>{t('invitations.statusRejected')}</strong> — {t('invitations.respondedOn')} {formatDate(inv.updated_at)}</>
                    }
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                  {portfolioHref && (
                    <Link href={portfolioHref} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 border border-purple-200 hover:border-purple-400 px-3 py-1.5 rounded-lg transition">
                      <Eye className="w-3.5 h-3.5" />
                      {t('invitations.viewProfile')}
                    </Link>
                  )}

                  {inv.status === 'pending' && (
                    <button
                      onClick={() => handleWithdraw(inv.id)}
                      disabled={withdrawing === inv.id}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 border border-amber-200 hover:border-amber-400 px-3 py-1.5 rounded-lg transition disabled:opacity-60"
                    >
                      {withdrawing === inv.id
                        ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        : <AlertCircle className="w-3.5 h-3.5" />
                      }
                      {t('invitations.withdraw')}
                    </button>
                  )}

                  {(inv.status === 'withdrawn' || inv.status === 'rejected') && (
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t('common.delete')}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
