'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import SocialLoginButtons from '@/components/auth/SocialLoginButtons'

export default function LoginPage() {
  const { t } = useTranslation()
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [oauthError, setOauthError] = useState<{ error: string; provider: string } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const err = params.get('error')
    if (!err) return
    setOauthError({ error: err, provider: params.get('provider') || '' })
    const url = new URL(window.location.href)
    url.searchParams.delete('error')
    url.searchParams.delete('provider')
    window.history.replaceState(null, '', url.pathname + url.search)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, password)
  }

  return (
    <div className="bg-slate-50 py-8 sm:py-10">
      {/* Navigation: Navbar is in app/layout.tsx — do not add second header */}
      <div className="flex flex-col items-center px-4 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              {t('auth.loginPageTitle')}
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              {t('auth.loginPageSubtitle')}
            </p>
          </div>
          {oauthError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
              <strong className="block mb-1">
                {t('auth.oauthLoginFailed', { provider: oauthError.provider || t('auth.viaOAuth') })}
              </strong>
              <span className="break-words">{oauthError.error}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 transition shadow-sm"
              >
                {loading ? t('auth.loggingIn') : t('auth.doLogin')}
              </button>
            </form>

            <SocialLoginButtons disabled={loading} />

            <p className="text-center text-sm text-gray-500 mt-6">
              {t('auth.noAccountYet')}{' '}
              <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                {t('auth.registerNow')}
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
