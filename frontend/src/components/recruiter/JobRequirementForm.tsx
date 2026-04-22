'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/services/api'
import { Toast, useToast } from '@/components/Toast'

interface Skill {
  name: string
  level?: string
}

interface JobRequirementFormProps {
  jobId?: number
  onSuccess: () => void
  onCancel: () => void
}

export default function JobRequirementForm({
  jobId,
  onSuccess,
  onCancel,
}: JobRequirementFormProps) {
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState<Skill[]>([{ name: '', level: undefined }])
  const { toast, showToast, closeToast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    required_skills: [] as Skill[],
    years_experience: '',
    required_role: '',
    customer_facing: false,
    tech_stack: [] as string[],
    is_management_role: false,
    weights_config: null as any,
    is_active: true,
  })

  const [techStackInput, setTechStackInput] = useState('')

  useEffect(() => {
    if (jobId) {
      fetchJobRequirement()
    }
  }, [jobId])

  const fetchJobRequirement = async () => {
    if (!jobId) return
    try {
      setLoading(true)
      const data = await apiClient.get(`/api/recruiter/job-requirements/${jobId}`)
      setFormData({
        title: data.title,
        required_skills: data.required_skills || [],
        years_experience: data.years_experience || '',
        required_role: data.required_role || '',
        customer_facing: data.customer_facing || false,
        tech_stack: data.tech_stack || [],
        is_management_role: data.is_management_role || false,
        weights_config: data.weights_config,
        is_active: data.is_active !== false,
      })
      setSkills(data.required_skills || [{ name: '', level: undefined }])
      setTechStackInput((data.tech_stack || []).join(', '))
    } catch (err: any) {
      showToast('Không thể tải yêu cầu công việc', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = () => {
    setSkills([...skills, { name: '', level: undefined }])
  }

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const handleSkillChange = (index: number, field: string, value: any) => {
    const updated = [...skills]
    updated[index] = { ...updated[index], [field]: value }
    setSkills(updated)
  }

  const handleTechStackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTechStackInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title.trim()) {
      showToast('Tiêu đề công việc không được để trống', 'error')
      return
    }

    const validSkills = skills.filter(s => s.name.trim())
    if (validSkills.length === 0) {
      showToast('Vui lòng thêm ít nhất 1 kỹ năng yêu cầu', 'error')
      return
    }

    try {
      setLoading(true)

      const techStack = techStackInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t)

      const payload = {
        title: formData.title,
        required_skills: validSkills,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
        required_role: formData.required_role || null,
        customer_facing: formData.customer_facing,
        tech_stack: techStack,
        is_management_role: formData.is_management_role,
        weights_config: formData.weights_config,
        is_active: formData.is_active,
      }

      if (jobId) {
        await apiClient.put(`/api/recruiter/job-requirements/${jobId}`, payload)
        showToast('Đã cập nhật yêu cầu công việc', 'success')
      } else {
        await apiClient.post('/api/recruiter/job-requirements', payload)
        showToast('Đã tạo yêu cầu công việc mới', 'success')
      }

      setTimeout(() => {
        onSuccess()
      }, 1000)
    } catch (err: any) {
      console.error('Submit error:', err)
      showToast(err.response?.data?.detail || 'Có lỗi xảy ra', 'error')
    } finally {
      setLoading(false)
    }
  }

  const experienceLevels = ['entry', 'junior', 'mid', 'senior', 'lead']

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">
        {jobId ? 'Chỉnh sửa yêu cầu công việc' : 'Tạo yêu cầu công việc mới'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tiêu đề */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề công việc *
          </label>
          <input
            type="text"
            placeholder="VD: Senior Backend Developer"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Required Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Kỹ năng yêu cầu *
          </label>
          <div className="space-y-3">
            {skills.map((skill, idx) => (
              <div key={idx} className="flex gap-3">
                <input
                  type="text"
                  placeholder="VD: Python, React"
                  value={skill.name}
                  onChange={(e) => handleSkillChange(idx, 'name', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={skill.level || ''}
                  onChange={(e) => handleSkillChange(idx, 'level', e.target.value || undefined)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn mức độ</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                {skills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Xóa
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddSkill}
            className="mt-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            + Thêm kỹ năng
          </button>
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số năm kinh nghiệm
          </label>
          <input
            type="number"
            min="0"
            placeholder="VD: 3"
            value={formData.years_experience}
            onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Required Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vai trò yêu cầu
          </label>
          <input
            type="text"
            placeholder="VD: Backend, Frontend, Fullstack"
            value={formData.required_role}
            onChange={(e) => setFormData({ ...formData, required_role: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stack công nghệ
          </label>
          <input
            type="text"
            placeholder="VD: Python, React, PostgreSQL (cách nhau bởi dấu phẩy)"
            value={techStackInput}
            onChange={handleTechStackChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.customer_facing}
              onChange={(e) => setFormData({ ...formData, customer_facing: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Yêu cầu giao tiếp với khách hàng</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_management_role}
              onChange={(e) => setFormData({ ...formData, is_management_role: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Vị trí quản lý/lãnh đạo</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Công việc đang mở</span>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Đang xử lý...' : jobId ? 'Cập nhật' : 'Tạo mới'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 font-medium"
          >
            Hủy
          </button>
        </div>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  )
}
