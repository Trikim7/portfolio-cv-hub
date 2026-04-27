'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import SocialLoginButtons from '@/components/auth/SocialLoginButtons'

export default function LoginPage() {
  const { t } = useTranslation()
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Portfolio CV Hub</h1>
          <p className="text-blue-300 mt-2 text-sm">{t('auth.platformSubtitle')}</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/55 backdrop-blur-xl border border-blue-200/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">{t('auth.loginTitle')}</h2>

          {error && (
            <div className="mb-5 p-3 bg-red-500/20 border border-red-400/40 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1.5">
                {t('auth.email')}
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-blue-100/25 text-white placeholder-blue-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-200/60 transition"
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 bg-slate-950/40 border border-blue-100/25 text-white placeholder-blue-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-200/60 transition pr-12"
                  placeholder={t('auth.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-100 hover:text-white transition text-sm select-none"
                >
                  {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 mt-2"
            >
              {loading ? t('auth.loggingIn') : t('auth.loginTitle')}
            </button>
          </form>

          <SocialLoginButtons label={t('auth.orContinueWith')} disabled={loading} variant="dark" />

          {/* Register links */}
          <div className="mt-4 text-center text-sm">
            <p className="text-blue-100">
              {t('auth.noAccountYet')}{' '}
              <Link href="/register?role=candidate" className="text-sky-300 hover:text-white font-semibold transition-colors">
                {t('auth.registerNowSimple')}
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-blue-400/50 text-xs mt-6">
          {t('auth.loginPageSubtitle')}
        </p>
      </div>
    </div>
  )
}
