/**
 * TypeScript Type Definitions
 * All types for STAGE Narrative Engine
 */

// ============================================================================
// CONTENT TYPES
// ============================================================================

export interface Content {
  id: string  // MongoDB ObjectId
  title: string
  genre?: string
  runtime?: number
  targetAudience?: string
  summary?: string
  script?: string
  themes?: string
  tone?: string
  content_metadata?: Record<string, any>
  content_analysis?: any
  stakeholder_responses?: any
  created_at?: string
  updated_at?: string
}

export interface ContentCreate {
  title: string
  genre?: string
  runtime?: number
  targetAudience?: string
  summary?: string
  script?: string
  themes?: string
  tone?: string
  content_metadata?: Record<string, any>
}

// ============================================================================
// SESSION TYPES
// ============================================================================

export interface NarrativeSession {
  id: string  // MongoDB ObjectId
  content_id: string  // MongoDB ObjectId
  status: 'pending' | 'generating' | 'evaluating' | 'complete' | 'failed'
  candidates_count: number
  created_at: string
  completed_at?: string
  evaluation_mode?: 'independent' | 'deliberative'
  round_number?: number
  parent_session_id?: string  // MongoDB ObjectId
  content_analysis?: any
  council_conversation?: any
}

export interface SessionWithCandidates {
  session: NarrativeSession
  candidates: NarrativeCandidate[]
}

// ============================================================================
// NARRATIVE CANDIDATE TYPES
// ============================================================================

export interface NarrativeCandidate {
  id: string  // MongoDB ObjectId
  rank: number
  narrative_text: string
  angle: string
  generation_type?: 'ai_only' | 'ai_human'
  overall_score: number
  production_avg: number
  audience_avg: number
  insights: string[]
  conflicts: Conflict[]
  demographic_breakdown: DemographicBreakdown
  production_council: Record<string, CouncilEvaluation>
  audience_council: Record<string, PersonaEvaluation>
}

export interface CouncilEvaluation {
  score: number
  reasoning: string
  recommendation: 'approve' | 'revise' | 'reject'
  red_flags?: string[]
  green_lights?: string[]
  concerns?: string[]
}

export interface PersonaEvaluation {
  score: number
  would_click: 'yes' | 'no' | 'maybe'
  [key: string]: any  // Flexible for persona-specific fields
}

export interface Conflict {
  type: string
  severity: 'low' | 'medium' | 'high'
  description: string
  role?: string
}

export interface DemographicBreakdown {
  by_age: Record<string, number>
  by_gender: Record<string, number>
  by_segment: Record<string, number>
  strong_appeal: Array<{ persona: string; score: number }>
  weak_appeal: Array<{ persona: string; score: number }>
}

// ============================================================================
// VOTING TYPES
// ============================================================================

export interface TeamVote {
  candidate_id: string  // MongoDB ObjectId
  user_email: string
  user_role?: string
  score: number
  comment?: string
  selected_for_sensor_board: boolean
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface GenerateResponse {
  session_id: string  // MongoDB ObjectId
  status: string
  candidates_generated: number
  message: string
}

export interface ApiError {
  detail: string
}

// ============================================================================
// COUNCIL MEMBER INFO
// ============================================================================

export const PRODUCTION_ROLES = {
  content_head: { name: 'Content Head', icon: '🎯' },
  content_manager: { name: 'Content Manager', icon: '📚' },
  marketing_manager: { name: 'Marketing Manager', icon: '📊' },
  promo_producer: { name: 'Promo Producer', icon: '🎯' },
  poster_designer: { name: 'Poster Designer', icon: '🎨' },
  trailer_designer: { name: 'Trailer Designer', icon: '🎬' }
} as const

export const AUDIENCE_PERSONAS = {
  priya_25f_drama: { name: 'Priya', age: 25, segment: 'Drama/Romance' },
  rajesh_35m_action: { name: 'Rajesh', age: 35, segment: 'Action/Thriller' },
  ananya_19f_genz: { name: 'Ananya', age: 19, segment: 'Gen-Z' },
  vikram_42m_premium: { name: 'Vikram', age: 42, segment: 'Premium' },
  neha_31f_parent: { name: 'Neha', age: 31, segment: 'Parent' },
  arjun_28m_scifi: { name: 'Arjun', age: 28, segment: 'Sci-Fi' },
  maya_55f_mature: { name: 'Maya', age: 55, segment: 'Mature' },
  rohan_32m_comedy: { name: 'Rohan', age: 32, segment: 'Comedy' }
} as const
