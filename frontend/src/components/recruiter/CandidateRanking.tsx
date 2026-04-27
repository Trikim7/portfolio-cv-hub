'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/services/api'
import {
  CandidateScore,
  RadarScores,
  RankingResponse,
} from '@/types'
import SearchHistoryList from './SearchHistoryList'
import CandidateRadarChart from './CandidateRadarChart'
import { Scale, Zap, FolderOpen, Search } from 'lucide-react'

// ─── Job Requirement Interface ────────────────────────────────────────────────
interface JobRequirement {
  id: number
  title: string
  required_skills: Array<{ name: string; level?: string }>
  years_experience?: number
  required_role?: string
  tech_stack?: string[]
  is_active: boolean
}

// ─── Local types ──────────────────────────────────────────────────────────────
/** All 6 weights fully required — avoids fighting with Partial<> from ScoringCriteria */
type WeightsConfig = {
  technical_skills: number
  experience: number
  portfolio: number
  soft_skills: number
  leadership: number
  readiness_signals: number
}

type RadarKey = keyof WeightsConfig

// ─── Preset icons (Lucide) ───────────────────────────────────────────────────────────────────
function PresetIcon({ id, className }: { id: PresetKey; className?: string }) {
  const cls = className ?? 'w-5 h-5'
  if (id === 'balanced')  return <Scale      className={cls} />
  if (id === 'tech')      return <Zap        className={cls} />
  // portfolio
  return <FolderOpen className={cls} />
}

// ─── Presets ──────────────────────────────────────────────────────────────────
type PresetKey = 'balanced' | 'tech' | 'portfolio'

interface Preset {
  labelKey: string
  descKey: string
  icon: string
  weights: WeightsConfig
}

const PRESETS: Record<PresetKey, Preset> = {
  balanced: {
    labelKey: 'ranking.balanced',
    descKey: 'ranking.balancedDesc',
    icon: 'balanced',
    weights: { technical_skills: 0.25, experience: 0.25, portfolio: 0.2, soft_skills: 0.1, leadership: 0.1, readiness_signals: 0.1 },
  },
  tech: {
    labelKey: 'ranking.technicalFocus',
    descKey: 'ranking.technicalFocusDesc',
    icon: 'tech',
    weights: { technical_skills: 0.4, experience: 0.3, portfolio: 0.15, soft_skills: 0.05, leadership: 0.05, readiness_signals: 0.05 },
  },
  portfolio: {
    labelKey: 'ranking.portfolioFocus',
    descKey: 'ranking.portfolioFocusDesc',
    icon: '🎨',
    weights: { technical_skills: 0.2, experience: 0.15, portfolio: 0.4, soft_skills: 0.1, leadership: 0.05, readiness_signals: 0.1 },
  },
}

const DEFAULT_WEIGHTS: WeightsConfig = PRESETS.balanced.weights

// ─── Auto-fill suggestions ─────────────────────────────────────────────────────
interface RoleSuggestion { role: string; skills: string[]; tech: string[] }
const ROLE_SUGGESTIONS: Record<string, RoleSuggestion> = {
  backend: { role: 'Backend', skills: ['Python', 'Node.js', 'REST API', 'SQL'], tech: ['FastAPI', 'PostgreSQL', 'Docker', 'Redis'] },
  frontend: { role: 'Frontend', skills: ['JavaScript', 'React', 'CSS', 'TypeScript'], tech: ['Next.js', 'Tailwind CSS', 'Figma'] },
  fullstack: { role: 'Fullstack', skills: ['JavaScript', 'React', 'Node.js', 'SQL'], tech: ['Next.js', 'PostgreSQL', 'Docker'] },
  data: { role: 'Data', skills: ['Python', 'SQL', 'Machine Learning', 'Statistics'], tech: ['Pandas', 'Scikit-learn', 'Spark', 'Tableau'] },
  devops: { role: 'DevOps', skills: ['Linux', 'CI/CD', 'Docker', 'Cloud'], tech: ['Kubernetes', 'Terraform', 'AWS', 'GitHub Actions'] },
}

