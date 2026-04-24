'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/services/api'
import { useToast } from '@/components/Toast'
import { ExternalLink } from 'lucide-react'
import { CandidateSearchResult, I18nText } from '@/types'
import ComparisonTable from './ComparisonTable'

const i18nToText = (value: I18nText): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.vi || value.en || Object.values(value)[0] || ''
}

interface JobRequirement {
  id: number
  title: string
  required_skills: Array<{ name: string; level?: string }>
  years_experience?: number
  required_role?: string
  tech_stack?: string[]
  is_active: boolean
}

const mapYearsToExperienceLevel = (years?: number): string => {
  if (!years) return ''
  if (years < 1) return 'fresher'
  if (years < 3) return 'junior'
  if (years < 5) return 'mid'
  return 'senior'
}

export default function CandidateSearch() {
  const { t } = useTranslation()
  const [keyword, setKeyword] = useState('')
  const [skill, setSkill] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [location, setLocation] = useState('')
  const [results, setResults] = useState<CandidateSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCandidates, setSelectedCandidates] = useState<CandidateSearchResult[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const { showToast } = useToast()
  const [jobRequirements, setJobRequirements] = useState<JobRequirement[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)

  // Read max_comparison limit set by admin (stored in localStorage, default 3)
  const maxCompare = (() => {
    if (typeof window === 'undefined') return 3
    const v = parseInt(localStorage.getItem('max_comparison') ?? '3', 10)
    return isNaN(v) || v < 1 ? 3 : Math.min(v, 5)
  })()

  useEffect(() => {
    const fetchJobRequirements = async () => {
      try {
        const data = await apiClient.get('/api/recruiter/job-requirements', { params: { active_only: true } })
        setJobRequirements(data)
      } catch { /* silent */ } finally {
        setLoadingJobs(false)
      }
    }
    fetchJobRequirements()
  }, [])

  useEffect(() => {
    if (!keyword && !skill && !experienceLevel && !location) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await apiClient.searchCandidates(keyword, skill, experienceLevel, location)
        setResults(data)
      } catch { /* silent */ } finally { setLoading(false) }
    }, 500)
    return () => clearTimeout(timer)
  }, [keyword, skill, experienceLevel, location])

  const handleSelectJobRequirement = (jobId: string) => {
    if (!jobId) { setSkill(''); setExperienceLevel(''); return }
    const selected = jobRequirements.find(j => j.id.toString() === jobId)
    if (!selected) return
    setKeyword(selected.title)
    setSkill(selected.required_skills.map(s => s.name).join(', ') || '')
    setExperienceLevel(mapYearsToExperienceLevel(selected.years_experience))
    setLocation(selected.required_role || '')
  }

  const handleSearch = async () => {
    if (!keyword && !skill && !experienceLevel && !location) {
      showToast(t('candidateSearch.needCriteria'), 'error'); return
    }
    setLoading(true)
    try {
      const data = await apiClient.searchCandidates(keyword, skill, experienceLevel, location)
      setResults(data)
      showToast(`${t('candidateSearch.found')} ${data.length} ${t('candidateSearch.candidates')}`, 'success')
    } catch {
      showToast(t('candidateSearch.searchFailed'), 'error')
    } finally { setLoading(false) }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch() }

  const toggleSelect = (candidate: CandidateSearchResult) => {
    setSelectedCandidates(prev => {
      const exists = prev.find(c => c.id === candidate.id)
      if (!exists && prev.length >= maxCompare) {
        showToast(t('candidateSearch.maxCompareReached', { max: maxCompare }), 'error')
        return prev
      }
      return exists ? prev.filter(c => c.id !== candidate.id) : [...prev, candidate]
    })
  }

  const candidatesToCompare = useMemo(() => selectedCandidates, [selectedCandidates])

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-5">{t('candidateSearch.filterTitle')}</h2>

        <div className="space-y-4">
          {jobRequirements.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('candidateSearch.quickFillLabel')}</label>
              <select
                onChange={(e) => handleSelectJobRequirement(e.target.value)}
                disabled={loadingJobs}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              >
                <option value="">{t('candidateSearch.selectJobReq')}</option>
                {jobRequirements.map((job) => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">{t('candidateSearch.quickFillHint')}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder={t('candidateSearch.keywordPlaceholder')}
              value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyPress={handleKeyPress}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <input type="text" placeholder={t('candidateSearch.skillsPlaceholder')}
              value={skill} onChange={(e) => setSkill(e.target.value)} onKeyPress={handleKeyPress}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
              <option value="">{t('candidateSearch.expLevel')}</option>
              <option value="fresher">Fresher (0–1 năm)</option>
              <option value="junior">Junior (1–3 năm)</option>
              <option value="mid">Mid (3–5 năm)</option>
              <option value="senior">Senior (5+ năm)</option>
            </select>
            <input type="text" placeholder={t('candidateSearch.locationPlaceholder')}
              value={location} onChange={(e) => setLocation(e.target.value)} onKeyPress={handleKeyPress}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>

          <button onClick={handleSearch} disabled={loading}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition">
            {loading ? t('candidateSearch.searching') : t('candidateSearch.search')}
          </button>

          {(keyword || skill || experienceLevel || location) && (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-sm text-purple-900 font-semibold mb-2">{t('candidateSearch.activeFilters')}</p>
              <div className="flex flex-wrap gap-2">
                {keyword && <span className="px-3 py-1 bg-white border border-purple-200 text-purple-800 text-xs rounded-full">{keyword}</span>}
                {skill && <span className="px-3 py-1 bg-white border border-purple-200 text-purple-800 text-xs rounded-full">{skill}</span>}
                {experienceLevel && <span className="px-3 py-1 bg-white border border-purple-200 text-purple-800 text-xs rounded-full">{experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}</span>}
                {location && <span className="px-3 py-1 bg-white border border-purple-200 text-purple-800 text-xs rounded-full">{location}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-base font-bold text-gray-900 mb-4">{t('candidateSearch.results')} ({results.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((candidate) => {
              const selected = selectedCandidates.some((c) => c.id === candidate.id)
              const portfolioHref = candidate.public_slug ? `/portfolio/${candidate.public_slug}` : null
              return (
                <div key={candidate.id} className={`p-4 border rounded-xl transition-shadow ${selected ? 'border-purple-400 bg-purple-50 shadow-sm' : 'border-gray-200 hover:border-purple-200 hover:shadow-sm'}`}>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      {portfolioHref ? (
                        <Link href={portfolioHref} target="_blank" rel="noreferrer"
                          className="font-bold text-gray-900 hover:text-purple-700 hover:underline truncate block transition-colors">
                          {candidate.full_name || t('candidateSearch.noResult')}
                        </Link>
                      ) : (
                        <h4 className="font-bold text-gray-900 truncate">{candidate.full_name || t('candidateSearch.noResult')}</h4>
                      )}
                      <p className="text-sm text-gray-600 truncate">{candidate.headline || t('candidateSearch.noResult')}</p>
                    </div>
                    <button onClick={() => toggleSelect(candidate)}
                      className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold transition ${selected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {selected ? t('candidateSearch.selected') : t('candidateSearch.select')}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{i18nToText(candidate.bio)}</p>
                  {candidate.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {candidate.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md">{s}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {portfolioHref ? (
                      <Link href={portfolioHref} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                        {t('candidateSearch.viewPublicProfile')}
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400 italic">{t('candidateSearch.notPublic')}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {selectedCandidates.length > 0 && (
            <div className="mt-5 p-4 bg-purple-50 border border-purple-200 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <p className="text-sm text-purple-900 font-semibold">
                {t('candidateSearch.selectedCount')} {selectedCandidates.length}/{maxCompare} {t('candidateSearch.candidates')}
              </p>
              <button onClick={() => setShowComparison(true)} disabled={selectedCandidates.length < 2}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition">
                {t('candidateSearch.compare')} ({selectedCandidates.length})
              </button>
            </div>
          )}
        </div>
      )}

      {showComparison && (
        <ComparisonTable candidates={candidatesToCompare} onClose={() => setShowComparison(false)} />
      )}
    </div>
  )
}
