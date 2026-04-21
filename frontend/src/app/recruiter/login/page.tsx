'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect to the unified login page
export default function RecruiterLoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Đang chuyển hướng...</p>
    </div>
  )
}
