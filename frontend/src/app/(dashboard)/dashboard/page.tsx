'use client'

import { useRouter } from 'next/navigation'
import { ProfileProvider, useProfileContext } from '@/hooks/ProfileContext'
import ProfileForm from '@/components/dashboard/ProfileForm'
import SkillsManager from '@/components/dashboard/SkillsManager'
import ExperiencesManager from '@/components/dashboard/ExperiencesManager'
import ProjectsManager from '@/components/dashboard/ProjectsManager'
import CVManager from '@/components/dashboard/CVManager'

function DashboardContent() {
  const { profile } = useProfileContext()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    router.push('/login')
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    )
  }

  return (
    <>
      {/* Top greeting bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg">👋</span>
            <span className="font-semibold text-lg">
              Hi, chào {profile.full_name || 'Ứng viên'}!
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors text-sm backdrop-blur-sm border border-white/30"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">DASHBOARD ỨNG VIÊN</h1>
          <p className="text-gray-600">Quản lý hồ sơ và portfolio của bạn</p>
        </div>

        <ProfileForm />
        <SkillsManager />
        <ExperiencesManager />
        <ProjectsManager />
        <CVManager />
      </div>
    </>
  )
}

export default function DashboardPage() {
  return (
    <ProfileProvider>
      <DashboardContent />
    </ProfileProvider>
  )
}

