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
          apiClient.getCurrentUser(),
        ])
        setProfile(profileData)
        setUser(userData)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Không thể tải portfolio')
      } finally {
        setLoading(false)
      }
    }

    if (isLoggedIn) fetchData()
  }, [isLoggedIn, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-600">Đang tải portfolio của bạn...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có dữ liệu</h2>
          <p className="text-gray-600 mb-6">{error || 'Bạn chưa cập nhật thông tin hồ sơ.'}</p>
          <Link
            href="/dashboard"
            className="inline-flex px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Quay lại Hồ sơ
          </Link>
        </div>
      </div>
    )
  }

  const getInitials = (name: string) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  const primaryCv = profile.cvs.find((cv) => cv.is_primary) || profile.cvs[0]

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Preview top bar */}
      <div className="bg-gray-900 text-white py-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-blue-600 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
              Xem trước
            </span>
            <span className="text-gray-300">Đây là cách nhà tuyển dụng nhìn thấy hồ sơ của bạn</span>
          </div>
          <div className="flex gap-2">
            {profile.public_slug && profile.is_public && (
              <a
                href={`/portfolio/${profile.public_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition"
              >
                Xem trang public
              </a>
            )}
            <Link
              href="/dashboard"
              className="px-4 py-1.5 bg-white text-gray-900 hover:bg-gray-100 rounded-lg text-sm font-medium transition"
            >
              Chỉnh sửa
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="shrink-0">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Avatar'}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover ring-2 ring-white/40 shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-4xl md:text-5xl font-bold shadow-lg ring-2 ring-white/30">
                  {getInitials(profile.full_name || user?.email || 'N')}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {profile.full_name || 'Cập nhật tên ở Hồ sơ'}
              </h1>
              <p className="mt-2 text-lg md:text-xl text-white/85 font-medium">
                {profile.headline || 'Cập nhật vị trí ứng tuyển'}
              </p>

              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2 text-sm text-white/80">
                <span>Việt Nam</span>
                <span>{user?.email || 'email@example.com'}</span>
                <span>{profile.views || 0} lượt xem</span>
              </div>

              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                <a
                  href={`mailto:${user?.email}`}
                  className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow"
                >
                  Liên hệ
                </a>
                {primaryCv ? (
                  <a
                    href={`/api/candidate/cvs/download/${primaryCv.id}`}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur ring-1 ring-white/30 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                  >
                    Tải CV
                  </a>
                ) : (
                  <button
                    disabled
                    className="bg-white/10 text-white/60 ring-1 ring-white/20 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed"
                  >
                    Chưa cập nhật CV
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-6">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <header className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Giới thiệu</h2>
          </header>
          <div className="p-6">
            {i18nToText(profile.bio) ? (
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {i18nToText(profile.bio)}
              </div>
            ) : (
              <p className="text-gray-400 italic">Ứng viên chưa cập nhật phần giới thiệu.</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <header className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Kỹ năng</h2>
          </header>
          <div className="p-6">
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-4 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-sm font-medium"
                  >
                    {skill.name}
                    {skill.level && (
                      <span className="opacity-70 text-xs ml-1">({skill.level})</span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">Chưa có kỹ năng nào được thêm.</p>
            )}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {profile.experiences && profile.experiences.length > 0 && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <header className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Kinh nghiệm làm việc</h2>
              </header>
              <div className="p-6 space-y-6">
                {profile.experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-6 border-l-2 border-blue-200">
                    <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-[7px] top-1.5 shadow-[0_0_0_4px_white]" />
                    <h3 className="text-base font-bold text-gray-900">{exp.job_title}</h3>
                    <div className="text-blue-700 font-medium text-sm">{exp.company_name}</div>
                    <div className="text-xs text-gray-500 mt-1 mb-2">
                      {new Date(exp.start_date).toLocaleDateString('vi-VN', {
                        month: '2-digit',
                        year: 'numeric',
                      })}{' '}
                      -{' '}
                      {exp.is_current
                        ? 'Hiện tại'
                        : new Date(exp.end_date!).toLocaleDateString('vi-VN', {
                            month: '2-digit',
                            year: 'numeric',
                          })}
                    </div>
                    {i18nToText(exp.description) && (
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {i18nToText(exp.description)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {profile.projects && profile.projects.length > 0 && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <header className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Dự án tiêu biểu</h2>
              </header>
              <div className="p-6 space-y-5">
                {profile.projects.map((proj) => {
                  const description = i18nToText(proj.description)
                  const projectUrl = proj.project_url || proj.github_url
                  return (
                    <div
                      key={proj.id}
                      className="p-5 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition"
                    >
                      <h3 className="text-base font-bold text-gray-900">{proj.project_name}</h3>
                      {proj.role && (
                        <p className="text-xs text-blue-700 mt-1 font-medium">{proj.role}</p>
                      )}
                      {description && (
                        <p className="text-gray-600 text-sm mt-2 line-clamp-3">{description}</p>
                      )}

                      <div className="mt-3 flex flex-col gap-3">
                        {proj.technologies && (
                          <div className="flex flex-wrap gap-1.5">
                            {proj.technologies
                              .split(',')
                              .map((t) => t.trim())
                              .map((tech, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
                                >
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
                            className="text-blue-700 hover:text-blue-900 text-sm font-semibold w-fit"
                          >
                            Xem dự án →
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
