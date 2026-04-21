import { useCallback, useState } from 'react'
import { apiClient } from '@/services/api'
import { CandidateProfile, Skill, Experience, Project } from '@/types'

export const useProfile = () => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getMyProfile()
      setProfile(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data: Partial<CandidateProfile>) => {
    setLoading(true)
    setError(null)
    try {
      const updated = await apiClient.updateProfile(data)
      setProfile(updated)
      return updated
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile')
      return undefined
    } finally {
      setLoading(false)
    }
  }, [])

  const togglePublicProfile = useCallback(async (isPublic: boolean) => {
    try {
      await apiClient.togglePublicProfile(isPublic)
      setProfile(prev => prev ? { ...prev, is_public: isPublic } : null)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update visibility')
    }
  }, [])

  // Skills
  const addSkill = useCallback(async (name: string, level?: string) => {
    try {
      const skill = await apiClient.addSkill(name, level)
      setProfile(prev => prev ? { ...prev, skills: [...prev.skills, skill] } : null)
      return skill
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add skill')
      return undefined
    }
  }, [])

  const updateSkill = useCallback(async (skillId: number, data: Partial<Skill>) => {
    try {
      const updated = await apiClient.updateSkill(skillId, data)
      setProfile(prev =>
        prev
          ? {
              ...prev,
              skills: prev.skills.map((s) => (s.id === skillId ? updated : s)),
            }
          : null
      )
      return updated
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update skill')
      return undefined
    }
  }, [])

  const deleteSkill = useCallback(async (skillId: number) => {
    try {
      await apiClient.deleteSkill(skillId)
      setProfile(prev => prev ? { ...prev, skills: prev.skills.filter((s) => s.id !== skillId) } : null)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete skill')
    }
  }, [])

  // Experiences
  const addExperience = useCallback(async (data: Partial<Experience>) => {
    try {
      const exp = await apiClient.addExperience(data)
      setProfile(prev => prev ? { ...prev, experiences: [...prev.experiences, exp] } : null)
      return exp
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add experience')
      return undefined
    }
  }, [])

  const updateExperience = useCallback(async (expId: number, data: Partial<Experience>) => {
    try {
      const updated = await apiClient.updateExperience(expId, data)
      setProfile(prev =>
        prev
          ? {
              ...prev,
              experiences: prev.experiences.map((e) => (e.id === expId ? updated : e)),
            }
          : null
      )
      return updated
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update experience')
      return undefined
    }
  }, [])

  const deleteExperience = useCallback(async (expId: number) => {
    try {
      await apiClient.deleteExperience(expId)
      setProfile(prev => prev ? { ...prev, experiences: prev.experiences.filter((e) => e.id !== expId) } : null)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete experience')
    }
  }, [])

  // Projects
  const addProject = useCallback(async (data: Partial<Project>) => {
    try {
      const project = await apiClient.addProject(data)
      setProfile(prev => prev ? { ...prev, projects: [...prev.projects, project] } : null)
      return project
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add project')
      return undefined
    }
  }, [])

  const updateProject = useCallback(async (projId: number, data: Partial<Project>) => {
    try {
      const updated = await apiClient.updateProject(projId, data)
      setProfile(prev =>
        prev
          ? {
              ...prev,
              projects: prev.projects.map((p) => (p.id === projId ? updated : p)),
            }
          : null
      )
      return updated
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update project')
      return undefined
    }
  }, [])

  const deleteProject = useCallback(async (projId: number) => {
    try {
      await apiClient.deleteProject(projId)
      setProfile(prev => prev ? { ...prev, projects: prev.projects.filter((p) => p.id !== projId) } : null)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete project')
    }
  }, [])

  // CVs
  const uploadCV = useCallback(async (file: File) => {
    try {
      const cv = await apiClient.uploadCV(file)
      setProfile(prev => prev ? { ...prev, cvs: [...prev.cvs, cv] } : null)
      return cv
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload CV')
      return undefined
    }
  }, [])

  const setPrimaryCV = useCallback(async (cvId: number) => {
    try {
      await apiClient.setPrimaryCV(cvId)
      setProfile(prev =>
        prev
          ? {
              ...prev,
              cvs: prev.cvs.map((cv) => ({
                ...cv,
                is_primary: cv.id === cvId,
              })),
            }
          : null
      )
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to set primary CV')
    }
  }, [])

  const deleteCV = useCallback(async (cvId: number) => {
    try {
      await apiClient.deleteCV(cvId)
      setProfile(prev => prev ? { ...prev, cvs: prev.cvs.filter((cv) => cv.id !== cvId) } : null)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete CV')
    }
  }, [])

  return {
    profile,
    loading,
    error,
    fetchProfile,
    refreshProfile: fetchProfile,   // alias — triggers a full re-fetch
    updateProfile,
    togglePublicProfile,
    addSkill,
    updateSkill,
    deleteSkill,
    addExperience,
    updateExperience,
    deleteExperience,
    addProject,
    updateProject,
    deleteProject,
    uploadCV,
    setPrimaryCV,
    deleteCV,
  }
}
