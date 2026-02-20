/**
 * API Client
 * Handles all backend API communication
 */

import type {
  Content,
  ContentCreate,
  GenerateResponse,
  SessionWithCandidates,
  NarrativeCandidate,
  TeamVote
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `API Error: ${response.statusText}`)
  }

  return response.json()
}

// ============================================================================
// CONTENT API
// ============================================================================

export const contentAPI = {
  /**
   * List all content
   */
  list: async (): Promise<Content[]> => {
    return fetchAPI<Content[]>('/content')
  },

  /**
   * Get specific content by ID
   */
  get: async (id: number): Promise<Content> => {
    return fetchAPI<Content>(`/content/${id}`)
  },

  /**
   * Create new content
   */
  create: async (data: ContentCreate): Promise<Content> => {
    return fetchAPI<Content>('/content', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete content and all associated data
   */
  delete: async (id: number): Promise<{ message: string }> => {
    return fetchAPI<{ message: string }>(`/content/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Save stakeholder interview responses
   */
  saveStakeholderResponses: async (id: number, responses: any): Promise<{
    message: string
    content_id: number
    responses: any
  }> => {
    return fetchAPI<{ message: string; content_id: number; responses: any }>(
      `/content/${id}/stakeholder-responses`,
      {
        method: 'POST',
        body: JSON.stringify(responses),
      }
    )
  },

  /**
   * Get stakeholder interview responses
   */
  getStakeholderResponses: async (id: number): Promise<{
    content_id: number
    responses: any
    has_responses: boolean
  }> => {
    return fetchAPI<{ content_id: number; responses: any; has_responses: boolean }>(
      `/content/${id}/stakeholder-responses`
    )
  },

  /**
   * Upload and extract text from PDF
   */
  uploadPDF: async (file: File): Promise<{
    filename: string
    pages: number
    extracted_text: string
    character_count: number
    success: boolean
  }> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_URL}/upload-pdf`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `API Error: ${response.statusText}`)
    }

    return response.json()
  },
}

// ============================================================================
// NARRATIVE GENERATION API
// ============================================================================

export const narrativeAPI = {
  /**
   * Generate narratives for content using council brainstorming
   */
  generate: async (
    contentId: number,
    count: number = 10
  ): Promise<GenerateResponse> => {
    return fetchAPI<GenerateResponse>('/generate-narratives', {
      method: 'POST',
      body: JSON.stringify({
        content_id: contentId,
        candidates_count: count,
      }),
    })
  },

  /**
   * Get all sessions for a content
   */
  getContentSessions: async (contentId: number): Promise<{
    content_id: number
    sessions: Array<{
      id: number
      status: string
      candidates_count: number
      created_at: string
      completed_at: string | null
    }>
  }> => {
    return fetchAPI(`/content/${contentId}/sessions`)
  },

  /**
   * Get session with all candidates
   */
  getSession: async (sessionId: number): Promise<SessionWithCandidates> => {
    return fetchAPI<SessionWithCandidates>(`/sessions/${sessionId}`)
  },

  /**
   * Get specific candidate details
   */
  getCandidate: async (candidateId: number): Promise<NarrativeCandidate> => {
    return fetchAPI<NarrativeCandidate>(`/candidates/${candidateId}`)
  },

  /**
   * Get top N candidates for Sensor Board
   */
  getTopCandidates: async (
    sessionId: number,
    limit: number = 5
  ): Promise<{ session_id: number; top_candidates: NarrativeCandidate[] }> => {
    return fetchAPI(`/session/${sessionId}/top-candidates?limit=${limit}`)
  },

  /**
   * Generate refined Round 2 narratives based on Round 1 learnings
   */
  generateRefined: async (
    contentId: number,
    count: number = 10
  ): Promise<{
    session_id: number
    round_number: number
    parent_session_id: number
    round_1_best_score: number
    round_2_best_score: number
    improvement: number
    message: string
  }> => {
    return fetchAPI('/generate-refined-narratives', {
      method: 'POST',
      body: JSON.stringify({
        content_id: contentId,
        candidates_count: count,
      }),
    })
  },

  /**
   * Start Round 2 with stakeholder feedback
   */
  startRound2: async (
    sessionId: number,
    stakeholderFeedback: string,
    count: number = 10
  ): Promise<{
    round_2_session_id: number
    status: string
    candidates_count: number
    top_score: number
    round_1_top_score: number
    improvement: number
    message: string
  }> => {
    return fetchAPI(`/sessions/${sessionId}/start-round-2`, {
      method: 'POST',
      body: JSON.stringify({
        stakeholder_feedback: stakeholderFeedback,
        candidates_count: count,
      }),
    })
  },

  /**
   * Get all rounds for a content
   */
  getRounds: async (contentId: number): Promise<{
    rounds: Array<{
      session_id: number
      round_number: number
      status: string
      candidates_count: number
      top_score: number | null
      created_at: string
      completed_at: string | null
      parent_session_id: number | null
      stakeholder_feedback: string | null
    }>
  }> => {
    return fetchAPI(`/content/${contentId}/rounds`)
  },

  /**
   * Get real-time progress for a generation session
   */
  getProgress: async (sessionId: number): Promise<{
    session_id: number
    status: string
    progress: {
      phase: string
      percent: number
      message: string
      updated_at: string
    } | null
    created_at: string
    completed_at: string | null
  }> => {
    return fetchAPI(`/sessions/${sessionId}/progress`)
  },
}

// ============================================================================
// VOTING API
// ============================================================================

export const votingAPI = {
  /**
   * Submit team vote
   */
  submit: async (vote: TeamVote): Promise<{ message: string }> => {
    return fetchAPI<{ message: string }>('/vote', {
      method: 'POST',
      body: JSON.stringify(vote),
    })
  },
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const api = {
  content: contentAPI,
  narrative: narrativeAPI,
  voting: votingAPI,
}

export default api
