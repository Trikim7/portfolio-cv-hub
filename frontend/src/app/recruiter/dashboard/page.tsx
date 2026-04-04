'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRecruiter } from '@/hooks/useRecruiter'
import { useAuth } from '@/hooks/AuthContext'
import CompanyProfile from '@/components/recruiter/CompanyProfile'

export default function RecruiterDashboardPage() {
  const router = useRouter()
  const { role, loading: authLoading } = useAuth()
  const { fetchCompanyProfile, loading: recruiterLoading } = useRecruiter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // Don't check auth until context is fully loaded
      if (authLoading) {
        console.log('⏳ Auth context still loading...')
        return
      }

      // Check if user is logged in as a recruiter
      if (!role) {
        console.log('⚠️ No role found, redirecting to recruiter login')
        router.push('/recruiter/login')
        return
      }

      if (role !== 'recruiter') {
        console.log(`⚠️ User is ${role}, not recruiter. Redirecting to recruiter login`)
        // Clear the candidate token and redirect to recruiter login
        localStorage.removeItem('access_token')
        localStorage.removeItem('role')
        router.push('/recruiter/login')
        return
      }

      try {
        console.log('✓ User is recruiter, fetching company profile...')
        await fetchCompanyProfile()
        console.log('✓ Auth check passed')
        setIsAuthorized(true)
      } catch (error) {
        // Token might be invalid, redirect to login
        console.error('✗ Auth check failed:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('role')
        router.push('/recruiter/login')
      }
    }

    checkAuth()
  }, [role, authLoading, fetchCompanyProfile, router])

  if (authLoading || recruiterLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Đang kiểm tra thông tin...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard Doanh nghiệp</h1>
        
        <CompanyProfile />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2">📊 Lời mời đã gửi</h3>
            <p className="text-3xl font-bold text-blue-600">-</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2">👥 Ứng viên tìm thấy</h3>
            <p className="text-3xl font-bold text-green-600">-</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2">✅ Ứng viên quan tâm</h3>
            <p className="text-3xl font-bold text-orange-600">-</p>
          </div>
        </div>

        <div className="mt-8">
          <a
            href="/recruiter/search"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            🔍 Tìm kiếm ứng viên
          </a>
        </div>
      </div>
    </div>
  )
}
