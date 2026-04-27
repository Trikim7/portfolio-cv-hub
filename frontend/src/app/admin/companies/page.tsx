'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/services/api'
import { AdminCompany } from '@/types'
import { useTranslation } from 'react-i18next'
import { Check, X, Lock, LockOpen, Building2, RefreshCw } from 'lucide-react'

// ─── Lucide icon aliases ───────────────────────────────────────────────────────────────────
const IcCheck    = () => <Check    className="w-3.5 h-3.5" />
const IcX        = () => <X        className="w-3.5 h-3.5" />
const IcLock     = () => <Lock     className="w-3.5 h-3.5" />
const IcUnlock   = () => <LockOpen className="w-3.5 h-3.5" />
const IcBuilding = () => <Building2 className="w-5 h-5" />
const IcRefresh  = () => <RefreshCw className="w-4 h-4" />

export default function AdminCompaniesPage() {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const searchParams = useSearchParams()

  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [search, setSearch] = useState('')

  const PAGE_SIZE = 15

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.getAdminCompanies({
        page,
        page_size: PAGE_SIZE,
        status: statusFilter || undefined,
        search: search || undefined,
      })
      setCompanies(data.companies)
      setTotal(data.total)
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search, router])

  useEffect(() => { fetchCompanies() }, [fetchCompanies])

  const handleStatusChange = async (companyId: number, newStatus: string) => {
    setActionLoading(companyId)
    try {
      await apiClient.updateCompanyStatus(companyId, newStatus)
      await fetchCompanies()
    } catch (err: any) {
      alert(err.response?.data?.detail || t('common.error'))
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const statusBadge = (status: string) => {
    const cfg: Record<string, { bg: string; dot: string; label: string }> = {
      pending:   { bg: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500',  label: t('admin.pending') },
      approved:  { bg: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-500',  label: t('admin.approved') },
      rejected:  { bg: 'bg-red-50 text-red-700 border-red-200',        dot: 'bg-red-500',    label: t('admin.rejected') },
      suspended: { bg: 'bg-gray-100 text-gray-600 border-gray-300',    dot: 'bg-gray-400',   label: t('admin.suspended') },
    }
    const c = cfg[status] || cfg.pending
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
        {c.label}
      </span>
    )
  }

  const renderActions = (company: AdminCompany) => {
    const disabled = actionLoading === company.id
    const btnBase = 'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50'

    switch (company.status) {
      case 'pending':
        return (
          <>
            <button onClick={() => handleStatusChange(company.id, 'approved')} disabled={disabled}
              className={`inline-flex items-center gap-1.5 ${btnBase} bg-green-50 text-green-700 border-green-200 hover:bg-green-100`}>
              <IcCheck /> {t('admin.approve')}
            </button>
            <button onClick={() => handleStatusChange(company.id, 'rejected')} disabled={disabled}
              className={`inline-flex items-center gap-1.5 ${btnBase} bg-red-50 text-red-700 border-red-200 hover:bg-red-100`}>
              <IcX /> {t('admin.reject')}
            </button>
          </>
        )
      case 'approved':
        return (
          <button onClick={() => handleStatusChange(company.id, 'suspended')} disabled={disabled}
            className={`inline-flex items-center gap-1.5 ${btnBase} bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100`}>
            <IcLock /> {t('admin.suspend')}
          </button>
        )
      case 'rejected':
        return (
          <button onClick={() => handleStatusChange(company.id, 'approved')} disabled={disabled}
            className={`inline-flex items-center gap-1.5 ${btnBase} bg-green-50 text-green-700 border-green-200 hover:bg-green-100`}>
            <IcCheck /> {t('admin.approveAgain')}
          </button>
        )
      case 'suspended':
        return (
          <button onClick={() => handleStatusChange(company.id, 'approved')} disabled={disabled}
            className={`inline-flex items-center gap-1.5 ${btnBase} bg-green-50 text-green-700 border-green-200 hover:bg-green-100`}>
            <IcUnlock /> {t('admin.unlock')}
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <IcBuilding />
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.manageCompaniesTitle')}</h1>
        </div>
        <p className="text-sm text-gray-500">{t('admin.totalCompaniesInSystem').replace('{total}', String(total))}</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('admin.search')}</label>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('admin.searchByCompany')}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('admin.statusLabel')}</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="">{t('admin.all')}</option>
              <option value="pending">{t('admin.pending')}</option>
              <option value="approved">{t('admin.approved')}</option>
              <option value="rejected">{t('admin.rejected')}</option>
              <option value="suspended">{t('admin.suspended')}</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setStatusFilter(''); setSearch(''); setPage(1) }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
            >
              <IcRefresh /> {t('admin.clearFilter')}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-3" />
            <p>{t('admin.loading')}</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="font-medium">{t('admin.noCompaniesFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.companyName')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.website')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.registeredDate')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.status')}</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                          {company.company_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{company.company_name}</p>
                          {company.location && <p className="text-xs text-gray-400 truncate">{company.location}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {company.website ? (
                        <a
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-[200px]"
                        >
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(company.created_at).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                    </td>
                    <td className="px-6 py-4">{statusBadge(company.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {renderActions(company)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-sm text-gray-500">
              {t('admin.page')} {page} {t('admin.of')} {totalPages} ({total} {t('admin.results')})
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium disabled:opacity-40 transition-colors"
              >
                                {t('admin.prev')}
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                const p = start + i
                if (p > totalPages) return null
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium disabled:opacity-40 transition-colors"
              >
                                {t('admin.next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
