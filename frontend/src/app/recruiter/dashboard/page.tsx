'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api'
import { useRecruiter } from '@/hooks/useRecruiter'
import { useAuth } from '@/hooks/AuthContext'
import CompanyProfile from '@/components/recruiter/CompanyProfile'
import SocialAccountsManager from '@/components/dashboard/SocialAccountsManager'
import DashboardShell, {
  DashboardNavItem,
  SectionCard,
  StatCard,
} from '@/components/layout/DashboardShell'
import { Company, JobInvitation } from '@/types'

type RecruiterSection = 'overview' | 'company' | 'actions' | 'social'

const NAV: (DashboardNavItem & { id: RecruiterSection })[] = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'company', label: 'Hồ sơ công ty' },
  { id: 'actions', label: 'Tuyển dụng' },
  { id: 'social', label: 'Tài khoản liên kết' },
]

const RECRUITER_SECTION_LABELS: Record<RecruiterSection, string> = {
  overview: 'Tổng quan',
  company: 'Hồ sơ công ty',
  actions: 'Tuyển dụng',
  social: 'Tài khoản liên kết',
}

export default function RecruiterDashboardPage() {
  const router = useRouter()
  const { role, loading: authLoading } = useAuth()
  const { fetchCompanyProfile, loading: recruiterLoading } = useRecruiter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [company, setCompany] = useState<Company | null>(null)
  const [section, setSection] = useState<RecruiterSection>('overview')
  const [logoUploading, setLogoUploading] = useState(false)
  const [invitations, setInvitations] = useState<JobInvitation[]>([])
  const [candidatesFound, setCandidatesFound] = useState<{ total: number; sessions: number } | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleLogoClick = () => logoInputRef.current?.click()

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      const result = await apiClient.uploadCompanyLogo(file)
      setCompany(prev => prev ? { ...prev, logo_url: result.logo_url } : null)
    } catch {
      // silent — user can retry
    } finally {
      setLogoUploading(false)
      e.target.value = ''
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      if (authLoading) return

      if (!role) {
        router.push('/')
        return
      }

      if (role !== 'recruiter') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('role')
        router.push('/')
        return
      }

      try {
        const companyData = await fetchCompanyProfile()
        if (companyData && companyData.status === 'pending') {
          router.push('/recruiter/waiting-approval')
          return
        }
        setCompany(companyData)
        setIsAuthorized(true)
        // Load stats in parallel (non-critical)
        await Promise.allSettled([
          apiClient.getJobInvitations().then(invData => {
            setInvitations(Array.isArray(invData) ? invData : [])
          }),
          apiClient.getComparisonHistory({ limit: 100 }).then(histData => {
            const sessions = histData.total ?? 0
            const total = (histData.items ?? []).reduce(
              (acc, item) => acc + (item.candidate_count ?? 0), 0
            )
            setCandidatesFound({ total, sessions })
          }),
        ])
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('role')
        router.push('/')
      }
    }

    checkAuth()
  }, [role, authLoading, fetchCompanyProfile, router])

  if (authLoading || recruiterLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-600">Đang kiểm tra thông tin...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) return null

  const statusBadge =
    company?.status === 'approved'
      ? 'Đã duyệt'
      : company?.status === 'pending'
        ? 'Chờ duyệt'
        : company?.status || undefined

  return (
    <DashboardShell
      accent="purple"
      title={company?.company_name || 'Dashboard Doanh nghiệp'}
      subtitle="Trung tâm tuyển dụng"
      userName={company?.company_name || undefined}
      userAvatarUrl={company?.logo_url || null}
      onAvatarClick={handleLogoClick}
      badge={logoUploading ? 'Đang tải logo…' : statusBadge}
      nav={NAV}
      activeId={section}
      activeNavLabel={RECRUITER_SECTION_LABELS[section]}
      onSelect={(id) => setSection(id as RecruiterSection)}
      headerAction={
        <div className="flex gap-2">
          {/* Hidden file input for logo upload */}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleLogoChange}
          />
          <Link
            href="/recruiter/search"
            className="bg-white/10 hover:bg-white/20 backdrop-blur px-4 py-2 rounded-xl text-sm font-semibold transition ring-1 ring-white/20"
          >
            Tìm kiếm
          </Link>
          <Link
            href="/recruiter/ranking"
            className="bg-white text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-xl text-sm font-semibold transition shadow"
          >
            AI Ranking
          </Link>
        </div>
      }
    >
      {section === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Lời mời đã gửi"
              value={invitations.length > 0 ? String(invitations.length) : '0'}
              hint={invitations.length > 0 ? `${invitations.filter(i => i.status === 'pending').length} đang chờ phản hồi` : 'Chưa có lời mời nào'}
              tone="purple"
            />
            <StatCard
              label="Ứng viên tìm thấy"
              value={candidatesFound !== null ? String(candidatesFound.total) : '—'}
              hint={
                candidatesFound === null
                  ? 'Đang tải…'
                  : candidatesFound.sessions === 0
                    ? 'Chưa có lần tìm kiếm nào'
                    : `Qua ${candidatesFound.sessions} lần AI Ranking`
              }
              tone="emerald"
            />
            <StatCard
              label="Quan tâm"
              value={invitations.filter(i => i.status === 'interested').length > 0 ? String(invitations.filter(i => i.status === 'interested').length) : '0'}
              hint={invitations.filter(i => i.status === 'interested').length > 0 ? 'Ứng viên đã phản hồi tích cực' : 'Chưa có phản hồi'}
              tone="amber"
            />
          </div>

          <SectionCard
            title="Bắt đầu tuyển dụng"
            description="Chọn nhanh công cụ bạn cần để tiếp cận ứng viên."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/recruiter/search"
                className="group rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 hover:border-blue-400 transition"
              >
                <h3 className="font-bold text-gray-900">Tìm kiếm ứng viên</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Lọc theo kỹ năng, vị trí và kinh nghiệm.
                </p>
                <p className="mt-3 text-sm font-semibold text-blue-700 group-hover:translate-x-1 transition">
                  Mở tìm kiếm →
                </p>
              </Link>

              <Link
                href="/recruiter/ranking"
                className="group rounded-2xl border border-purple-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 hover:border-purple-400 transition"
              >
                <h3 className="font-bold text-gray-900">AI Ranking</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Xếp hạng ứng viên thông minh theo tiêu chí JD.
                </p>
                <p className="mt-3 text-sm font-semibold text-purple-700 group-hover:translate-x-1 transition">
                  Chạy AI Ranking →
                </p>
              </Link>
            </div>
          </SectionCard>

          <SectionCard
            title="Tóm tắt công ty"
            action={
              <button
                type="button"
                onClick={() => setSection('company')}
                className="text-sm font-semibold text-purple-700 hover:text-purple-900"
              >
                Chỉnh sửa →
              </button>
            }
          >
            {company ? (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-semibold uppercase text-gray-500">Tên công ty</dt>
                  <dd className="mt-1 text-gray-900 font-medium">{company.company_name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-gray-500">Ngành</dt>
                  <dd className="mt-1 text-gray-900 font-medium">{company.industry || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-gray-500">Địa điểm</dt>
                  <dd className="mt-1 text-gray-900 font-medium">{company.location || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-gray-500">Website</dt>
                  <dd className="mt-1">
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-700 hover:underline font-medium"
                      >
                        {company.website}
                      </a>
                    ) : (
                      <span className="text-gray-900">—</span>
                    )}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-gray-500 text-sm">Chưa có thông tin công ty.</p>
            )}
          </SectionCard>
        </>
      )}

      {section === 'company' && <CompanyProfile />}

      {section === 'actions' && (
        <SectionCard title="Công cụ tuyển dụng">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/recruiter/search"
              className="p-5 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition"
            >
              <h3 className="font-semibold text-gray-900">Tìm kiếm ứng viên</h3>
              <p className="text-sm text-gray-500 mt-1">Lọc theo skill, vị trí, kinh nghiệm</p>
            </Link>
            <Link
              href="/recruiter/ranking"
              className="p-5 rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50/50 transition"
            >
              <h3 className="font-semibold text-gray-900">AI Ranking</h3>
              <p className="text-sm text-gray-500 mt-1">Xếp hạng ứng viên theo JD</p>
            </Link>
          </div>
        </SectionCard>
      )}

      {section === 'social' && <SocialAccountsManager />}
    </DashboardShell>
  )
}
