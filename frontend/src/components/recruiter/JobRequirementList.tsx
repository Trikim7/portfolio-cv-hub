'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/services/api'
import { Toast, useToast } from '@/components/Toast'
import { useTranslation } from 'react-i18next'

interface JobRequirement {
  id: number
  title: string
  required_skills: Array<{ name: string; level?: string }>
  years_experience?: number
  required_role?: string
  customer_facing: boolean
  is_management_role: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

interface JobRequirementListProps {
  refreshTrigger?: number
  onEdit: (jobId: number) => void
}

export default function JobRequirementList({
  refreshTrigger = 0,
  onEdit,
}: JobRequirementListProps) {
  const { t } = useTranslation()
  const [jobs, setJobs] = useState<JobRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [activeOnly, setActiveOnly] = useState(true)
  const { toast, showToast, closeToast } = useToast()

  useEffect(() => {
    fetchJobRequirements()
  }, [refreshTrigger, activeOnly])

  const fetchJobRequirements = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get('/api/recruiter/job-requirements', {
        params: { active_only: activeOnly },
      })
      setJobs(data)
    } catch (err: any) {
      showToast(t('jobList.loadError'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (jobId: number) => {
    if (!window.confirm(t('jobList.confirmDelete'))) {
      return
    }

    try {
      await apiClient.delete(`/api/recruiter/job-requirements/${jobId}`)
      showToast(t('jobList.deleteSuccess'), 'success')
      fetchJobRequirements()
    } catch (err: any) {
      showToast(t('jobList.deleteError'), 'error')
    }
  }

  if (loading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">{t('jobList.showActiveOnly')}</span>
        </label>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">{t('jobList.noJobsFound')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {job.is_active ? t('jobList.activeStatus') : t('jobList.closedStatus')}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">{t('jobList.skillsLabel')}</p>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          {skill.name}
                          {skill.level && <span className="ml-1 opacity-75">({skill.level})</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {job.years_experience && (
                      <div>
                        <span className="text-gray-500">{t('jobList.experienceLabel')} </span>
                        <span className="font-medium">{job.years_experience} {t('jobList.years')}</span>
                      </div>
                    )}
                    {job.required_role && (
                      <div>
                        <span className="text-gray-500">{t('jobList.roleLabel')} </span>
                        <span className="font-medium">{job.required_role}</span>
                      </div>
                    )}
                    {job.customer_facing && (
                      <div className="col-span-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-orange-50 text-orange-700">
                          👥 {t('jobList.customerFacing')}
                        </span>
                      </div>
                    )}
                    {job.is_management_role && (
                      <div className="col-span-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-50 text-purple-700">
                          👔 {t('jobList.managementRole')}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    {t('jobList.updatedAt')} {new Date(job.updated_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(job.id)}
                    className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
