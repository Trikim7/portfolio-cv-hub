'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api'
import { useRecruiter } from '@/hooks/useRecruiter'
import { useAuth } from '@/hooks/AuthContext'
import CompanyProfile from '@/components/recruiter/CompanyProfile'
import SocialAccountsManager from '@/components/dashboard/SocialAccountsManager'
import JobRequirementList from '@/components/recruiter/JobRequirementList'
import JobRequirementForm from '@/components/recruiter/JobRequirementForm'
import RecruiterInvitationsPanel from '@/components/recruiter/RecruiterInvitationsPanel'

import DashboardShell, {
  DashboardNavItem,
  SectionCard,
  StatCard,
} from '@/components/layout/DashboardShell'
import { useTranslation } from 'react-i18next'
import { Company, JobInvitation } from '@/types'

type RecruiterSection = 'overview' | 'company' | 'actions' | 'job-requirements' | 'invitations' | 'social'

const NAV_SECTION_KEYS: Record<RecruiterSection, string> = {
  overview:           'recruiterDashboard.overview',
  company:            'recruiterDashboard.company',
  actions:            'recruiterDashboard.actions',
  'job-requirements': 'recruiterDashboard.jobRequirements',
  invitations:        'recruiterDashboard.invitations',
  social:             'recruiterDashboard.social',
}

