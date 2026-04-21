'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api'

// Unified display type — views is optional (real API doesn't return it)
interface DisplayCandidate {
  id: number
  full_name?: string
  headline?: string
  public_slug?: string
  skills: string[]
  views?: number
}

// ─── Static featured candidates fallback ─────────────────────────────────────
const FALLBACK_CANDIDATES: DisplayCandidate[] = [
  { id: 1, full_name: 'Nguyễn Văn A', headline: 'Frontend Developer', public_slug: '', skills: ['React', 'TypeScript', 'Tailwind'], views: 342 },
  { id: 2, full_name: 'Trần Thị B', headline: 'UI/UX Designer', public_slug: '', skills: ['Figma', 'Adobe XD', 'Prototyping'], views: 521 },
  { id: 3, full_name: 'Lê Minh C', headline: 'Backend Developer', public_slug: '', skills: ['Python', 'FastAPI', 'PostgreSQL'], views: 189 },
  { id: 4, full_name: 'Phạm Đức D', headline: 'Fullstack Engineer', public_slug: '', skills: ['Node.js', 'React', 'Docker'], views: 278 },
]

const HOW_STEPS: { icon: React.ReactNode; label: string; desc: string }[] = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    label: 'Tạo Portfolio', desc: 'Điền thông tin cá nhân, kỹ năng và dự án',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx={12} cy={12} r={10} />
        <line x1={2} y1={12} x2={22} y2={12} />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    label: 'Chia sẻ Link', desc: 'Portfolio public với đường dẫn riêng',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx={13.5} cy={6.5} r={1} /><circle cx={17.5} cy={10.5} r={1} /><circle cx={8.5} cy={7.5} r={1} /><circle cx={6.5} cy={12.5} r={1} />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    ),
    label: 'Thu hút DN', desc: 'Doanh nghiệp tìm kiếm và xem hồ sơ',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <line x1={22} y1={2} x2={11} y2={13} /><polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    label: 'Nhận lời mời', desc: 'Kết nối trực tiếp với nhà tuyển dụng',
  },
]

const QUICK_TAGS = ['React', 'Python', 'UI/UX', 'DevOps', 'Data Science']

// ─── Avatar initials helper ───────────────────────────────────────────────────
function initials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-blue-400', 'bg-indigo-400', 'bg-violet-400',
  'bg-sky-400', 'bg-cyan-400', 'bg-purple-400',
]

export default function HomePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [featured, setFeatured] = useState<DisplayCandidate[]>([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [platformStats, setPlatformStats] = useState<{
    total_candidates: number
    total_views: number
    total_invitations: number
  } | null>(null)

  // Load real data on mount — non-blocking, fallback gracefully
  useEffect(() => {
    Promise.allSettled([
      // Featured candidates sorted by views
      apiClient.getFeaturedCandidates(4).then(data => {
        const mapped: DisplayCandidate[] = data.map(c => ({
          id: c.id,
          full_name: c.full_name,
          headline: c.headline,
          public_slug: c.public_slug,
          skills: c.skills,
          views: c.views,
        }))
        setFeatured(mapped)
      }),
      // Platform-wide stats
      apiClient.getPublicStats().then(stats => setPlatformStats(stats)),
    ]).finally(() => setLoadingFeatured(false))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    const params = new URLSearchParams()
    if (q) params.set('keyword', q)
    router.push(`/search?${params}`)
  }

  const handleTag = (tag: string) => {
    router.push(`/search?skill=${encodeURIComponent(tag)}`)
  }

  // Use real data if available, fallback to mock
  const displayCandidates = featured.length > 0 ? featured : FALLBACK_CANDIDATES

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Nền tảng Portfolio
          </h1>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-emerald-300 mt-1">
            cho thế hệ mới
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Tạo portfolio chuyên nghiệp, kết nối với doanh nghiệp hàng đầu. Để kỹ năng của bạn tỏa sáng.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-10 flex items-center max-w-xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden ring-2 ring-white/20">
            <span className="pl-5 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx={11} cy={11} r={8} /><path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm kiếm theo kỹ năng, vị trí..."
              className="flex-1 px-4 py-4 text-gray-800 text-sm outline-none bg-transparent placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="m-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shrink-0"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Quick tags */}
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            {QUICK_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTag(tag)}
                className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-medium backdrop-blur transition ring-1 ring-white/20"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx={9} cy={7} r={4} />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
              value: platformStats ? `${platformStats.total_candidates.toLocaleString('vi-VN')}+` : '—',
              label: 'Ứng viên',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx={12} cy={12} r={3} />
                </svg>
              ),
              value: platformStats ? `${platformStats.total_views.toLocaleString('vi-VN')}+` : '—',
              label: 'Lượt xem Portfolio',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1={22} y1={2} x2={11} y2={13} />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              ),
              value: platformStats ? `${platformStats.total_invitations.toLocaleString('vi-VN')}+` : '—',
              label: 'Lời mời tuyển dụng',
            },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured candidates ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Ứng viên nổi bật</h2>
            <p className="mt-1 text-sm text-gray-500">Khám phá những tài năng hàng đầu trên nền tảng</p>
          </div>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-200 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayCandidates.map((c, idx) => {
              const name = c.full_name || 'Ứng viên'
              const headline = c.headline || ''
              const skills = (c.skills ?? []).slice(0, 3)
              const views = c.views
              const slug = c.public_slug || ''
              const avatarBg = AVATAR_COLORS[idx % AVATAR_COLORS.length]

              const card = (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer">
                  <div className={`w-12 h-12 rounded-full ${avatarBg} text-white flex items-center justify-center text-sm font-extrabold mb-4 shadow-sm`}>
                    {initials(name)}
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">{name}</h3>
                  {headline && <p className="text-sm text-gray-500 mt-0.5">{headline}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {skills.map(s => (
                      <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                  {views !== undefined && (
                    <p className="mt-4 text-xs text-gray-400 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx={12} cy={12} r={3} />
                      </svg>
                      {views} lượt xem
                    </p>
                  )}
                </div>
              )

              return slug ? (
                <Link key={c.id} href={`/portfolio/${slug}`}>{card}</Link>
              ) : (
                <div key={c.id}>{card}</div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── How it works ── */}
      <section className="bg-white border-t border-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-12">Cách hoạt động</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {HOW_STEPS.map((step, _) => (
              <div key={step.label} className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
                  {step.icon}
                </div>
                <p className="font-bold text-gray-900 text-sm">{step.label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-10 text-center text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
          <h2 className="text-2xl sm:text-3xl font-extrabold">Sẵn sàng bắt đầu?</h2>
          <p className="mt-3 text-blue-100 text-sm sm:text-base max-w-md mx-auto">
            Tạo portfolio của bạn ngay hôm nay và để nhà tuyển dụng tìm đến bạn.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition shadow-sm"
            >
              Tạo Portfolio miễn phí
            </Link>
            <Link
              href="/recruiter/register"
              className="px-8 py-3 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition ring-1 ring-white/30 backdrop-blur"
            >
              Tuyển dụng ngay
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-end text-sm text-gray-500">
          <span>© {new Date().getFullYear()} Portfolio CV Hub</span>
        </div>
      </footer>
    </div>
  )
}
