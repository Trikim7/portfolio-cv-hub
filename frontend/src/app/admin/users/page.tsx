'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api'
import { AdminUser } from '@/types'
import { useTranslation } from 'react-i18next'
import { Users, Lock, LockOpen, RefreshCw } from 'lucide-react'

// ─── Lucide icon aliases ───────────────────────────────────────────────────────────────────
const IcUser    = () => <Users    className="w-5 h-5" />
const IcLock    = () => <Lock     className="w-3.5 h-3.5" />
const IcUnlock  = () => <LockOpen className="w-3.5 h-3.5" />
const IcRefresh = () => <RefreshCw className="w-4 h-4" />

export default function AdminCandidatesPage() {
  const router = useRouter()
  const { t, i18n } = useTranslation()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const [activeFilter, setActiveFilter] = useState('')
  const [search, setSearch] = useState('')

  const PAGE_SIZE = 15

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.getAdminUsers({
        page,
        page_size: PAGE_SIZE,
        role: 'candidate',
        is_active: activeFilter ? activeFilter === 'true' : undefined,
        search: search || undefined,
      })
      setUsers(data.users)
      setTotal(data.total)
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }, [page, activeFilter, search, router])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    setActionLoading(userId)
    try {
      await apiClient.toggleUserActive(userId, !currentActive)
      await fetchUsers()
    } catch (err: any) {
      alert(err.response?.data?.detail || t('common.error'))
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <IcUser />
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.manageCandidatesTitle')}</h1>
        </div>
        <p className="text-sm text-gray-500">{t('admin.totalCandidatesInSystem').replace('{total}', String(total))}</p>
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
              placeholder={t('admin.searchByEmail')}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('admin.statusLabel')}</label>
            <select
              value={activeFilter}
              onChange={(e) => { setActiveFilter(e.target.value); setPage(1) }}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="">{t('admin.all')}</option>
              <option value="true">{t('admin.active')}</option>
              <option value="false">{t('admin.locked')}</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setActiveFilter(''); setSearch(''); setPage(1) }}
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
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="font-medium">{t('admin.noUsersFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.idColumn')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.email')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.createdDate')}</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-sm text-gray-400 font-mono">#{user.id}</td>
                    <td className="px-6 py-3.5 text-sm font-semibold text-gray-900">{user.email}</td>
                    <td className="px-6 py-3.5">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          {t('admin.active')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          {t('admin.locked')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleActive(user.id, user.is_active)}
                        disabled={actionLoading === user.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
                          user.is_active
                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        }`}
                      >
                        {actionLoading === user.id
                          ? '...'
                          : user.is_active
                          ? <span className="inline-flex items-center gap-1.5"><IcLock /> {t('admin.lock')}</span>
                          : <span className="inline-flex items-center gap-1.5"><IcUnlock /> {t('admin.unlock')}</span>}
                      </button>
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
