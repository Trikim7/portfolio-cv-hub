'use client'

import { useState } from 'react'
import { CandidateSearchResult, I18nText } from '@/types'
import { apiClient } from '@/services/api'
import { Toast, useToast } from '@/components/Toast'

const i18nToText = (value: I18nText): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.vi || value.en || Object.values(value)[0] || ''
}

interface ComparisonTableProps {
  candidates: CandidateSearchResult[]
  onClose: () => void
}

interface InvitationState {
  candidateId: number | null
  candidateName: string
  jobTitle: string
  message: string
  loading: boolean
}

export default function ComparisonTable({ candidates, onClose }: ComparisonTableProps) {
  const { toast, showToast, closeToast } = useToast()
  const [invitationState, setInvitationState] = useState<InvitationState>({
    candidateId: null,
    candidateName: '',
    jobTitle: '',
    message: '',
    loading: false,
  })

  if (candidates.length === 0) {
    return null
  }

  const openInvitationForm = (candidate: CandidateSearchResult) => {
    setInvitationState({
      candidateId: candidate.id,
      candidateName: candidate.full_name || 'Ứng viên',
      jobTitle: candidate.headline || '',
      message: '',
      loading: false,
    })
  }

  const closeInvitationForm = () => {
    setInvitationState({
      candidateId: null,
      candidateName: '',
      jobTitle: '',
      message: '',
      loading: false,
    })
  }

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!invitationState.candidateId || !invitationState.jobTitle) {
      showToast('Vui lòng điền đầy đủ thông tin', 'error')
      return
    }

    setInvitationState((prev) => ({ ...prev, loading: true }))

    try {
      await apiClient.sendJobInvitation(
        invitationState.candidateId,
        invitationState.jobTitle,
        invitationState.message
      )
      showToast(`Đã gửi lời mời tới ${invitationState.candidateName}`, 'success')
      closeInvitationForm()
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Gửi lời mời thất bại', 'error')
    } finally {
      setInvitationState((prev) => ({ ...prev, loading: false }))
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white p-6 flex justify-between items-center">
            <h2 className="text-xl font-bold">So sánh ứng viên</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-lg"
              aria-label="Đóng"
            >
              ×
            </button>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto p-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="text-left p-4 font-bold min-w-[150px] bg-gray-50">Thông tin</th>
                  {candidates.map((candidate) => (
                    <th key={candidate.id} className="p-4 font-semibold text-center min-w-[200px] border-l border-gray-300">
                      <div className="font-bold text-blue-700">{candidate.full_name}</div>
                      <div className="text-sm text-gray-600">{candidate.headline}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Full Name */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-semibold text-gray-700 bg-gray-50">Họ tên</td>
                  {candidates.map((candidate) => (
                    <td key={candidate.id} className="p-4 text-center border-l border-gray-300">
                      {candidate.full_name}
                    </td>
                  ))}
                </tr>

                {/* Title / Position */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-semibold text-gray-700 bg-gray-50">Vị trí</td>
                  {candidates.map((candidate) => (
                    <td key={candidate.id} className="p-4 text-center border-l border-gray-300 text-sm">
                      {candidate.headline || '-'}
                    </td>
                  ))}
                </tr>

                {/* Bio / Description */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-semibold text-gray-700 bg-gray-50">Giới thiệu</td>
                  {candidates.map((candidate) => (
                    <td key={candidate.id} className="p-4 border-l border-gray-300 text-sm text-gray-700 max-w-xs">
                      <p className="line-clamp-3">{i18nToText(candidate.bio) || '-'}</p>
                    </td>
                  ))}
                </tr>

                {/* Skills */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-semibold text-gray-700 bg-gray-50">Kỹ năng</td>
                  {candidates.map((candidate) => (
                    <td key={candidate.id} className="p-4 border-l border-gray-300">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {candidate.skills.length > 0 ? (
                          candidate.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Experience - Skills count as proxy */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-semibold text-gray-700 bg-gray-50">Tổng kỹ năng</td>
                  {candidates.map((candidate) => (
                    <td key={candidate.id} className="p-4 text-center border-l border-gray-300 text-lg font-bold text-blue-600">
                      {candidate.skills.length}
                    </td>
                  ))}
                </tr>

                {/* Quick Actions */}
                <tr className="bg-purple-50 border-t-2 border-purple-300">
                  <td className="p-4 font-semibold text-gray-700">Hành động</td>
                  {candidates.map((candidate) => (
                    <td key={candidate.id} className="p-4 border-l border-gray-300 text-center">
                      <button
                        onClick={() => openInvitationForm(candidate)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-semibold"
                      >
                        Gửi lời mời
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 text-center">
            <p className="text-sm text-gray-600">
              Đang so sánh <span className="font-bold text-purple-600">{candidates.length}</span> ứng viên
            </p>
          </div>
        </div>
      </div>

      {/* Invitation Form Modal */}
      {invitationState.candidateId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
              <h3 className="text-xl font-bold">Gửi lời mời</h3>
              <p className="text-sm mt-2 text-white/90">Tới: <span className="font-semibold">{invitationState.candidateName}</span></p>
            </div>

            <form onSubmit={handleSendInvitation} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí tuyển dụng</label>
                <input
                  type="text"
                  value={invitationState.jobTitle}
                  onChange={(e) => setInvitationState((prev) => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="VD: Frontend Developer, Senior Backend..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lời mời (tùy chọn)</label>
                <textarea
                  value={invitationState.message}
                  onChange={(e) => setInvitationState((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Nhập lời mời, thông tin công ty, lương, địa điểm làm việc..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeInvitationForm}
                  disabled={invitationState.loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={invitationState.loading}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold transition disabled:bg-gray-400"
                >
                  {invitationState.loading ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={closeToast} />}
    </>
  )
}

