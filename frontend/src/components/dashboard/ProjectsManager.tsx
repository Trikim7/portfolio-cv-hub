'use client'

import { useState } from 'react'
import { useProfileContext } from '@/hooks/ProfileContext'
import { Project } from '@/types'
import { Toast, useToast } from '@/components/Toast'

export default function ProjectsManager() {
  const { profile, addProject, updateProject, deleteProject } = useProfileContext()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const { toast, showToast, closeToast } = useToast()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    technologies: '',
  })

  const projects = profile?.projects || []

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      showToast('Vui lòng nhập tên dự án', 'error')
      return
    }
    const projectTitle = formData.title
    await addProject(formData)
    setFormData({ title: '', description: '', url: '', technologies: '' })
    setShowForm(false)
    showToast(`✓ Đã thêm dự án "${projectTitle}"`, 'success')
  }

  const handleEditProject = (proj: Project) => {
    setEditingId(proj.id)
    setFormData({
      title: proj.title,
      description: proj.description || '',
      url: proj.url || '',
      technologies: proj.technologies || '',
    })
    setShowForm(true)
  }

  const handleSaveEdit = async (projId: number) => {
    await updateProject(projId, formData)
    setEditingId(null)
    setShowForm(false)
    setFormData({ title: '', description: '', url: '', technologies: '' })
    showToast('✓ Đã cập nhật dự án', 'success')
  }

  const handleDeleteProject = async (projId: number) => {
    if (confirm('Xóa dự án này?')) {
      await deleteProject(projId)
      showToast('✓ Đã xóa dự án', 'success')
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dự án</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
          >
            + Thêm dự án
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={editingId ? (e) => { e.preventDefault(); handleSaveEdit(editingId) } : handleAddProject}
          className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên dự án</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Portfolio Website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả dự án..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL dự án</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/user/project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Công nghệ</label>
            <input
              type="text"
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="React, TypeScript, Tailwind CSS"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
            >
              {editingId ? '✓ Cập nhật' : '✓ Thêm'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                setFormData({ title: '', description: '', url: '', technologies: '' })
              }}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              ✕ Hủy
            </button>
          </div>

          {/* Existing projects quick reference */}
          {projects.length > 0 && (
            <div className="mt-2 pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2">📌 Dự án đã thêm:</p>
              <div className="flex flex-wrap gap-1.5">
                {projects.map((proj) => (
                  <span
                    key={proj.id}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                      formData.title.trim().toLowerCase() === proj.title.toLowerCase()
                        ? 'bg-red-100 text-red-700 border border-red-300 ring-1 ring-red-400'
                        : 'bg-purple-100 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {proj.title}
                    {proj.technologies && (
                      <span className="text-[10px] opacity-70">({proj.technologies})</span>
                    )}
                    {formData.title.trim().toLowerCase() === proj.title.toLowerCase() && (
                      <span className="text-red-600 font-bold">⚠ trùng</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.length === 0 ? (
          <p className="text-gray-500 italic">Chưa có dự án.</p>
        ) : (
          <>
            <div className="col-span-full">
              <p className="text-sm text-gray-600 mb-3">📋 Tổng {projects.length} dự án</p>
            </div>
            {projects.map((proj) => (
              <div key={proj.id} className="p-4 border border-purple-200 bg-purple-50 rounded-lg hover:shadow-md transition">
                <h3 className="font-bold text-lg mb-2 text-gray-900">{proj.title}</h3>
                {proj.description && <p className="text-gray-700 mb-2 bg-white p-2 rounded">{proj.description}</p>}
                {proj.url && (
                  <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mb-2 block font-semibold">
                    🔗 {proj.url}
                  </a>
                )}
                {proj.technologies && (
                  <p className="text-sm text-gray-600 mb-3 bg-white p-2 rounded">
                    <span className="font-semibold">🛠 Công nghệ:</span> {proj.technologies}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditProject(proj)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm font-semibold"
                  >
                    ✎ Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-semibold"
                  >
                    ✕ Xóa
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
