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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transform MongoDB document by converting _id to id
 */
function transformMongoDoc<T>(doc: any): T {
  if (!doc) return doc

  // Handle arrays
  if (Array.isArray(doc)) {
    return doc.map(item => transformMongoDoc(item)) as T
  }

  // Handle objects
  if (typeof doc === 'object') {
    const transformed: any = {}

    for (const [key, value] of Object.entries(doc)) {
      // Convert _id to id
      if (key === '_id') {
        transformed.id = typeof value === 'object' && value !== null ? (value as any).toString() : value
      } else {
        // Recursively transform nested objects
        transformed[key] = typeof value === 'object' && value !== null
          ? transformMongoDoc(value)
          : value
      }
    }

    return transformed as T
  }

  return doc
}

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

  const data = await response.json()
  return transformMongoDoc<T>(data)
}

// ============================================================================
// CONTENT API
// ============================================================================

export const contentAPI = {
  /**
   * List all content
   */
  list: async (): Promise<Content[]> => {
    return fetchAPI<Content[]>('/narrative/content')
  },

  /**
   * Get specific content by ID
   */
  get: async (id: string): Promise<Content> => {
    return fetchAPI<Content>(`/narrative/content/${id}`)
  },

  /**
   * Create new content
   */
  create: async (data: ContentCreate): Promise<Content> => {
    return fetchAPI<Content>('/narrative/content', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete content and all associated data
   */
  delete: async (id: string): Promise<{ message: string }> => {
    return fetchAPI<{ message: string }>(`/narrative/content/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Save stakeholder interview responses
   */
  saveStakeholderResponses: async (id: string, responses: any): Promise<{
    message: string
    content_id: string
    responses: any
  }> => {
    return fetchAPI<{ message: string; content_id: string; responses: any }>(
      `/narrative/content/${id}/stakeholder-responses`,
      {
        method: 'POST',
        body: JSON.stringify(responses),
      }
    )
  },

  /**
   * Get stakeholder interview responses
   */
  getStakeholderResponses: async (id: string): Promise<{
    content_id: string
    responses: any
    has_responses: boolean
  }> => {
    return fetchAPI<{ content_id: string; responses: any; has_responses: boolean }>(
      `/narrative/content/${id}/stakeholder-responses`
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

    const response = await fetch(`${API_URL}/narrative/upload-pdf`, {
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
    contentId: string,
    count: number = 10
  ): Promise<GenerateResponse> => {
    return fetchAPI<GenerateResponse>(`/narrative/content/${contentId}/generate`, {
      method: 'POST',
      body: JSON.stringify({
        round: 1,
      }),
    })
  },

  /**
   * Get all sessions for a content
   */
  getContentSessions: async (contentId: string): Promise<{
    content_id: string
    sessions: Array<{
      id: string
      status: string
      candidates_count: number
      created_at: string
      completed_at: string | null
    }>
  }> => {
    return fetchAPI(`/narrative/content/${contentId}/rounds`)
  },

  /**
   * Get session with all candidates
   */
  getSession: async (sessionId: string): Promise<SessionWithCandidates> => {
    return fetchAPI<SessionWithCandidates>(`/narrative/sessions/${sessionId}`)
  },

  /**
   * Get specific candidate details
   */
  getCandidate: async (candidateId: string): Promise<NarrativeCandidate> => {
    return fetchAPI<NarrativeCandidate>(`/narrative/candidates/${candidateId}`)
  },

  /**
   * Get top N candidates for Sensor Board
   */
  getTopCandidates: async (
    sessionId: string,
    limit: number = 5
  ): Promise<{ session_id: string; top_candidates: NarrativeCandidate[] }> => {
    return fetchAPI(`/narrative/session/${sessionId}/top-candidates?limit=${limit}`)
  },

  /**
   * Generate refined Round 2 narratives based on Round 1 learnings
   */
  generateRefined: async (
    contentId: string,
    count: number = 10
  ): Promise<{
    session_id: string
    round_number: number
    parent_session_id: string
    round_1_best_score: number
    round_2_best_score: number
    improvement: number
    message: string
  }> => {
    return fetchAPI(`/narrative/content/${contentId}/generate`, {
      method: 'POST',
      body: JSON.stringify({
        round: 2,
      }),
    })
  },

  /**
   * Start Round 2 with stakeholder feedback
   */
  startRound2: async (
    sessionId: string,
    stakeholderFeedback: string,
    count: number = 10
  ): Promise<{
    round_2_session_id: string
    status: string
    candidates_count: number
    top_score: number
    round_1_top_score: number
    improvement: number
    message: string
  }> => {
    return fetchAPI(`/narrative/sessions/${sessionId}/start-round-2`, {
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
  getRounds: async (contentId: string): Promise<{
    rounds: Array<{
      session_id: string
      round_number: number
      status: string
      candidates_count: number
      top_score: number | null
      created_at: string
      completed_at: string | null
      parent_session_id: string | null
      stakeholder_feedback: string | null
    }>
  }> => {
    return fetchAPI(`/narrative/content/${contentId}/rounds`)
  },

  /**
   * Get real-time progress for a generation session
   */
  getProgress: async (sessionId: string): Promise<{
    session_id: string
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
    return fetchAPI(`/narrative/sessions/${sessionId}/status`)
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
