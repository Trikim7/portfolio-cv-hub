'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import SocialLoginButtons from '@/components/auth/SocialLoginButtons'

export default function LoginForm() {
  const { t } = useTranslation()
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, password)
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">{t('auth.loginTitle')}</h1>

      {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition"
        >
          {loading ? t('auth.loggingIn') : t('auth.login')}
        </button>
      </form>

      <SocialLoginButtons disabled={loading} />

      <p className="text-center text-sm text-gray-600 mt-4">
        {t('auth.dontHaveAccount')}{' '}
        <Link href="/register" className="text-blue-500 hover:underline">
          {t('auth.registerNow')}
        </Link>
      </p>
    </div>
  )
}
