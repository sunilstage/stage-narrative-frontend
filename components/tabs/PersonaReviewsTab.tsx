'use client'

/**
 * Persona Reviews Tab
 * Shows each persona's perspective on all narratives
 * - Best/worst picks per persona
 * - Detailed evaluations for all 10 narratives
 */

import { useState } from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { AUDIENCE_PERSONAS } from '@/lib/types'
import type { NarrativeCandidate } from '@/lib/types'

export default function PersonaReviewsTab({ candidates }: {
  candidates: NarrativeCandidate[]
}) {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
        <p className="text-gray-600 font-semibold text-lg">No narratives available</p>
        <p className="text-gray-500 text-sm mt-2">Generate narratives to see persona reviews</p>
      </div>
    )
  }

  // Get all unique persona IDs from the candidates
  const personaIds = Array.from(
    new Set(
      candidates.flatMap(c => Object.keys(c.audience_council))
    )
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">👥 Persona-Wise Evaluation</h2>
        <p className="text-gray-700 font-medium mb-4">
          See how each audience persona rated all {candidates.length} narrative candidates
        </p>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1.5 bg-white rounded-lg font-semibold text-blue-700 border-2 border-blue-200 text-sm">
            {personaIds.length} personas
          </span>
          <span className="px-3 py-1.5 bg-white rounded-lg font-semibold text-indigo-700 border-2 border-indigo-200 text-sm">
            {candidates.length} narratives evaluated
          </span>
        </div>
      </div>

      {/* Persona Cards */}
      <div className="space-y-6">
        {personaIds.map(personaId => {
          const persona = AUDIENCE_PERSONAS[personaId as keyof typeof AUDIENCE_PERSONAS]
          if (!persona) return null

          return (
            <PersonaCard
              key={personaId}
              personaId={personaId}
              persona={persona}
              candidates={candidates}
            />
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// Persona Card
// ============================================================================

function PersonaCard({ personaId, persona, candidates }: {
  personaId: string
  persona: any
  candidates: NarrativeCandidate[]
}) {
  const [expanded, setExpanded] = useState(false)

  // Get all evaluations for this persona
  const evaluations = candidates.map(candidate => ({
    candidate,
    evaluation: candidate.audience_council[personaId]
  })).filter(item => item.evaluation)

  // Sort by score to find best/worst
  const sortedByScore = [...evaluations].sort((a, b) =>
    b.evaluation.score - a.evaluation.score
  )

  const bestPicks = sortedByScore.slice(0, 3)
  const worstPicks = sortedByScore.slice(-3).reverse()
  const avgScore = evaluations.reduce((sum, item) => sum + item.evaluation.score, 0) / evaluations.length

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-5 border-b-4 border-blue-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-2xl font-bold">{persona.name}</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 bg-white/20 rounded-lg text-sm font-semibold border border-white/30">
                {persona.age}yo
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-lg text-sm font-semibold border border-white/30">
                {persona.segment}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-lg text-sm font-semibold border border-white/30">
                Avg: {avgScore.toFixed(1)}/10
              </span>
            </div>
          </div>
        </div>
        {persona.description && (
          <p className="text-blue-50 text-sm leading-relaxed">{persona.description}</p>
        )}
      </div>

      {/* Best/Worst Picks Summary */}
      <div className="p-5 border-b-2 border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          {/* Best Picks */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">🌟</span>
              Top Picks
            </h4>
            <div className="space-y-2">
              {bestPicks.map((item, idx) => (
                <div key={item.candidate.id} className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-green-700">#{item.candidate.rank}</span>
                    <span className="px-2 py-0.5 bg-green-600 text-white rounded font-bold text-xs">
                      {item.evaluation.score}/10
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 font-medium line-clamp-2 mb-2">
                    {item.candidate.narrative_text}
                  </p>
                  {(() => {
                    const comment = item.evaluation.impression || item.evaluation.reasoning ||
                                   item.evaluation.why || item.evaluation.the_real_talk ||
                                   item.evaluation.refined_assessment || item.evaluation.parent_perspective ||
                                   item.evaluation.arjun_thoughts || item.evaluation.rohan_reaction ||
                                   item.evaluation.mature_perspective;
                    return comment ? (
                      <p className="text-xs text-green-900 italic leading-relaxed border-t border-green-300 pt-2">
                        💭 "{comment}"
                      </p>
                    ) : null;
                  })()}
                </div>
              ))}
            </div>
          </div>

          {/* Worst Picks */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              Least Favorite
            </h4>
            <div className="space-y-2">
              {worstPicks.map((item, idx) => (
                <div key={item.candidate.id} className="bg-red-50 rounded-lg p-3 border-2 border-red-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-red-700">#{item.candidate.rank}</span>
                    <span className="px-2 py-0.5 bg-red-600 text-white rounded font-bold text-xs">
                      {item.evaluation.score}/10
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 font-medium line-clamp-2 mb-2">
                    {item.candidate.narrative_text}
                  </p>
                  {(() => {
                    const comment = item.evaluation.impression || item.evaluation.reasoning ||
                                   item.evaluation.why || item.evaluation.the_real_talk ||
                                   item.evaluation.refined_assessment || item.evaluation.parent_perspective ||
                                   item.evaluation.arjun_thoughts || item.evaluation.rohan_reaction ||
                                   item.evaluation.mature_perspective;
                    return comment ? (
                      <p className="text-xs text-red-900 italic leading-relaxed border-t border-red-300 pt-2">
                        💭 "{comment}"
                      </p>
                    ) : null;
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expand/Collapse for Full Reviews */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors border-b-2 border-gray-200"
      >
        <span className="font-bold text-gray-900">
          View All {evaluations.length} Detailed Reviews
        </span>
        {expanded ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {/* Full Reviews */}
      {expanded && (
        <div className="p-5 bg-gray-50">
          <div className="grid grid-cols-1 gap-4">
            {evaluations.map((item, idx) => (
              <div key={item.candidate.id} className="bg-white rounded-lg p-4 border-2 border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-lg flex items-center justify-center font-bold shadow-sm">
                      #{item.candidate.rank}
                    </div>
                    <div>
                      <div className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-bold inline-block">
                        {item.candidate.angle}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "px-3 py-1.5 rounded-lg font-bold shadow-sm",
                      item.evaluation.score >= 7 ? "bg-green-600 text-white" :
                      item.evaluation.score >= 5 ? "bg-yellow-500 text-white" :
                      "bg-red-600 text-white"
                    )}>
                      {item.evaluation.score}/10
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-900 font-medium mb-3 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {item.candidate.narrative_text}
                </p>

                {item.evaluation.would_click && (
                  <div className="mb-3">
                    <span className={cn(
                      "inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase",
                      item.evaluation.would_click === 'yes' ? "bg-green-600 text-white" :
                      item.evaluation.would_click === 'maybe' ? "bg-yellow-500 text-white" :
                      "bg-red-600 text-white"
                    )}>
                      {item.evaluation.would_click === 'yes' ? '✓ Would Click' :
                       item.evaluation.would_click === 'maybe' ? '? Maybe' : '✗ Won\'t Click'}
                    </span>
                  </div>
                )}

                {(() => {
                  const comment = item.evaluation.impression || item.evaluation.reasoning ||
                                 item.evaluation.why || item.evaluation.the_real_talk ||
                                 item.evaluation.refined_assessment || item.evaluation.parent_perspective ||
                                 item.evaluation.arjun_thoughts || item.evaluation.rohan_reaction ||
                                 item.evaluation.mature_perspective;
                  return comment ? (
                    <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
                      <p className="text-sm text-gray-800 leading-relaxed font-medium">
                        💭 {comment}
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
