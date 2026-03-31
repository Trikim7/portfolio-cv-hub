// User types
export interface User {
  id: number
  email: string
  role: 'candidate' | 'recruiter' | 'admin'
  is_active: boolean
  created_at: string
}

// Auth response
export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

// Candidate profile types
export interface Skill {
  id: number
  name: string
  level?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead'
  endorsements: number
  created_at: string
}

export interface Experience {
  id: number
  job_title: string
  company_name: string
  description?: string
  start_date: string
  end_date?: string
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: number
  title: string
  description?: string
  url?: string
  technologies?: string
  created_at: string
  updated_at: string
}

export interface CV {
  id: number
  file_name: string
  file_path: string
  file_size?: number
  is_primary: boolean
  created_at: string
}

export interface CandidateProfile {
  id: number
  user_id: number
  full_name?: string
  title?: string
  bio?: string
  profile_slug?: string
  is_public: boolean
  avatar_url?: string
  skills: Skill[]
  experiences: Experience[]
  projects: Project[]
  cvs: CV[]
  created_at: string
  updated_at: string
}
