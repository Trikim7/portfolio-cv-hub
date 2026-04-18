'use client'

import { useMemo, useState } from 'react'
import { apiClient } from '@/services/api'
import {
  CandidateScore,
  RankingResponse,
  ScoringCriteria,
} from '@/types'

const defaultCriteria: ScoringCriteria = {
  title: 'Ad-hoc search',
  required_skills: [],
  years_experience: 2,
  required_role: '',
  customer_facing: false,
  tech_stack: [],
  is_management_role: false,
  weights_config: {
    technical_skills: 0.25,
    experience: 0.25,
    portfolio: 0.2,
    soft_skills: 0.1,
    leadership: 0.1,
    readiness_signals: 0.1,
  },
}

const AXIS_LABEL: Record<keyof NonNullable<ScoringCriteria['weights_config']>, string> = {
  technical_skills: 'Kỹ năng kỹ thuật',
  experience: 'Kinh nghiệm',
  portfolio: 'Portfolio',
  soft_skills: 'Kỹ năng mềm',
  leadership: 'Lãnh đạo',
  readiness_signals: 'Tín hiệu sẵn sàng',
}

function scoreColor(value: number): string {
  if (value >= 80) return 'bg-green-100 text-green-700 border-green-200'
  if (value >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  if (value >= 40) return 'bg-orange-100 text-orange-700 border-orange-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

function axisColor(value: number): string {
  if (value >= 8) return 'text-green-600'
  if (value >= 5) return 'text-yellow-600'
  return 'text-red-500'
}

export default function CandidateRanking() {
  const [criteria, setCriteria] = useState<ScoringCriteria>(defaultCriteria)
  const [skillsInput, setSkillsInput] = useState('')
  const [techInput, setTechInput] = useState('')
  const [minScore, setMinScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RankingResponse | null>(null)

  const filteredCandidates: CandidateScore[] = useMemo(() => {
    if (!result) return []
    return result.candidates.filter((c) => c.overall_match >= minScore)
  }, [result, minScore])

  const handleRun = async () => {
    setLoading(true)
    setError(null)
    try {
      const required_skills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const tech_stack = techInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const response = await apiClient.rankCandidates({
        criteria: {
          ...criteria,
          required_skills,
          tech_stack: tech_stack.length > 0 ? tech_stack : undefined,
        },
        limit: 50,
      })
      setResult(response)
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Không thể tải ranking')
    } finally {
      setLoading(false)
    }
  }

  const updateWeight = (axis: keyof NonNullable<ScoringCriteria['weights_config']>, value: number) => {
    setCriteria((prev) => ({
      ...prev,
      weights_config: {
        ...(prev.weights_config || {}),
        [axis]: value,
      },
    }))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-2xl font-bold mb-1 text-gray-900">Xếp hạng ứng viên</h2>
        <p className="text-sm text-gray-500 mb-6">
          Nhập yêu cầu công việc và chạy thuật toán chấm điểm AI (6 trục radar).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
            <input
              type="text"
              value={criteria.title || ''}
              onChange={(e) => setCriteria({ ...criteria, title: e.target.value })}
              placeholder="VD: Senior Backend Engineer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role hint (Backend/Frontend/…)
            </label>
            <input
              type="text"
              value={criteria.required_role || ''}
              onChange={(e) => setCriteria({ ...criteria, required_role: e.target.value })}
              placeholder="Backend"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kỹ năng yêu cầu (phân tách bởi dấu phẩy)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="Python, React, PostgreSQL"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tech stack (phân tách bởi dấu phẩy)
            </label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="Python, React, PostgreSQL, Docker"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Năm kinh nghiệm yêu cầu</label>
            <input
              type="number"
              min={0}
              value={criteria.years_experience ?? 0}
              onChange={(e) =>
                setCriteria({ ...criteria, years_experience: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-6 pt-5">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!criteria.customer_facing}
                onChange={(e) =>
                  setCriteria({ ...criteria, customer_facing: e.target.checked })
                }
              />
              Tiếp xúc khách hàng
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!criteria.is_management_role}
                onChange={(e) =>
                  setCriteria({ ...criteria, is_management_role: e.target.checked })
                }
              />
              Vai trò quản lý
            </label>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Tùy chỉnh trọng số radar</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.keys(AXIS_LABEL) as Array<keyof typeof AXIS_LABEL>).map((axis) => (
              <label key={axis} className="text-xs text-gray-600">
                <span className="block mb-1">
                  {AXIS_LABEL[axis]} ({(criteria.weights_config?.[axis] ?? 0).toFixed(2)})
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={criteria.weights_config?.[axis] ?? 0}
                  onChange={(e) => updateWeight(axis, Number(e.target.value))}
                  className="w-full"
                />
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Backend sẽ tự động chuẩn hóa tổng trọng số = 1.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
          >
            {loading ? 'Đang chấm điểm…' : 'Chạy AI Ranking'}
          </button>

          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-gray-600">Lọc điểm tối thiểu:</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-32"
            />
            <span className="font-semibold text-blue-600 w-10 text-right">{minScore}</span>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </p>
        )}
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Kết quả ({filteredCandidates.length}/{result.total} ứng viên)
            </h3>
          </div>

          {filteredCandidates.length === 0 ? (
            <p className="text-gray-500 italic">Không có ứng viên nào vượt ngưỡng.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 font-semibold text-gray-700">#</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Ứng viên</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Tech</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Exp</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Portfolio</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Soft</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Lead</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Ready</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((c, index) => (
                    <tr
                      key={c.candidate_id}
                      className="border-b hover:bg-blue-50 transition"
                    >
                      <td className="p-3 text-gray-500">
                        {c.match_details?.ranking ?? index + 1}
                      </td>
                      <td className="p-3 font-medium text-gray-900">
                        {c.full_name || `Ứng viên #${c.candidate_id}`}
                      </td>
                      <td className={`p-3 text-right font-semibold ${axisColor(c.radar_scores.technical_skills)}`}>
                        {c.radar_scores.technical_skills.toFixed(1)}
                      </td>
                      <td className={`p-3 text-right font-semibold ${axisColor(c.radar_scores.experience)}`}>
                        {c.radar_scores.experience.toFixed(1)}
                      </td>
                      <td className={`p-3 text-right font-semibold ${axisColor(c.radar_scores.portfolio)}`}>
                        {c.radar_scores.portfolio.toFixed(1)}
                      </td>
                      <td className={`p-3 text-right font-semibold ${axisColor(c.radar_scores.soft_skills)}`}>
                        {c.radar_scores.soft_skills.toFixed(1)}
                      </td>
                      <td className={`p-3 text-right font-semibold ${axisColor(c.radar_scores.leadership)}`}>
                        {c.radar_scores.leadership.toFixed(1)}
                      </td>
                      <td className={`p-3 text-right font-semibold ${axisColor(c.radar_scores.readiness_signals)}`}>
                        {c.radar_scores.readiness_signals.toFixed(1)}
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={`px-3 py-1 rounded-full border font-bold ${scoreColor(c.overall_match)}`}
                        >
                          {c.overall_match.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
