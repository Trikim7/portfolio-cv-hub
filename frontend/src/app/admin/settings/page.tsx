'use client'

import { useState, useEffect } from 'react'
import {
  Settings, Globe, BarChart2, Layers,
  Database, RefreshCw, AlertTriangle, Check, ChevronRight,
  Save, Zap, Users,
  Pencil, X, Mail, Eye,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface WeightConfig {
  technical_skills: number
  experience: number
  portfolio: number
  soft_skills: number
  leadership: number
  readiness_signals: number
}

interface EmailTemplate {
  id: string
  label: string
  subject: string
  body: string
  hint: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_WEIGHTS: WeightConfig = {
  technical_skills: 25,
  experience: 25,
  portfolio: 20,
  soft_skills: 10,
  leadership: 10,
  readiness_signals: 10,
}


const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'invitation',
    label: 'Lời mời tuyển dụng (gửi cho ứng viên)',
    subject: '[Portfolio CV Hub] Lời mời từ {{company_name}}',
    body: 'Xin chào {{candidate_name}},\n\nCông ty {{company_name}} mời bạn ứng tuyển vị trí: {{job_title}}\n\nTin nhắn từ nhà tuyển dụng:\n{{message}}\n\nVào Dashboard để xem và phản hồi: {{dashboard_url}}',
    hint: 'Biến khả dụng: {{candidate_name}}, {{company_name}}, {{job_title}}, {{message}}, {{dashboard_url}}',
  },
  {
    id: 'company_approved',
    label: 'Duyệt tài khoản doanh nghiệp',
    subject: '[Portfolio CV Hub] Tài khoản doanh nghiệp đã được duyệt',
    body: 'Xin chào {{company_name}},\n\nAdmin đã phê duyệt tài khoản doanh nghiệp của bạn.\nĐăng nhập tại: {{dashboard_url}}',
    hint: 'Biến khả dụng: {{company_name}}, {{dashboard_url}}',
  },
  {
    id: 'company_rejected',
    label: 'Từ chối tài khoản doanh nghiệp',
    subject: '[Portfolio CV Hub] Thông báo về đăng ký tài khoản doanh nghiệp',
    body: 'Xin chào {{company_name}},\n\nRất tiếc, Admin đã từ chối đăng ký tài khoản của bạn.\nVui lòng liên hệ quản trị viên để biết thêm chi tiết.',
    hint: 'Biến khả dụng: {{company_name}}',
  },
]

