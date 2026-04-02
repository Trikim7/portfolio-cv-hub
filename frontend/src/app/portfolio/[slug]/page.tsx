'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CandidateProfile } from '@/types'
import { apiClient } from '@/services/api'

export default function PublicPortfolioPage() {
  const params = useParams()
  const slug = params.slug as string
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiClient.getPublicProfile(slug)
        setProfile(data)
        setError(null)
      } catch (err) {
        setError('Không tìm thấy portfolio')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProfile()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600 mb-2">Lỗi</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h1 className="text-4xl font-bold mb-2">{profile.full_name}</h1>
        <p className="text-2xl text-blue-600 mb-2">{profile.title}</p>
        <p className="text-gray-700 text-lg">{profile.bio}</p>
      </div>

      {/* Skills */}
      {profile.skills.length > 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Kỹ năng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.skills.map((skill) => (
              <div key={skill.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-semibold">{skill.name}</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                  {skill.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experiences */}
      {profile.experiences.length > 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Kinh nghiệm làm việc</h2>
          <div className="space-y-4">
            {profile.experiences.map((exp) => (
              <div key={exp.id} className="border-l-4 border-blue-500 pl-4 pb-4">
                <h3 className="text-xl font-bold">{exp.job_title}</h3>
                <p className="text-lg text-blue-600">{exp.company_name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(exp.start_date).toLocaleDateString('vi-VN')} -
                  {exp.is_current ? ' Hiện tại' : ` ${new Date(exp.end_date!).toLocaleDateString('vi-VN')}`}
                </p>
                <p className="text-gray-700 mt-2">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {profile.projects.length > 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Dự án</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {profile.projects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-700 mb-3">{project.description}</p>
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mb-3 block">
                    {project.url}
                  </a>
                )}
                {project.technologies && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Công nghệ:</span> {project.technologies}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CVs */}
      {profile.cvs.length > 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">CV</h2>
          <div className="space-y-3">
            {profile.cvs.map((cv) => (
              <div key={cv.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <div>
                  <p className="font-semibold">{cv.file_name}</p>
                  <p className="text-sm text-gray-600">
                    {cv.file_size ? `${(cv.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                  </p>
                </div>
                <a
                  href={`/api/candidate/cvs/download/${cv.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Tải về
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
