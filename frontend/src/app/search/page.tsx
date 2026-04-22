'use client'

import React, { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/services/api'
import { ChevronLeft, Search, X } from 'lucide-react'

interface CandidateCard {
  id: number
  full_name?: string
  headline?: string
  public_slug?: string
  avatar_url?: string
  skills: string[]
}

const AVATAR_COLORS = [
  'bg-blue-400', 'bg-indigo-400', 'bg-violet-400',
  'bg-sky-400', 'bg-cyan-400', 'bg-purple-400',
]

const QUICK_TAGS = ['React', 'Python', 'UI/UX', 'DevOps', 'Data Science', 'Node.js', 'Figma']

function initials(name: string) {
  const parts = (name || '').trim().split(' ').filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function SearchPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Dùng 1 state duy nhất cho keyword (tags cũng search qua keyword)
  const [query, setQuery] = useState(
    searchParams.get('keyword') || searchParams.get('skill') || ''
  )
  const [candidates, setCandidates] = useState<CandidateCard[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const doSearch = async (kw: string) => {
    setLoading(true)
    setSearched(true)
    try {
      // Gửi keyword — backend tìm trong name, headline, bio, VÀ skill names
      const data = await apiClient.searchCandidates(
        kw || undefined,
        undefined,
        undefined,
        undefined,
      )
      setCandidates(
        (Array.isArray(data) ? data : []).map((c: any) => ({
          id: c.id,
          full_name: c.full_name,
          headline: c.headline,
          public_slug: c.public_slug,
          avatar_url: c.avatar_url,
          skills: Array.isArray(c.skills) ? c.skills : [],
        }))
      )
    } catch {
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }

  // Auto-search khi có URL params
  useEffect(() => {
    const kw = searchParams.get('keyword') || searchParams.get('skill') || ''
    if (kw) {
      setQuery(kw)
      doSearch(kw)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const kw = query.trim()
    router.replace(kw ? `/search?keyword=${encodeURIComponent(kw)}` : '/search')
    doSearch(kw)
  }

  const applyTag = (tag: string) => {
    setQuery(tag)
    router.replace(`/search?keyword=${encodeURIComponent(tag)}`)
    doSearch(tag)
  }

  const clearAll = () => {
    setQuery('')
    setSearched(false)
    setCandidates([])
    router.replace('/search')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-6 transition">
            <ChevronLeft className="w-4 h-4" />
            Trang chủ
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold">Tìm kiếm ứng viên</h1>
          <p className="mt-2 text-blue-200 text-sm">Khám phá tài năng phù hợp với nhu cầu của bạn</p>

          {/* Search form */}
          <form onSubmit={handleSubmit} className="mt-8 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tên, kỹ năng, vị trí..."
                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm outline-none shadow focus:ring-2 focus:ring-blue-300"
              />
              {/* Clear button */}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition shadow shrink-0"
            >
              Tìm
            </button>
          </form>

          {/* Quick tags — highlight khi khớp với query */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {QUICK_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => applyTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ring-1 ring-white/20 backdrop-blur ${
                  query === tag
                    ? 'bg-white text-blue-700 ring-white'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-200 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-100 rounded-full" />
                  <div className="h-6 w-12 bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : !searched ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nhập từ khóa hoặc chọn tag để tìm kiếm ứng viên</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">Không tìm thấy ứng viên phù hợp với <strong>&quot;{query}&quot;</strong>.</p>
            <button
              onClick={clearAll}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                Tìm thấy <span className="font-semibold text-gray-800">{candidates.length}</span> ứng viên
                {query && <> cho <span className="font-semibold text-blue-600">&quot;{query}&quot;</span></>}
              </p>
              <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-600 transition">
                Xóa bộ lọc
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {candidates.map((c, idx) => {
                const name = c.full_name || 'Ứng viên'
                const slugLink = c.public_slug ? `/portfolio/${c.public_slug}` : null
                const avatarBg = AVATAR_COLORS[idx % AVATAR_COLORS.length]

                const card = (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 h-full">
                    {c.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.avatar_url} alt={name} className="w-12 h-12 rounded-full object-cover mb-4 shadow-sm" />
                    ) : (
                      <div className={`w-12 h-12 rounded-full ${avatarBg} text-white flex items-center justify-center text-sm font-extrabold mb-4 shadow-sm`}>
                        {initials(name)}
                      </div>
                    )}
                    <h3 className="font-bold text-gray-900 text-base leading-tight">{name}</h3>
                    {c.headline && <p className="text-sm text-gray-500 mt-0.5">{c.headline}</p>}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {c.skills.slice(0, 4).map(s => (
                        <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )

                return slugLink ? (
                  <Link key={c.id} href={slugLink} className="block h-full">{card}</Link>
                ) : (
                  <div key={c.id}>{card}</div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  )
}
