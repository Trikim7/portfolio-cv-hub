'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode, useState } from 'react'
import {
  LayoutDashboard, User, Code2, Briefcase, FolderOpen,
  FileText, Sparkles, Share2, Building2, Search,
  ClipboardList, Camera, ChevronUp, ChevronDown,
  BarChart2, Mail, Palette,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LanguageToggle from './LanguageToggle'

export interface DashboardNavItem {
  id: string
  /** First line (before newline) displayed in sidebar */
  label: string
  /** Không hiển thị trong UI — giữ nếu cần metadata; sidebar chỉ dùng `label` */
  description?: string
}

// ─── Lucide nav icons (keyed by nav item id) ──────────────────────────────────

const CLS = 'w-4 h-4 shrink-0'

const NAV_ICONS: Record<string, React.ReactNode> = {
  // Candidate
  overview:           <LayoutDashboard className={CLS} />,
  profile:            <User className={CLS} />,
  skills:             <Code2 className={CLS} />,
  experience:         <Briefcase className={CLS} />,
  projects:           <FolderOpen className={CLS} />,
  cv:                 <FileText className={CLS} />,
  'generate-cv':      <Sparkles className={CLS} />,
  social:             <Share2 className={CLS} />,
  analytics:          <BarChart2 className={CLS} />,
  invitations:        <Mail className={CLS} />,
  theme:              <Palette className={CLS} />,
  // Recruiter
  company:            <Building2 className={CLS} />,
  actions:            <Search className={CLS} />,
  'job-requirements': <ClipboardList className={CLS} />,
}

function navTitleFromItem(item: DashboardNavItem): string {
  return item.label.split(/\r?\n/)[0]?.trim() ?? ''
}

function navTitleFromLabel(label: string | undefined): string {
  if (!label) return ''
  return label.split(/\r?\n/)[0]?.trim() ?? ''
}

interface DashboardShellProps {
  title: string
  subtitle?: string
  accent?: 'blue' | 'purple' | 'emerald'
  userName?: string
  userEmail?: string
  userAvatarUrl?: string | null
  onAvatarClick?: () => void
  badge?: string
  nav: DashboardNavItem[]
  activeId: string
  /** Shown in the mobile nav bar when the active section is not listed in `nav` */
  activeNavLabel?: string
  onSelect: (id: string) => void
  headerAction?: ReactNode
  children: ReactNode
}

const ACCENT_STYLES = {
  blue: {
    hero: 'from-blue-600 via-indigo-600 to-violet-600',
    chip: 'bg-blue-50 text-blue-700 border-blue-200',
    activeNav: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  purple: {
    hero: 'from-violet-600 via-purple-600 to-fuchsia-600',
    chip: 'bg-purple-50 text-purple-700 border-purple-200',
    activeNav: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
  emerald: {
    hero: 'from-emerald-600 via-teal-600 to-cyan-600',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeNav: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
}

export default function DashboardShell({
  title,
  subtitle,
  accent = 'blue',
  userName,
  userEmail,
  userAvatarUrl,
  onAvatarClick,
  badge,
  nav,
  activeId,
  activeNavLabel,
  onSelect,
  headerAction,
  children,
}: DashboardShellProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const styles = ACCENT_STYLES[accent]

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('role')
    window.dispatchEvent(new Event('logout'))
    router.push('/')
  }

  const initials = (userName || title || userEmail || 'U')
    .split(' ')
    .map((p) => p.trim().charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <div className={`bg-gradient-to-r ${styles.hero} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-4 sm:pb-5">
          {/* Mini top bar: brand + logout */}
          <div className="flex items-center justify-between mb-3 sm:mb-3.5">
            <Link
              href="/"
              className="text-white/90 hover:text-white font-bold text-base sm:text-lg tracking-tight"
            >
              Portfolio CV Hub
            </Link>
            <div className="flex items-center gap-2">
              <LanguageToggle variant="light" />
              <button
                type="button"
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 backdrop-blur px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium transition ring-1 ring-white/20"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0">
                {onAvatarClick ? (
                  <button
                    type="button"
                    onClick={onAvatarClick}
                    title={t('common.changeAvatar')}
                    className="relative group block focus:outline-none"
                  >
                    {userAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userAvatarUrl}
                        alt={userName || 'avatar'}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover ring-2 ring-white/40 shadow-md"
                      />
                    ) : (
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-base sm:text-lg font-bold shadow-md ring-2 ring-white/30">
                        {initials || 'U'}
                      </div>
                    )}
                    {/* Camera overlay on hover */}
                    <span className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Camera className="w-5 h-5 text-white" />
                    </span>
                  </button>
                ) : (
                  <>
                    {userAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userAvatarUrl}
                        alt={userName || 'avatar'}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover ring-2 ring-white/40 shadow-md"
                      />
                    ) : (
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-base sm:text-lg font-bold shadow-md ring-2 ring-white/30">
                        {initials || 'U'}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-white/80 text-[11px] sm:text-xs font-medium uppercase tracking-wider">
                  {subtitle || t('dashboard.hello')}
                </p>
                <h1 className="text-xl sm:text-2xl font-extrabold leading-snug truncate">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {badge && (
                    <span className="inline-flex items-center gap-1.5 bg-white text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                      {badge}
                    </span>
                  )}
                  {userEmail && (
                    <span className="text-white/80 text-xs truncate">{userEmail}</span>
                  )}
                </div>
              </div>
            </div>

            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>
        </div>
      </div>

      {/* Mobile nav toggle */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 -mt-3 relative z-10">
        <button
          type="button"
          onClick={() => setMobileNavOpen((v) => !v)}
          className="w-full flex items-center justify-between bg-white rounded-xl shadow-md px-4 py-3 text-sm font-semibold text-gray-700 border border-gray-200"
        >
          <span>
            {navTitleFromLabel(
              activeNavLabel ?? nav.find((n) => n.id === activeId)?.label,
            ) || t('common.navigate')}
          </span>
          <span className="text-gray-400">{mobileNavOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-6">
          {/* Sidebar */}
          <aside
            className={`${mobileNavOpen ? 'block' : 'hidden'} lg:block mb-4 lg:mb-0`}
          >
            <nav className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 lg:sticky lg:top-6">
              {nav.map((item) => {
                const isActive = activeId === item.id
                const icon = NAV_ICONS[item.id]
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item.id)
                      setMobileNavOpen(false)
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl text-left transition mb-1 last:mb-0 border ${
                      isActive
                        ? styles.activeNav
                        : 'border-transparent text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {icon && (
                        <span className={isActive ? 'opacity-80' : 'opacity-40'}>
                          {icon}
                        </span>
                      )}
                      <span className="text-sm font-semibold truncate">
                        {navTitleFromItem(item)}
                      </span>
                    </span>
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="min-w-0">
            <div className="space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className = '',
}: {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  const hasHeader = title || description || action
  return (
    <section
      className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div className="min-w-0">
            {title && (
              <h2 className="text-lg font-bold text-gray-900 truncate">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className="p-6">{children}</div>
    </section>
  )
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'blue',
}: {
  label: string
  value: string | number
  hint?: string
  tone?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose'
}) {
  const tones = {
    blue: 'from-blue-50 to-indigo-50 border-blue-100 text-blue-900',
    emerald: 'from-emerald-50 to-teal-50 border-emerald-100 text-emerald-900',
    purple: 'from-violet-50 to-fuchsia-50 border-violet-100 text-violet-900',
    amber: 'from-amber-50 to-orange-50 border-amber-100 text-amber-900',
    rose: 'from-rose-50 to-pink-50 border-rose-100 text-rose-900',
  }
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br ${tones[tone]} p-5`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-extrabold leading-none">{value}</p>
      {hint && <p className="text-xs mt-2 opacity-75">{hint}</p>}
    </div>
  )
}

export function PageShell({
  title,
  subtitle,
  accent = 'blue',
  headerAction,
  backHref,
  backLabel,
  children,
}: {
  title: string
  subtitle?: string
  accent?: 'blue' | 'purple' | 'emerald'
  headerAction?: ReactNode
  backHref?: string
  backLabel?: string
  children: ReactNode
}) {
  const router = useRouter()
  const { t } = useTranslation()
  const styles = ACCENT_STYLES[accent]
  const resolvedBackLabel = backLabel ?? t('common.back')

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('role')
    window.dispatchEvent(new Event('logout'))
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className={`bg-gradient-to-r ${styles.hero} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-5 sm:pb-6">
          {/* Single unified hero bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Left: title block */}
            <div className="min-w-0">
              <Link
                href="/"
                className="text-white/70 hover:text-white text-xs font-semibold uppercase tracking-widest transition mb-1 inline-block"
              >
                Portfolio CV Hub
              </Link>
              {subtitle && (
                <p className="text-white/80 text-[11px] sm:text-xs font-medium uppercase tracking-wider">
                  {subtitle}
                </p>
              )}
              <h1 className="text-xl sm:text-2xl font-extrabold leading-snug">{title}</h1>
            </div>

            {/* Right: action buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {backHref && (
                <Link
                  href={backHref}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ring-1 ring-white/20"
                >
                  {resolvedBackLabel}
                </Link>
              )}
              {headerAction}
              <LanguageToggle variant="light" />
              <button
                type="button"
                onClick={handleLogout}
                className="bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ring-1 ring-white/30 text-white"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  )
}