const SKILL_SUGGESTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js',
  'Java', 'Go', 'SQL', 'NoSQL', 'Docker', 'Kubernetes',
  'AWS', 'REST API', 'GraphQL', 'Machine Learning',
]

const AXIS_META: Record<RadarKey, { label: string; tooltip: string }> = {
  technical_skills: { label: 'ranking.axis_technical_skills', tooltip: 'ranking.axis_technical_skills_tooltip' },
  experience: { label: 'ranking.axis_experience', tooltip: 'ranking.axis_experience_tooltip' },
  portfolio: { label: 'ranking.axis_portfolio', tooltip: 'ranking.axis_portfolio_tooltip' },
  soft_skills: { label: 'ranking.axis_soft_skills', tooltip: 'ranking.axis_soft_skills_tooltip' },
  leadership: { label: 'ranking.axis_leadership', tooltip: 'ranking.axis_leadership_tooltip' },
  readiness_signals: { label: 'ranking.axis_readiness_signals', tooltip: 'ranking.axis_readiness_signals_tooltip' },
}

const RADAR_KEYS: RadarKey[] = [
  'technical_skills', 'experience', 'portfolio',
  'soft_skills', 'leadership', 'readiness_signals',
]

const AXIS_SHORT: Record<RadarKey, string> = {
  technical_skills: 'scoring.technicalSkills',
  experience: 'scoring.experience',
  portfolio: 'scoring.portfolio',
  soft_skills: 'scoring.softSkills',
  leadership: 'scoring.leadership',
  readiness_signals: 'scoring.readinessSignals',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function scoreColor(v: number): string {
  if (v >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (v >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  if (v >= 40) return 'bg-orange-100 text-orange-700 border-orange-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

function scoreBar(v: number): string {
  if (v >= 80) return 'bg-emerald-500'
  if (v >= 60) return 'bg-yellow-400'
  if (v >= 40) return 'bg-orange-400'
  return 'bg-red-400'
}

function extractError(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { detail?: string } }; message?: string }
  return e?.response?.data?.detail ?? e?.message ?? fallback
}

// ─── TagInput ─────────────────────────────────────────────────────────────────
interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
}

function TagInput({ tags, onChange, suggestions = [], placeholder }: TagInputProps) {
  const [input, setInput] = useState('')
  const [showSuggest, setShowSuggest] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s),
  )

  const addTag = (tag: string) => {
    const t = tag.trim()
    if (t && !tags.includes(t)) onChange([...tags, t])
    setInput('')
    setShowSuggest(false)
    inputRef.current?.focus()
  }

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag))

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === 'Backspace' && !input && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="relative">
      <div
        className="min-h-[44px] flex flex-wrap gap-1.5 items-center px-3 py-2 border border-gray-300 rounded-xl bg-white focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-violet-500 transition cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 bg-violet-100 text-violet-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-500 transition leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggest(true) }}
          onKeyDown={handleKey}
          onFocus={() => setShowSuggest(true)}
          onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-24 outline-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400"
        />
      </div>
      {showSuggest && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-44 overflow-auto">
          {filtered.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => addTag(s)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-violet-50 text-gray-700 transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block ml-1">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold inline-flex items-center justify-center hover:bg-violet-200 hover:text-violet-700 transition"
      >
        ?
      </button>
      {show && (
        <span className="absolute left-5 top-0 z-30 w-52 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl leading-relaxed">
          {text}
        </span>
      )}
    </span>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
interface SectionProps { step: number; title: string; desc: string; children: React.ReactNode }
function Section({ step, title, desc, children }: SectionProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-8 h-8 rounded-xl bg-violet-600 text-white text-sm font-extrabold flex items-center justify-center shrink-0 shadow">
          {step}
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Label ────────────────────────────────────────────────────────────────────
interface LabelProps { children: React.ReactNode; tooltip?: string }
function FieldLabel({ children, tooltip }: LabelProps) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children}
      {tooltip && <Tooltip text={tooltip} />}
    </label>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CandidateRanking() {
  const { t } = useTranslation()
  
  // Form state
  const [jobTitle, setJobTitle] = useState('')
  const [roleType, setRoleType] = useState('')
  const [yearsExp, setYearsExp] = useState(2)
  const [skills, setSkills] = useState<string[]>([])
  const [techStack, setTechStack] = useState<string[]>([])
  const [preset, setPreset] = useState<PresetKey>('balanced')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [weights, setWeights] = useState<WeightsConfig>(DEFAULT_WEIGHTS)
  const [minScore, setMinScore] = useState(0)

  // API state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RankingResponse | null>(null)

  // Job requirements state
  const [jobRequirements, setJobRequirements] = useState<JobRequirement[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)

  // Incremented after each successful run to auto-refresh history list
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  // Invitation state
  const [inviteTarget, setInviteTarget] = useState<{ id: number; name: string } | null>(null)
  const [inviteJobTitle, setInviteJobTitle] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  // Set of candidate IDs that already received an invite this session
  const [invitedIds, setInvitedIds] = useState<Set<number>>(new Set())

  // Tooltip state — use React state instead of CSS group-hover
  // so tooltip stays alive as mouse moves from card → tooltip
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openTooltip = (id: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setHoveredId(id)
  }
  const closeTooltip = () => {
    closeTimer.current = setTimeout(() => setHoveredId(null), 120)
  }

  // Auto-fill when job title changes
  useEffect(() => {
    const lower = jobTitle.toLowerCase()
    const matchKey = Object.keys(ROLE_SUGGESTIONS).find((k) => lower.includes(k))
    if (matchKey) {
      const s = ROLE_SUGGESTIONS[matchKey]
      if (!roleType) setRoleType(s.role)
      if (skills.length === 0) setSkills(s.skills)
      if (techStack.length === 0) setTechStack(s.tech)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobTitle])

  // Fetch job requirements on mount
  useEffect(() => {
    const fetchJobRequirements = async () => {
      try {
        const data = await apiClient.get('/api/recruiter/job-requirements', {
          params: { active_only: true },
        })
        setJobRequirements(data)
      } catch (err) {
        console.error('Error loading job requirements:', err)
      } finally {
        setLoadingJobs(false)
      }
    }
    fetchJobRequirements()
  }, [])

  // Load latest default weights configured by admin.
  useEffect(() => {
    let mounted = true
    apiClient.getDefaultRankingWeights()
      .then((data) => {
        if (!mounted) return
        const parseWeight = (value: unknown, fallback: number) => {
          const num = Number(value)
          return Number.isFinite(num) ? num : fallback
        }
        const nextWeights: WeightsConfig = {
          technical_skills: parseWeight(data.technical_skills, DEFAULT_WEIGHTS.technical_skills),
          experience: parseWeight(data.experience, DEFAULT_WEIGHTS.experience),
          portfolio: parseWeight(data.portfolio, DEFAULT_WEIGHTS.portfolio),
          soft_skills: parseWeight(data.soft_skills, DEFAULT_WEIGHTS.soft_skills),
          leadership: parseWeight(data.leadership, DEFAULT_WEIGHTS.leadership),
          readiness_signals: parseWeight(data.readiness_signals, DEFAULT_WEIGHTS.readiness_signals),
        }
        setWeights(nextWeights)
      })
      .catch(() => {
        if (!mounted) return
        setWeights(DEFAULT_WEIGHTS)
      })
    return () => { mounted = false }
  }, [])

  const handleSelectJobRequirement = (jobId: string) => {
    if (!jobId) {
      setJobTitle('')
      setSkills([])
      setTechStack([])
      setYearsExp(2)
      setRoleType('')
      return
    }

    const selected = jobRequirements.find(j => j.id.toString() === jobId)
    if (!selected) return

    // Fill title
    setJobTitle(selected.title)

    // Fill role - map from required_role to available role types
    const roleMapping: Record<string, string> = {
      'backend': 'Backend',
      'frontend': 'Frontend',
      'fullstack': 'Fullstack',
      'data': 'Data',
      'devops': 'DevOps',
      'mobile': 'Mobile',
    }

    if (selected.required_role) {
      const mappedRole = roleMapping[selected.required_role.toLowerCase()] || selected.required_role
      setRoleType(mappedRole)
    }

    // Fill years experience
    if (selected.years_experience) {
      setYearsExp(selected.years_experience)
    }

    // Fill skills
    const skillsText = selected.required_skills
      .map(s => s.name)
      .filter(Boolean)
    setSkills(skillsText)

    // Fill tech stack
    if (selected.tech_stack && selected.tech_stack.length > 0) {
      setTechStack(selected.tech_stack)
    }
  }

  const applyPreset = (key: PresetKey) => {
    setPreset(key)
    setWeights(PRESETS[key].weights)
    setShowAdvanced(false)
  }

  const updateWeight = (axis: RadarKey, val: number) => {
    setWeights((prev) => ({ ...prev, [axis]: val }))
  }


  const handleRerun = (criteriaJson: Record<string, unknown>) => {
    // criteria_json is stored as { criteria_source: {...}, results: [...] }
    // the actual search params live inside criteria_source
    const raw = (criteriaJson.criteria_source as Record<string, unknown> | undefined) ?? criteriaJson
    if (raw.title && typeof raw.title === 'string') setJobTitle(raw.title)
    if (raw.required_role && typeof raw.required_role === 'string') setRoleType(raw.required_role)
    if (raw.years_experience !== undefined) setYearsExp(Number(raw.years_experience))
    const rawSkills = raw.required_skills as unknown[] | undefined
    if (rawSkills?.length) {
      setSkills(rawSkills.map((s) => typeof s === 'string' ? s : (s as { name: string }).name).filter(Boolean))
    }
    const rawTech = raw.tech_stack as string[] | undefined
    if (rawTech?.length) setTechStack(rawTech)
    const rawW = raw.weights_config as Record<string, number> | undefined
    if (rawW) {
      setWeights((prev) => ({ ...prev, ...rawW } as WeightsConfig))
      setPreset('balanced')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRun = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.rankCandidates({
        criteria: {
          title: jobTitle || 'Ad-hoc search',
          required_skills: skills,
          years_experience: yearsExp,
          required_role: roleType,
          customer_facing: false,
          tech_stack: techStack.length > 0 ? techStack : undefined,
          is_management_role: false,
          weights_config: weights,
        },
        limit: 50,
      })
      setResult(res)
      // Trigger auto-refresh of the history panel
      setHistoryRefreshKey((k) => k + 1)
    } catch (err: unknown) {
      setError(extractError(err, t('ranking.load_results_error')))
    } finally {
      setLoading(false)
    }
  }


  const filteredCandidates: CandidateScore[] = useMemo(
    () => (result?.candidates ?? []).filter((c) => c.overall_match >= minScore),
    [result, minScore],
  )

  const totalWeight = RADAR_KEYS.reduce((sum, k) => sum + weights[k], 0) || 1

  const previewPriorities = RADAR_KEYS
    .map((k) => ({ key: k, label: t(AXIS_META[k].label as any), pct: Math.round((weights[k] / totalWeight) * 100) }))
    .sort((a, b) => b.pct - a.pct)

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Invite Modal ── */}
      {inviteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">{t('ranking.invite_modal_title')}</h3>
              <button
                type="button"
                onClick={() => { setInviteTarget(null); setInviteError(null) }}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >×</button>
            </div>
            <p className="text-sm text-gray-500">
              {t('ranking.invite_modal_to')} <span className="font-semibold text-gray-800">{inviteTarget.name}</span>
            </p>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('ranking.invite_job_title_label')} <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={inviteJobTitle}
                onChange={e => setInviteJobTitle(e.target.value)}
                placeholder={jobTitle || t('ranking.placeholder_job_title')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('ranking.invite_message_label')}</label>
              <textarea
                value={inviteMessage}
                onChange={e => setInviteMessage(e.target.value)}
                rows={3}
                placeholder={t('ranking.invite_message_placeholder')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition resize-none"
              />
            </div>
            {inviteError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{inviteError}</p>
            )}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setInviteTarget(null); setInviteError(null) }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                {t('ranking.invite_cancel')}
              </button>
              <button
                type="button"
                disabled={inviteSending || !inviteJobTitle.trim()}
                onClick={async () => {
                  if (!inviteTarget || !inviteJobTitle.trim()) return
                  setInviteSending(true)
                  setInviteError(null)
                  try {
                    await apiClient.sendJobInvitation(
                      inviteTarget.id,
                      inviteJobTitle.trim(),
                      inviteMessage.trim() || undefined,
                    )
                    setInvitedIds(prev => new Set(prev).add(inviteTarget.id))
                    setInviteTarget(null)
                    setInviteMessage('')
                  } catch (err: unknown) {
                    setInviteError(extractError(err, t('ranking.invite_send_error')))
                  } finally {
                    setInviteSending(false)
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold transition shadow-sm"
              >
                {inviteSending ? t('comparison.sending') : t('comparison.sendInvitation')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Section 1: Job Overview ── */}
      <Section step={1} title={t('ranking.sectionJobTitle')} desc={t('ranking.sectionJobDesc')}>
        {jobRequirements.length > 0 && (
          <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('candidateSearch.quickFillLabel')}
            </label>
            <select
              onChange={(e) => handleSelectJobRequirement(e.target.value)}
              disabled={loadingJobs}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
            >
              <option value="">{t('candidateSearch.selectJobReq')}</option>
              {jobRequirements.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-1.5">{t('candidateSearch.quickFillHint')}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <FieldLabel tooltip={t('ranking.axis_technical_skills_tooltip') as string}>{t('ranking.jobTitle')}</FieldLabel>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder={t('ranking.placeholder_job_title')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
            />
          </div>
          <div>
            <FieldLabel tooltip={t('ranking.axis_readiness_signals_tooltip') as string}>{t('ranking.roleType')}</FieldLabel>
            <select
              value={roleType}
              onChange={(e) => setRoleType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
            >
              <option value="">{t('ranking.select_placeholder')}</option>
              <option value="Backend">Backend</option>
              <option value="Frontend">Frontend</option>
              <option value="Fullstack">Fullstack</option>
              <option value="Data">Data / AI</option>
              <option value="DevOps">DevOps / Cloud</option>
              <option value="Mobile">Mobile</option>
            </select>
          </div>
          <div>
            <FieldLabel tooltip={t('ranking.axis_experience_tooltip') as string}>{t('ranking.min_experience_label')}</FieldLabel>
            <div className="flex items-center gap-3">
              <input
                type="range" min={0} max={10} step={1}
                value={yearsExp}
                onChange={(e) => setYearsExp(Number(e.target.value))}
                className="flex-1 accent-violet-600"
              />
              <span className="w-24 text-center text-sm font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg py-1.5">
                {yearsExp === 0 ? t('ranking.no_exp_required') : `${yearsExp} ${t('ranking.years_suffix')}`}
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Section 2: Core Requirements ── */}
      <Section step={2} title={t('ranking.sectionSkillsTitle')} desc={t('ranking.sectionSkillsDesc')}>
        <div className="space-y-4">
          <div>
            <FieldLabel tooltip={t('ranking.axis_technical_skills_tooltip') as string}>
              {t('ranking.requiredSkills')} <span className="text-red-500">*</span>
            </FieldLabel>
            <TagInput
              tags={skills}
              onChange={setSkills}
              suggestions={SKILL_SUGGESTIONS}
              placeholder={t('ranking.placeholder_skills')}
            />
            {skills.length === 0 && (
              <p className="text-xs text-gray-400 mt-1.5">
                {t('ranking.skills_hint')}
              </p>
            )}
          </div>
          <div>
            <FieldLabel tooltip={t('ranking.axis_technical_skills_tooltip') as string}>
              {t('ranking.techStack')}{' '}
            </FieldLabel>
            <TagInput
              tags={techStack}
              onChange={setTechStack}
              suggestions={['Docker', 'PostgreSQL', 'Redis', 'Next.js', 'FastAPI', 'Django', 'Spring Boot', 'Kubernetes', 'AWS', 'GCP', 'Figma', 'Tailwind CSS']}
              placeholder={t('ranking.tech_stack_placeholder')}
            />
          </div>
        </div>
      </Section>

      {/* ── Section 3: Evaluation Preferences ── */}
      <Section step={3} title={t('ranking.evaluation_criteria_title')} desc={t('ranking.evaluation_criteria_desc')}>
        {/* Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {(Object.keys(PRESETS) as PresetKey[]).map((key) => {
            const p = PRESETS[key]
            const active = preset === key && !showAdvanced
            return (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className={`rounded-xl border-2 p-4 text-left transition ${active
                  ? 'border-violet-500 bg-violet-50 shadow-sm'
                  : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                  }`}
              >
                <PresetIcon id={key} className="w-5 h-5" />
                <p className={`text-sm font-bold mt-1 ${active ? 'text-violet-700' : 'text-gray-800'}`}>
                  {t(p.labelKey as any)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{t(p.descKey as any)}</p>
              </button>
            )
          })}
        </div>

        {/* Evaluation preview — hidden when advanced sliders are open */}
        {!showAdvanced && <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider mb-3">
            {t('ranking.previewScoringMethod')}
          </p>
          <div className="space-y-2">
            {previewPriorities.map(({ key, label, pct }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-36 shrink-0 truncate">{label}</span>
                <div className="flex-1 h-2 bg-white/70 rounded-full overflow-hidden border border-violet-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-violet-700 w-9 text-right shrink-0">{pct}%</span>
              </div>
            ))}
          </div>
        </div>}

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-800 transition"
        >
          <span className={`inline-block transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>▶</span>
          {showAdvanced ? t('ranking.hideCustomization') : t('ranking.advancedCustomization')}
        </button>

        {showAdvanced && (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-4">
              {t('ranking.adjustWeights')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {RADAR_KEYS.map((axis) => (
                <div key={axis}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700 flex items-center">
                      {t(AXIS_META[axis].label as any)}
                      <Tooltip text={t(AXIS_META[axis].tooltip as any)} />
                    </span>
                    <span className="text-xs font-bold text-violet-700">
                      {Math.round((weights[axis] / totalWeight) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range" min={0} max={1} step={0.05}
                    value={weights[axis]}
                    onChange={(e) => updateWeight(axis, Number(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* ── CTA + Score filter ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1">
            <button
              onClick={handleRun}
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t('ranking.searching')}
                </>
              ) : (
                <>{t('ranking.findCandidates')}</>
              )}
            </button>
          </div>

          {result && (
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm text-gray-500 whitespace-nowrap">{t('ranking.minimumScore')}</span>
              <input
                type="range" min={0} max={100} step={5}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-28 accent-violet-600"
              />
              <span className="text-sm font-bold text-violet-700 w-10 text-right">{minScore}%</span>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
      </div>

      {/* ── Results ── */}
      {result && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {t('ranking.results')}{' '}
              <span className="text-violet-600">{filteredCandidates.length}</span>
              <span className="text-gray-400 font-normal text-base">/{result.total} {t('ranking.totalCandidates')}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{t('ranking.sortedByMatch')}</p>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="text-center py-10">
              <div className="flex justify-center mb-3">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">{t('ranking.noResults')}</p>
              <p className="text-sm text-gray-400 mt-1">
                {t('ranking.tryReduceScore')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCandidates.map((c, idx) => {
                const rank = (c.match_details?.ranking as number | undefined) ?? idx + 1
                const score = c.overall_match
                const radarScores = c.radar_scores as RadarScores
                const name = c.full_name ?? `${t('ranking.candidate_label')} ${c.candidate_id}`
                const avatarUrl = c.match_details?.avatar_url as string | undefined

                // Avatar initials + deterministic colour (fallback when no photo)
                const AVATAR_PALETTE = [
                  'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
                  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500',
                ]
                const avatarBg = AVATAR_PALETTE[c.candidate_id % AVATAR_PALETTE.length]
                const initials = name.split(' ').filter(Boolean).map((w: string) => w[0]).slice(-2).join('').toUpperCase()

                // Rank ring colour
                const ringCls = rank === 1 ? 'ring-2 ring-violet-500' :
                  rank === 2 ? 'ring-2 ring-gray-400' :
                    rank === 3 ? 'ring-2 ring-amber-400' : ''

                // Insights: top axes vs bottom axes vs required skills
                const sortedAxes = RADAR_KEYS
                  .map((k) => ({ key: k, val: radarScores[k] }))
                  .sort((a, b) => b.val - a.val)
                const strongAxes = sortedAxes.filter(a => a.val >= 7).slice(0, 2)
                const weakAxes = sortedAxes.filter(a => a.val < 5).slice(0, 1)

                return (
                  <div
                    key={c.candidate_id}
                    className={`relative rounded-xl border p-4 transition ${rank === 1 ? 'border-violet-300 bg-violet-50/40' : 'border-gray-200 hover:border-violet-200 hover:bg-gray-50/60'}`}
                    onMouseEnter={() => openTooltip(c.candidate_id)}
                    onMouseLeave={closeTooltip}
                  >
                    <div className="flex items-center gap-3">
                      {/* ── Avatar with rank badge ── */}
                      <div className="relative shrink-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={name}
                            className={`w-10 h-10 rounded-xl object-cover shadow-sm ${ringCls}`}
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-xl ${avatarBg} ${ringCls} text-white flex items-center justify-center text-sm font-extrabold shadow-sm`}>
                            {initials || '?'}
                          </div>
                        )}
                        {/* Rank pill */}
                        <span className={`absolute -bottom-1.5 -right-1.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none ${rank === 1 ? 'bg-violet-600 text-white' :
                          rank === 2 ? 'bg-gray-600   text-white' :
                            rank === 3 ? 'bg-amber-500  text-white' :
                              'bg-gray-100 text-gray-500'
                          }`}>
                          {rank}
                        </span>
                      </div>

                      {/* ── Main info ── */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-gray-900 truncate text-sm">{name}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (invitedIds.has(c.candidate_id)) return
                                setInviteJobTitle(jobTitle)
                                setInviteTarget({ id: c.candidate_id, name })
                              }}
                              className={`text-xs px-2.5 py-1 rounded-full font-semibold transition ${invitedIds.has(c.candidate_id)
                                ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                                }`}
                            >
                              {invitedIds.has(c.candidate_id) ? '✔ ' + t('ranking.invitationSent') : t('ranking.sendInvitation')}
                            </button>
                            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-extrabold ${scoreColor(score)}`}>
                              {score.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        {/* Score bar */}
                        <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${scoreBar(score)}`} style={{ width: `${score}%` }} />
                        </div>
                        {/* Mini breakdown chips */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {RADAR_KEYS.map((axis) => {
                            const val = radarScores[axis]
                            return (
                              <span key={axis} className={`text-[11px] px-2 py-0.5 rounded-full ${val >= 7 ? 'bg-emerald-50 text-emerald-700' :
                                val >= 4 ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-500'
                                }`}>
                                {t(AXIS_SHORT[axis] as any)}: {val.toFixed(1)}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* ── Hover Tooltip ── */}
                    <div
                      onMouseEnter={() => openTooltip(c.candidate_id)}
                      onMouseLeave={closeTooltip}
                      className={`absolute left-0 top-full pt-2 z-50 w-72 transition-all duration-200 ${hoveredId === c.candidate_id
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 translate-y-1 pointer-events-none'
                        }`}
                    >
                      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-center gap-2.5">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={name}
                              className="w-9 h-9 rounded-xl object-cover shrink-0"
                            />
                          ) : (
                            <div className={`w-9 h-9 rounded-xl ${avatarBg} text-white flex items-center justify-center text-xs font-extrabold shrink-0`}>
                              {initials || '?'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
                            <p className="text-xs text-gray-400">
                              {t('ranking.overallScore')}: <span className="font-semibold text-violet-600">{score.toFixed(1)}%</span>
                              &nbsp;·&nbsp;{t('ranking.rank')} {rank}
                            </p>
                          </div>
                        </div>

                        {/* Key Insights */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{t('ranking.quickInsights')}</p>
                          <ul className="space-y-1">
                            {strongAxes.map(a => (
                              <li key={a.key} className="flex items-start gap-1.5 text-xs text-gray-700">
                                <span className="text-emerald-500 mt-0.5 shrink-0">✔</span>
                                <span>{t('scoring.good')}: <span className="font-semibold">{t(AXIS_META[a.key].label as any)}</span> ({a.val.toFixed(1)}/10)</span>
                              </li>
                            ))}
                            {weakAxes.map(a => (
                              <li key={a.key} className="flex items-start gap-1.5 text-xs text-gray-700">
                                <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
                                <span>{t('scoring.weak')}: <span className="font-semibold">{t(AXIS_META[a.key].label as any)}</span> ({a.val.toFixed(1)}/10)</span>
                              </li>
                            ))}
                            {strongAxes.length === 0 && weakAxes.length === 0 && (
                              <li className="text-xs text-gray-400 italic">{t('ranking.needMoreReview')}</li>
                            )}
                          </ul>
                        </div>

                        {/* Radar Chart */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">{t('ranking.radarChart')}</p>
                          <CandidateRadarChart radarScores={radarScores} candidateName={name} />
                        </div>

                        {/* Full radar breakdown */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{t('ranking.detailedScores')}</p>
                          <div className="space-y-1">
                            {RADAR_KEYS.map(axis => {
                              const val = radarScores[axis]
                              return (
                                <div key={axis} className="flex items-center gap-2">
                                  <span className="text-[11px] text-gray-500 w-28 shrink-0 truncate">{t(AXIS_META[axis].label as any)}</span>
                                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${val >= 7 ? 'bg-emerald-400' : val >= 4 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                      style={{ width: `${val * 10}%` }}
                                    />
                                  </div>
                                  <span className={`text-[11px] font-bold w-7 text-right shrink-0 ${val >= 7 ? 'text-emerald-600' : val >= 4 ? 'text-yellow-600' : 'text-red-500'}`}>
                                    {val.toFixed(1)}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* CTA — view full profile */}
                        <div className="pt-2 border-t border-gray-100">
                          <a
                            href={
                              (c.match_details?.public_slug as string | undefined)
                                ? `/portfolio/${c.match_details.public_slug}`
                                : `/portfolio?id=${c.candidate_id}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-semibold transition shadow-sm"
                          >
                            {t('ranking.viewFullProfile')}
                          </a>
                        </div>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}


      {/* ── History ── */}
      <SearchHistoryList onRerun={handleRerun} refreshKey={historyRefreshKey} />

    </div>
  )
}
