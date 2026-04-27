'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/services/api'
import { Toast, useToast } from '@/components/Toast'
import { Check } from 'lucide-react'

interface Skill { name: string; level?: string }
interface JobRequirementFormProps { jobId?: number; onSuccess: () => void; onCancel: () => void }

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block ml-1">
      <button type="button" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
        className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold inline-flex items-center justify-center hover:bg-violet-200 hover:text-violet-700 transition">?</button>
      {show && <span className="absolute left-5 top-0 z-30 w-52 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl leading-relaxed">{text}</span>}
    </span>
  )
}

function FieldLabel({ children, tooltip }: { children: React.ReactNode; tooltip?: string }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children}{tooltip && <Tooltip text={tooltip} />}
    </label>
  )
}

function Section({ step, title, desc, children }: { step: number; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-8 h-8 rounded-xl bg-violet-600 text-white text-sm font-extrabold flex items-center justify-center shrink-0 shadow">{step}</div>
        <div><h3 className="text-base font-bold text-gray-900">{title}</h3><p className="text-sm text-gray-500 mt-0.5">{desc}</p></div>
      </div>
      {children}
    </div>
  )
}

const SKILL_SUGGESTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js',
  'Java', 'Go', 'SQL', 'NoSQL', 'Docker', 'Kubernetes',
  'AWS', 'REST API', 'GraphQL', 'Machine Learning',
  'C++', 'C#', '.NET', 'Spring Boot', 'FastAPI', 'Django',
]

