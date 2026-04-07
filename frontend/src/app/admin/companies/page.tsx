'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/services/api'
import { AdminCompany } from '@/types'

export default function AdminCompaniesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  // Filters
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

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'admin') {
      router.push('/login')
      return
    }
    fetchCompanies()
  }, [fetchCompanies, router])

  const handleStatusChange = async (companyId: number, newStatus: string) => {
    setActionLoading(companyId)
    try {
      await apiClient.updateCompanyStatus(companyId, newStatus)
      await fetchCompanies()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Thao tác thất bại')
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; label: string }> = {
      pending: { bg: 'bg-yellow-50 text-yellow-800 border-yellow-200', label: '⏳ Chờ duyệt' },
      approved: { bg: 'bg-green-50 text-green-800 border-green-200', label: '✅ Đã duyệt' },
      rejected: { bg: 'bg-red-50 text-red-800 border-red-200', label: '❌ Từ chối' },
      suspended: { bg: 'bg-gray-100 text-gray-800 border-gray-300', label: '🚫 Tạm khóa' },
    }
    const c = config[status] || config.pending
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg}`}>
        {c.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold mb-2 text-gray-900">🏢 Quản lý Doanh nghiệp</h1>
            <p className="text-gray-500 font-medium">Tổng cộng {total} doanh nghiệp</p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 shadow-sm rounded-lg transition text-sm font-medium text-gray-700"
          >
            ← Về Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm rounded-xl p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tìm kiếm</label>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Tìm theo tên công ty..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
                <option value="suspended">Tạm khóa</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setStatusFilter(''); setSearch(''); setPage(1) }}
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition"
              >
                🔄 Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Company Cards */}
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin text-3xl mb-3">⚙️</div>
            Đang tải...
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500 font-medium border border-gray-200">
            Không tìm thấy doanh nghiệp nào
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 shadow-sm transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Company Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{company.company_name}</h3>
                      {getStatusBadge(company.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600 font-medium">
                      {company.location && (
                        <p>📍 {company.location}</p>
                      )}
                      {company.website && (
                        <p>🌐 <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">{company.website}</a></p>
                      )}
                      {company.email && (
                        <p>📧 {company.email}</p>
                      )}
                      {company.phone && (
                        <p>📞 {company.phone}</p>
                      )}
                      <p>📅 Đăng ký: {new Date(company.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                    {company.description && (
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">{company.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 md:flex-col md:min-w-[140px]">
                    {company.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(company.id, 'approved')}
                          disabled={actionLoading === company.id}
                          className="flex-1 md:w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                          {actionLoading === company.id ? '...' : '✅ Phê duyệt'}
                        </button>
                        <button
                          onClick={() => handleStatusChange(company.id, 'rejected')}
                          disabled={actionLoading === company.id}
                          className="flex-1 md:w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                          {actionLoading === company.id ? '...' : '❌ Từ chối'}
                        </button>
                      </>
                    )}
                    {company.status === 'approved' && (
                      <button
                        onClick={() => handleStatusChange(company.id, 'suspended')}
                        disabled={actionLoading === company.id}
                        className="flex-1 md:w-full px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        {actionLoading === company.id ? '...' : '🚫 Tạm khóa'}
                      </button>
                    )}
                    {company.status === 'rejected' && (
                      <button
                        onClick={() => handleStatusChange(company.id, 'approved')}
                        disabled={actionLoading === company.id}
                        className="flex-1 md:w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        {actionLoading === company.id ? '...' : '✅ Phê duyệt lại'}
                      </button>
                    )}
                    {company.status === 'suspended' && (
                      <button
                        onClick={() => handleStatusChange(company.id, 'approved')}
                        disabled={actionLoading === company.id}
                        className="flex-1 md:w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        {actionLoading === company.id ? '...' : '🔓 Mở khóa'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-white shadow-sm rounded-xl px-4 py-3 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">
              Trang {page} / {totalPages} <span className="text-gray-400">({total} kết quả)</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium disabled:opacity-50 transition"
              >
                ← Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium disabled:opacity-50 transition"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
