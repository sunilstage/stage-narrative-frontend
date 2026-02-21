'use client'

/**
 * Narratives Tab - Split Panel Layout
 * Left: Narrative list (33%) | Right: Detail view with sub-tabs (67%)
 */

import { useState } from 'react'
import { useSearchParams, useRouter, useParams } from 'next/navigation'
import type { NarrativeCandidate } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  FiTrendingUp, FiTarget, FiUsers, FiFilter, FiCopy, FiCheck,
  FiChevronRight, FiMessageSquare
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { PRODUCTION_ROLES, AUDIENCE_PERSONAS } from '@/lib/types'
import Round2Modal from '@/components/Round2Modal'

type SubTab = 'production' | 'audience'

export default function NarrativesTab({ session, onNavigateToCouncil, councilConversation }: {
  session: any
  onNavigateToCouncil: () => void
  councilConversation?: any
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const [sortBy, setSortBy] = useState<'rank' | 'production' | 'audience'>('rank')
  const [filterSegment, setFilterSegment] = useState<string>('all')
  const [subTab, setSubTab] = useState<SubTab>('production')
  const [showRound2Modal, setShowRound2Modal] = useState(false)

  // Check if this is Round 1 and complete (can start Round 2)
  const isRound1 = session?.session?.round_number === 1 || !session?.session?.round_number
  const canStartRound2 = isRound1 && session?.session?.status === 'complete'

  // Get selected narrative from URL or default to first
  const selectedId = searchParams.get('selected')
    ? parseInt(searchParams.get('selected')!)
    : session?.candidates?.[0]?.id

  const candidates = session?.candidates || []

  // Sort candidates
  const sortedCandidates = [...candidates].sort((a, b) => {
    if (sortBy === 'rank') return a.rank - b.rank
    if (sortBy === 'production') return b.production_avg - a.production_avg
    if (sortBy === 'audience') return b.audience_avg - a.audience_avg
    return 0
  })

  // Filter by segment
  const filteredCandidates = filterSegment === 'all'
    ? sortedCandidates
    : sortedCandidates.filter(c => {
        return Object.entries(c.audience_council).some(([personaId, evaluation]: [string, any]) => {
          const persona = AUDIENCE_PERSONAS[personaId as keyof typeof AUDIENCE_PERSONAS]
          return persona?.segment === filterSegment && evaluation.score >= 7
        })
      })

  const selectedCandidate = candidates.find((c: NarrativeCandidate) => c.id === selectedId)

  const handleSelectNarrative = (id: string) => {  // MongoDB ObjectId
    const url = new URL(window.location.href)
    url.searchParams.set('selected', id)  // Already a string
    router.push(url.pathname + url.search, { scroll: false })
  }

  const handleRound2Success = (round2SessionId: string) => {  // MongoDB ObjectId
    // Navigate to Round 2 results
    router.push(`/project/${params.id}?tab=narratives&session=${round2SessionId}`)
  }

  if (!session || candidates.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
        <FiFileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold text-lg">No narratives generated yet</p>
        <p className="text-gray-500 text-sm mt-2">Generate narratives to see them here</p>
      </div>
    )
  }

  return (
    <div>
      {/* Round 2 CTA Banner */}
      {canStartRound2 && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                💡 Want to explore different angles?
              </h3>
              <p className="text-gray-700 font-medium">
                If the council missed important context or you want to explore new directions,
                start Round 2 with your feedback. The council will reconvene and create new candidates
                addressing your insights.
              </p>
            </div>
            <button
              onClick={() => setShowRound2Modal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold whitespace-nowrap transition-colors shadow-md hover:shadow-lg"
            >
              Start Round 2 →
            </button>
          </div>
        </div>
      )}

      {/* Round 2 Modal */}
      {showRound2Modal && (
        <Round2Modal
          sessionId={session.id}
          onClose={() => setShowRound2Modal(false)}
          onSuccess={handleRound2Success}
        />
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <FiFilter className="text-gray-400 text-xl" />
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-stage-red focus:border-stage-red bg-white text-gray-900"
            >
              <option value="rank">Overall Rank</option>
              <option value="production">Production Score</option>
              <option value="audience">Audience Score</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Segment:</label>
            <select
              value={filterSegment}
              onChange={(e) => setFilterSegment(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-stage-red focus:border-stage-red bg-white text-gray-900"
            >
              <option value="all">All Segments</option>
              <option value="Drama/Romance">Drama/Romance</option>
              <option value="Action/Thriller">Action/Thriller</option>
              <option value="Gen-Z">Gen-Z</option>
              <option value="Premium">Premium</option>
              <option value="Comedy">Comedy</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Mature">Mature</option>
            </select>
          </div>

          {filterSegment !== 'all' && (
            <button
              onClick={() => setFilterSegment('all')}
              className="text-sm text-stage-red hover:text-stage-red-dark font-medium"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Split Panel Layout */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-340px)]">
        {/* Left Panel - Narrative List (33%) */}
        <div className="col-span-4 overflow-y-auto bg-white rounded-xl border-2 border-gray-200 p-4">
          <h3 className="text-xl font-bold text-gray-900 mb-6 sticky top-0 bg-white pb-3 border-b-2 border-gray-200 z-10">
            All Narratives ({filteredCandidates.length})
          </h3>
          <div className="space-y-4">
            {filteredCandidates.map((candidate: NarrativeCandidate) => (
              <NarrativeListItem
                key={candidate.id}
                candidate={candidate}
                selected={candidate.id === selectedId}
                onClick={() => handleSelectNarrative(candidate.id)}
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Narrative Detail (67%) */}
        <div className="col-span-8 overflow-y-auto">
          {selectedCandidate ? (
            <NarrativeDetail
              candidate={selectedCandidate}
              subTab={subTab}
              onSubTabChange={setSubTab}
              onNavigateToCouncil={onNavigateToCouncil}
              councilConversation={councilConversation}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-white rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-gray-500">Select a narrative to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Narrative List Item
// ============================================================================

function NarrativeListItem({ candidate, selected, onClick }: {
  candidate: NarrativeCandidate
  selected: boolean
  onClick: () => void
}) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600', icon: '🥇' }
    if (rank === 2) return { bg: 'bg-gradient-to-br from-gray-300 to-gray-500', icon: '🥈' }
    if (rank === 3) return { bg: 'bg-gradient-to-br from-orange-400 to-orange-600', icon: '🥉' }
    return { bg: 'bg-gray-600', icon: '' }
  }

  const rankBadge = getRankBadge(candidate.rank)

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "w-full text-left p-5 rounded-xl border-2 transition-all hover:shadow-lg cursor-pointer",
        selected
          ? "border-stage-red bg-red-50 shadow-lg scale-[1.02]"
          : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
      )}
    >
      <div className="flex items-start gap-4 mb-3">
        <div className={cn("w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold text-white shadow-md flex-shrink-0", rankBadge.bg)}>
          <span className="text-2xl">{rankBadge.icon}</span>
          <span className="text-xs">#{candidate.rank}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-bold">
              {candidate.angle}
            </div>
            {candidate.generation_type && (
              <div className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-bold",
                candidate.generation_type === 'ai_human'
                  ? "bg-gradient-to-r from-blue-500 to-green-500 text-white"
                  : "bg-gray-500 text-white"
              )}>
                {candidate.generation_type === 'ai_human' ? '🤝 AI+Human' : '🤖 AI-Only'}
              </div>
            )}
          </div>
          <p className="text-base text-gray-900 font-medium line-clamp-3 leading-relaxed">
            {candidate.narrative_text}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
        <ScoreBadge score={candidate.overall_score} label="Overall" color="red" size="sm" />
        <ScoreBadge score={candidate.production_avg} label="Prod" color="green" size="sm" />
        <ScoreBadge score={candidate.audience_avg} label="Aud" color="blue" size="sm" />
      </div>
    </button>
  )
}

function ScoreBadge({ score, label, color, size = 'sm' }: {
  score: number
  label: string
  color: 'red' | 'green' | 'blue'
  size?: 'xs' | 'sm'
}) {
  const colors = {
    red: 'bg-red-100 text-red-800 border-red-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
  }

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
  }

  return (
    <div className={cn("rounded border font-bold", colors[color], sizes[size])}>
      {label}: {score.toFixed(1)}
    </div>
  )
}

// ============================================================================
// Narrative Detail
// ============================================================================

function NarrativeDetail({ candidate, subTab, onSubTabChange, onNavigateToCouncil, councilConversation }: {
  candidate: NarrativeCandidate
  subTab: SubTab
  onSubTabChange: (tab: SubTab) => void
  onNavigateToCouncil: () => void
  councilConversation?: any
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(candidate.narrative_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-stage-red to-red-600 text-white p-6 border-b-4 border-red-800">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white/20 rounded-lg font-bold border-2 border-white/30">
              #{candidate.rank}
            </div>
            <div className="text-xl font-bold">{candidate.angle}</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
            <FiTrendingUp />
            <span className="font-bold text-xl">{candidate.overall_score.toFixed(1)}</span>
            <span className="text-sm opacity-90">Overall</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
            <FiTarget />
            <span className="font-bold text-lg">{candidate.production_avg.toFixed(1)}</span>
            <span className="text-sm opacity-90">Production</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
            <FiUsers />
            <span className="font-bold text-lg">{candidate.audience_avg.toFixed(1)}</span>
            <span className="text-sm opacity-90">Audience</span>
          </div>
        </div>
      </div>

      {/* Narrative Text */}
      <div className="p-6 border-b-2 border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-gray-900">Marketing Narrative</h3>
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all",
              copied
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            )}
          >
            {copied ? <FiCheck /> : <FiCopy />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
          <p className="text-gray-900 leading-relaxed font-medium">
            {candidate.narrative_text}
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="border-b-2 border-gray-200">
        <div className="flex">
          <SubTabButton
            active={subTab === 'production'}
            onClick={() => onSubTabChange('production')}
            icon={<FiTarget className="text-green-600" />}
            label="Production Council"
            count={Object.keys(candidate.production_council).length}
          />
          <SubTabButton
            active={subTab === 'audience'}
            onClick={() => onSubTabChange('audience')}
            icon={<FiUsers className="text-blue-600" />}
            label="Audience Response"
            count={Object.keys(candidate.audience_council).length}
          />
        </div>
      </div>

      {/* Sub-tab Content */}
      <div className="p-6">
        {subTab === 'production' && (
          <ProductionCouncilView
            candidate={candidate}
            onNavigateToCouncil={onNavigateToCouncil}
            councilConversation={councilConversation}
          />
        )}
        {subTab === 'audience' && (
          <AudienceResponseView candidate={candidate} />
        )}
      </div>
    </div>
  )
}

function SubTabButton({ active, onClick, icon, label, count }: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count: number
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-4",
        active
          ? "border-gray-900 bg-gray-50"
          : "border-transparent hover:bg-gray-50"
      )}
    >
      {icon}
      <span className={active ? "text-gray-900" : "text-gray-600"}>{label}</span>
      <span className={cn(
        "px-2 py-0.5 rounded-full text-xs font-bold",
        active ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-600"
      )}>
        {count}
      </span>
    </button>
  )
}

