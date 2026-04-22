'use client'

import { useState } from 'react'
import JobRequirementForm from '@/components/recruiter/JobRequirementForm'
import JobRequirementList from '@/components/recruiter/JobRequirementList'

export default function JobRequirementsPage() {
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleCreate = () => {
    setMode('create')
    setSelectedJobId(null)
  }

  const handleEdit = (jobId: number) => {
    setSelectedJobId(jobId)
    setMode('edit')
  }

  const handleFormSuccess = () => {
    setMode('list')
    setSelectedJobId(null)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleFormCancel = () => {
    setMode('list')
    setSelectedJobId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Yêu cầu công việc</h1>
          <p className="text-gray-600 mt-2">
            Tạo và quản lý các tiêu chí tuyển dụng cho vị trí của bạn
          </p>
        </div>

        {/* Content */}
        {mode === 'list' ? (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium"
              >
                + Tạo yêu cầu công việc
              </button>
            </div>

            <JobRequirementList
              refreshTrigger={refreshTrigger}
              onEdit={handleEdit}
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <JobRequirementForm
              jobId={selectedJobId || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        )}
      </div>
    </div>
  )
}
