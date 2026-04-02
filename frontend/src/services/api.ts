import axios, { AxiosInstance } from 'axios'
import { TokenResponse, CandidateProfile, Skill, Experience, Project, CV } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  // Auth endpoints
  async register(email: string, password: string): Promise<TokenResponse> {
    const response = await this.client.post('/api/auth/register', {
      email,
      password,
      role: 'candidate',
    })
    return response.data
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    const response = await this.client.post('/api/auth/login', {
      email,
      password,
    })
    return response.data
  }

  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me')
    return response.data
  }

  // Profile endpoints
  async getMyProfile(): Promise<CandidateProfile> {
    const response = await this.client.get('/api/candidate/profile')
    return response.data
  }

  async updateProfile(data: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const response = await this.client.put('/api/candidate/profile', data)
    return response.data
  }

  async togglePublicProfile(isPublic: boolean): Promise<{ message: string; is_public: boolean }> {
    const response = await this.client.put(`/api/candidate/profile/toggle-public?is_public=${isPublic}`)
    return response.data
  }

  async getPublicProfile(slug: string): Promise<CandidateProfile> {
    const response = await this.client.get(`/api/candidate/public/${slug}`)
    return response.data
  }

  // Skills endpoints
  async addSkill(name: string, level?: string): Promise<Skill> {
    const response = await this.client.post('/api/candidate/skills', { name, level })
    return response.data
  }

  async getSkills(): Promise<Skill[]> {
    const response = await this.client.get('/api/candidate/skills')
    return response.data
  }

  async updateSkill(skillId: number, data: Partial<Skill>): Promise<Skill> {
    const response = await this.client.put(`/api/candidate/skills/${skillId}`, data)
    return response.data
  }

  async deleteSkill(skillId: number): Promise<{ message: string }> {
    const response = await this.client.delete(`/api/candidate/skills/${skillId}`)
    return response.data
  }

  // Experiences endpoints
  async addExperience(data: Partial<Experience>): Promise<Experience> {
    const response = await this.client.post('/api/candidate/experiences', data)
    return response.data
  }

  async getExperiences(): Promise<Experience[]> {
    const response = await this.client.get('/api/candidate/experiences')
    return response.data
  }

  async updateExperience(expId: number, data: Partial<Experience>): Promise<Experience> {
    const response = await this.client.put(`/api/candidate/experiences/${expId}`, data)
    return response.data
  }

  async deleteExperience(expId: number): Promise<{ message: string }> {
    const response = await this.client.delete(`/api/candidate/experiences/${expId}`)
    return response.data
  }

  // Projects endpoints
  async addProject(data: Partial<Project>): Promise<Project> {
    const response = await this.client.post('/api/candidate/projects', data)
    return response.data
  }

  async getProjects(): Promise<Project[]> {
    const response = await this.client.get('/api/candidate/projects')
    return response.data
  }

  async updateProject(projId: number, data: Partial<Project>): Promise<Project> {
    const response = await this.client.put(`/api/candidate/projects/${projId}`, data)
    return response.data
  }

  async deleteProject(projId: number): Promise<{ message: string }> {
    const response = await this.client.delete(`/api/candidate/projects/${projId}`)
    return response.data
  }

  // CVs endpoints
  async uploadCV(file: File): Promise<CV> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await this.client.post('/api/candidate/cvs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }

  async getCVs(): Promise<CV[]> {
    const response = await this.client.get('/api/candidate/cvs')
    return response.data
  }

  async setPrimaryCV(cvId: number): Promise<{ message: string; cv: CV }> {
    const response = await this.client.put(`/api/candidate/cvs/${cvId}/set-primary`)
    return response.data
  }

  async deleteCV(cvId: number): Promise<{ message: string }> {
    const response = await this.client.delete(`/api/candidate/cvs/${cvId}`)
    return response.data
  }
}

export const apiClient = new ApiClient()