export default function RecruiterDashboardPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { role, loading: authLoading } = useAuth()
  const { fetchCompanyProfile, loading: recruiterLoading } = useRecruiter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [company, setCompany] = useState<Company | null>(null)
  const [section, setSection] = useState<RecruiterSection>('overview')
  const [logoUploading, setLogoUploading] = useState(false)
  const [invitations, setInvitations] = useState<JobInvitation[]>([])
  const [candidatesFound, setCandidatesFound] = useState<{ total: number; sessions: number } | null>(null)
  const [jobRequirementsMode, setJobRequirementsMode] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [jobRequirementsRefresh, setJobRequirementsRefresh] = useState(0)

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
          <p className="text-gray-600">{t('common.checkingInfo')}</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) return null

  // Build nav dynamically per language
  const NAV: (DashboardNavItem & { id: RecruiterSection })[] = Object.keys(NAV_SECTION_KEYS).map(
    (id) => ({ id: id as RecruiterSection, label: t(NAV_SECTION_KEYS[id as RecruiterSection]) })
  )

  const statusBadge =
    company?.status === 'approved'
      ? t('recruiterDashboard.approved')
      : company?.status === 'pending'
        ? t('recruiterDashboard.pending')
        : company?.status || undefined

  return (
    <DashboardShell
      accent="purple"
      title={company?.company_name || t('recruiterDashboard.dashboardTitle')}
      subtitle={t('recruiterDashboard.recruitingHub')}
      userName={company?.company_name || undefined}
      userAvatarUrl={company?.logo_url || null}
      onAvatarClick={handleLogoClick}
      badge={logoUploading ? t('recruiterDashboard.uploadingLogo') : statusBadge}
      nav={NAV}
      activeId={section}
      activeNavLabel={t(NAV_SECTION_KEYS[section])}
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
            {t('recruiterDashboard.goToSearch')}
          </Link>
          <Link
            href="/recruiter/ranking"
            className="bg-white text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-xl text-sm font-semibold transition shadow"
          >
            {t('recruiterDashboard.goToRanking')}
          </Link>
        </div>
      }
    >
      {section === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label={t('recruiterDashboard.invitationsSent')}
              value={invitations.length > 0 ? String(invitations.length) : '0'}
              hint={invitations.length > 0 ? `${invitations.filter(i => i.status === 'pending').length} ${t('recruiterDashboard.awaitingResponse')}` : t('recruiterDashboard.noInvitations')}
              tone="purple"
            />
            <StatCard
              label={t('recruiterDashboard.candidatesFound')}
              value={candidatesFound !== null ? String(candidatesFound.total) : '—'}
              hint={
                candidatesFound === null
                  ? t('recruiterDashboard.loading')
                  : candidatesFound.sessions === 0
                    ? t('recruiterDashboard.noSearchSessions')
                    : t('recruiterDashboard.aiRankingSessions', { count: candidatesFound.sessions })
              }
              tone="emerald"
            />
            <StatCard
              label={t('recruiterDashboard.interested')}
              value={invitations.filter(i => i.status === 'interested').length > 0 ? String(invitations.filter(i => i.status === 'interested').length) : '0'}
              hint={invitations.filter(i => i.status === 'interested').length > 0 ? t('recruiterDashboard.positiveResponse') : t('recruiterDashboard.noResponse')}
              tone="amber"
            />
          </div>

          {/* Quick link to invitations detail */}
          {invitations.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSection('invitations')}
                className="text-sm font-semibold text-purple-700 hover:text-purple-900 hover:underline transition-colors"
              >
                {t('recruiterDashboard.viewInvitations')}
              </button>
            </div>
          )}

          <SectionCard
            title={t('recruiterDashboard.startRecruiting')}
            description={t('recruiterDashboard.startRecruitingHint')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/recruiter/search"
                className="group rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 hover:border-blue-400 transition"
              >
                <h3 className="font-bold text-gray-900">{t('recruiterDashboard.findCandidates')}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {t('recruiterDashboard.findCandidatesDesc')}
                </p>
                <p className="mt-3 text-sm font-semibold text-blue-700 group-hover:translate-x-1 transition">
                  {t('recruiterDashboard.openSearch')}
                </p>
              </Link>

              <Link
                href="/recruiter/ranking"
                className="group rounded-2xl border border-purple-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 hover:border-purple-400 transition"
              >
                <h3 className="font-bold text-gray-900">{t('ranking.candidateRanking')}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {t('recruiterDashboard.aiRankingDesc')}
                </p>
                <p className="mt-3 text-sm font-semibold text-purple-700 group-hover:translate-x-1 transition">
                  {t('recruiterDashboard.runAIRanking')}
                </p>
              </Link>
            </div>
          </SectionCard>

          <SectionCard
            title={t('recruiterDashboard.companySummary')}
            action={
              <button
                type="button"
                onClick={() => setSection('company')}
                className="text-sm font-semibold text-purple-700 hover:text-purple-900"
              >
                {t('recruiterDashboard.editCompany')}
              </button>
            }
          >
            {company ? (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-semibold uppercase text-gray-500">{t('recruiterDashboard.companyName')}</dt>
                  <dd className="mt-1 text-gray-900 font-medium">{company.company_name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-gray-500">{t('recruiterDashboard.industry')}</dt>
                  <dd className="mt-1 text-gray-900 font-medium">{company.industry || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-gray-500">{t('recruiterDashboard.location')}</dt>
                  <dd className="mt-1 text-gray-900 font-medium">{company.location || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-gray-500">{t('recruiterDashboard.website')}</dt>
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
              <p className="text-gray-500 text-sm">{t('recruiterDashboard.noCompanyInfo')}</p>
            )}
          </SectionCard>
        </>
      )}

      {section === 'company' && <CompanyProfile />}

      {section === 'actions' && (
        <SectionCard title={t('recruiterDashboard.recruitingTools')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/recruiter/search"
              className="p-5 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition"
            >
              <h3 className="font-semibold text-gray-900">{t('recruiterDashboard.findCandidates')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('recruiterDashboard.filterBySkill')}</p>
            </Link>
            <Link
              href="/recruiter/ranking"
              className="p-5 rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50/50 transition"
            >
              <h3 className="font-semibold text-gray-900">AI Ranking</h3>
              <p className="text-sm text-gray-500 mt-1">{t('recruiterDashboard.rankByJD')}</p>
            </Link>
          </div>
        </SectionCard>
      )}

      {section === 'job-requirements' && (
        <div className="space-y-5">
          {jobRequirementsMode === 'list' && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setJobRequirementsMode('create')
                  setSelectedJobId(null)
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl font-bold text-sm transition shadow-sm"
              >
                {t('recruiterDashboard.createJobReq')}
              </button>
            </div>
          )}

          {jobRequirementsMode === 'list' && (
            <JobRequirementList
              refreshTrigger={jobRequirementsRefresh}
              onEdit={(jobId) => {
                setSelectedJobId(jobId)
                setJobRequirementsMode('edit')
              }}
            />
          )}

          {(jobRequirementsMode === 'create' || jobRequirementsMode === 'edit') && (
            <JobRequirementForm
              jobId={selectedJobId || undefined}
              onSuccess={() => {
                setJobRequirementsMode('list')
                setSelectedJobId(null)
                setJobRequirementsRefresh(prev => prev + 1)
              }}
              onCancel={() => {
                setJobRequirementsMode('list')
                setSelectedJobId(null)
              }}
            />
          )}
        </div>
      )}

      {section === 'social' && <SocialAccountsManager />}

      {section === 'invitations' && (
        <SectionCard
          title={t('recruiterDashboard.invitationsSentTitle')}
          description={t('recruiterDashboard.invitationsSentHint')}
        >
          <RecruiterInvitationsPanel />
        </SectionCard>
      )}
    </DashboardShell>
  )
}
