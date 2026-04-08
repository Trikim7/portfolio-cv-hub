'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CandidateSearch from '@/components/recruiter/CandidateSearch'
import { useRecruiter } from '@/hooks/useRecruiter'
import { useAuth } from '@/hooks/AuthContext'

export default function RecruiterSearchPage() {
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
        console.log('⚠️ No role found, redirecting to home')
        router.push('/')
        return
      }

      if (role !== 'recruiter') {
        console.log(`⚠️ User is ${role}, not recruiter. Redirecting to home`)
        // Clear the candidate token and redirect
        localStorage.removeItem('access_token')
        localStorage.removeItem('role')
        router.push('/')
        return
      }

      try {
        console.log('✓ User is recruiter, fetching company profile...')
        const companyData = await fetchCompanyProfile()
        
        if (companyData && companyData.status === 'pending') {
          console.log('⏳ Company is pending approval, redirecting')
          router.push('/recruiter/waiting-approval')
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        // Not authenticated, redirect to home
        console.error('✗ Auth check failed:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('role')
        router.push('/')
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
      <div className="max-w-6xl mx-auto">
        <CandidateSearch />
      </div>
    </div>
  )
}
