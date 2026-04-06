'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/services/api'
import { AdminUser } from '@/types'

export default function AdminUsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  // Filters
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '')
  const [activeFilter, setActiveFilter] = useState('')
  const [search, setSearch] = useState('')

  const PAGE_SIZE = 15

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.getAdminUsers({
        page,
        page_size: PAGE_SIZE,
        role: roleFilter || undefined,
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
  }, [page, roleFilter, activeFilter, search, router])

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'admin') {
      router.push('/login')
      return
    }
    fetchUsers()
  }, [fetchUsers, router])

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    setActionLoading(userId)
    try {
      await apiClient.toggleUserActive(userId, !currentActive)
      await fetchUsers()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Thao tác thất bại')
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const getRoleBadge = (role: string) => {
    const badges: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800 border border-purple-200',
      candidate: 'bg-blue-100 text-blue-800 border border-blue-200',
      recruiter: 'bg-green-100 text-green-800 border border-green-200',
    }
    const labels: Record<string, string> = {
      admin: 'Admin',
      candidate: 'Ứng viên',
      recruiter: 'Nhà tuyển dụng',
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[role] || 'bg-gray-600 text-white'}`}>
        {labels[role] || role}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold mb-2 text-gray-900">👥 Quản lý người dùng</h1>
            <p className="text-gray-500 font-medium">Tổng cộng {total} người dùng</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tìm kiếm</label>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Tìm theo email..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Vai trò</label>
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              >
                <option value="">Tất cả</option>
                <option value="candidate">Ứng viên</option>
                <option value="recruiter">Nhà tuyển dụng</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Trạng thái</label>
              <select
                value={activeFilter}
                onChange={(e) => { setActiveFilter(e.target.value); setPage(1) }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              >
                <option value="">Tất cả</option>
                <option value="true">Hoạt động</option>
                <option value="false">Đã khóa</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setRoleFilter(''); setActiveFilter(''); setSearch(''); setPage(1) }}
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition"
              >
                🔄 Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin text-3xl mb-3">⚙️</div>
              Đang tải...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">
              Không tìm thấy người dùng nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase">Vai trò</th>
                    <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-600 uppercase">Ngày tạo</th>
                    <th className="px-4 py-3 text-center text-xs font-bold tracking-wider text-gray-600 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-500 font-medium">#{user.id}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">{user.email}</td>
                      <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-3">
                        {user.is_active ? (
                          <span className="inline-flex items-center gap-1 text-green-700 font-medium text-sm bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 font-medium text-sm bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleActive(user.id, user.is_active)}
                            disabled={actionLoading === user.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                              user.is_active
                                ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30'
                                : 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30'
                            } disabled:opacity-50`}
                          >
                            {actionLoading === user.id
                              ? '...'
                              : user.is_active
                              ? '🔒 Khóa'
                              : '🔓 Mở khóa'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
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
    </div>
  )
}
