'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { apiClient } from '@/services/api'
import { ComparisonDetailResponse, ComparisonHistoryItem } from '@/types'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CandidateMini {
  id: number
  name: string
  role?: string
  initials: string
  color: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
/** Deterministic pastel colour from an integer seed */
const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-fuchsia-100 text-fuchsia-700',
]

function avatarColor(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

/** Fallback: give a generic name to a bare id */
function idToMini(id: number): CandidateMini {
  return {
    id,
    name: `Ứng viên ${id}`,
    initials: `${id}`.slice(-2),
    color: avatarColor(id),
  }
}

// Parse the criteria_json into readable parts
interface ParsedCriteria {
  title?: string
  role?: string
  experience?: number
  skills: string[]
  techStack: string[]
  priorities: { label: string; level: string; color: string }[]
}

const WEIGHT_LABELS: Record<string, string> = {
  technical_skills: 'Kỹ thuật',
  experience: 'Kinh nghiệm',
  portfolio: 'Portfolio',
  soft_skills: 'Kỹ năng mềm',
  leadership: 'Lãnh đạo',
  readiness_signals: 'Sẵn sàng',
}

function levelBadge(pct: number): { level: string; color: string } {
  if (pct >= 30) return { level: 'Cao', color: 'bg-violet-100 text-violet-700 border-violet-200' }
  if (pct >= 15) return { level: 'Trung bình', color: 'bg-blue-100 text-blue-700 border-blue-200' }
  return { level: 'Thấp', color: 'bg-gray-100 text-gray-500 border-gray-200' }
}

function parseCriteria(json: Record<string, unknown>): ParsedCriteria {
  // skills may be strings or {name, level} objects
  const rawSkills = (json.required_skills ?? json.skills) as unknown[] | undefined
  const skills: string[] = (rawSkills ?? []).map((s) =>
    typeof s === 'string' ? s : (s as { name: string }).name ?? '',
  ).filter(Boolean)

  const rawTech = json.tech_stack as string[] | undefined
  const techStack = rawTech?.filter(Boolean) ?? []

  const rawWeights = json.weights_config as Record<string, number> | undefined
  const priorities: ParsedCriteria['priorities'] = []
  if (rawWeights) {
    const total = Object.values(rawWeights).reduce((a, b) => a + b, 0) || 1
    Object.entries(rawWeights)
      .sort((a, b) => b[1] - a[1])
      .filter(([, v]) => v > 0)
      .forEach(([key, val]) => {
        const pct = Math.round((val / total) * 100)
        const { level, color } = levelBadge(pct)
        priorities.push({ label: WEIGHT_LABELS[key] ?? key, level, color })
      })
  }

  return {
    title: json.title as string | undefined,
    role: json.required_role as string | undefined,
    experience: json.years_experience as number | undefined,
    skills,
    techStack,
    priorities,
  }
}

function extractError(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { detail?: string } }; message?: string }
  return e?.response?.data?.detail ?? e?.message ?? fallback
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Animated expand/collapse wrapper — uses ResizeObserver so height updates
 * automatically after async content loads (fixes the "click twice" bug). */
