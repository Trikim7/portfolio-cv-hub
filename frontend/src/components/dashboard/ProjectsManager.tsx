'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProfileContext } from '@/hooks/ProfileContext'
import { Project } from '@/types'
import { Toast, useToast } from '@/components/Toast'

type ProjectFormState = {
  project_name: string
  description: string
  project_url: string
  github_url: string
  technologies: string
  role: string
}

const EMPTY_FORM: ProjectFormState = {
  project_name: '',
  description: '',
  project_url: '',
  github_url: '',
  technologies: '',
  role: '',
}

const describeProject = (proj: Project): string => {
  if (!proj.description) return ''
  if (typeof proj.description === 'string') return proj.description
  return proj.description.vi || proj.description.en || Object.values(proj.description)[0] || ''
}

export default function ProjectsManager() {
  const { t } = useTranslation()
  const { profile, addProject, updateProject, deleteProject } = useProfileContext()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const { toast, showToast, closeToast } = useToast()
  const [formData, setFormData] = useState<ProjectFormState>(EMPTY_FORM)

  const projects = profile?.projects || []

  const buildPayload = () => ({
    project_name: formData.project_name.trim(),
    description: formData.description ? { vi: formData.description } : undefined,
    project_url: formData.project_url || undefined,
    github_url: formData.github_url || undefined,
    technologies: formData.technologies || undefined,
    role: formData.role || undefined,
  })

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.project_name.trim()) {
      showToast(t('projects.nameRequired'), 'error')
      return
    }
    const projectTitle = formData.project_name
    await addProject(buildPayload())
    setFormData(EMPTY_FORM)
    setShowForm(false)
    showToast(`${t('projects.addSuccess')} "${projectTitle}"`, 'success')
  }

  const handleEditProject = (proj: Project) => {
    setEditingId(proj.id)
    setFormData({
      project_name: proj.project_name,
      description: describeProject(proj),
      project_url: proj.project_url || '',
      github_url: proj.github_url || '',
      technologies: proj.technologies || '',
      role: proj.role || '',
    })
    setShowForm(true)
  }

  const handleSaveEdit = async (projId: number) => {
    await updateProject(projId, buildPayload())
    setEditingId(null)
    setShowForm(false)
    setFormData(EMPTY_FORM)
    showToast(t('projects.updateSuccess'), 'success')
  }

  const handleDeleteProject = async (projId: number) => {
    if (confirm(t('projects.deleteConfirm'))) {
      await deleteProject(projId)
      showToast(t('projects.deleteSuccess'), 'success')
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">{t('projects.title')}</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition"
          >
            {t('projects.addBtn')}
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={editingId ? (e) => { e.preventDefault(); handleSaveEdit(editingId) } : handleAddProject}
          className="mb-6 p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-100"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.projectName')}</label>
            <input
              type="text"
              value={formData.project_name}
              onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Portfolio Website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.role')}</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Backend Lead"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('projects.descPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.projectUrl')}</label>
              <input
                type="url"
                value={formData.project_url}
                onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://myproject.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
              <input
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://github.com/user/project"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.technologies')}</label>
            <input
              type="text"
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="React, TypeScript, Tailwind CSS"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
              {editingId ? t('projects.update') : t('projects.add')}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); setFormData(EMPTY_FORM) }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {t('projects.cancel')}
            </button>
          </div>

          {projects.length > 0 && (
            <div className="mt-2 pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2">{t('projects.added')}</p>
              <div className="flex flex-wrap gap-1.5">
                {projects.map((proj) => {
                  const isDuplicate = formData.project_name.trim().toLowerCase() === proj.project_name.toLowerCase()
                  return (
                    <span key={proj.id} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                      isDuplicate ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-violet-100 text-violet-700 border border-violet-200'
                    }`}>
                      {proj.project_name}
                      {proj.technologies && <span className="text-[10px] opacity-70">({proj.technologies})</span>}
                      {isDuplicate && <span className="text-red-600 font-bold">{t('projects.duplicate')}</span>}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.length === 0 ? (
          <p className="text-gray-500 italic">{t('projects.noProjects')}</p>
        ) : (
          <>
            <div className="col-span-full">
              <p className="text-sm text-gray-600 mb-3">{t('projects.total')} {projects.length} {t('projects.totalProj')}</p>
            </div>
            {projects.map((proj) => {
              const description = describeProject(proj)
              return (
                <div key={proj.id} className="p-4 border border-gray-200 bg-gray-50 rounded-xl hover:shadow-sm transition">
                  <h3 className="font-bold text-gray-900">{proj.project_name}</h3>
                  {proj.role && <p className="text-sm text-violet-700 mt-1">{proj.role}</p>}
                  {description && (
                    <p className="text-gray-700 text-sm mt-2 bg-white p-3 rounded-lg border border-gray-100">{description}</p>
                  )}
                  {proj.project_url && (
                    <a href={proj.project_url} target="_blank" rel="noopener noreferrer"
                      className="text-blue-700 hover:underline text-sm mt-2 block font-semibold break-all">
                      {proj.project_url}
                    </a>
                  )}
                  {proj.github_url && (
                    <a href={proj.github_url} target="_blank" rel="noopener noreferrer"
                      className="text-gray-700 hover:underline text-sm mt-1 block font-semibold break-all">
                      {proj.github_url}
                    </a>
                  )}
                  {proj.technologies && (
                    <p className="text-xs text-gray-600 mt-2 bg-white px-3 py-2 rounded-lg border border-gray-100">
                      <span className="font-semibold">{t('projects.techLabel')}</span> {proj.technologies}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleEditProject(proj)}
                      className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold">
                      {t('projects.edit')}
                    </button>
                    <button onClick={() => handleDeleteProject(proj.id)}
                      className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 text-sm font-semibold">
                      {t('projects.delete')}
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {toast && <Toast {...toast} onClose={closeToast} />}
    </div>
  )
}
