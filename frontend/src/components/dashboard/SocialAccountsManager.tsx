'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiClient } from '@/services/api'
import { OAuthProvider, SocialAccount } from '@/types'

const ALL_PROVIDERS: OAuthProvider[] = ['google', 'github', 'facebook']

const PROVIDER_META: Record<
  OAuthProvider,
  { label: string; icon: string; className: string }
> = {
  google: {
    label: 'Google',
    icon: 'G',
    className: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
  },
  github: {
    label: 'GitHub',
    icon: 'GH',
    className: 'bg-gray-900 text-white hover:bg-gray-800',
  },
  facebook: {
    label: 'Facebook',
    icon: 'f',
    className: 'bg-blue-600 text-white hover:bg-blue-700',
  },
}

export default function SocialAccountsManager() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await apiClient.listSocialAccounts()
      setAccounts(rows)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Không tải được danh sách tài khoản liên kết.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const linkedByProvider = useMemo(() => {
    const map = new Map<OAuthProvider, SocialAccount>()
    for (const a of accounts) {
      map.set(a.provider as OAuthProvider, a)
    }
    return map
  }, [accounts])

  const handleLink = async (provider: OAuthProvider) => {
    setBusy(provider)
    setError(null)
    setNotice(null)
    try {
      const { url } = await apiClient.startOAuthLink(provider)
      window.location.href = url
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          `Không khởi tạo được liên kết ${PROVIDER_META[provider].label}.`,
      )
      setBusy(null)
    }
  }

  const handleUnlink = async (provider: OAuthProvider) => {
    if (!window.confirm(`Hủy liên kết ${PROVIDER_META[provider].label}?`)) return
    setBusy(provider)
    setError(null)
    setNotice(null)
    try {
      await apiClient.unlinkSocialAccount(provider)
      setNotice(`Đã hủy liên kết ${PROVIDER_META[provider].label}.`)
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.detail || `Không thể hủy liên kết ${provider}.`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Tài khoản liên kết</h2>
          <p className="text-sm text-gray-500">
            Quản lý các phương thức đăng nhập qua mạng xã hội.
          </p>
        </div>
        {loading && <span className="text-sm text-gray-500">Đang tải...</span>}
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
          {notice}
        </div>
      )}

      <div className="space-y-2">
        {ALL_PROVIDERS.map((provider) => {
          const meta = PROVIDER_META[provider]
          const linked = linkedByProvider.get(provider)
          const pending = busy === provider
          return (
            <div
              key={provider}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg ${meta.className}`}
                >
                  {meta.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{meta.label}</p>
                  <p className="text-xs text-gray-500">
                    {linked
                      ? `ID: ${linked.provider_account_id}`
                      : 'Chưa liên kết'}
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
                  {pending ? 'Đang xử lý...' : 'Hủy liên kết'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleLink(provider)}
                  className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Liên kết
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Nếu tài khoản của bạn chưa có mật khẩu, hãy giữ ít nhất một liên kết mạng xã hội để có thể đăng nhập lại.
      </p>
    </div>
  )
}
