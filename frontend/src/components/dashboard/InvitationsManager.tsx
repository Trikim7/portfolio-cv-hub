'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/services/api'
import {
  Mail, Building2, CheckCircle, XCircle, Clock,
  ExternalLink, RefreshCw, AlertCircle,
} from 'lucide-react'

interface Invitation {
  id: number
  job_title: string
  message?: string
  status: 'pending' | 'interested' | 'rejected' | 'withdrawn'
  created_at: string
  updated_at: string
  company?: {
    id: number
    name: string
    logo_url?: string
    website?: string
  } | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export default function InvitationsManager() {
  const { t } = useTranslation()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [responding, setResponding] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [filter, setFilter] = useState<'all' | Invitation['status']>('all')

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const STATUS_CONFIG = {
    pending:    { label: t('invitations.statusPending'),   color: 'bg-amber-100 text-amber-700',  icon: Clock },
    interested: { label: t('invitations.statusInterested'), color: 'bg-green-100 text-green-700',  icon: CheckCircle },
    rejected:   { label: t('invitations.statusRejected'),  color: 'bg-red-100 text-red-700',      icon: XCircle },
    withdrawn:  { label: t('invitations.statusWithdrawn'), color: 'bg-gray-100 text-gray-600',    icon: AlertCircle },
  }

  const fetchInvitations = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.getCandidateInvitations()
      setInvitations(data)
      setError(null)
    } catch {
      setError(t('invitations.fetchError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { fetchInvitations() }, [fetchInvitations])

  const handleRespond = async (id: number, status: 'interested' | 'rejected') => {
    setResponding(id)
    try {
      await apiClient.respondToInvitation(id, status)
      setInvitations(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv))
      showToast(
        status === 'interested' ? t('invitations.respondInterested') : t('invitations.respondRejected'),
        'success'
      )
    } catch {
      showToast(t('invitations.respondError'), 'error')
    } finally {
      setResponding(null)
    }
  }

  const filtered = filter === 'all' ? invitations : invitations.filter(i => i.status === filter)
  const counts = {
    all: invitations.length,
    pending: invitations.filter(i => i.status === 'pending').length,
    interested: invitations.filter(i => i.status === 'interested').length,
    rejected: invitations.filter(i => i.status === 'rejected').length,
  }

  const filterTabs = [
    { key: 'all' as const,        label: `${t('invitations.filterAll')} (${counts.all})` },
    { key: 'pending' as const,    label: `${t('invitations.filterPending')} (${counts.pending})` },
    { key: 'interested' as const, label: `${t('invitations.filterInterested')} (${counts.interested})` },
    { key: 'rejected' as const,   label: `${t('invitations.filterRejected')} (${counts.rejected})` },
  ]

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
          <Mail className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">{t('invitations.title')}</h2>
          {counts.pending > 0 && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {counts.pending} {t('invitations.newBadge')}
            </span>
          )}
        </div>
        <button
          onClick={fetchInvitations}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('invitations.refresh')}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-gray-100" />)}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">
            {filter === 'all' ? t('invitations.noInvitationsAll') : t('invitations.noInvitationsFilter')}
          </p>
          <p className="text-sm text-gray-400 mt-1">{t('invitations.publicHint')}</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(inv => {
            const statusCfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.pending
            const StatusIcon = statusCfg.icon
            return (
              <div key={inv.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-white">
                      {inv.company?.logo_url
                        ? <img src={inv.company.logo_url} alt="" className="w-full h-full object-cover rounded-lg" />
                        : <Building2 className="w-5 h-5" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 leading-snug">{inv.job_title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-sm text-gray-500">{inv.company?.name ?? t('invitations.unknownCompany')}</span>
                        {inv.company?.website && (
                          <a href={inv.company.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{t('invitations.receivedDate')} {formatDate(inv.created_at)}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusCfg.label}
                  </span>
                </div>

                {inv.message && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border-l-2 border-blue-300">
                    {inv.message}
                  </div>
                )}

                {inv.status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleRespond(inv.id, 'interested')}
                      disabled={responding === inv.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
                    >
                      {responding === inv.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      {t('invitations.interested')}
                    </button>
                    <button
                      onClick={() => handleRespond(inv.id, 'rejected')}
                      disabled={responding === inv.id}
                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-lg transition disabled:opacity-60"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {t('invitations.reject')}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
