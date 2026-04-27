'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

type Status = 'processing' | 'success' | 'error'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [status, setStatus] = useState<Status>('processing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const parseFragment = (): Record<string, string> => {
      const raw = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash
      const out: Record<string, string> = {}
      if (!raw) return out
      for (const part of raw.split('&')) {
        const [k, v] = part.split('=')
        if (k) out[decodeURIComponent(k)] = decodeURIComponent(v || '')
      }
      return out
    }

    const params = parseFragment()
    const search = new URLSearchParams(window.location.search)
    const err = params.error || search.get('error')

    if (err) {
      setStatus('error')
      setMessage(decodeURIComponent(err))
      return
    }

    const token = params.token
    const role = params.role || 'candidate'
    const provider = params.provider || ''
    const isNew = params.new_account === '1'
    const isLinked = params.linked === '1'

    if (!token) {
      setStatus('error')
      setMessage(t('oauth.noToken'))
      return
    }

    try {
      localStorage.setItem('access_token', token)
      localStorage.setItem('role', role)
      window.dispatchEvent(new Event('login'))
    } catch {
      setStatus('error')
      setMessage(t('oauth.cannotSaveSession'))
      return
    }

    setStatus('success')
    setMessage(
      isLinked
        ? t('oauth.linked', { provider })
        : isNew
          ? t('oauth.newAccount', { provider })
          : t('oauth.loginSuccess', { provider }),
    )

    window.history.replaceState(null, '', '/auth/oauth-callback')

    const target =
      role === 'admin'
        ? '/admin/dashboard'
        : role === 'recruiter'
        ? '/recruiter/dashboard'
        : '/dashboard'

    const timer = window.setTimeout(() => router.push(target), 800)
    return () => window.clearTimeout(timer)
  }, [router, t])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center space-y-5">
        {status === 'processing' && (
          <>
            <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <h1 className="text-xl font-bold text-gray-900">{t('oauth.processing')}</h1>
            <p className="text-gray-600 text-sm">{message || t('oauth.verifying')}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h1 className="text-xl font-bold text-emerald-700">{t('oauth.success')}</h1>
            <p className="text-gray-600 text-sm">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto text-2xl font-bold">
              ×
            </div>
            <h1 className="text-xl font-bold text-rose-700">{t('oauth.failed')}</h1>
            <p className="text-gray-600 text-sm break-words">{message}</p>
            <Link
              href="/login"
              className="inline-block mt-2 px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              {t('oauth.backToLogin')}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
