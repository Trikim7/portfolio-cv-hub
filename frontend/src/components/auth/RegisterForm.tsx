'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import SocialLoginButtons from '@/components/auth/SocialLoginButtons'

export default function RegisterForm() {
  const { t } = useTranslation()
  const { register, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const getPasswordByteLength = (str: string) => {
    return new TextEncoder().encode(str).length
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (password !== confirmPassword) {
      setPasswordError(t('auth.passwordMismatch') || 'Passwords do not match')
      return
    }

    if (password.length < 6) {
      setPasswordError(t('auth.passwordTooShort') || 'Password must be at least 6 characters')
      return
    }

    if (getPasswordByteLength(password) > 30) {
      setPasswordError(t('auth.passwordTooLong') || 'Password is too long (max 30 characters). Please use a shorter password.')
      return
    }

    register(email, password)
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">{t('auth.registerTitle')}</h1>

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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.password')}
            <span className={`ml-2 text-xs ${getPasswordByteLength(password) > 30 ? 'text-red-600' : getPasswordByteLength(password) > 20 ? 'text-yellow-600' : 'text-gray-500'}`}>
              ({getPasswordByteLength(password)}/30)
            </span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirmPassword')}</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        {passwordError && (
          <div className="p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded">{passwordError}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition"
        >
          {loading ? t('auth.registering') || 'Registering...' : t('auth.registerButton')}
        </button>
      </form>

      <SocialLoginButtons label={t('auth.orRegisterWith') || 'Or register with'} disabled={loading} />

      <p className="text-center text-sm text-gray-600 mt-4">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link href="/login" className="text-blue-500 hover:underline">
          {t('auth.loginTitle')}
        </Link>
      </p>
    </div>
  )
}
