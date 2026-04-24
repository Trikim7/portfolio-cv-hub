'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/services/api'
import { Toast, useToast } from '@/components/Toast'
import { useAuth } from '@/hooks/AuthContext'

const decodeToken = (token: string): { role?: string } => {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch { return {} }
}

export default function RecruiterLoginForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const { checkAuth } = useAuth()
  const { toast, showToast, closeToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) { setError(t('auth.fillRequired')); return }
    setLoading(true)
    try {
      const response = await apiClient.loginRecruiter(email, password)
      localStorage.setItem('access_token', response.access_token)
      const decoded = decodeToken(response.access_token)
      localStorage.setItem('role', decoded.role || 'recruiter')
      checkAuth()
      showToast(t('auth.loginSuccess'), 'success')
      setTimeout(() => router.push('/recruiter/dashboard'), 100)
    } catch (err: any) {
      setError(err.response?.data?.detail || t('auth.loginFailed'))
    } finally { setLoading(false) }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">{t('auth.recruiterLoginTitle')}</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="company@email.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition">
          {loading ? t('auth.loggingIn') : t('auth.doLogin')}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        {t('auth.noAccountYet')}{' '}
        <Link href="/register" className="text-green-600 hover:underline">{t('auth.registerNow')}</Link>
      </p>

      {toast && <Toast {...toast} onClose={closeToast} />}
    </div>
  )
}