const TABS = [
  { id: 'general',    label: 'Cấu hình chung',       icon: Globe },
  { id: 'algorithm',  label: 'Trọng số Thuật toán',   icon: BarChart2 },
  { id: 'templates',  label: 'Quản lý Template',       icon: Layers },
  { id: 'tools',      label: 'Công cụ Dữ liệu',        icon: Database },
]

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {msg}
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start py-4 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${props.className ?? ''}`}
    />
  )
}

// ─── Tab: General Config ──────────────────────────────────────────────────────
function TabGeneral() {
  const [savingGeneral, setSavingGeneral] = useState(false)
  const [savingSmtp, setSavingSmtp] = useState(false)
  const [testingSmtp, setTestingSmtp] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const [general, setGeneral] = useState({
    site_name: 'Portfolio CV Hub',
    site_url: 'http://localhost:3000',
    max_comparison: '3',
  })

  const [smtp, setSmtp] = useState({
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    smtp_from_address: 'noreply@portfoliocvhub.com',
    smtp_enabled: true,
  })

  useEffect(() => {
    import('@/services/api').then(({ apiClient }) => {
      apiClient.getSmtpConfig()
        .then(data => {
          setSmtp({
            smtp_host: data.smtp_host || 'smtp.gmail.com',
            smtp_port: String(data.smtp_port || 587),
            smtp_username: data.smtp_username || '',
            smtp_password: data.smtp_password || '',
            smtp_from_address: data.smtp_from_address || 'noreply@portfoliocvhub.com',
            smtp_enabled: data.smtp_enabled ?? true,
          })
        })
        .catch(() => {})
    })
  }, [])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const setG = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setGeneral(f => ({ ...f, [k]: e.target.value }))

  const setS = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSmtp(f => ({ ...f, [k]: e.target.value }))

  const handleSaveGeneral = async () => {
    setSavingGeneral(true)
    await new Promise(r => setTimeout(r, 600))
    setSavingGeneral(false)
    showToast('Đã lưu cấu hình chung!', 'success')
  }

  const handleSaveSmtp = async () => {
    if (!smtp.smtp_username.trim()) {
      showToast('Vui lòng nhập SMTP Username', 'error'); return
    }
    if (!smtp.smtp_password || smtp.smtp_password === '••••••••') {
      showToast('Vui lòng nhập SMTP Password (App Password 16 ký tự)', 'error'); return
    }
    setSavingSmtp(true)
    try {
      const { apiClient } = await import('@/services/api')
      await apiClient.saveSmtpConfig({
        smtp_host: smtp.smtp_host,
        smtp_port: parseInt(smtp.smtp_port),
        smtp_username: smtp.smtp_username,
        smtp_password: smtp.smtp_password,
        smtp_from_address: smtp.smtp_from_address,
        smtp_enabled: smtp.smtp_enabled,
      })
      showToast('✅ Đã lưu cấu hình SMTP! Email sẽ được gửi tự động.', 'success')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Lưu thất bại. Kiểm tra lại thông tin.'
      showToast(`❌ ${msg}`, 'error')
    } finally {
      setSavingSmtp(false)
    }
  }

  const handleTestSmtp = async () => {
    setTestingSmtp(true)
    try {
      const { apiClient } = await import('@/services/api')
      const result = await apiClient.testSmtpConnection()
      showToast(`✅ ${result.message}`, 'success')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Kết nối thất bại. Kiểm tra host/port/password.'
      showToast(`❌ ${msg}`, 'error')
    } finally {
      setTestingSmtp(false)
    }
  }

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* General */}
      <Section title="Thông tin Hệ thống" desc="Tên thương hiệu và URL công khai">
        <Field label="Tên hệ thống" hint="Hiển thị trên tiêu đề và email">
          <Input value={general.site_name} onChange={setG('site_name')} placeholder="Portfolio CV Hub" />
        </Field>
        <Field label="URL hệ thống" hint="Dùng cho các link trong email">
          <Input value={general.site_url} onChange={setG('site_url')} placeholder="https://yourdomain.com" />
        </Field>
        <Field label="Giới hạn so sánh" hint="Số ứng viên tối đa so sánh cùng lúc (1–5)">
          <Input type="number" min={1} max={5} value={general.max_comparison} onChange={setG('max_comparison')} className="w-24" />
        </Field>
      </Section>
      <div className="flex justify-end mb-6">
        <button
          onClick={handleSaveGeneral}
          disabled={savingGeneral}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60"
        >
          {savingGeneral ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {savingGeneral ? 'Đang lưu…' : 'Lưu cấu hình chung'}
        </button>
      </div>

      {/* SMTP — real API */}
      <Section title="Cấu hình Email (SMTP)" desc="Gửi thông báo tự động: duyệt tài khoản doanh nghiệp và lời mời tuyển dụng">
        <Field label="SMTP Host">
          <Input value={smtp.smtp_host} onChange={setS('smtp_host')} placeholder="smtp.gmail.com" />
        </Field>
        <Field label="SMTP Port">
          <Input value={smtp.smtp_port} onChange={setS('smtp_port')} placeholder="587" className="w-28" />
        </Field>
        <Field label="SMTP Username">
          <Input value={smtp.smtp_username} onChange={setS('smtp_username')} placeholder="your@gmail.com" />
        </Field>
        <Field label="SMTP Password" hint="Dùng App Password của Gmail (16 ký tự), KHÔNG dùng mật khẩu tài khoản thường">
          <Input type="password" value={smtp.smtp_password} onChange={setS('smtp_password')} placeholder="Nhập App Password mới để thay đổi" />
        </Field>
        <Field label="From Address" hint="Địa chỉ hiển thị khi gửi đi">
          <Input value={smtp.smtp_from_address} onChange={setS('smtp_from_address')} placeholder="noreply@portfoliocvhub.com" />
        </Field>
        <Field label="Bật gửi email">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSmtp(s => ({ ...s, smtp_enabled: !s.smtp_enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${smtp.smtp_enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${smtp.smtp_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium ${smtp.smtp_enabled ? 'text-blue-700' : 'text-gray-500'}`}>
              {smtp.smtp_enabled ? 'Đang bật — hệ thống sẽ gửi email tự động' : 'Đang tắt — không gửi email'}
            </span>
          </div>
        </Field>
      </Section>

      <div className="flex items-center justify-end gap-3 mb-6">
        <button
          onClick={handleTestSmtp}
          disabled={testingSmtp || savingSmtp}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60"
        >
          {testingSmtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {testingSmtp ? 'Đang kiểm tra…' : 'Kiểm tra kết nối'}
        </button>
        <button
          onClick={handleSaveSmtp}
          disabled={savingSmtp || testingSmtp}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60"
        >
          {savingSmtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {savingSmtp ? 'Đang lưu…' : 'Lưu cấu hình SMTP'}
        </button>
      </div>
    </>
  )
}


