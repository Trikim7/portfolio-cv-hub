'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { apiClient } from '@/services/api'
import {
  Activity, Users, Building2, Settings, Shield,
  LogOut, Menu, X,
} from 'lucide-react'
import LanguageToggle from '@/components/layout/LanguageToggle'
import { useTranslation } from 'react-i18next'

// ─── Lucide icon map ───────────────────────────────────────────────────────────────────
const ICON_CLS = 'w-[18px] h-[18px] shrink-0'

const NAV_ICON_MAP: Record<string, React.ReactNode> = {
  '/admin/dashboard': <Activity className={ICON_CLS} />,
  '/admin/users':     <Users className={ICON_CLS} />,
  '/admin/companies': <Building2 className={ICON_CLS} />,
  '/admin/settings':  <Settings className={ICON_CLS} />,
}

export default function AdminSidebar() {
  const { t } = useTranslation()
  const pathname = usePathname()

  const navItems = [
    { label: t('admin.navDashboard'), href: '/admin/dashboard' },
    { label: t('admin.navUsers'), href: '/admin/users' },
    { label: t('admin.navCompanies'), href: '/admin/companies', showBadge: true },
    { label: t('admin.navSettings'), href: '/admin/settings' },
  ]
  const router = useRouter()
  const [pendingCount, setPendingCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    apiClient.getAdminStats()
      .then((s) => setPendingCount(s.pending_companies ?? 0))
      .catch(() => {})
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('role')
    window.dispatchEvent(new Event('logout'))
    router.push('/')
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-blue-600/40">
        <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <Shield className="w-[18px] h-[18px] shrink-0" />
          </div>
          <span className="text-lg font-bold tracking-tight">{t('admin.title')}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium
                ${active
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'}
              `}
            >
              <span className="flex items-center justify-center w-[18px]">
                {NAV_ICON_MAP[item.href]}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.showBadge && pendingCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5">
                  {pendingCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-blue-600/40">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold border-2 border-blue-400">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{t('admin.welcome')}</p>
            <p className="text-xs text-blue-200 truncate">{t('admin.adminRole')}</p>
          </div>
        </div>
        <div className="mb-3">
          <LanguageToggle variant="light" dropUp />
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" /> {t('common.logout')}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] w-10 h-10 bg-blue-700 text-white rounded-lg flex items-center justify-center shadow-lg"
      >
        {mobileOpen ? <X className="w-[18px] h-[18px] shrink-0" /> : <Menu className="w-[18px] h-[18px] shrink-0" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-700 to-blue-800 text-white flex-col z-50 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Sidebar - mobile */}
      <aside
        className={`
          lg:hidden fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-700 to-blue-800
          text-white flex flex-col z-50 shadow-xl transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
