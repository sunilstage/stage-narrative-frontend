'use client'

/**
 * Session Results Page - ENHANCED
 * Better contrast, improved visibility, polished flow
 */

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useState } from 'react'
import type { NarrativeCandidate } from '@/lib/types'
import { PRODUCTION_ROLES, AUDIENCE_PERSONAS } from '@/lib/types'
import { getScoreColor, getScoreBgColor, cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiTrendingUp, FiUsers, FiTarget, FiMessageSquare, FiX, FiChevronRight,
  FiStar, FiBarChart2, FiFilter, FiCopy, FiCheck, FiChevronDown, FiChevronUp
} from 'react-icons/fi'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

type TabType = 'candidates' | 'council' | 'insights'

export default function SessionResults() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string  // MongoDB ObjectId string
  const [activeTab, setActiveTab] = useState<TabType>('candidates')
  const [selectedCandidate, setSelectedCandidate] = useState<NarrativeCandidate | null>(null)
  const [sortBy, setSortBy] = useState<'rank' | 'production' | 'audience'>('rank')
  const [filterSegment, setFilterSegment] = useState<string>('all')

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => api.narrative.getSession(sessionId),
    enabled: !!sessionId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-stage-red mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading session results...</p>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <p className="text-red-900 font-medium">
            Error loading session: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }

  const candidates = session.candidates || []

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="bg-white shadow-sm border-b-2 border-gray-100 sticky top-0 z-10">
          <div className="px-6 py-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Back to dashboard"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Session Results</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-600">{candidates.length} candidates generated</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      ✓ Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-t border-gray-200">
            <TabButton
              active={activeTab === 'candidates'}
              onClick={() => setActiveTab('candidates')}
              icon={<FiStar />}
              label="Candidates"
              count={candidates.length}
            />
            <TabButton
              active={activeTab === 'council'}
              onClick={() => setActiveTab('council')}
              icon={<FiMessageSquare />}
              label="Council Discussion"
              badge={session.session.council_conversation ? '✓' : null}
            />
            <TabButton
              active={activeTab === 'insights'}
              onClick={() => setActiveTab('insights')}
              icon={<FiBarChart2 />}
              label="Insights"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 pt-6">
          {activeTab === 'candidates' && (
            <CandidatesTab
              candidates={filteredCandidates}
              onSelectCandidate={setSelectedCandidate}
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterSegment={filterSegment}
              onFilterChange={setFilterSegment}
            />
          )}

          {activeTab === 'council' && (
            <CouncilTab conversation={session.session.council_conversation} />
          )}

          {activeTab === 'insights' && (
            <InsightsTab candidates={candidates} />
          )}
        </div>
      </div>

      {/* Candidate Detail Modal */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  )
}

// ============================================================================
// TABS
// ============================================================================

function TabButton({ active, onClick, icon, label, count, badge }: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count?: number
  badge?: string | null
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-3",
        active
          ? "border-stage-red text-stage-red bg-red-50"
          : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      )}
    >
      <span className={cn("text-lg", active && "scale-110 transition-transform")}>{icon}</span>
      <span>{label}</span>
      {count !== undefined && (
        <span className={cn(
          "px-2.5 py-0.5 rounded-full text-xs font-bold",
          active ? "bg-stage-red text-white" : "bg-gray-200 text-gray-700"
        )}>
          {count}
        </span>
      )}
      {badge && (
        <span className="text-green-600 font-bold text-lg">{badge}</span>
      )}
    </button>
  )
}

// ============================================================================
// CANDIDATES TAB
// ============================================================================

