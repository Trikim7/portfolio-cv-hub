'use client'

import { useState, useMemo, useEffect } from 'react'
import { apiClient } from '@/services/api'
import { useToast } from '@/components/Toast'
import { CandidateSearchResult, I18nText } from '@/types'
import ComparisonTable from './ComparisonTable'

const i18nToText = (value: I18nText): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.vi || value.en || Object.values(value)[0] || ''
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
      {/* Search Bar & Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">🔍 Tìm kiếm ứng viên</h2>
        
        <div className="space-y-4">
          {/* Row 1: Keyword + Skill */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="📝 Tên, vị trí, bio..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="text"
              placeholder="🛠️ Kỹ năng: Python, React, Node.js..."
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Row 2: Experience Level + Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">📊 Mức kinh nghiệm (Tất cả)</option>
              <option value="fresher">🌱 Fresher (0-1 năm)</option>
              <option value="junior">👨‍💼 Junior (1-3 năm)</option>
              <option value="mid">👨‍💻 Mid (3-5 năm)</option>
              <option value="senior">👴 Senior (5+ năm)</option>
            </select>

            <input
              type="text"
              placeholder="📍 Địa điểm: Hà Nội, TP.HCM, Đà Nẵng..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
          >
            {loading ? '⏳ Tìm kiếm...' : '🔍 Tìm kiếm ứng viên'}
          </button>

          {/* Active Filters Display */}
          {(keyword || skill || experienceLevel || location) && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700 font-semibold mb-2">🎯 Bộ lọc đang áp dụng:</p>
              <div className="flex flex-wrap gap-2">
                {keyword && (
                  <span className="px-3 py-1 bg-blue-200 text-blue-800 text-sm rounded-full">
                    📝 {keyword}
                  </span>
                )}
                {skill && (
                  <span className="px-3 py-1 bg-blue-200 text-blue-800 text-sm rounded-full">
                    🛠️ {skill}
                  </span>
                )}
                {experienceLevel && (
                  <span className="px-3 py-1 bg-blue-200 text-blue-800 text-sm rounded-full">
                    📊 {experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}
                  </span>
                )}
                {location && (
                  <span className="px-3 py-1 bg-blue-200 text-blue-800 text-sm rounded-full">
                    📍 {location}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4">Kết quả ({results.length})</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((candidate) => (
              <div
                key={candidate.id}
                className={`p-4 border-2 rounded-lg transition ${
                  selectedCandidates.some(c => c.id === candidate.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{candidate.full_name || 'Ứng viên'}</h4>
                    <p className="text-sm text-gray-600">{candidate.headline || 'Chưa cập nhật'}</p>
                  </div>
                  <button
                    onClick={() => toggleSelect(candidate)}
                    className={`ml-2 px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                      selectedCandidates.some(c => c.id === candidate.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {selectedCandidates.some(c => c.id === candidate.id) ? '✓ Đã chọn' : 'Chọn'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">{i18nToText(candidate.bio)}</p>
                
                {candidate.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-gray-200 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedCandidates.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg flex justify-between items-center">
              <p className="text-sm text-gray-700 font-semibold">✓ Đã chọn {selectedCandidates.length} ứng viên</p>
              <button
                onClick={() => setShowComparison(true)}
                disabled={selectedCandidates.length < 2}
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-400 transition"
              >
                📊 So sánh ({selectedCandidates.length})
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
