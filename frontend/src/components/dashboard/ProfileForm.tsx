'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useProfileContext } from '@/hooks/ProfileContext'
import { CandidateProfile, I18nText } from '@/types'
import { Toast, useToast } from '@/components/Toast'

const i18nToText = (value: I18nText): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.vi || value.en || Object.values(value)[0] || ''
}

export default function ProfileForm() {
  const { t } = useTranslation()
  const { profile, updateProfile, togglePublicProfile, loading } = useProfileContext()
  const [fullName, setFullName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const { toast, showToast, closeToast } = useToast()

  const [savedData, setSavedData] = useState<{
    full_name: string
    headline: string
    bio: string
  } | null>(null)

  useEffect(() => {
    if (profile) {
      const bioText = i18nToText(profile.bio)
      setFullName(profile.full_name || '')
      setHeadline(profile.headline || '')
      setBio(bioText)
      setIsPublic(profile.is_public || false)
      if (profile.full_name || profile.headline || bioText) {
        setSavedData({
          full_name: profile.full_name || '',
          headline: profile.headline || '',
          bio: bioText,
        })
      }
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      showToast(t('profile.nameRequired'), 'error')
      return
    }
    try {
      const data: Partial<CandidateProfile> = {
        full_name: fullName,
        headline: headline,
        bio: bio ? { vi: bio } : undefined,
      }
      await updateProfile(data)
      setSavedData({ full_name: fullName, headline: headline, bio: bio })
      showToast(t('profile.updated'), 'success')
    } catch {
      showToast(t('profile.updateFailed'), 'error')
    }
  }

  const handleTogglePublic = async () => {
    try {
      const newState = !isPublic
      await togglePublicProfile(newState)
      setIsPublic(newState)
      showToast(
        newState ? t('profile.publicProfileEnabled') : t('profile.publicProfileDisabled'),
        'success',
      )
    } catch {
      showToast(t('profile.publicProfileError'), 'error')
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-6">{t('profile.personalInfo')}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t('profile.fullName')}</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('profile.fullNamePlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t('profile.jobTitle')}</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Senior Developer"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t('profile.bio')}</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('profile.bioPlaceholder')}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t('profile.publicProfile')}
            </label>
            <p className="text-xs text-gray-600">
              {isPublic ? t('profile.publicProfileOn') : t('profile.publicProfileOff')}
            </p>
          </div>
          <button
            type="button"
            onClick={handleTogglePublic}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
              isPublic ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                isPublic ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? t('profile.updating') : t('profile.update')}
        </button>
      </form>

      {savedData && (savedData.full_name || savedData.headline || savedData.bio) && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <h3 className="text-sm font-bold text-blue-800 mb-3">{t('profile.savedInfo')}</h3>
          <div className="space-y-2 text-sm">
            {savedData.full_name && (
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-600 min-w-[100px]">{t('profile.fullName')}</span>
                <span className="text-gray-800">{savedData.full_name}</span>
              </div>
            )}
            {savedData.headline && (
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-600 min-w-[100px]">{t('profile.position')}</span>
                <span className="text-gray-800">{savedData.headline}</span>
              </div>
            )}
            {savedData.bio && (
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-600 min-w-[100px]">{t('profile.introduction')}</span>
                <span className="text-gray-800 whitespace-pre-wrap">{savedData.bio}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={closeToast} />}
    </div>
  )
}
