'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/services/api'
import { Toast, useToast } from '@/components/Toast'
import { useAuth } from '@/hooks/AuthContext'

// Helper function to decode JWT and extract role
const decodeToken = (token: string): { role?: string } => {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch {
    return {}
  }
}

export default function RecruiterRegisterForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const { checkAuth } = useAuth()
  const { toast, showToast, closeToast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [website, setWebsite] = useState('')
  const [location, setLocation] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !companyName) {
      showToast(t('auth.fillAllFields') || 'Please fill in all required fields', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.registerRecruiter(
        { email, password, role: 'recruiter' },
        { company_name: companyName, website, location }
      )
      // Save token to localStorage
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token)
        // Extract role from token and save to localStorage
        const decoded = decodeToken(response.access_token)
        localStorage.setItem('role', decoded.role || 'recruiter')
        console.log('✓ Token and role saved to localStorage:', decoded.role || 'recruiter')
        
        // Notify AuthContext to update
        checkAuth()
      }
        showToast(t('auth.registerSuccess') || '✓ Registration successful!', 'success')
      // Small delay to ensure state updates before navigation
      setTimeout(() => {
        router.push('/recruiter/dashboard')
      }, 100)
    } catch (err: any) {
      showToast(err.response?.data?.detail || t('auth.registerFailed') || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6">{t('auth.registerAsCompany')}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="company@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.companyName')}</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Company Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.location')}</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('auth.locationPlaceholder') || 'Hanoi, Vietnam'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.website')}</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? t('auth.processing') : t('auth.registerButton')}
        </button>
      </form>

      {toast && <Toast {...toast} onClose={closeToast} />}
    </div>
  )
}