function CandidatesTab({ candidates, onSelectCandidate, sortBy, onSortChange, filterSegment, onFilterChange }: {
  candidates: NarrativeCandidate[]
  onSelectCandidate: (candidate: NarrativeCandidate) => void
  sortBy: 'rank' | 'production' | 'audience'
  onSortChange: (sort: 'rank' | 'production' | 'audience') => void
  filterSegment: string
  onFilterChange: (segment: string) => void
}) {
  const segments = ['all', 'Drama/Romance', 'Action/Thriller', 'Gen-Z', 'Premium', 'Comedy', 'Sci-Fi', 'Mature']

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <FiFilter className="text-gray-400 text-xl" />
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
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
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-stage-red focus:border-stage-red bg-white text-gray-900"
            >
              {segments.map(seg => (
                <option key={seg} value={seg === 'all' ? 'all' : seg}>
                  {seg === 'all' ? 'All Segments' : seg}
                </option>
              ))}
            </select>
          </div>

          {filterSegment !== 'all' && (
            <button
              onClick={() => onFilterChange('all')}
              className="text-sm text-stage-red hover:text-stage-red-dark font-medium"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Candidate Cards */}
      <div className="space-y-4">
        {candidates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-600 font-medium">No candidates match the selected filters</p>
            <button
              onClick={() => onFilterChange('all')}
              className="mt-3 text-stage-red hover:text-stage-red-dark font-semibold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onClick={() => onSelectCandidate(candidate)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function CandidateCard({ candidate, onClick }: {
  candidate: NarrativeCandidate
  onClick: () => void
}) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600', text: 'text-white', icon: '🥇' }
    if (rank === 2) return { bg: 'bg-gradient-to-br from-gray-300 to-gray-500', text: 'text-white', icon: '🥈' }
    if (rank === 3) return { bg: 'bg-gradient-to-br from-orange-400 to-orange-600', text: 'text-white', icon: '🥉' }
    return { bg: 'bg-gray-600', text: 'text-white', icon: '' }
  }

  const rankBadge = getRankBadge(candidate.rank)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-stage-red hover:shadow-xl transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start gap-6">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <div className={cn("w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold shadow-lg", rankBadge.bg, rankBadge.text)}>
            <span className="text-2xl">{rankBadge.icon}</span>
            <span className="text-xs mt-1">#{candidate.rank}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Angle */}
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-bold shadow-sm">
              {candidate.angle}
            </span>
          </div>

          {/* Narrative Text */}
          <p className="text-gray-900 leading-relaxed mb-4 text-base font-medium">
            {candidate.narrative_text}
          </p>

          {/* Scores */}
          <div className="flex items-center gap-6">
            <ScorePill
              icon={<FiTrendingUp />}
              label="Overall"
              score={candidate.overall_score}
              color="red"
            />
            <ScorePill
              icon={<FiTarget />}
              label="Production"
              score={candidate.production_avg}
              color="green"
            />
            <ScorePill
              icon={<FiUsers />}
              label="Audience"
              score={candidate.audience_avg}
              color="blue"
            />
          </div>
        </div>

        {/* View Details Button */}
        <div className="flex-shrink-0">
          <div className="text-center mb-3">
            <div className="text-4xl font-bold text-gray-900">
              {candidate.overall_score.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 font-medium">SCORE</div>
          </div>
          <button className="w-full px-5 py-2.5 bg-stage-red text-white rounded-lg hover:bg-stage-red-dark transition-all font-semibold flex items-center justify-center gap-2 shadow-md group-hover:shadow-lg">
            View Details
            <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function ScorePill({ icon, label, score, color }: {
  icon: React.ReactNode
  label: string
  score: number
  color: 'red' | 'green' | 'blue'
}) {
  const colors = {
    red: 'bg-red-100 border-red-300 text-red-800',
    green: 'bg-green-100 border-green-300 text-green-800',
    blue: 'bg-blue-100 border-blue-300 text-blue-800',
  }

  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border-2", colors[color])}>
      <span className="text-lg">{icon}</span>
      <div>
        <div className="text-xs font-semibold opacity-75">{label}</div>
        <div className="text-lg font-bold leading-none">{score.toFixed(1)}</div>
      </div>
    </div>
  )
}

// ============================================================================
// CANDIDATE DETAIL MODAL
// ============================================================================