function TagInput({ tags, onChange, suggestions = [], placeholder }: {
  tags: string[]; onChange: (tags: string[]) => void; suggestions?: string[]; placeholder?: string
}) {
  const [input, setInput] = useState('')
  const [showSuggest, setShowSuggest] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const filtered = suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s))
  const addTag = (tag: string) => {
    const t = tag.trim()
    if (t && !tags.includes(t)) onChange([...tags, t])
    setInput(''); setShowSuggest(false); inputRef.current?.focus()
  }
  const removeTag = (tag: string) => onChange(tags.filter(t => t !== tag))
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) { e.preventDefault(); addTag(input) }
    if (e.key === 'Backspace' && !input && tags.length) onChange(tags.slice(0, -1))
  }
  return (
    <div className="relative">
      <div className="min-h-[44px] flex flex-wrap gap-1.5 items-center px-3 py-2 border border-gray-300 rounded-xl bg-white focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-violet-500 transition cursor-text"
        onClick={() => inputRef.current?.focus()}>
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 bg-violet-100 text-violet-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition leading-none">×</button>
          </span>
        ))}
        <input ref={inputRef} value={input}
          onChange={e => { setInput(e.target.value); setShowSuggest(true) }}
          onKeyDown={handleKey} onFocus={() => setShowSuggest(true)}
          onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-24 outline-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400" />
      </div>
      {showSuggest && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-44 overflow-auto">
          {filtered.slice(0, 8).map(s => (
            <button key={s} type="button" onMouseDown={() => addTag(s)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-violet-50 text-gray-700 transition">{s}</button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function JobRequirementForm({ jobId, onSuccess, onCancel }: JobRequirementFormProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const { toast, showToast, closeToast } = useToast()

  const [title, setTitle] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [techStack, setTechStack] = useState<string[]>([])
  const [yearsExp, setYearsExp] = useState(0)
  const [requiredRole, setRequiredRole] = useState('')
  const [customerFacing, setCustomerFacing] = useState(false)
  const [isManagement, setIsManagement] = useState(false)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!jobId) return
    const load = async () => {
      try {
        setLoading(true)
        const data = await apiClient.get(`/api/recruiter/job-requirements/${jobId}`)
        setTitle(data.title ?? '')
        setYearsExp(data.years_experience ?? 0)
        setRequiredRole(data.required_role ?? '')
        setCustomerFacing(data.customer_facing ?? false)
        setIsManagement(data.is_management_role ?? false)
        setIsActive(data.is_active !== false)
        setSkills((data.required_skills ?? []).map((s: Skill) => s.name).filter(Boolean))
        setTechStack(data.tech_stack ?? [])
      } catch {
        showToast(t('jobForm.loadError'), 'error')
      } finally { setLoading(false) }
    }
    load()
  }, [jobId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { showToast(t('jobForm.titleRequired'), 'error'); return }
    if (skills.length === 0) { showToast(t('jobForm.skillsRequired'), 'error'); return }
    try {
      setLoading(true)
      const payload = {
        title: title.trim(),
        required_skills: skills.map(name => ({ name })),
        years_experience: yearsExp || null,
        required_role: requiredRole || null,
        customer_facing: customerFacing,
        tech_stack: techStack,
        is_management_role: isManagement,
        is_active: isActive,
      }
      if (jobId) {
        await apiClient.put(`/api/recruiter/job-requirements/${jobId}`, payload)
        showToast(t('jobForm.updateSuccess'), 'success')
      } else {
        await apiClient.post('/api/recruiter/job-requirements', payload)
        showToast(t('jobForm.createSuccess'), 'success')
      }
      setTimeout(() => onSuccess(), 1000)
    } catch (err: any) {
      showToast(err?.response?.data?.detail || t('jobForm.error'), 'error')
    } finally { setLoading(false) }
  }

  const OPTIONS = [
    { key: 'customer_facing', label: t('jobForm.optCustomerFacing'), desc: t('jobForm.optCustomerFacingDesc'), value: customerFacing, set: setCustomerFacing },
    { key: 'management', label: t('jobForm.optManagement'), desc: t('jobForm.optManagementDesc'), value: isManagement, set: setIsManagement },
    { key: 'active', label: t('jobForm.optActive'), desc: t('jobForm.optActiveDesc'), value: isActive, set: setIsActive },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Section step={1} title={t('jobForm.sectionBasicTitle')} desc={t('jobForm.sectionBasicDesc')}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <FieldLabel tooltip={t('jobForm.jobTitle')}>
              {t('jobForm.jobTitle')} <span className="text-red-500">*</span>
            </FieldLabel>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder={t('jobForm.placeholderTitle') || 'e.g. Senior Backend Developer'}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition" />
          </div>
          <div>
            <FieldLabel>{t('jobForm.roleType')}</FieldLabel>
            <select value={requiredRole} onChange={e => setRequiredRole(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition">
              <option value="">{t('jobForm.selectRole')}</option>
              <option value="backend">Backend</option>
              <option value="frontend">Frontend</option>
              <option value="fullstack">Fullstack</option>
              <option value="data">Data / AI</option>
              <option value="devops">DevOps / Cloud</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>
          <div>
            <FieldLabel>{t('jobForm.minExperience')}</FieldLabel>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={10} step={1} value={yearsExp} onChange={e => setYearsExp(Number(e.target.value))} className="flex-1 accent-violet-600" />
              <span className="w-28 text-center text-sm font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg py-1.5 shrink-0">
                {yearsExp === 0 ? t('jobForm.noExperience') : `${yearsExp} ${t('jobForm.years')}`}
              </span>
            </div>
          </div>
        </div>
      </Section>

      <Section step={2} title={t('jobForm.sectionSkillsTitle')} desc={t('jobForm.sectionSkillsDesc')}>
        <div className="space-y-4">
          <div>
            <FieldLabel>
              {t('jobForm.requiredSkills')} <span className="text-red-500">*</span>
            </FieldLabel>
            <TagInput tags={skills} onChange={setSkills} suggestions={SKILL_SUGGESTIONS}
              placeholder={t('jobForm.placeholderSkills') || 'e.g. Python, React, SQL...'} />
          </div>
          <div>
            <FieldLabel>Tech Stack</FieldLabel>
            <TagInput tags={techStack} onChange={setTechStack}
              suggestions={['Docker', 'PostgreSQL', 'Redis', 'Next.js', 'FastAPI', 'Django', 'Spring Boot', 'Kubernetes', 'AWS', 'GCP', 'Figma', 'Tailwind CSS']}
              placeholder={t('jobForm.placeholderTech') || 'e.g. Docker, PostgreSQL, AWS...'} />
          </div>
        </div>
      </Section>

      <Section step={3} title={t('jobForm.sectionOptionsTitle')} desc={t('jobForm.sectionOptionsDesc')}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {OPTIONS.map(({ key, label, desc, value, set }) => (
            <button key={key} type="button" onClick={() => set(!value)}
              className={`rounded-xl border-2 p-4 text-left transition ${value ? 'border-violet-500 bg-violet-50 shadow-sm' : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition ${value ? 'border-violet-500 bg-violet-500' : 'border-gray-300'}`}>
                  {value && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span className={`text-sm font-semibold ${value ? 'text-violet-700' : 'text-gray-800'}`}>{label}</span>
              </div>
              <p className="text-xs text-gray-500 pl-6">{desc}</p>
            </button>
          ))}
        </div>
      </Section>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition shadow-sm">
            {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? t('jobForm.processing') : jobId ? t('jobForm.update') : t('jobForm.create')}
          </button>
          <button type="button" onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
            {t('jobForm.cancel')}
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </form>
  )
}
