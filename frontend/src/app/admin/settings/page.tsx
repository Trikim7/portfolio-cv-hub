'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/services/api'
import {
  Settings, Globe, BarChart2, Layers,
  Database, RefreshCw, AlertTriangle, Check, ChevronRight,
  Save, Zap, Users,
  Pencil, Plus, Trash2, X, Mail, Eye,
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
  labelKey: string
  subjectKey: string
  bodyKey: string
  hintKey: string
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
    labelKey: 'admin.settings.emailTplInvite',
    subjectKey: 'admin.settings.emailTplInviteSubject',
    bodyKey: 'admin.settings.emailTplInviteBody',
    hintKey: 'admin.settings.emailTplInviteHint',
  },
  {
    id: 'company_approved',
    labelKey: 'admin.settings.emailTplApprove',
    subjectKey: 'admin.settings.emailTplApproveSubject',
    bodyKey: 'admin.settings.emailTplApproveBody',
    hintKey: 'admin.settings.emailTplApproveHint',
  },
  {
    id: 'company_rejected',
    labelKey: 'admin.settings.emailTplReject',
    subjectKey: 'admin.settings.emailTplRejectSubject',
    bodyKey: 'admin.settings.emailTplRejectBody',
    hintKey: 'admin.settings.emailTplRejectHint',
  },
]

