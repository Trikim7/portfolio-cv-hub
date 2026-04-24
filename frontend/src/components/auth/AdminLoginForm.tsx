'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'

export default function AdminLoginForm() {
  const { t } = useTranslation()
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, password)
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border-t-4 border-purple-500">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🛡️</div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.loginTitle')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('admin.adminOnly')}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.emailLabel')}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="admin@email.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition">
          {loading ? t('admin.verifying') : `🔐 ${t('admin.loginTitle')}`}
        </button>
      </form>

      <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
        <p className="text-xs text-purple-700 text-center">{t('admin.accessWarning')}</p>
      </div>
    </div>
  )
}
