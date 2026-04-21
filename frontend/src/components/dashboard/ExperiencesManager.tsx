'use client'

import { useState } from 'react'
import { useProfileContext } from '@/hooks/ProfileContext'
import { Experience, I18nText } from '@/types'
import { Toast, useToast } from '@/components/Toast'

const i18nToText = (value: I18nText): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.vi || value.en || Object.values(value)[0] || ''
}

export default function ExperiencesManager() {
  const { profile, addExperience, updateExperience, deleteExperience } = useProfileContext()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const { toast, showToast, closeToast } = useToast()
  const [formData, setFormData] = useState({
    job_title: '',
    company_name: '',
    description: '',
    start_date: '',
    end_date: '',
    is_current: false,
  })

  const experiences = profile?.experiences || []

  // Format dates for API: append T00:00:00 for backend datetime, null for empty end_date
  const formatPayload = (data: typeof formData) => ({
    job_title: data.job_title,
    company_name: data.company_name,
    description: data.description ? { vi: data.description } : undefined,
    start_date: data.start_date ? `${data.start_date}T00:00:00` : data.start_date,
    end_date: data.end_date ? `${data.end_date}T00:00:00` : undefined,
    is_current: data.is_current,
  })

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.company_name.trim()) {
      showToast('Vui lòng nhập tên công ty', 'error')
      return
    }
    try {
      const companyName = formData.company_name
      const result = await addExperience(formatPayload(formData))
      if (!result) throw new Error('Failed')
      setFormData({
        job_title: '',
        company_name: '',
        description: '',
        start_date: '',
        end_date: '',
        is_current: false,
      })
      setShowForm(false)
      showToast(`Đã thêm kinh nghiệm tại ${companyName}`, 'success')
    } catch {
      showToast('Thêm kinh nghiệm thất bại, vui lòng thử lại', 'error')
    }
  }

  const handleEditExperience = (exp: Experience) => {
    setEditingId(exp.id)
    setFormData({
      job_title: exp.job_title,
      company_name: exp.company_name,
      description: i18nToText(exp.description),
      start_date: exp.start_date.split('T')[0],
      end_date: exp.end_date?.split('T')[0] || '',
      is_current: exp.is_current,
    })
    setShowForm(true)
  }

  const handleSaveEdit = async (expId: number) => {
    try {
      const result = await updateExperience(expId, formatPayload(formData))
      if (!result) throw new Error('Failed')
      setEditingId(null)
      setShowForm(false)
      setFormData({
        job_title: '',
        company_name: '',
        description: '',
        start_date: '',
        end_date: '',
        is_current: false,
      })
      showToast('Đã cập nhật kinh nghiệm', 'success')
    } catch {
      showToast('Cập nhật kinh nghiệm thất bại', 'error')
    }
  }

  const handleDeleteExperience = async (expId: number) => {
    if (confirm('Xóa kinh nghiệm này?')) {
      await deleteExperience(expId)
      showToast('Đã xóa kinh nghiệm', 'success')
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Kinh nghiệm làm việc</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition"
          >
            Thêm kinh nghiệm
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={editingId ? (e) => { e.preventDefault(); handleSaveEdit(editingId) } : handleAddExperience}
          className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chức danh</label>
              <input
                type="text"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Senior Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Công ty</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tech Company"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả công việc</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả công việc..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value, is_current: false })}
                disabled={formData.is_current}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_current}
              onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_date: e.target.checked ? '' : formData.end_date })}
              className="h-4 w-4 text-blue-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">Hiện tại đang làm việc ở đây</label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
            >
              {editingId ? 'Cập nhật' : 'Thêm'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                setFormData({
                  job_title: '',
                  company_name: '',
                  description: '',
                  start_date: '',
                  end_date: '',
                  is_current: false,
                })
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Hủy
            </button>
          </div>

          {/* Existing experiences quick reference */}
          {experiences.length > 0 && (
            <div className="mt-2 pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2">Kinh nghiệm đã thêm:</p>
              <div className="flex flex-wrap gap-1.5">
                {experiences.map((exp) => (
                  <span
                    key={exp.id}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                      formData.company_name.trim().toLowerCase() === exp.company_name.toLowerCase() &&
                      formData.job_title.trim().toLowerCase() === exp.job_title.toLowerCase()
                        ? 'bg-red-100 text-red-700 border border-red-300 ring-1 ring-red-400'
                        : 'bg-green-100 text-green-700 border border-green-200'
                    }`}
                  >
                    {exp.job_title} @ {exp.company_name}
                    {formData.company_name.trim().toLowerCase() === exp.company_name.toLowerCase() &&
                      formData.job_title.trim().toLowerCase() === exp.job_title.toLowerCase() && (
                        <span className="text-red-600 font-bold">trùng</span>
                      )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </form>
      )}

      <div className="space-y-3">
        {experiences.length === 0 ? (
          <p className="text-gray-500 italic">Chưa có kinh nghiệm. Thêm kinh nghiệm đầu tiên!</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3">Tổng {experiences.length} kinh nghiệm</p>
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-4 border border-gray-200 bg-gray-50 rounded-xl hover:shadow-sm transition"
              >
                <div className="flex justify-between items-start mb-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">{exp.job_title}</h3>
                    <p className="text-sm text-gray-600">{exp.company_name}</p>
                  </div>
                  {exp.is_current && (
                    <span className="shrink-0 bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                      Hiện tại
                    </span>
                  )}
                </div>

                {i18nToText(exp.description) && (
                  <p className="text-gray-700 text-sm mb-3 bg-white p-3 rounded-lg border border-gray-100">
                    {i18nToText(exp.description)}
                  </p>
                )}

                <p className="text-xs text-gray-500 mb-3">
                  {new Date(exp.start_date).toLocaleDateString('vi-VN')}
                  {exp.end_date && !exp.is_current
                    ? ` — ${new Date(exp.end_date).toLocaleDateString('vi-VN')}`
                    : ' — Hiện tại'}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditExperience(exp)}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 text-sm font-semibold"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {toast && <Toast {...toast} onClose={closeToast} />}
    </div>
  )
}