const TABS = [
  { id: 'general',    labelKey: 'admin.settings.tabGeneral',       icon: Globe },
  { id: 'algorithm',  labelKey: 'admin.settings.tabAlgorithm',     icon: BarChart2 },
  { id: 'templates',  labelKey: 'admin.settings.tabTemplates',     icon: Layers },
  { id: 'tools',      labelKey: 'admin.settings.tabTools',         icon: Database },
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
  const { t } = useTranslation()
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
    showToast(t('admin.settings.saveGeneralSuccess'), 'success')
  }

  const handleSaveSmtp = async () => {
    if (!smtp.smtp_username.trim()) {
      showToast(t('admin.settings.smtpUsernameError'), 'error'); return
    }
    if (!smtp.smtp_password || smtp.smtp_password === '••••••••') {
      showToast(t('admin.settings.smtpPasswordError'), 'error'); return
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
      showToast(t('admin.settings.smtpSaveSuccess'), 'success')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || t('admin.settings.smtpSaveError')
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
      const msg = err?.response?.data?.detail || t('admin.settings.smtpTestError')
      showToast(`❌ ${msg}`, 'error')
    } finally {
      setTestingSmtp(false)
    }
  }

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* General */}
      <Section title={t('admin.settings.systemInfo')} desc={t('admin.settings.systemInfoDesc')}>
        <Field label={t('admin.settings.siteName')} hint={t('admin.settings.siteNameHint')}>
          <Input value={general.site_name} onChange={setG('site_name')} placeholder="Portfolio CV Hub" />
        </Field>
        <Field label={t('admin.settings.siteUrl')} hint={t('admin.settings.siteUrlHint')}>
          <Input value={general.site_url} onChange={setG('site_url')} placeholder="https://yourdomain.com" />
        </Field>
        <Field label={t('admin.settings.maxComparison')} hint={t('admin.settings.maxComparisonHint')}>
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
          {savingGeneral ? t('admin.settings.saving') : t('admin.settings.saveGeneral')}
        </button>
      </div>

      {/* SMTP — real API */}
      <Section title={t('admin.settings.smtpTitle')} desc={t('admin.settings.smtpDesc')}>
        <Field label={t('admin.settings.smtpHost')}>
          <Input value={smtp.smtp_host} onChange={setS('smtp_host')} placeholder="smtp.gmail.com" />
        </Field>
        <Field label={t('admin.settings.smtpPort')}>
          <Input value={smtp.smtp_port} onChange={setS('smtp_port')} placeholder="587" className="w-28" />
        </Field>
        <Field label={t('admin.settings.smtpUsername')}>
          <Input value={smtp.smtp_username} onChange={setS('smtp_username')} placeholder="your@gmail.com" />
        </Field>
        <Field label={t('admin.settings.smtpPassword')} hint={t('admin.settings.smtpPasswordHint')}>
          <Input type="password" value={smtp.smtp_password} onChange={setS('smtp_password')} placeholder={t('admin.settings.smtpPassword')} />
        </Field>
        <Field label={t('admin.settings.smtpFromAddress')} hint={t('admin.settings.smtpFromAddressHint')}>
          <Input value={smtp.smtp_from_address} onChange={setS('smtp_from_address')} placeholder="noreply@portfoliocvhub.com" />
        </Field>
        <Field label={t('admin.settings.smtpEnabled')}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSmtp(s => ({ ...s, smtp_enabled: !s.smtp_enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${smtp.smtp_enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${smtp.smtp_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium ${smtp.smtp_enabled ? 'text-blue-700' : 'text-gray-500'}`}>
              {smtp.smtp_enabled ? t('admin.settings.smtpEnabledOn') : t('admin.settings.smtpEnabledOff')}
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
          {testingSmtp ? t('admin.settings.testing') : t('admin.settings.testConnection')}
        </button>
        <button
          onClick={handleSaveSmtp}
          disabled={savingSmtp || testingSmtp}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60"
        >
          {savingSmtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {savingSmtp ? t('admin.settings.saving') : t('admin.settings.saveSmtp')}
        </button>
      </div>
    </>
  )
}


// ─── Tab: Algorithm Weights ───────────────────────────────────────────────────
function TabAlgorithm() {
  const { t } = useTranslation()
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
    setToast(t('admin.settings.saveWeightsSuccess'))
    setTimeout(() => setToast(null), 3000)
  }

  const FACTORS: { key: keyof WeightConfig; labelKey: string; descKey: string; color: string }[] = [
    { key: 'technical_skills',  labelKey: 'admin.settings.techSkills',  descKey: 'admin.settings.techSkillsDesc', color: 'bg-blue-500' },
    { key: 'experience',        labelKey: 'admin.settings.experience',  descKey: 'admin.settings.experienceDesc', color: 'bg-indigo-500' },
    { key: 'portfolio',         labelKey: 'admin.settings.portfolio',   descKey: 'admin.settings.portfolioDesc', color: 'bg-violet-500' },
    { key: 'soft_skills',       labelKey: 'admin.settings.softSkills',  descKey: 'admin.settings.softSkillsDesc', color: 'bg-emerald-500' },
    { key: 'leadership',        labelKey: 'admin.settings.leadership',  descKey: 'admin.settings.leadershipDesc', color: 'bg-amber-500' },
    { key: 'readiness_signals', labelKey: 'admin.settings.readiness',   descKey: 'admin.settings.readinessDesc', color: 'bg-rose-500' },
  ]

  return (
    <>
      {toast && <Toast msg={toast} type="success" />}
      <Section
        title={t('admin.settings.algorithmTitle')}
        desc={t('admin.settings.algorithmDesc')}
      >
        <div className="space-y-5">
          {FACTORS.map(f => (
            <div key={f.key} className="flex items-center gap-4">
              <div className="w-48 shrink-0">
                <p className="text-sm font-medium text-gray-700">{t(f.labelKey)}</p>
                <p className="text-xs text-gray-400">{t(f.descKey)}</p>
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
            ? <><Check className="w-4 h-4" /> {t('admin.settings.totalWeight')}: <strong>100%</strong> — {t('admin.settings.validWeight')}</>
            : <><AlertTriangle className="w-4 h-4" /> {t('admin.settings.totalWeight')}: <strong>{total}%</strong> — {t('admin.settings.invalidWeight')}</>
          }
        </div>
      </Section>

      <div className="flex justify-between">
        <button onClick={reset} className="flex items-center gap-2 border border-gray-300 text-gray-600 hover:bg-gray-50 px-5 py-2.5 rounded-lg text-sm font-medium transition">
          <RefreshCw className="w-4 h-4" /> {t('admin.settings.restoreDefault')}
        </button>
        <button onClick={save} disabled={saving || !valid}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? t('admin.settings.saving') : t('admin.settings.saveWeights')}
        </button>
      </div>
    </>
  )
}

// ─── Tab: Templates ───────────────────────────────────────────────────────────
function TabTemplates() {
  const { t } = useTranslation()
  // ── Portfolio templates state ────────────────────────────────
  const [portfolioTemplates, setPortfolioTemplates] = useState<import('@/types').PortfolioTemplate[]>([])
  const [tplLoading, setTplLoading] = useState(true)
  const [editingTplId, setEditingTplId] = useState<number | null>(null)
  const [editTplForm, setEditTplForm] = useState({ name: '', description: '', primaryColor: '#3b5bdb' })
  const [showAddTpl, setShowAddTpl] = useState(false)
  const [newTpl, setNewTpl] = useState({ name: '', description: '', primaryColor: '#6366f1' })

  // ── Email templates state ────────────────────────────────────
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(DEFAULT_EMAIL_TEMPLATES)
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null)
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null)

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Load portfolio templates from API ───────────────────────
  useEffect(() => {
    apiClient.getAdminTemplates()
      .then(data => setPortfolioTemplates(data))
      .catch(() => showToast(t('admin.settings.loadError'), 'error'))
      .finally(() => setTplLoading(false))
  }, [t])

  // ── Portfolio template actions ────────────────────────────────
  const toggleTplStatus = async (tpl: import('@/types').PortfolioTemplate) => {
    const newStatus = tpl.status === 'active' ? 'inactive' : 'active'
    try {
      await apiClient.updateTemplate(tpl.id, { status: newStatus })
      setPortfolioTemplates(ts => ts.map(t => t.id === tpl.id ? { ...t, status: newStatus } : t))
      showToast(`${t('admin.settings.statusActive')} ${newStatus === 'active' ? t('admin.settings.statusActive') : t('admin.settings.statusInactive')} template "${tpl.name}"`)
    } catch {
      showToast(t('admin.settings.smtpSaveError'), 'error')
    }
  }

  const startEditTpl = (tpl: import('@/types').PortfolioTemplate) => {
    setEditingTplId(tpl.id)
    setEditTplForm({
      name: tpl.name,
      description: tpl.description,
      primaryColor: tpl.config_json?.primaryColor || '#3b5bdb',
    })
  }

  const saveEditTpl = async () => {
    if (!editTplForm.name.trim()) { showToast(t('admin.settings.templateName') + ' ' + t('admin.settings.invalidWeight'), 'error'); return }
    try {
      const updated = await apiClient.updateTemplate(editingTplId!, {
        name: editTplForm.name,
        description: editTplForm.description,
        config_json: { ...portfolioTemplates.find(t => t.id === editingTplId)?.config_json, primaryColor: editTplForm.primaryColor },
      })
      setPortfolioTemplates(ts => ts.map(t => t.id === editingTplId ? { ...t, ...updated } : t))
      setEditingTplId(null)
      showToast(t('admin.settings.saveGeneralSuccess'))
    } catch {
      showToast(t('admin.settings.smtpSaveError'), 'error')
    }
  }

  const deleteTpl = async (tpl: import('@/types').PortfolioTemplate) => {
    if (!confirm(t('admin.settings.deleteConfirm', { name: tpl.name }))) return
    try {
      await apiClient.deleteTemplate(tpl.id)
      setPortfolioTemplates(ts => ts.filter(t => t.id !== tpl.id))
      showToast(t('admin.settings.deleteSuccess'))
    } catch {
      showToast(t('admin.settings.smtpSaveError'), 'error')
    }
  }

  const addTpl = async () => {
    if (!newTpl.name.trim()) { showToast(t('admin.settings.templateName') + ' ' + t('admin.settings.invalidWeight'), 'error'); return }
    try {
      const created = await apiClient.createTemplate({
        name: newTpl.name,
        description: newTpl.description,
        config_json: { theme: 'light', primaryColor: newTpl.primaryColor, layout: 'single-column', sections: ['bio', 'skills', 'experience', 'projects'] },
      })
      setPortfolioTemplates(ts => [...ts, created])
      setNewTpl({ name: '', description: '', primaryColor: '#6366f1' })
      setShowAddTpl(false)
      showToast(t('admin.settings.saveGeneralSuccess'))
    } catch {
      showToast(t('admin.settings.smtpSaveError'), 'error')
    }
  }

  // ── Email template actions ────────────────────────────────────
  const startEditEmail = (id: string) => setEditingEmailId(id === editingEmailId ? null : id)
  const updateEmail = (id: string, field: 'subjectKey' | 'bodyKey', value: string) => {
    setEmailTemplates(ts => ts.map(t => t.id === id ? { ...t, [field]: value } : t))
  }
  const saveEmail = (_id: string) => {
    setEditingEmailId(null)
    showToast(t('admin.settings.saveEmailSuccess'))
  }

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── Portfolio Themes ── */}
      <Section
        title={t('admin.settings.portfolioTemplates')}
        desc={t('admin.settings.portfolioTemplatesDesc')}
      >
        {tplLoading ? (
          <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">{t('admin.settings.loading')}</span>
          </div>
        ) : (
          <div className="space-y-2">
            {portfolioTemplates.map(tpl => (
              <div key={tpl.id}>
                {editingTplId === tpl.id ? (
                  <div className="py-4 space-y-3 border border-blue-200 rounded-xl p-4 bg-blue-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('admin.settings.templateName')} *</label>
                        <input
                          value={editTplForm.name}
                          onChange={e => setEditTplForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('admin.settings.primaryColor')}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editTplForm.primaryColor}
                            onChange={e => setEditTplForm(f => ({ ...f, primaryColor: e.target.value }))}
                            className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5"
                          />
                          <input
                            value={editTplForm.primaryColor}
                            onChange={e => setEditTplForm(f => ({ ...f, primaryColor: e.target.value }))}
                            className="flex-1 border border-blue-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('admin.settings.description')}</label>
                      <input
                        value={editTplForm.description}
                        onChange={e => setEditTplForm(f => ({ ...f, description: e.target.value }))}
                        className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEditTpl}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition">
                        <Check className="w-3.5 h-3.5" /> {t('admin.settings.save')}
                      </button>
                      <button onClick={() => setEditingTplId(null)}
                        className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition">
                        <X className="w-3.5 h-3.5" /> {t('admin.settings.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-3 px-1 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl shadow-md shrink-0 border-2 border-white ring-1 ring-gray-200"
                        style={{ background: tpl.config_json?.primaryColor || '#3b5bdb' }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{tpl.name}</p>
                        <p className="text-xs text-gray-500">{tpl.description || t('admin.settings.description')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        tpl.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {tpl.status === 'active' ? t('admin.settings.statusActive') : t('admin.settings.statusInactive')}
                      </span>
                      <button onClick={() => startEditTpl(tpl)} title={t('admin.settings.edit')}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleTplStatus(tpl)}
                        title={tpl.status === 'active' ? t('admin.settings.statusInactive') : t('admin.settings.statusActive')}
                        className={`relative w-10 h-5 rounded-full transition-colors ${tpl.status === 'active' ? 'bg-blue-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${tpl.status === 'active' ? 'left-5' : 'left-0.5'}`} />
                      </button>
                      <button onClick={() => deleteTpl(tpl)} title={t('admin.settings.deleteSuccess')}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add form */}
            {showAddTpl ? (
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                <p className="text-sm font-semibold text-blue-800">{t('admin.settings.addTemplate')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('admin.settings.templateName')} *</label>
                    <input
                      value={newTpl.name}
                      onChange={e => setNewTpl(f => ({ ...f, name: e.target.value }))}
                      placeholder="VD: Vibrant Creative"
                      className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('admin.settings.primaryColor')}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newTpl.primaryColor}
                        onChange={e => setNewTpl(f => ({ ...f, primaryColor: e.target.value }))}
                        className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5"
                      />
                      <input
                        value={newTpl.primaryColor}
                        onChange={e => setNewTpl(f => ({ ...f, primaryColor: e.target.value }))}
                        className="flex-1 border border-blue-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('admin.settings.description')}</label>
                  <input
                    value={newTpl.description}
                    onChange={e => setNewTpl(f => ({ ...f, description: e.target.value }))}
                    placeholder={t('admin.settings.templateDescPlaceholder') || 'e.g. Suitable for designers, artists'}
                    className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={addTpl}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition">
                    <Plus className="w-3.5 h-3.5" /> {t('admin.settings.save')}
                  </button>
                  <button onClick={() => { setShowAddTpl(false); setNewTpl({ name: '', description: '', primaryColor: '#6366f1' }) }}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition">
                    <X className="w-3.5 h-3.5" /> {t('admin.settings.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddTpl(true)}
                className="mt-3 w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl py-3 text-sm font-semibold text-gray-500 hover:text-blue-700 transition"
              >
                <Plus className="w-4 h-4" /> {t('admin.settings.addTemplate')}
              </button>
            )}
          </div>
        )}
      </Section>

      {/* ── Email Templates ── */}
      <Section
        title={t('admin.settings.emailTemplates')}
        desc={t('admin.settings.emailTemplatesDesc')}
      >
        <div className="space-y-3">
          {emailTemplates.map(tpl => (
            <div key={tpl.id} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Header row */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-800">{t(tpl.labelKey)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedPreview(expandedPreview === tpl.id ? null : tpl.id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {expandedPreview === tpl.id ? t('admin.settings.hidePreview') : t('admin.settings.viewPreview')}
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
                    {editingEmailId === tpl.id ? t('admin.settings.close') : t('admin.settings.edit')}
                  </button>
                </div>
              </div>

              {/* Edit form */}
              {editingEmailId === tpl.id && (
                <div className="p-4 space-y-3 border-t border-gray-200">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('admin.settings.subject')}</label>
                    <input
                      value={t(tpl.subjectKey)}
                      onChange={e => updateEmail(tpl.id, 'subjectKey', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('admin.settings.body')}</label>
                    <textarea
                      value={t(tpl.bodyKey)}
                      onChange={e => updateEmail(tpl.id, 'bodyKey', e.target.value)}
                      rows={6}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                  </div>
                  <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                    💡 {t(tpl.hintKey)}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => saveEmail(tpl.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition">
                      <Save className="w-3.5 h-3.5" /> {t('admin.settings.saveTemplate')}
                    </button>
                    <button onClick={() => setEditingEmailId(null)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition">
                      <X className="w-3.5 h-3.5" /> {t('admin.settings.cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* Preview */}
              {expandedPreview === tpl.id && editingEmailId !== tpl.id && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 mb-1">{t('admin.settings.subject')}:</p>
                  <p className="text-sm text-gray-800 font-medium mb-3">{t(tpl.subjectKey)}</p>
                  <p className="text-xs font-semibold text-gray-500 mb-1">{t('admin.settings.body')}:</p>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-white border border-gray-200 rounded-lg p-3">{t(tpl.bodyKey)}</pre>
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
  const { t } = useTranslation()
  const [seedLoading, setSeedLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const handleSeed = async () => {
    setSeedLoading(true)
    try {
      await apiClient.seedDemoData()
      setToast({ msg: t('admin.settings.seedSuccess'), type: 'success' })
    } catch {
      setToast({ msg: t('admin.settings.smtpSaveError'), type: 'error' })
    } finally {
      setSeedLoading(false)
      setTimeout(() => setToast(null), 4000)
    }
  }

  const handleReset = async () => {
    if (!confirmReset) { setConfirmReset(true); return }
    setResetLoading(true)
    try {
      await apiClient.resetDemoData()
      setConfirmReset(false)
      setToast({ msg: t('admin.settings.deleteSuccess'), type: 'success' })
    } catch {
      setToast({ msg: t('admin.settings.smtpSaveError'), type: 'error' })
    } finally {
      setResetLoading(false)
      setTimeout(() => setToast(null), 4000)
    }
  }

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <Section title={t('admin.settings.seedData')}
        desc={t('admin.settings.seedDataDesc')}>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: Users,  label: t('admin.settings.users50'), desc: t('admin.settings.users50Desc') },
                { icon: Zap,    label: t('admin.settings.companies10'), desc: t('admin.settings.companies10Desc') },
                { icon: Layers, label: t('admin.settings.templates4'), desc: t('admin.settings.templates4Desc') },
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
              {seedLoading ? t('admin.settings.seeding') : t('admin.settings.runSeed')}
            </button>
          </div>
        </div>
      </Section>

      <Section title={t('admin.settings.resetTitle')}
        desc={t('admin.settings.resetDesc')}>
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700">
            <p className="font-semibold mb-1">{t('admin.settings.dangerZone')}</p>
            <p>{t('admin.settings.resetWarning')}</p>
          </div>
        </div>

        {confirmReset && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3 text-sm text-amber-700 font-medium">
            <AlertTriangle className="w-4 h-4" />
            {t('admin.settings.confirmResetMsg')}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleReset} disabled={resetLoading}
            className={`flex items-center gap-2 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60 ${confirmReset ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
            {resetLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            {resetLoading ? t('admin.settings.saving') : confirmReset ? t('admin.settings.confirmResetBtn') : t('admin.settings.resetBtn')}
          </button>
          {confirmReset && (
            <button onClick={() => setConfirmReset(false)}
              className="px-5 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition">
              {t('admin.settings.cancel')}
            </button>
          )}
        </div>
      </Section>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="p-6 lg:p-8 max-w-[1000px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.settings.systemSettingsTitle')}</h1>
        </div>
        <p className="text-sm text-gray-500">{t('admin.settings.systemSettingsDesc')}</p>
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
              {t(tab.labelKey)}
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