// ============================================================================
// Production Council View
// ============================================================================

function ProductionCouncilView({ candidate, onNavigateToCouncil, councilConversation }: {
  candidate: NarrativeCandidate
  onNavigateToCouncil: () => void
  councilConversation?: any
}) {
  // Extract relevant discussion about this narrative
  const narrativeText = candidate.narrative_text?.slice(0, 50).toLowerCase() || ''
  const angleText = candidate.angle?.toLowerCase() || ''
  const relevantMessages = councilConversation?.conversation?.filter((msg: any) =>
    (narrativeText && msg.message.toLowerCase().includes(narrativeText.slice(0, 30))) ||
    (angleText && msg.message.toLowerCase().includes(angleText))
  ).slice(0, 3) || []

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold text-gray-900">Council Discussion About This Narrative</h4>
        <button
          onClick={onNavigateToCouncil}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border-2 border-purple-200"
        >
          <FiMessageSquare />
          View Full Discussion
        </button>
      </div>

      {/* Collaborative Creation Info */}
      <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">✨</span>
          <span className="font-bold text-gray-900">Collaboratively Created</span>
        </div>
        <p className="text-sm text-gray-700">
          This narrative was created through council brainstorming with {(candidate.production_council as any).created_by || 'team collaboration'}.
          Consensus level: <span className="font-semibold">{(candidate.production_council as any).consensus || 'high'}</span>
        </p>
      </div>

      {/* Relevant Discussion Excerpts */}
      {relevantMessages.length > 0 ? (
        <div className="space-y-3">
          <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Relevant Discussion:</h5>
          {relevantMessages.map((msg: any, idx: number) => (
            <div key={idx} className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {PRODUCTION_ROLES[msg.speaker?.toLowerCase().replace(/\s+/g, '_') as keyof typeof PRODUCTION_ROLES]?.icon || '💬'}
                </span>
                <span className="font-bold text-gray-900 text-sm">{msg.speaker}</span>
                <span className="text-xs text-gray-500">• {msg.phase}</span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">
                {msg.message}
              </p>
            </div>
          ))}
          <div className="text-center pt-2">
            <button
              onClick={onNavigateToCouncil}
              className="text-sm text-purple-600 hover:text-purple-800 font-semibold underline"
            >
              Read complete discussion with all {councilConversation?.conversation?.length || 0} messages →
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-3">No specific discussion found for this narrative in the excerpt.</p>
          <button
            onClick={onNavigateToCouncil}
            className="text-sm text-purple-600 hover:text-purple-800 font-semibold underline"
          >
            View complete council discussion →
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Audience Response View
// ============================================================================

// Helper function to create a one-line summary from full comment
function summarizeComment(fullComment: string, score: number, wouldClick?: string): string {
  if (!fullComment) return ''

  // Remove excessive punctuation and normalize
  let text = fullComment.trim()

  // Extract first sentence if it's concise
  const firstSentence = text.split(/[.!?]\s/)[0]
  if (firstSentence.length < 80) {
    return firstSentence
  }

  // Try to extract key sentiment/point based on score and would_click
  const sentiment = score >= 7 ? 'Positive' : score >= 5 ? 'Mixed' : 'Negative'
  const action = wouldClick === 'yes' ? 'would watch' : wouldClick === 'no' ? 'would skip' : 'might watch'

  // Extract key phrases (remove filler words, keep substance)
  const keyPhrase = text
    .replace(/^(okay|well|so|basically|honestly|i mean|like),?\s*/gi, '')
    .replace(/\.\.\./g, '')
    .split(/[.!?]/)[0]
    .slice(0, 90)

  if (keyPhrase.length > 40) {
    return keyPhrase + (keyPhrase.length < text.split(/[.!?]/)[0].length ? '...' : '')
  }

  // Fallback: create summary from score and sentiment
  return `${sentiment} response (${score}/10) - ${action}`
}

function AudienceResponseView({ candidate }: { candidate: NarrativeCandidate }) {
  const [expandedPersonas, setExpandedPersonas] = useState<Set<string>>(new Set())

  const togglePersona = (personaId: string) => {
    const newExpanded = new Set(expandedPersonas)
    if (newExpanded.has(personaId)) {
      newExpanded.delete(personaId)
    } else {
      newExpanded.add(personaId)
    }
    setExpandedPersonas(newExpanded)
  }

  return (
    <div>
      <h4 className="text-lg font-bold text-gray-900 mb-4">Persona Evaluations</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(candidate.audience_council).map(([personaId, evaluation]: [string, any]) => {
          const persona = AUDIENCE_PERSONAS[personaId as keyof typeof AUDIENCE_PERSONAS]
          const isExpanded = expandedPersonas.has(personaId)

          const fullComment = evaluation.impression || evaluation.reasoning ||
                             evaluation.why || evaluation.the_real_talk ||
                             evaluation.refined_assessment || evaluation.parent_perspective ||
                             evaluation.arjun_thoughts || evaluation.rohan_reaction ||
                             evaluation.mature_perspective || ''

          const summary = summarizeComment(fullComment, evaluation.score, evaluation.would_click)

          return (
            <div key={personaId} className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-gray-900">{persona?.name}</div>
                  <div className="text-xs text-gray-700 font-semibold">
                    {persona?.age}yo • {persona?.segment}
                  </div>
                </div>
                <div className={cn(
                  "px-2.5 py-1 rounded-lg font-bold text-sm shadow-sm",
                  evaluation.score >= 7 ? "bg-blue-600 text-white" :
                  evaluation.score >= 5 ? "bg-yellow-500 text-white" :
                  "bg-red-600 text-white"
                )}>
                  {evaluation.score}/10
                </div>
              </div>

              {evaluation.would_click && (
                <div className={cn(
                  "inline-block px-2 py-1 rounded text-xs font-bold mb-2 uppercase",
                  evaluation.would_click === 'yes' ? "bg-green-600 text-white" :
                  evaluation.would_click === 'maybe' ? "bg-yellow-500 text-white" :
                  "bg-red-600 text-white"
                )}>
                  {evaluation.would_click === 'yes' ? '✓ Would Click' :
                   evaluation.would_click === 'maybe' ? '? Maybe' : '✗ Won\'t Click'}
                </div>
              )}

              {fullComment && (
                <div>
                  {!isExpanded ? (
                    <div>
                      <p className="text-xs text-gray-800 leading-relaxed font-medium mb-2 italic">
                        💭 {summary}
                      </p>
                      <button
                        onClick={() => togglePersona(personaId)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
                      >
                        Read Full Review
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-800 leading-relaxed font-medium mb-2">
                        💭 "{fullComment}"
                      </p>
                      <button
                        onClick={() => togglePersona(personaId)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
                      >
                        Show Less
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Fix import
import { FiFileText } from 'react-icons/fi'
