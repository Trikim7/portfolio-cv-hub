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
  contact_email?: string
  views: number
  skills: Skill[]
  experiences: Experience[]
  projects: Project[]
  cvs: CV[]
  created_at: string
  updated_at: string
}

// Recruiter types
export interface Company {
  id: number
  company_name: string
  company_slug: string
  industry?: string
  website?: string
  description?: string
  logo_url?: string
  location?: string
  email?: string
  phone?: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  created_at: string
  updated_at: string
}

export interface JobInvitation {
  id: number
  company_id: number
  candidate_id: number
  job_title: string
  message?: string
  status: 'pending' | 'interested' | 'rejected' | 'withdrawn'
  created_at: string
  updated_at: string
}

export interface CandidateSearchResult {
  id: number
  user_id: number
  full_name?: string
  title?: string
  bio?: string
  profile_slug: string
  avatar_url?: string
  skills: string[]
}

// ─── Admin types ──────────────────────────────────────────────
export interface DashboardStats {
  total_users: number
  total_candidates: number
  total_recruiters: number
  total_companies: number
  pending_companies: number
  approved_companies: number
  public_profiles: number
  total_invitations: number
}

export interface AdminUser {
  id: number
  email: string
  role: 'candidate' | 'recruiter' | 'admin'
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface AdminUserListResponse {
  users: AdminUser[]
  total: number
  page: number
  page_size: number
}

export interface AdminCompany {
  id: number
  user_id?: number
  company_name: string
  company_slug: string
  industry?: string
  website?: string
  description?: string
  location?: string
  email?: string
  phone?: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  created_at: string
  updated_at?: string
}

export interface AdminCompanyListResponse {
  companies: AdminCompany[]
  total: number
  page: number
  page_size: number
}

