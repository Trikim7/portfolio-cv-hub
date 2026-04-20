'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CandidateProfile } from '@/types'
import { apiClient } from '@/services/api'

export default function PublicPortfolioPage() {
  const params = useParams()
  const slug = params.slug as string
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiClient.getPublicProfile(slug)
        setProfile(data)
        setError(null)
      } catch (err) {
        setError('Không tìm thấy portfolio hoặc hồ sơ chưa được công khai')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProfile()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4 text-blue-600">⚙️</div>
          <p className="text-gray-500">Đang tải hồ sơ...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full border border-red-100">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a 
            href="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-block"
          >
            Về trang chủ
          </a>
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
  
  const contactEmail = profile.contact_email?.trim() || ''

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Header Section */}
      <div className="bg-[#1e40af] text-white pt-16 pb-16 px-4 md:px-8 shadow-inner relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          
          {/* Avatar Box */}
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
               <img 
                 src={profile.avatar_url} 
                 alt={profile.full_name || 'Avatar'} 
                 className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-2xl border-4 border-white/20 bg-white/10"
               />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-[#3b82f6] shadow-2xl border-4 border-white/20 flex items-center justify-center text-5xl md:text-6xl font-bold tracking-tighter shadow-blue-900/20">
                {getInitials(profile.full_name || 'N')}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 text-center md:text-left pt-2">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
              {profile.full_name || 'Hồ sơ Ứng viên'}
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 mb-6 font-medium">
              {profile.title || 'Chuyên viên'}
            </p>

            {/* Meta Tags */}
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-3 mb-8 text-blue-100/90 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>Hồ Chí Minh, Việt Nam</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✉️</span>
                <span>{contactEmail || 'Không công khai email'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>👁️</span>
                <span>{profile.views || 0} lượt xem</span> 
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              {contactEmail ? (
                <a 
                  href={`mailto:${contactEmail}`}
                  className="px-8 py-2.5 bg-white text-blue-700 font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-50 flex items-center gap-2 transition-all active:scale-95"
                >
                  <span>✉️</span> Liên hệ ngay
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-8 py-2.5 bg-white/40 text-white/90 font-semibold rounded-lg border border-white/40 flex items-center gap-2 cursor-not-allowed"
                >
                  <span>✉️</span> Chưa công khai email
                </button>
              )}
              
              {primaryCv ? (
                <a 
                  href={`/api/candidate/cvs/download/${primaryCv.id}`}
                  className="px-8 py-2.5 bg-white/20 text-white font-semibold rounded-lg border border-white/30 hover:bg-white/30 flex items-center gap-2 transition backdrop-blur-sm shadow-lg"
                >
                  <span>⬇️</span> Tải CV (PDF)
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto -mt-6 px-4 md:px-8 relative z-0">
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* Section: Giới thiệu */}
          <div className="p-8 md:p-10 border-b border-gray-100">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
              Giới thiệu bản thân
            </h2>
            {profile.bio ? (
              <div className="prose prose-blue max-w-none text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </div>
            ) : (
              <p className="text-gray-400 italic">Ứng viên đang cập nhật phần giới thiệu.</p>
            )}
          </div>

          {/* Section: Kỹ năng */}
          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
              Kỹ năng chuyên môn
            </h2>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {profile.skills.map(skill => (
                  <div 
                    key={skill.id}
                    className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-full shadow-md hover:bg-blue-700 transition cursor-default flex items-center gap-2"
                  >
                    {skill.name} 
                    {skill.level && (
                      <span className="opacity-70 text-xs font-normal border-l border-white/30 pl-2">
                        {skill.level.toUpperCase()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
               <p className="text-gray-400 italic">Chưa có thông tin kỹ năng.</p>
            )}
          </div>
          
        </div>

        {/* Section: Kinh nghiệm & Dự án */}
        <div className="grid md:grid-cols-2 gap-8 mt-10">
          
          {/* Experiences Column */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
              <span>💼</span> Kinh nghiệm
            </h2>
            {profile.experiences && profile.experiences.length > 0 ? (
              <div className="space-y-8">
                {profile.experiences.map(exp => (
                  <div key={exp.id} className="relative pl-8 border-l-2 border-blue-100 last:pb-0">
                    <div className="absolute w-4 h-4 bg-blue-600 rounded-full -left-[9px] top-1.5 border-4 border-white ring-1 ring-blue-100 shadow-sm"></div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{exp.job_title}</h3>
                    <div className="text-blue-600 font-bold mb-2 uppercase text-sm tracking-wider">{exp.company_name}</div>
                    <div className="text-sm text-gray-500 mb-4 font-medium flex items-center gap-2">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {new Date(exp.start_date).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })} 
                        {' - '} 
                        {exp.is_current ? 'Hiện tại' : new Date(exp.end_date!).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                    {exp.description && <p className="text-gray-600 leading-relaxed text-sm">{exp.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
               <p className="text-gray-400 italic">Không có dữ liệu kinh nghiệm.</p>
            )}
          </div>

          {/* Projects Column */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
              <span>🚀</span> Dự án tiêu biểu
            </h2>
            {profile.projects && profile.projects.length > 0 ? (
              <div className="space-y-6">
                {profile.projects.map(proj => (
                  <div key={proj.id} className="group p-6 rounded-2xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors uppercase">{proj.title}</h3>
                    {proj.description && <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">{proj.description}</p>}
                    
                    <div className="flex flex-col gap-4 mt-auto">
                      {proj.technologies && (
                        <div className="flex flex-wrap gap-2 text-[10px]">
                          {proj.technologies.split(',').map(tech => tech.trim()).map((tech, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-white text-blue-600 border border-blue-100 rounded-md font-bold uppercase">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {proj.url && (
                        <a 
                          href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1.5 w-fit border-b-2 border-transparent hover:border-blue-600 transition-all pb-0.5"
                        >
                          XEM CHI TIẾT DỰ ÁN
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">Chưa có dự án nào được công khai.</p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  )
}

