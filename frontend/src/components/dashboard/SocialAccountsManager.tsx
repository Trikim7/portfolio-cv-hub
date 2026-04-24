'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/services/api'
import { OAuthProvider, SocialAccount } from '@/types'

const ALL_PROVIDERS: OAuthProvider[] = ['google', 'github']

const PROVIDER_META = {
  google: {
    label: 'Google',
    icon: <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />,
    className: 'bg-white border border-gray-300 hover:bg-gray-50',
  },
  github: {
    label: 'GitHub',
    icon: <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="w-5 h-5" />,
    className: 'bg-white border border-gray-300 hover:bg-gray-50',
  },
}

export default function SocialAccountsManager() {
  const { t } = useTranslation()
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const rows = await apiClient.listSocialAccounts()
      setAccounts(rows)
    } catch (err: any) {
      setError(err?.response?.data?.detail || t('socialAccounts.loadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  const linkedByProvider = useMemo(() => {
    const map = new Map<OAuthProvider, SocialAccount>()
    for (const a of accounts) map.set(a.provider as OAuthProvider, a)
    return map
  }, [accounts])

  const handleLink = async (provider: OAuthProvider) => {
    setBusy(provider); setError(null); setNotice(null)
    try {
      const { url } = await apiClient.startOAuthLink(provider)
      window.location.href = url
    } catch (err: any) {
      setError(err?.response?.data?.detail || `${t('socialAccounts.linkError')} ${PROVIDER_META[provider].label}.`)
      setBusy(null)
    }
  }

  const handleUnlink = async (provider: OAuthProvider) => {
    if (!window.confirm(`${t('socialAccounts.unlinkConfirm')} ${PROVIDER_META[provider].label}?`)) return
    setBusy(provider); setError(null); setNotice(null)
    try {
      await apiClient.unlinkSocialAccount(provider)
      setNotice(`${t('socialAccounts.unlinkSuccess')} ${PROVIDER_META[provider].label}.`)
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.detail || `${t('socialAccounts.unlinkError')} ${provider}.`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{t('socialAccounts.title')}</h2>
          <p className="text-sm text-gray-500">{t('socialAccounts.subtitle')}</p>
        </div>
        {loading && <span className="text-sm text-gray-500">{t('socialAccounts.loading')}</span>}
      </div>

      {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>}
      {notice && <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">{notice}</div>}

      <div className="space-y-2">
        {ALL_PROVIDERS.map((provider) => {
          const meta = PROVIDER_META[provider]
          const linked = linkedByProvider.get(provider)
          const pending = busy === provider
          return (
            <div key={provider} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg ${meta.className}`}>
                  {meta.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{meta.label}</p>
                  <p className="text-xs text-gray-500">
                    {linked ? `ID: ${linked.provider_account_id}` : t('socialAccounts.notLinked')}
                  </p>
                </div>
              </div>

              {linked ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleUnlink(provider)}
                  className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                >
                  {pending ? t('socialAccounts.processing') : t('socialAccounts.unlink')}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleLink(provider)}
                  className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {t('socialAccounts.link')}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-500 mt-4">{t('socialAccounts.keepOneNote')}</p>
    </div>
  )
}
