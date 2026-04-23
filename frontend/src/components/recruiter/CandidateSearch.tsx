'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
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

  useEffect(() => {
    // Load job requirements when component mounts
    const fetchJobRequirements = async () => {
      try {
        const data = await apiClient.get('/api/recruiter/job-requirements', {
          params: { active_only: true },
        })
        setJobRequirements(data)
      } catch (err) {
        console.error('Lỗi tải yêu cầu công việc:', err)
      } finally {
        setLoadingJobs(false)
      }
    }
    fetchJobRequirements()
  }, [])

  useEffect(() => {
    if (!keyword && !skill && !experienceLevel && !location) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await apiClient.searchCandidates(
          keyword,
          skill,
          experienceLevel,
          location
        )
        setResults(data)
      } catch (err: any) {
        console.error('Lỗi tìm kiếm:', err)
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [keyword, skill, experienceLevel, location])

  const handleSelectJobRequirement = (jobId: string) => {
    if (!jobId) {
      setSkill('')
      setExperienceLevel('')
      return
    }

    const selected = jobRequirements.find(j => j.id.toString() === jobId)
    if (!selected) return

    // Auto-fill keyword with job title
    setKeyword(selected.title)

    // Map required_skills to comma-separated string
    const skillsText = selected.required_skills
      .map(s => s.name)
      .join(', ')

    // Map years_experience to experience level
    const expLevel = mapYearsToExperienceLevel(selected.years_experience)

    setSkill(skillsText || '')
    setExperienceLevel(expLevel)
    setLocation(selected.required_role || '')
  }

  const handleSearch = async () => {
    if (!keyword && !skill && !experienceLevel && !location) {
      showToast('Nhập ít nhất một tiêu chí để tìm kiếm', 'error')
      return
    }

    setLoading(true)
    try {
      const data = await apiClient.searchCandidates(
        keyword,
        skill,
        experienceLevel,
        location
      )
      setResults(data)
      showToast(`Tìm thấy ${data.length} ứng viên`, 'success')
    } catch (err: any) {
      showToast('Tìm kiếm thất bại', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const toggleSelect = (candidate: CandidateSearchResult) => {
    setSelectedCandidates(prev => {
      const exists = prev.find(c => c.id === candidate.id)
      if (exists) {
        return prev.filter(c => c.id !== candidate.id)
      } else {
        return [...prev, candidate]
      }
    })
  }

  const candidatesToCompare = useMemo(
    () => selectedCandidates,
    [selectedCandidates]
  )

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Bộ lọc tìm kiếm</h2>

        <div className="space-y-4">
          {jobRequirements.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Điền nhanh từ Yêu cầu công việc
              </label>
              <select
                onChange={(e) => handleSelectJobRequirement(e.target.value)}
                disabled={loadingJobs}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              >
                <option value="">-- Chọn yêu cầu công việc --</option>
                {jobRequirements.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Chọn một yêu cầu để tự động điền tiêu chí tìm kiếm</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Tên, vị trí, giới thiệu..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="Kỹ năng: Python, React, Node.js..."
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">Mức kinh nghiệm (Tất cả)</option>
              <option value="fresher">Fresher (0–1 năm)</option>
              <option value="junior">Junior (1–3 năm)</option>
              <option value="mid">Mid (3–5 năm)</option>
              <option value="senior">Senior (5+ năm)</option>
            </select>

            <input
              type="text"
              placeholder="Địa điểm: Hà Nội, TP.HCM, Đà Nẵng..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Đang tìm...' : 'Tìm kiếm ứng viên'}
          </button>

          {(keyword || skill || experienceLevel || location) && (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-sm text-purple-900 font-semibold mb-2">Bộ lọc đang áp dụng:</p>
              <div className="flex flex-wrap gap-2">
                {keyword && (
                  <span className="px-3 py-1 bg-white border border-purple-200 text-purple-800 text-xs rounded-full">
                    {keyword}
                  </span>
                )}
                {skill && (
                  <span className="px-3 py-1 bg-white border border-purple-200 text-purple-800 text-xs rounded-full">
                    {skill}
                  </span>
                )}
                {experienceLevel && (
                  <span className="px-3 py-1 bg-white border border-purple-200 text-purple-800 text-xs rounded-full">
                    {experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}
                  </span>
                )}
                {location && (
                  <span className="px-3 py-1 bg-white border border-purple-200 text-purple-800 text-xs rounded-full">
                    {location}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-base font-bold text-gray-900 mb-4">Kết quả ({results.length})</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((candidate) => {
              const selected = selectedCandidates.some((c) => c.id === candidate.id)
              const portfolioHref = candidate.public_slug
                ? `/portfolio/${candidate.public_slug}`
                : null

              return (
                <div
                  key={candidate.id}
                  className={`p-4 border rounded-xl transition-shadow ${selected
                    ? 'border-purple-400 bg-purple-50 shadow-sm'
                    : 'border-gray-200 hover:border-purple-200 hover:shadow-sm'
                  }`}
                >
                  {/* Top row: info + actions */}
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      {/* Clickable name → portfolio */}
                      {portfolioHref ? (
                        <Link
                          href={portfolioHref}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-gray-900 hover:text-purple-700 hover:underline truncate block transition-colors"
                        >
                          {candidate.full_name || 'Ứng viên'}
                        </Link>
                      ) : (
                        <h4 className="font-bold text-gray-900 truncate">
                          {candidate.full_name || 'Ứng viên'}
                        </h4>
                      )}
                      <p className="text-sm text-gray-600 truncate">
                        {candidate.headline || 'Chưa cập nhật'}
                      </p>
                    </div>

                    {/* Select for comparison */}
                    <button
                      onClick={() => toggleSelect(candidate)}
                      className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold transition ${selected
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selected ? 'Đã chọn' : 'Chọn'}
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2">{i18nToText(candidate.bio)}</p>

                  {candidate.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {candidate.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* View portfolio button */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {portfolioHref ? (
                      <Link
                        href={portfolioHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Xem hồ sơ công khai
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Hồ sơ chưa công khai</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>


          {selectedCandidates.length > 0 && (
            <div className="mt-5 p-4 bg-purple-50 border border-purple-200 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <p className="text-sm text-purple-900 font-semibold">
                Đã chọn {selectedCandidates.length} ứng viên
              </p>
              <button
                onClick={() => setShowComparison(true)}
                disabled={selectedCandidates.length < 2}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition"
              >
                So sánh ({selectedCandidates.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Comparison Modal */}
      {showComparison && (
        <ComparisonTable
          candidates={candidatesToCompare}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  )
}
