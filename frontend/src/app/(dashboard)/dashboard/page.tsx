'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ProfileProvider, useProfileContext } from '@/hooks/ProfileContext'
import ProfileForm from '@/components/dashboard/ProfileForm'
import SkillsManager from '@/components/dashboard/SkillsManager'
import ExperiencesManager from '@/components/dashboard/ExperiencesManager'
import ProjectsManager from '@/components/dashboard/ProjectsManager'
import CVManager from '@/components/dashboard/CVManager'
import CandidateStatsCard from '@/components/dashboard/CandidateStatsCard'
import SocialAccountsManager from '@/components/dashboard/SocialAccountsManager'
import DashboardShell, {
  DashboardNavItem,
  SectionCard,
  StatCard,
} from '@/components/layout/DashboardShell'

type CandidateSection =
  | 'overview'
  | 'profile'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'cv'
  | 'social'

const SECTION_LABELS: Record<CandidateSection, string> = {
  overview: 'Tổng quan',
  profile: 'Thông tin cá nhân',
  skills: 'Kỹ năng',
  experience: 'Kinh nghiệm',
  projects: 'Dự án',
  cv: 'CV / Resume',
  social: 'Tài khoản liên kết',
}

const SECTION_ORDER: CandidateSection[] = [
  'overview',
  'profile',
  'skills',
  'experience',
  'projects',
  'cv',
  'social',
]

const SIDEBAR_NAV: (DashboardNavItem & { id: CandidateSection })[] = SECTION_ORDER.map(
  (id) => ({ id, label: SECTION_LABELS[id] }),
)

function DashboardContent() {
  const { profile } = useProfileContext()
  const [section, setSection] = useState<CandidateSection>('overview')

  const completion = useMemo(() => {
    if (!profile) return 0
    const checks = [
      !!profile.full_name,
      !!profile.headline,
      !!profile.bio,
      (profile.skills || []).length > 0,
      (profile.experiences || []).length > 0,
      (profile.projects || []).length > 0,
    ]
    const done = checks.filter(Boolean).length
    return Math.round((done / checks.length) * 100)
  }, [profile])

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  const missing: { id: CandidateSection; label: string }[] = []
  if (!profile.full_name || !profile.headline)
    missing.push({ id: 'profile', label: 'Bổ sung thông tin cá nhân' })
  if (!(profile.skills || []).length)
    missing.push({ id: 'skills', label: 'Thêm kỹ năng đầu tiên' })
  if (!(profile.experiences || []).length)
    missing.push({ id: 'experience', label: 'Thêm kinh nghiệm làm việc' })
  if (!(profile.projects || []).length)
    missing.push({ id: 'projects', label: 'Thêm dự án vào portfolio' })

  return (
    <DashboardShell
      accent="blue"
      title={profile.full_name || 'Ứng viên'}
      subtitle="Xin chào"
      badge={profile.is_public ? 'Công khai' : 'Chưa công khai'}
      nav={SIDEBAR_NAV}
      activeId={section}
      onSelect={(id) => setSection(id as CandidateSection)}
      headerAction={
        <Link
          href={profile.public_slug ? `/portfolio/${profile.public_slug}` : '/portfolio'}
          className="bg-white text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition shadow-sm w-full sm:w-auto text-center"
        >
          Xem portfolio công khai
        </Link>
      }
    >
      {section === 'overview' && (
        <>
          <SectionCard
            title="Tiến độ hoàn thiện hồ sơ"
            description="Hoàn thiện càng nhiều, doanh nghiệp càng dễ tìm thấy bạn."
          >
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Bạn đã hoàn thành{' '}
                  <span className="font-semibold text-gray-800">{completion}%</span> hồ sơ.
                </p>
              </div>
              <div className="text-3xl font-extrabold text-blue-600 min-w-[70px] text-right">
                {completion}%
              </div>
            </div>

            {missing.length > 0 && (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {missing.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSection(m.id)}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition text-left"
                  >
                    <span className="text-sm font-medium text-gray-700">{m.label}</span>
                    <span className="text-blue-500 text-sm">→</span>
                  </button>
                ))}
              </div>
            )}
          </SectionCard>

          <CandidateStatsCard />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Kỹ năng"
              value={(profile.skills || []).length}
              hint="Số kỹ năng đã khai báo"
              tone="blue"
            />
            <StatCard
              label="Kinh nghiệm"
              value={(profile.experiences || []).length}
              hint="Vị trí đã trải qua"
              tone="emerald"
            />
            <StatCard
              label="Dự án"
              value={(profile.projects || []).length}
              hint="Mục trong portfolio"
              tone="purple"
            />
          </div>
        </>
      )}

      {section === 'profile' && <ProfileForm />}
      {section === 'skills' && <SkillsManager />}
      {section === 'experience' && <ExperiencesManager />}
      {section === 'projects' && <ProjectsManager />}
      {section === 'cv' && <CVManager />}
      {section === 'social' && <SocialAccountsManager />}
    </DashboardShell>
  )
}

export default function DashboardPage() {
  return (
    <ProfileProvider>
      <DashboardContent />
    </ProfileProvider>
  )
}