function Expandable({ open, children }: { open: boolean; children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>(0)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return

    // Snap to the correct height immediately on open/close
    setHeight(open ? el.scrollHeight : 0)

    // While open: keep watching so the height stays accurate as children change
    // (e.g., the loading spinner is replaced by the full detail panel)
    if (!open) return
    const obs = new ResizeObserver(() => {
      if (innerRef.current) setHeight(innerRef.current.scrollHeight)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [open])

  return (
    <div
      style={{
        maxHeight: `${height}px`,
        overflow: 'hidden',
        transition: 'max-height 320ms cubic-bezier(0.4,0,0.2,1), opacity 250ms ease',
        opacity: open ? 1 : 0,
      }}
    >
      <div ref={innerRef}>
        {children}
      </div>
    </div>
  )
}

/** Detail panel rendered inline below each history row */
function DetailPanel({
  detail,
  loading,
  error,
  historyItem,
  onRerun,
}: {
  detail: ComparisonDetailResponse | null
  loading: boolean
  error: string | null
  historyItem: ComparisonHistoryItem
  onRerun: (item: ComparisonHistoryItem) => void
}) {

  if (loading && !detail) {
    return (
      <div className="flex items-center gap-2 py-6 px-4 text-sm text-gray-400">
        <span className="w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin shrink-0" />
        Đang tải chi tiết...
      </div>
    )
  }

  if (error) {
    return (
      <p className="py-4 px-4 text-sm text-red-600 bg-red-50 rounded-xl mx-2 mb-2">
        {error}
      </p>
    )
  }

  if (!detail) return null

  const raw = detail.criteria_json as Record<string, unknown>

  // criteria_json is stored as { criteria_source: {...}, results: [...], ... }
  // parseCriteria needs the inner criteria_source object, not the wrapper
  const criteriaSource =
    (raw.criteria_source as Record<string, unknown> | undefined) ?? raw
  const criteria = parseCriteria(criteriaSource)

  // Candidate names are already stored inside criteria_json.results
  const storedResults = (
    raw.results as Array<{ candidate_id: number; full_name?: string }> | undefined
  ) ?? []
  const nameMap = new Map<number, string>(
    storedResults
      .filter((r) => r.full_name)
      .map((r) => [r.candidate_id, r.full_name as string]),
  )

  const ids = detail.participant_candidate_ids
  const candidates: CandidateMini[] = ids.map((id) => {
    const name = nameMap.get(id)
    if (name) {
      const parts = name.trim().split(/\s+/)
      const initials =
        parts.length >= 2
          ? `${parts[parts.length - 2][0]}${parts[parts.length - 1][0]}`.toUpperCase()
          : name.slice(0, 2).toUpperCase()
      return { id, name, initials, color: avatarColor(id) }
    }
    return idToMini(id)
  })
  const visibleCandidates = candidates.slice(0, 5)
  const extraCount = candidates.length - visibleCandidates.length

  return (
    <div className="border-t border-dashed border-violet-100 bg-white rounded-b-xl">
      <div className="p-4 space-y-4">

        {/* ─── Top action bar ─────────────────────────────── */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs text-gray-400">
            {new Date(detail.created_at).toLocaleString('vi-VN')}
          </span>
          <button
            type="button"
            onClick={() => onRerun(historyItem)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg px-2.5 py-1 transition"
          >
            ▶ Chạy lại
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ─── Criteria Summary ─────────────────────── */}
            <div className="bg-gradient-to-br from-slate-50 to-violet-50/30 border border-violet-100 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-3">
                📋 Tiêu chí tìm kiếm
              </p>
              <div className="space-y-2 text-sm">
                {criteria.title && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-24 shrink-0">Vị trí</span>
                    <span className="font-semibold text-gray-800 truncate">{criteria.title}</span>
                  </div>
                )}
                {criteria.role && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-24 shrink-0">Loại vai trò</span>
                    <span className="font-semibold text-gray-800">{criteria.role}</span>
                  </div>
                )}
                {criteria.experience !== undefined && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-24 shrink-0">Kinh nghiệm</span>
                    <span className="font-semibold text-gray-800">
                      {criteria.experience === 0 ? 'Không yêu cầu' : `${criteria.experience} năm`}
                    </span>
                  </div>
                )}
                {criteria.skills.length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-24 shrink-0">Kỹ năng</span>
                    <div className="flex flex-wrap gap-1">
                      {criteria.skills.map((s) => (
                        <span key={s} className="bg-violet-100 text-violet-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {criteria.techStack.length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-24 shrink-0">Tech stack</span>
                    <div className="flex flex-wrap gap-1">
                      {criteria.techStack.map((t) => (
                        <span key={t} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium border border-blue-100">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {criteria.priorities.length > 0 && (
                  <div className="flex gap-2 items-start">
                    <span className="text-gray-400 w-24 shrink-0">Ưu tiên</span>
                    <div className="flex flex-wrap gap-1">
                      {criteria.priorities.map((p) => (
                        <span key={p.label} className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${p.color}`}>
                          {p.label}: {p.level}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Candidate List ───────────────────────── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-3">
                👥 Ứng viên trong phiên ({ids.length})
              </p>

              {ids.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-2xl mb-1">🚫</p>
                  <p className="text-sm">Không có ứng viên nào trong phiên này</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleCandidates.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-violet-50/50 hover:border-violet-100 transition"
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${c.color}`}>
                        {c.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                        {c.role && (
                          <p className="text-xs text-gray-400 truncate">{c.role}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {extraCount > 0 && (
                    <p className="text-xs text-gray-400 text-center pt-1">
                      +{extraCount} ứng viên khác
                    </p>
                  )}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  )
}

// ─── History Row ───────────────────────────────────────────────────────────────
interface HistoryRowProps {
  item: ComparisonHistoryItem
  isOpen: boolean
  detail: ComparisonDetailResponse | null
  detailLoading: boolean
  detailError: string | null
  onToggle: (id: number) => void
  onRerun: (item: ComparisonHistoryItem) => void
}

function HistoryRow({ item, isOpen, detail, detailLoading, detailError, onToggle, onRerun }: HistoryRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && rowRef.current) {
      setTimeout(() => rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
    }
  }, [isOpen])

  return (
    <div
      ref={rowRef}
      className={`rounded-xl border overflow-hidden transition-all duration-200 ${isOpen ? 'border-violet-300 shadow-sm shadow-violet-100' : 'border-gray-200 hover:border-violet-200'
        }`}
    >
      {/* Header row — clickable */}
      <button
        type="button"
        onClick={() => onToggle(item.comparison_id)}
        className={`w-full text-left p-3 flex items-center gap-3 transition ${isOpen ? 'bg-violet-50/60' : 'bg-white hover:bg-gray-50'
          }`}
      >
        {/* Icon */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base transition ${isOpen ? 'bg-violet-600 text-white' : 'bg-violet-50 text-violet-500'
          }`}>
          💼
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isOpen ? 'text-violet-900' : 'text-gray-900'}`}>
            {item.criteria_title ?? `Phiên ${item.comparison_id}`}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(item.created_at).toLocaleString('vi-VN')}
          </p>
        </div>

        {/* Badge + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold border border-violet-200">
            {item.candidate_count} ứng viên
          </span>
          <span className={`text-gray-400 text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      {/* Expandable detail panel — rendered INSIDE the map */}
      <Expandable open={isOpen}>
        <DetailPanel
          detail={detail}
          loading={detailLoading}
          error={detailError}
          historyItem={item}
          onRerun={onRerun}
        />
      </Expandable>
    </div>
  )
}

// ─── Main Export ───────────────────────────────────────────────────────────────
interface SearchHistoryListProps {
  /** Called when user clicks "Re-run" — passes back the criteria_json */
  onRerun?: (criteriaJson: Record<string, unknown>) => void
  /** Increment this to trigger an automatic history reload (e.g. after a new ranking run) */
  refreshKey?: number
}

export default function SearchHistoryList({ onRerun, refreshKey = 0 }: SearchHistoryListProps) {
  const [history, setHistory] = useState<ComparisonHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  // Per-item expanded state
  const [openId, setOpenId] = useState<number | null>(null)
  const [detailCache, setDetailCache] = useState<Record<number, ComparisonDetailResponse>>({})
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [errorCache, setErrorCache] = useState<Record<number, string>>({})

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const res = await apiClient.getComparisonHistory({ limit: 20, offset: 0 })
      setHistory(res.items ?? [])
      // Clear detail cache on reload so stale data is not shown
      setDetailCache({})
      setErrorCache({})
    } catch (err) {
      setHistoryError(extractError(err, 'Không thể tải lịch sử'))
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  // Re-fetch whenever refreshKey changes (triggered by parent after a new run)
  useEffect(() => { loadHistory() }, [loadHistory, refreshKey])

  const handleToggle = async (id: number) => {
    // Collapse if already open
    if (openId === id) {
      setOpenId(null)
      return
    }

    setOpenId(id)

    // Fetch if not cached
    if (!detailCache[id]) {
      setLoadingId(id)
      try {
        const detail = await apiClient.getComparisonDetail(id)
        setDetailCache((prev) => ({ ...prev, [id]: detail }))
      } catch (err) {
        setErrorCache((prev) => ({ ...prev, [id]: extractError(err, 'Không thể tải chi tiết') }))
      } finally {
        setLoadingId(null)
      }
    }
  }

  const handleRerun = (item: ComparisonHistoryItem) => {
    const detail = detailCache[item.comparison_id]
    if (detail && onRerun) {
      onRerun(detail.criteria_json as Record<string, unknown>)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Lịch sử tìm kiếm</h3>
          <p className="text-xs text-gray-400 mt-0.5">Nhấn để xem chi tiết từng phiên</p>
        </div>
        {historyLoading && (
          <span className="ml-auto w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
        )}
      </div>

      {historyError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          {historyError}
        </p>
      )}

      {historyLoading && history.length === 0 ? (
        <div className="flex items-center gap-2 py-8 justify-center text-gray-400 text-sm">
          <span className="w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
          Đang tải lịch sử...
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-sm font-medium text-gray-500">Chưa có lịch sử tìm kiếm nào</p>
          <p className="text-xs text-gray-400 mt-1">Chạy tìm kiếm AI đầu tiên để xem tại đây</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item) => (
            <HistoryRow
              key={item.comparison_id}
              item={item}
              isOpen={openId === item.comparison_id}
              detail={detailCache[item.comparison_id] ?? null}
              detailLoading={loadingId === item.comparison_id}
              detailError={errorCache[item.comparison_id] ?? null}
              onToggle={handleToggle}
              onRerun={handleRerun}
            />
          ))}
        </div>
      )}
    </div>
  )
}
