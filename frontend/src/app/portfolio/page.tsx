'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CandidateProfile, I18nText } from '@/types'
import { apiClient } from '@/services/api'
import { useAuth } from '@/hooks/AuthContext'
import Link from 'next/link'

const i18nToText = (value: I18nText): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.vi || value.en || Object.values(value)[0] || ''
}

export default function CandidatePortfolioPreviewPage() {
  const router = useRouter()
  const { isLoggedIn, loading: authLoading } = useAuth()
  
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        const [profileData, userData] = await Promise.all([
          apiClient.getMyProfile(),
          apiClient.getCurrentUser()
        ])
        setProfile(profileData)
        setUser(userData)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Không thể tải portfolio')
      } finally {
        setLoading(false)
      }
    }

    if (isLoggedIn) {
      fetchData()
    }
  }, [isLoggedIn, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-gray-500">Đang tải portfolio của bạn...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full">
          <p className="text-4xl mb-4">📂</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Chưa có dữ liệu</h2>
          <p className="text-gray-600 mb-6">{error || 'Bạn chưa cập nhật thông tin hồ sơ.'}</p>
          <Link 
            href="/dashboard"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay lại Hồ sơ
          </Link>
        </div>
      </div>
    )
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  // Find primary CV or first available CV
  const primaryCv = profile.cvs.find(cv => cv.is_primary) || profile.cvs[0]

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top action bar (only visible for the owner in preview mode) */}
      <div className="bg-gray-900 text-white py-3 px-6 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-blue-600 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">Chế độ xem trước</span>
          <span className="text-gray-300">Đây là cách nhà tuyển dụng nhìn thấy hồ sơ của bạn</span>
        </div>
        <div className="flex gap-3">
          {profile.public_slug && profile.is_public && (
            <a 
              href={`/portfolio/${profile.public_slug}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition flex items-center gap-2"
            >
              🌐 Xem trang Public
            </a>
          )}
          <Link 
            href="/dashboard" 
            className="px-4 py-1.5 bg-white text-gray-900 hover:bg-gray-100 rounded text-sm font-medium transition flex items-center gap-2"
          >
            ✏️ Chỉnh sửa
          </Link>
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="bg-[#1e40af] text-white pt-16 pb-16 px-4 md:px-8 shadow-inner">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* Avatar Box */}
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
               <img 
                 src={profile.avatar_url} 
                 alt={profile.full_name || 'Avatar'} 
                 className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-lg border-4 border-white/20 bg-white/10"
               />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-[#3b82f6] shadow-lg border-4 border-white/20 flex items-center justify-center text-5xl md:text-6xl font-bold tracking-tighter">
                {getInitials(profile.full_name || user?.email || 'N')}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 text-center md:text-left pt-2">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
              {profile.full_name || 'Cập nhật tên ở Hồ sơ'}
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 mb-6 font-medium">
              {profile.headline || 'Cập nhật vị trí ứng tuyển'}
            </p>

            {/* Meta Tags */}
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-3 mb-8 text-blue-100/90 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>Việt Nam</span> {/* Backend currently lacks location for candidates, using default */}
              </div>
              <div className="flex items-center gap-2">
                <span>✉️</span>
                <span>{user?.email || 'email@example.com'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>👁️</span>
                <span>{profile.views || 0} lượt xem</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <a 
                href={`mailto:${user?.email}`}
                className="px-6 py-2.5 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-gray-50 flex items-center gap-2 transition"
              >
                <span>✉️</span> Liên hệ
              </a>
              
              {primaryCv ? (
                <a 
                  href={`/api/candidate/cvs/download/${primaryCv.id}`}
                  className="px-6 py-2.5 bg-white/20 text-white font-medium rounded-lg border border-white/30 hover:bg-white/30 flex items-center gap-2 transition backdrop-blur-sm"
                >
                  <span>⬇️</span> Tải CV
                </a>
              ) : (
                <button 
                  disabled
                  className="px-6 py-2.5 bg-white/10 text-white/50 font-medium rounded-lg border border-white/20 flex items-center gap-2 cursor-not-allowed"
                >
                  <span>⬇️</span> Chưa cập nhật CV
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto -mt-6 px-4 md:px-8 relative z-0">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Section: Giới thiệu */}
          <div className="p-8 md:p-10 border-b border-gray-100">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Giới thiệu</h2>
            {i18nToText(profile.bio) ? (
              <div className="prose prose-blue max-w-none text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                {i18nToText(profile.bio)}
              </div>
            ) : (
              <p className="text-gray-400 italic">Ứng viên chưa cập nhật phần giới thiệu.</p>
            )}
          </div>

          {/* Section: Kỹ năng */}
          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Kỹ năng</h2>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {profile.skills.map(skill => (
                  <div 
                    key={skill.id}
                    className="px-5 py-2 bg-blue-600 text-white font-medium rounded-full shadow-sm hover:shadow-md transition cursor-default"
                  >
                    {skill.name} 
                    {skill.level && (
                      <span className="opacity-70 text-sm ml-1">({skill.level})</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
               <p className="text-gray-400 italic">Chưa có kỹ năng nào được thêm.</p>
            )}
          </div>
          
        </div>

        {/* Section: Kinh nghiệm & Dự án */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          
          {/* Experiences Column */}
          {(profile.experiences && profile.experiences.length > 0) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>💼</span> Kinh nghiệm làm việc
              </h2>
              <div className="space-y-6">
                {profile.experiences.map(exp => (
                  <div key={exp.id} className="relative pl-6 border-l-2 border-blue-200 last:pb-0">
                    <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-[7px] top-1.5 shadow-[0_0_0_4px_white]"></div>
                    <h3 className="text-lg font-bold text-gray-900">{exp.job_title}</h3>
                    <div className="text-blue-600 font-medium mb-1">{exp.company_name}</div>
                    <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                      <span>📅</span>
                      {new Date(exp.start_date).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })} 
                      {' - '} 
                      {exp.is_current ? 'Hiện tại' : new Date(exp.end_date!).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                    </div>
                    {i18nToText(exp.description) && <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{i18nToText(exp.description)}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Column */}
          {(profile.projects && profile.projects.length > 0) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>🚀</span> Dự án tiêu biểu
              </h2>
              <div className="space-y-6">
                {profile.projects.map(proj => {
                  const description = i18nToText(proj.description)
                  const projectUrl = proj.project_url || proj.github_url
                  return (
                    <div key={proj.id} className="group p-5 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{proj.project_name}</h3>
                      {proj.role && (
                        <p className="text-sm text-blue-600 mb-2 font-medium">{proj.role}</p>
                      )}
                      {description && <p className="text-gray-600 text-sm mb-4 line-clamp-3">{description}</p>}

                      <div className="flex flex-col gap-3 mt-auto">
                        {proj.technologies && (
                          <div className="flex flex-wrap gap-2">
                            {proj.technologies.split(',').map(tech => tech.trim()).map((tech, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        {projectUrl && (
                          <a
                            href={projectUrl.startsWith('http') ? projectUrl : `https://${projectUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 w-fit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            Xem dự án
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}