function CandidateDetailModal({ candidate, onClose }: {
  candidate: NarrativeCandidate | null
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    production: true,
    audience: true,
  })

  if (!candidate) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(candidate.narrative_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleSection = (section: 'production' | 'audience') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-stage-red via-red-600 to-red-700 text-white p-6 border-b-4 border-red-800">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-bold text-lg border-2 border-white/30">
                    #{candidate.rank}
                  </div>
                  <div className="text-2xl font-bold">{candidate.angle}</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                    <FiTrendingUp className="text-xl" />
                    <span className="font-bold text-2xl">{candidate.overall_score.toFixed(1)}</span>
                    <span className="text-sm opacity-90">Overall</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                    <FiTarget className="text-xl" />
                    <span className="font-bold text-xl">{candidate.production_avg.toFixed(1)}</span>
                    <span className="text-sm opacity-90">Production</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                    <FiUsers className="text-xl" />
                    <span className="font-bold text-xl">{candidate.audience_avg.toFixed(1)}</span>
                    <span className="text-sm opacity-90">Audience</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <FiX className="w-7 h-7" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            {/* Full Narrative */}
            <div className="mb-6 pb-6 border-b-2 border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-gray-900">Marketing Narrative</h3>
                <button
                  onClick={handleCopy}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-sm",
                    copied
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  )}
                >
                  {copied ? <FiCheck /> : <FiCopy />}
                  {copied ? 'Copied!' : 'Copy Narrative'}
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <p className="text-gray-900 leading-relaxed text-lg font-medium">
                  {candidate.narrative_text}
                </p>
              </div>
            </div>

            {/* Production Council */}
            <CollapsibleSection
              title="Production Council Evaluations"
              icon={<FiTarget className="text-green-600" />}
              count={Object.keys(candidate.production_council).length}
              expanded={expandedSections.production}
              onToggle={() => toggleSection('production')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(candidate.production_council).map(([role, evaluation]: [string, any]) => (
                  <div key={role} className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {PRODUCTION_ROLES[role as keyof typeof PRODUCTION_ROLES]?.icon}
                        </span>
                        <span className="font-bold text-gray-900 text-base">
                          {PRODUCTION_ROLES[role as keyof typeof PRODUCTION_ROLES]?.name}
                        </span>
                      </div>
                      <div className={cn(
                        "px-3 py-1.5 rounded-lg font-bold text-base shadow-sm",
                        evaluation.score >= 7 ? "bg-green-600 text-white" :
                        evaluation.score >= 5 ? "bg-yellow-500 text-white" :
                        "bg-red-600 text-white"
                      )}>
                        {evaluation.score}/10
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed mb-3 font-medium">
                      {evaluation.reasoning}
                    </p>
                    {evaluation.recommendation && (
                      <div className={cn(
                        "inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide",
                        evaluation.recommendation === 'approve' ? "bg-green-200 text-green-900" :
                        evaluation.recommendation === 'revise' ? "bg-yellow-200 text-yellow-900" :
                        "bg-red-200 text-red-900"
                      )}>
                        {evaluation.recommendation}
                      </div>
                    )}
                    {evaluation.concerns && evaluation.concerns.length > 0 && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-orange-200">
                        <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Concerns:</span>
                        <ul className="text-xs text-gray-800 list-disc list-inside mt-1 space-y-1 font-medium">
                          {evaluation.concerns.map((concern: string, idx: number) => (
                            <li key={idx}>{concern}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Audience Personas */}
            <CollapsibleSection
              title="Audience Persona Evaluations"
              icon={<FiUsers className="text-blue-600" />}
              count={Object.keys(candidate.audience_council).length}
              expanded={expandedSections.audience}
              onToggle={() => toggleSection('audience')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(candidate.audience_council).map(([personaId, evaluation]: [string, any]) => {
                  const persona = AUDIENCE_PERSONAS[personaId as keyof typeof AUDIENCE_PERSONAS]
                  return (
                    <div key={personaId} className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-gray-900 text-base">{persona?.name}</div>
                          <div className="text-xs text-gray-700 font-semibold">
                            {persona?.age}yo • {persona?.segment}
                          </div>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-lg font-bold text-sm shadow-sm",
                          evaluation.score >= 7 ? "bg-blue-600 text-white" :
                          evaluation.score >= 5 ? "bg-yellow-500 text-white" :
                          "bg-red-600 text-white"
                        )}>
                          {evaluation.score}/10
                        </div>
                      </div>

                      {evaluation.would_click && (
                        <div className={cn(
                          "inline-block px-2 py-1 rounded text-xs font-bold mb-2 uppercase tracking-wide",
                          evaluation.would_click === 'yes' ? "bg-green-600 text-white" :
                          evaluation.would_click === 'maybe' ? "bg-yellow-500 text-white" :
                          "bg-red-600 text-white"
                        )}>
                          {evaluation.would_click === 'yes' ? '✓ Would Click' :
                           evaluation.would_click === 'maybe' ? '? Maybe' : '✗ Won\'t Click'}
                        </div>
                      )}

                      {(evaluation.impression || evaluation.reasoning) && (
                        <p className="text-xs text-gray-800 leading-relaxed font-medium">
                          {evaluation.impression || evaluation.reasoning}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </CollapsibleSection>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-200 p-5 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="px-6 py-2.5 bg-stage-red text-white rounded-lg hover:bg-stage-red-dark transition-colors font-semibold shadow-md flex items-center gap-2"
            >
              {copied ? <FiCheck /> : <FiCopy />}
              {copied ? 'Copied!' : 'Copy Narrative'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function CollapsibleSection({ title, icon, count, expanded, onToggle, children }: {
  title: string
  icon: React.ReactNode
  count: number
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="mb-6">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors mb-4 border-2 border-gray-200"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <span className="px-2 py-0.5 bg-gray-300 text-gray-800 rounded-full text-xs font-bold">
            {count}
          </span>
        </div>
        {expanded ? <FiChevronUp className="text-xl" /> : <FiChevronDown className="text-xl" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// COUNCIL TAB
// ============================================================================

function CouncilTab({ conversation }: { conversation: any }) {
  // Check if conversation exists and has the conversation array
  if (!conversation || !conversation.conversation || conversation.conversation.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
        <FiMessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold text-lg">No council discussion available.</p>
        <p className="text-gray-500 text-sm mt-2">The brainstorming conversation wasn't recorded for this session.</p>
      </div>
    )
  }

  const messages = conversation.conversation
  const insights = conversation.meeting_insights || []

  return (
    <div>
      {/* Header */}
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">🗣️ Council Brainstorming Session</h3>
        <p className="text-gray-700 font-medium mb-3">
          Watch how the production council discussed and created these narrative candidates together.
        </p>
        <div className="flex items-center gap-4 text-sm">
          <span className="px-3 py-1 bg-white rounded-lg font-semibold text-purple-700 border border-purple-200">
            {messages.length} messages
          </span>
          {insights.length > 0 && (
            <span className="px-3 py-1 bg-white rounded-lg font-semibold text-indigo-700 border border-indigo-200">
              {insights.length} key insights
            </span>
          )}
        </div>
      </div>

      {/* Meeting Insights */}
      {insights.length > 0 && (
        <div className="mb-6 bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
          <h4 className="text-lg font-bold text-gray-900 mb-3">💡 Meeting Insights</h4>
          <ul className="space-y-2">
            {insights.map((insight: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-gray-800 font-medium">
                <span className="text-blue-600 font-bold">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Conversation Messages */}
      <div className="space-y-4">
        {messages.map((message: any, idx: number) => {
          // Map speaker names to roles
          const roleKey = message.speaker
            ?.toLowerCase()
            .replace(/\s+/g, '_')
            .replace('content_head', 'content_head')
            .replace('content_manager', 'content_manager')
            .replace('marketing_manager', 'marketing_manager')
            .replace('creative_director', 'promo_producer')
            .replace('acquisition_lead', 'poster_designer')
            .replace('brand_manager', 'trailer_designer')

          // Get role info or use defaults
          const roleInfo = PRODUCTION_ROLES[roleKey as keyof typeof PRODUCTION_ROLES]

          // Phase color coding
          const phaseColors = {
            understanding: 'border-blue-300 bg-blue-50',
            ideation: 'border-green-300 bg-green-50',
            refinement: 'border-yellow-300 bg-yellow-50',
            finalization: 'border-purple-300 bg-purple-50',
          }
          const phaseColor = phaseColors[message.phase as keyof typeof phaseColors] || 'border-gray-200 bg-white'

          return (
            <div
              key={idx}
              className={cn(
                "rounded-xl p-5 border-2 shadow-sm hover:shadow-md transition-shadow",
                phaseColor
              )}
            >
              <div className="flex items-start justify-between mb-3 pb-3 border-b-2 border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {roleInfo?.icon || '💬'}
                  </span>
                  <div>
                    <span className="font-bold text-gray-900 text-base">
                      {message.speaker || 'Council Member'}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">Message #{idx + 1}</span>
                      {message.phase && (
                        <span className="px-2 py-0.5 bg-white rounded text-xs font-semibold text-gray-700 border border-gray-300">
                          {message.phase}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                {message.message}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// INSIGHTS TAB
// ============================================================================

function InsightsTab({ candidates }: { candidates: NarrativeCandidate[] }) {
  // Find best by segment
  const segmentBest: Record<string, { candidate: NarrativeCandidate, score: number }> = {}

  Object.entries(AUDIENCE_PERSONAS).forEach(([personaId, persona]) => {
    let bestScore = 0
    let bestCandidate = candidates[0]

    candidates.forEach(candidate => {
      const evaluation = candidate.audience_council[personaId]
      if (evaluation && evaluation.score > bestScore) {
        bestScore = evaluation.score
        bestCandidate = candidate
      }
    })

    segmentBest[persona.segment] = { candidate: bestCandidate, score: bestScore }
  })

  // Calculate variance for mass appeal
  const candidatesWithVariance = candidates.map(candidate => {
    const scores = Object.values(candidate.audience_council).map((e: any) => e.score)
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length
    return { candidate, variance, avgScore: avg }
  })

  const massAppeal = candidatesWithVariance.sort((a, b) => a.variance - b.variance)[0]
  const polarizing = candidatesWithVariance.sort((a, b) => b.variance - a.variance)[0]

  // Prepare chart data
  const chartData = candidates.slice(0, 5).map((c, idx) => ({
    name: `#${c.rank}`,
    score: c.overall_score,
    production: c.production_avg,
    audience: c.audience_avg,
  }))

  return (
    <div className="space-y-6">
      {/* Top 5 Chart */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Top 5 Candidates Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="#374151" />
            <YAxis domain={[0, 10]} stroke="#374151" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontWeight: 600
              }}
            />
            <Bar dataKey="score" fill="#E63946" name="Overall" radius={[8, 8, 0, 0]} />
            <Bar dataKey="production" fill="#2A9D8F" name="Production" radius={[8, 8, 0, 0]} />
            <Bar dataKey="audience" fill="#457B9D" name="Audience" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mass Appeal */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FiUsers className="text-green-600 text-2xl" />
          Mass Appeal Winner
        </h3>
        <p className="text-sm text-gray-700 mb-4 font-semibold">
          Most consistent scores across all audience segments • Variance: {massAppeal.variance.toFixed(2)}
        </p>
        <div className="bg-white rounded-xl p-5 border-2 border-green-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-4 py-2 bg-yellow-500 text-white font-bold rounded-lg text-lg shadow-md">
              #{massAppeal.candidate.rank}
            </span>
            <span className="font-bold text-gray-900 text-lg">{massAppeal.candidate.angle}</span>
          </div>
          <p className="text-gray-800 leading-relaxed font-medium">{massAppeal.candidate.narrative_text}</p>
        </div>
      </div>

      {/* Best by Segment */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Best by Audience Segment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(segmentBest).map(([segment, data]) => (
            <div key={segment} className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 hover:border-blue-400 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="font-bold text-gray-900 text-base">{segment}</div>
                <div className="text-base font-bold text-blue-700">
                  {data.score.toFixed(1)}/10
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-800 font-semibold">
                <span className="px-2.5 py-1 bg-white rounded-lg font-bold border-2 border-blue-200">
                  #{data.candidate.rank}
                </span>
                <span className="line-clamp-1">{data.candidate.angle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Polarizing */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-300 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FiTrendingUp className="text-orange-600 text-2xl" />
          Most Polarizing Narrative
        </h3>
        <p className="text-sm text-gray-700 mb-4 font-semibold">
          Highest variance in audience opinions • Variance: {polarizing.variance.toFixed(2)} • Strong reactions both ways
        </p>
        <div className="bg-white rounded-xl p-5 border-2 border-orange-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-4 py-2 bg-gray-600 text-white font-bold rounded-lg text-lg shadow-md">
              #{polarizing.candidate.rank}
            </span>
            <span className="font-bold text-gray-900 text-lg">{polarizing.candidate.angle}</span>
          </div>
          <p className="text-gray-800 leading-relaxed font-medium">{polarizing.candidate.narrative_text}</p>
        </div>
      </div>
    </div>
  )
}
