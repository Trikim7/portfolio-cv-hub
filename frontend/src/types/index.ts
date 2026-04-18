// ─── i18n ──────────────────────────────────────────────────────
// Every multilingual text field is stored as a {locale -> text} map on the
// backend (JSONB). The API may still return a bare string for legacy rows,
// which the UI should accept gracefully.
export type LocalizedText = Record<string, string>
export type I18nText = LocalizedText | string | null | undefined

// User types
export interface User {
  id: number
  email: string
  role: 'candidate' | 'recruiter' | 'admin'
  status: 'active' | 'locked' | 'pending'
  full_name?: string
  // Derived from `status`; kept for UI code that still reads it.
  is_active: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

// ─── Candidate portfolio ──────────────────────────────────────
export interface Skill {
  id: number
  name: string
  level?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead'
  category?: string
  endorsements: number
  created_at: string
}

export interface Experience {
  id: number
  job_title: string
  company_name: string
  description?: I18nText
  start_date: string
  end_date?: string
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: number
  project_name: string
  role?: string
  description?: I18nText
  project_url?: string
  github_url?: string
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
  headline?: string
  bio?: I18nText
  public_slug?: string
  template_id?: number | null
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

export interface CandidateAnalytics {
  total_views: number
  total_invitations: number
}

// ─── Recruiter ────────────────────────────────────────────────
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
  headline?: string
  bio?: I18nText
  public_slug: string
  avatar_url?: string
  skills: string[]
}

// ─── Social auth (Phase 2) ───────────────────────────────────
export type OAuthProvider = 'google' | 'github'

export interface SocialAccount {
  id?: number
  user_id?: number
  provider: OAuthProvider
  provider_account_id: string
  created_at: string
}

// ─── Scoring & Ranking (Phase 2) ─────────────────────────────
export interface RadarScores {
  technical_skills: number
  experience: number
  portfolio: number
  soft_skills: number
  leadership: number
  readiness_signals: number
}

export interface CandidateScore {
  candidate_id: number
  full_name?: string
  radar_scores: RadarScores
  overall_match: number
  match_details: Record<string, any>
}

export interface RankingResponse {
  job_id?: number
  total: number
  candidates: CandidateScore[]
  comparison?: {
    best_match: number
    best_match_name?: string
    average_match: number
    highest_skill_candidate: {
      candidate_id: number
      full_name?: string
      score: number
    }
  } | null
}

export interface ScoringCriteria {
  title?: string
  required_skills: Array<string | { name: string; level?: string }>
  years_experience?: number
  required_role?: string
  customer_facing?: boolean
  tech_stack?: string[]
  is_management_role?: boolean
  weights_config?: Partial<Record<keyof RadarScores, number>>
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
  status?: 'active' | 'locked' | 'pending'
  is_active: boolean
  company_status?: 'pending' | 'approved' | 'rejected' | 'suspended' | null
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
