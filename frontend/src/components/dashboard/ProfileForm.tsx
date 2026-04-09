'use client'

import { useState, useEffect } from 'react'
import { useProfileContext } from '@/hooks/ProfileContext'
import { CandidateProfile } from '@/types'
import { Toast, useToast } from '@/components/Toast'

export default function ProfileForm() {
  const { profile, updateProfile, togglePublicProfile, loading } = useProfileContext()
  const [fullName, setFullName] = useState('')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const { toast, showToast, closeToast } = useToast()

  // Track last saved values for the preview
  const [savedData, setSavedData] = useState<{ full_name: string; title: string; bio: string } | null>(null)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setTitle(profile.title || '')
      setBio(profile.bio || '')
      setIsPublic(profile.is_public || false)
      // Initialize saved data from profile
      if (profile.full_name || profile.title || profile.bio) {
        setSavedData({
          full_name: profile.full_name || '',
          title: profile.title || '',
          bio: profile.bio || '',
        })
      }
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) {
      showToast('Vui lòng nhập họ tên', 'error')
      return
    }

    try {
      const data: Partial<CandidateProfile> = {
        full_name: fullName,
        title: title,
        bio: bio,
      }

      await updateProfile(data)
      setSavedData({ full_name: fullName, title: title, bio: bio })
      showToast('✓ Đã cập nhật thông tin cá nhân', 'success')
    } catch (err) {
      showToast('❌ Cập nhật thất bại, vui lòng thử lại', 'error')
    }
  }

  const handleTogglePublic = async () => {
    try {
      const newState = !isPublic
      await togglePublicProfile(newState)
      setIsPublic(newState)
      showToast(
        newState
          ? '✓ Hồ sơ đã được công khai! Doanh nghiệp có thể tìm thấy bạn'
          : '✓ Hồ sơ đã được ẩn kín',
        'success'
      )
    } catch (err: any) {
      showToast('❌ Không thể thay đổi chế độ công khai', 'error')
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Thông tin cá nhân</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Họ tên</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">💼 Vị trí công việc</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Senior Developer"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Giới thiệu bản thân</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Viết một chút về bản thân..."
          />
        </div>

        {/* Public Profile Toggle */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">🌐 Công khai hồ sơ</label>
            <p className="text-xs text-gray-600">
              {isPublic
                ? '✓ Hồ sơ của bạn có thể được doanh nghiệp tìm kiếm'
                : '✗ Hồ sơ của bạn không công khai, chỉ ai có link mới xem'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleTogglePublic}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
              isPublic ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                isPublic ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition"
        >
          {loading ? '⏳ Đang cập nhật...' : '✓ Cập nhật'}
        </button>
      </form>

      {/* Saved data preview */}
      {savedData && (savedData.full_name || savedData.title || savedData.bio) && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white rounded-full text-xs">✓</span>
            Thông tin đã lưu
          </h3>
          <div className="space-y-2 text-sm">
            {savedData.full_name && (
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-600 min-w-[100px]">👤 Họ tên:</span>
                <span className="text-gray-800 bg-white px-2 py-0.5 rounded border border-blue-100">{savedData.full_name}</span>
              </div>
            )}
            {savedData.title && (
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-600 min-w-[100px]">💼 Vị trí:</span>
                <span className="text-gray-800 bg-white px-2 py-0.5 rounded border border-blue-100">{savedData.title}</span>
              </div>
            )}
            {savedData.bio && (
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-600 min-w-[100px]">📝 Giới thiệu:</span>
                <span className="text-gray-800 bg-white px-2 py-1 rounded border border-blue-100 block whitespace-pre-wrap">{savedData.bio}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={closeToast} />}
    </div>
  )
}