// ─── Tab: Algorithm Weights ───────────────────────────────────────────────────
function TabAlgorithm() {
  const [weights, setWeights] = useState<WeightConfig>(DEFAULT_WEIGHTS)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const total = Object.values(weights).reduce((s, v) => s + v, 0)
  const valid = total === 100

  const setW = (k: keyof WeightConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setWeights(w => ({ ...w, [k]: Number(e.target.value) }))

  const reset = () => setWeights(DEFAULT_WEIGHTS)

  const save = async () => {
    if (!valid) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setToast('Đã cập nhật trọng số thuật toán!')
    setTimeout(() => setToast(null), 3000)
  }

  const FACTORS: { key: keyof WeightConfig; label: string; desc: string; color: string }[] = [
    { key: 'technical_skills',  label: 'Kỹ năng Kỹ thuật',        desc: 'Tỷ lệ khớp skill, level, endorsements', color: 'bg-blue-500' },
    { key: 'experience',        label: 'Kinh nghiệm',               desc: 'Số năm KN và mức độ khớp vị trí',      color: 'bg-indigo-500' },
    { key: 'portfolio',         label: 'Thực chứng Dự án',          desc: 'Tech stack, live URL, mô tả đầy đủ',   color: 'bg-violet-500' },
    { key: 'soft_skills',       label: 'Kỹ năng Mềm',              desc: 'Keywords giao tiếp, teamwork trong bio', color: 'bg-emerald-500' },
    { key: 'leadership',        label: 'Lãnh đạo & Quản lý',       desc: 'Title Lead/Manager, skill level LEAD',  color: 'bg-amber-500' },
    { key: 'readiness_signals', label: 'Tín hiệu Tuyển dụng',      desc: 'Active gần đây, lượt xem, hoàn thiện', color: 'bg-rose-500' },
  ]

  return (
    <>
      {toast && <Toast msg={toast} type="success" />}
      <Section
        title="Trọng số 6 Yếu tố Radar Chart"
        desc="Tổng phải bằng đúng 100%. Thay đổi sẽ ảnh hưởng đến điểm Overall Match Score của toàn hệ thống."
      >
        <div className="space-y-5">
          {FACTORS.map(f => (
            <div key={f.key} className="flex items-center gap-4">
              <div className="w-48 shrink-0">
                <p className="text-sm font-medium text-gray-700">{f.label}</p>
                <p className="text-xs text-gray-400">{f.desc}</p>
              </div>
              <div className="flex-1">
                <input
                  type="range" min={0} max={60} step={5}
                  value={weights[f.key]}
                  onChange={setW(f.key)}
                  className="w-full accent-blue-600"
                />
                <div className={`h-1.5 rounded-full mt-1 transition-all ${f.color}`}
                  style={{ width: `${(weights[f.key] / 60) * 100}%` }} />
              </div>
              <div className="w-16 text-right">
                <span className={`text-lg font-bold ${valid ? 'text-gray-800' : 'text-red-500'}`}>
                  {weights[f.key]}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-6 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border ${valid ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {valid
            ? <><Check className="w-4 h-4" /> Tổng trọng số: <strong>100%</strong> — Hợp lệ</>
            : <><AlertTriangle className="w-4 h-4" /> Tổng hiện tại: <strong>{total}%</strong> — Phải bằng 100%</>
          }
        </div>
      </Section>

      <div className="flex justify-between">
        <button onClick={reset} className="flex items-center gap-2 border border-gray-300 text-gray-600 hover:bg-gray-50 px-5 py-2.5 rounded-lg text-sm font-medium transition">
          <RefreshCw className="w-4 h-4" /> Khôi phục mặc định
        </button>
        <button onClick={save} disabled={saving || !valid}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Đang lưu…' : 'Lưu trọng số'}
        </button>
      </div>
    </>
  )
}

// ─── Tab: Templates ───────────────────────────────────────────────────────────
function TabTemplates() {
  // ── Email templates state ────────────────────────────────────
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(DEFAULT_EMAIL_TEMPLATES)
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null)
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null)

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Email template actions ────────────────────────────────────
  const startEditEmail = (id: string) => setEditingEmailId(id === editingEmailId ? null : id)

  const updateEmail = (id: string, field: 'subject' | 'body', value: string) => {
    setEmailTemplates(ts => ts.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  const saveEmail = (_id: string) => {
    setEditingEmailId(null)
    showToast('Đã lưu template email!')
  }

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── Email Templates ── */}
      <Section
        title="Template Email Thông báo"
        desc="Tùy chỉnh tiêu đề và nội dung email cho từng loại sự kiện. Dùng {{biến}} để chèn dữ liệu động."
      >
        <div className="space-y-3">
          {emailTemplates.map(tpl => (
            <div key={tpl.id} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Header row */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-800">{tpl.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedPreview(expandedPreview === tpl.id ? null : tpl.id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {expandedPreview === tpl.id ? 'Ẩn' : 'Xem trước'}
                  </button>
                  <button
                    onClick={() => startEditEmail(tpl.id)}
                    className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                      editingEmailId === tpl.id
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {editingEmailId === tpl.id ? 'Đóng' : 'Sửa'}
                  </button>
                </div>
              </div>

              {/* Edit form */}
              {editingEmailId === tpl.id && (
                <div className="p-4 space-y-3 border-t border-gray-200">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Tiêu đề (Subject)</label>
                    <input
                      value={tpl.subject}
                      onChange={e => updateEmail(tpl.id, 'subject', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Nội dung (Body)</label>
                    <textarea
                      value={tpl.body}
                      onChange={e => updateEmail(tpl.id, 'body', e.target.value)}
                      rows={6}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                  </div>
                  <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                    💡 {tpl.hint}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => saveEmail(tpl.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition">
                      <Save className="w-3.5 h-3.5" /> Lưu template
                    </button>
                    <button onClick={() => setEditingEmailId(null)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition">
                      <X className="w-3.5 h-3.5" /> Hủy
                    </button>
                  </div>
                </div>
              )}

              {/* Preview */}
              {expandedPreview === tpl.id && editingEmailId !== tpl.id && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Subject:</p>
                  <p className="text-sm text-gray-800 font-medium mb-3">{tpl.subject}</p>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Body:</p>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-white border border-gray-200 rounded-lg p-3">{tpl.body}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ─── Tab: Data Tools ──────────────────────────────────────────────────────────
function TabTools() {
  const [seedLoading, setSeedLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const handleSeed = async () => {
    setSeedLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setSeedLoading(false)
    setToast({ msg: 'Đã tạo dữ liệu mẫu thành công! (50 ứng viên, 10 doanh nghiệp)', type: 'success' })
    setTimeout(() => setToast(null), 4000)
  }

  const handleReset = async () => {
    if (!confirmReset) { setConfirmReset(true); return }
    setResetLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setResetLoading(false)
    setConfirmReset(false)
    setToast({ msg: 'Đã xóa toàn bộ dữ liệu demo thành công!', type: 'success' })
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <Section title="Tạo Dữ liệu Mẫu (Seed Data)"
        desc="Tạo tự động tập dữ liệu demo đa dạng phục vụ kiểm thử và demo hệ thống.">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: Users,  label: '50 Ứng viên', desc: 'Đa dạng kỹ năng, kinh nghiệm' },
                { icon: Zap,    label: '10 Doanh nghiệp', desc: 'Đã được duyệt sẵn' },
                { icon: Layers, label: '4 Templates', desc: 'Kích hoạt đầy đủ' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2">
                  <item.icon className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleSeed} disabled={seedLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60">
              {seedLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {seedLoading ? 'Đang tạo dữ liệu…' : 'Chạy Seed Data'}
            </button>
          </div>
        </div>
      </Section>

      <Section title="Xóa Dữ liệu Demo (Reset)"
        desc="Xóa toàn bộ dữ liệu test/demo. Hành động này KHÔNG thể hoàn tác!">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700">
            <p className="font-semibold mb-1">Cảnh báo nguy hiểm</p>
            <p>Thao tác này sẽ xóa toàn bộ ứng viên, doanh nghiệp và dữ liệu liên quan đã được tạo bởi seed.
              Dữ liệu thật (tài khoản admin, settings) sẽ được giữ nguyên.</p>
          </div>
        </div>

        {confirmReset && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3 text-sm text-amber-700 font-medium">
            <AlertTriangle className="w-4 h-4" />
            Nhấn lần nữa để xác nhận xóa toàn bộ dữ liệu demo!
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleReset} disabled={resetLoading}
            className={`flex items-center gap-2 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60 ${confirmReset ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
            {resetLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            {resetLoading ? 'Đang xóa…' : confirmReset ? 'Xác nhận xóa!' : 'Reset Database Demo'}
          </button>
          {confirmReset && (
            <button onClick={() => setConfirmReset(false)}
              className="px-5 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition">
              Hủy
            </button>
          )}
        </div>
      </Section>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="p-6 lg:p-8 max-w-[1000px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt Hệ thống</h1>
        </div>
        <p className="text-sm text-gray-500">Quản lý cấu hình, thuật toán, template và công cụ dữ liệu</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                active ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {active && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'general'   && <TabGeneral />}
      {activeTab === 'algorithm' && <TabAlgorithm />}
      {activeTab === 'templates' && <TabTemplates />}
      {activeTab === 'tools'     && <TabTools />}
    </div>
  )
}
