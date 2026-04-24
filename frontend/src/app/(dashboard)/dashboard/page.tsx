'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/services/api'
import { ProfileProvider, useProfileContext } from '@/hooks/ProfileContext'
import ProfileForm from '@/components/dashboard/ProfileForm'
import SkillsManager from '@/components/dashboard/SkillsManager'
import ExperiencesManager from '@/components/dashboard/ExperiencesManager'
import ProjectsManager from '@/components/dashboard/ProjectsManager'
import CVManager from '@/components/dashboard/CVManager'
import CVGeneratorPanel from '@/components/dashboard/CVGeneratorPanel'
import SocialAccountsManager from '@/components/dashboard/SocialAccountsManager'
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard'
import InvitationsManager from '@/components/dashboard/InvitationsManager'
import ThemePicker from '@/components/dashboard/ThemePicker'
import DashboardShell, {
  DashboardNavItem,
  SectionCard,
  StatCard,
} from '@/components/layout/DashboardShell'
import { useTranslation } from 'react-i18next'

type CandidateSection =
  | 'overview'
  | 'profile'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'cv'
  | 'generate-cv'
  | 'invitations'
  | 'theme'
  | 'social'

const SECTION_LABEL_KEYS: Record<CandidateSection, string> = {
  overview:       'dashboard.overview',
  profile:        'dashboard.profile',
  skills:         'dashboard.skills',
  experience:     'dashboard.experience',
  projects:       'dashboard.projects',
  cv:             'dashboard.cv',
  'generate-cv':  'dashboard.generateCv',
  invitations:    'dashboard.invitations',
  theme:          'dashboard.theme',
  social:         'dashboard.social',
}

const SECTION_ORDER: CandidateSection[] = [
  'overview',
  'profile',
  'skills',
  'experience',
  'projects',
  'cv',
  'generate-cv',
  'invitations',
  'theme',
  'social',        // always last
]

function DashboardContent() {
  const { profile, loading, error, refreshProfile } = useProfileContext()
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [section, setSection] = useState<CandidateSection>(() => {
    const tab = searchParams.get('tab')
    if (tab && SECTION_ORDER.includes(tab as CandidateSection)) return tab as CandidateSection
    return 'overview'
  })
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Build nav labels dynamically per language
  const SIDEBAR_NAV: (DashboardNavItem & { id: CandidateSection })[] = SECTION_ORDER.map(
    (id) => ({ id, label: t(SECTION_LABEL_KEYS[id]) }),
  )

  const handleAvatarClick = () => avatarInputRef.current?.click()

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      await apiClient.uploadAvatar(file)
      await refreshProfile()
    } catch {
      // silent — user can retry
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

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

  // Redirect to login if not authenticated (profile fetch failed)
  useEffect(() => {
    if (!loading && !profile && error) {
      router.push('/?redirect=dashboard')
    }
  }, [loading, profile, error, router])

  if (loading || (!profile && !error)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-600">{t('common.loadingData')}</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    // Auth failed — redirect is in progress
    return null
  }

  const missing: { id: CandidateSection; label: string }[] = []
  if (!profile.full_name || !profile.headline)
    missing.push({ id: 'profile', label: t('dashboard.addPersonalInfo') })
  if (!(profile.skills || []).length)
    missing.push({ id: 'skills', label: t('dashboard.addFirstSkill') })
  if (!(profile.experiences || []).length)
    missing.push({ id: 'experience', label: t('dashboard.addWorkExperience') })
  if (!(profile.projects || []).length)
    missing.push({ id: 'projects', label: t('dashboard.addProjectPortfolio') })

  return (
    <DashboardShell
      accent="blue"
      title={profile.full_name || t('dashboard.title')}
      subtitle={t('dashboard.hello')}
      userName={profile.full_name || undefined}
      userAvatarUrl={profile.avatar_url || null}
      onAvatarClick={handleAvatarClick}
      badge={avatarUploading ? t('dashboard.uploading') : (profile.is_public ? t('dashboard.public') : t('dashboard.notPublic'))}
      nav={SIDEBAR_NAV}
      activeId={section}
      onSelect={(id) => setSection(id as CandidateSection)}
      headerAction={
        <Link
          href={profile.public_slug ? `/portfolio/${profile.public_slug}` : '/portfolio'}
          className="bg-white text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition shadow-sm w-full sm:w-auto text-center"
        >
          {t('dashboard.viewPublicPortfolio')}
        </Link>
      }
    >
      {/* Hidden file input for avatar upload */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleAvatarChange}
      />
      {section === 'overview' && (
        <>
          <SectionCard
            title={t('dashboard.profileCompletion')}
            description={t('dashboard.completionHint')}
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
                  {t('dashboard.completionText')}{' '}
                  <span className="font-semibold text-gray-800">{completion}%</span> {t('dashboard.completionProfile')}
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

          {/* Analytics merged into overview — replaces old CandidateStatsCard */}
          <SectionCard
            title={t('dashboard.statsAndActivity')}
            description={t('dashboard.statsHint')}
          >
            <AnalyticsDashboard />
          </SectionCard>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label={t('dashboard.skills')}
              value={(profile.skills || []).length}
              hint={t('dashboard.skillsCount')}
              tone="blue"
            />
            <StatCard
              label={t('dashboard.experience')}
              value={(profile.experiences || []).length}
              hint={t('dashboard.positionCount')}
              tone="emerald"
            />
            <StatCard
              label={t('dashboard.projects')}
              value={(profile.projects || []).length}
              hint={t('dashboard.projectCount')}
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
      {section === 'generate-cv' && <CVGeneratorPanel />}
      {section === 'invitations' && (
        <SectionCard
          title={t('dashboard.invitationsTitle')}
          description={t('dashboard.invitationsHint')}
        >
          <InvitationsManager />
        </SectionCard>
      )}
      {section === 'theme' && (
        <SectionCard title={t('dashboard.themeTitle')}>
          <ThemePicker
            currentTemplateId={profile.template_id}
            onSaved={() => refreshProfile()}
          />
        </SectionCard>
      )}
      {section === 'social' && <SocialAccountsManager />}
    </DashboardShell>
  )
}

export default function DashboardPage() {
  return (
    <ProfileProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-gray-600">...</p>
            </div>
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </ProfileProvider>
  )
}
