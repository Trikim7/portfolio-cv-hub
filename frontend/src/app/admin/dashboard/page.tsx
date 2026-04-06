'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api'
import { DashboardStats } from '@/types'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'admin') {
      router.push('/login')
      return
    }

    const fetchStats = async () => {
      try {
        const data = await apiClient.getAdminStats()
        setStats(data)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Không thể tải dữ liệu')
        if (err.response?.status === 403 || err.response?.status === 401) {
          router.push('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">⚙️</div>
          <p className="text-gray-400 text-lg">Đang tải bảng điều khiển...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-400 text-lg">❌ {error}</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Tổng người dùng',
      value: stats?.total_users ?? 0,
      icon: '👥',
      color: 'from-blue-500 to-blue-700',
      link: '/admin/users',
    },
    {
      label: 'Ứng viên',
      value: stats?.total_candidates ?? 0,
      icon: '👤',
      color: 'from-cyan-500 to-cyan-700',
      link: '/admin/users?role=candidate',
    },
    {
      label: 'Nhà tuyển dụng',
      value: stats?.total_recruiters ?? 0,
      icon: '🏢',
      color: 'from-green-500 to-green-700',
      link: '/admin/users?role=recruiter',
    },
    {
      label: 'Tổng công ty',
      value: stats?.total_companies ?? 0,
      icon: '🏭',
      color: 'from-indigo-500 to-indigo-700',
      link: '/admin/companies',
    },
    {
      label: 'Chờ duyệt',
      value: stats?.pending_companies ?? 0,
      icon: '⏳',
      color: 'from-yellow-500 to-yellow-700',
      link: '/admin/companies?status=pending',
    },
    {
      label: 'Đã phê duyệt',
      value: stats?.approved_companies ?? 0,
      icon: '✅',
      color: 'from-emerald-500 to-emerald-700',
      link: '/admin/companies?status=approved',
    },
    {
      label: 'Portfolio công khai',
      value: stats?.public_profiles ?? 0,
      icon: '📂',
      color: 'from-purple-500 to-purple-700',
      link: null,
    },
    {
      label: 'Tổng lời mời',
      value: stats?.total_invitations ?? 0,
      icon: '📨',
      color: 'from-pink-500 to-pink-700',
      link: null,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🛡️ Bảng điều khiển Admin
          </h1>
          <p className="text-gray-400">
            Tổng quan hệ thống Portfolio CV Hub
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => (
            <div
              key={card.label}
              onClick={() => card.link && router.push(card.link)}
              className={`
                bg-gradient-to-br ${card.color} rounded-xl p-6 shadow-lg
                transform transition-all duration-200 hover:scale-105
                ${card.link ? 'cursor-pointer' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{card.icon}</span>
                <span className="text-3xl font-bold">{card.value}</span>
              </div>
              <p className="text-white/80 text-sm font-medium">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              ⚡ Hành động nhanh
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/admin/companies?status=pending')}
                className="w-full flex items-center justify-between px-4 py-3 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/30 rounded-lg transition"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">⏳</span>
                  <span>Duyệt doanh nghiệp đang chờ</span>
                </span>
                <span className="bg-yellow-600 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                  {stats?.pending_companies ?? 0}
                </span>
              </button>
              <button
                onClick={() => router.push('/admin/users')}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-lg transition"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">👥</span>
                  <span>Quản lý người dùng</span>
                </span>
                <span className="text-gray-400">→</span>
              </button>
              <button
                onClick={() => router.push('/admin/companies')}
                className="w-full flex items-center justify-between px-4 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 rounded-lg transition"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">🏢</span>
                  <span>Quản lý doanh nghiệp</span>
                </span>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              📋 Thông tin hệ thống
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Phiên bản</span>
                <span className="text-white font-medium">MVP 1.0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Database</span>
                <span className="text-green-400 font-medium">✅ Kết nối OK</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Tỉ lệ profile công khai</span>
                <span className="text-white font-medium">
                  {stats && stats.total_candidates > 0
                    ? `${Math.round((stats.public_profiles / stats.total_candidates) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Lời mời / Ứng viên</span>
                <span className="text-white font-medium">
                  {stats && stats.total_candidates > 0
                    ? (stats.total_invitations / stats.total_candidates).toFixed(1)
                    : '0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
