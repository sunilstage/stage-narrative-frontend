'use client'

/**
 * Narrative Card
 * Full-width card showing a single narrative with expandable sections
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  FiCopy, FiCheck, FiBookmark, FiShare2, FiEdit2,
  FiChevronDown, FiChevronUp, FiMessageSquare, FiUsers
} from 'react-icons/fi'
import type { NarrativeCandidate } from '@/lib/types'
import { PRODUCTION_ROLES, AUDIENCE_PERSONAS } from '@/lib/types'

interface NarrativeCardProps {
  narrative: NarrativeCandidate
  onBookmark?: (id: string) => void  // MongoDB ObjectId
  isBookmarked?: boolean
}

export default function NarrativeCard({
  narrative,
  onBookmark,
  isBookmarked = false
}: NarrativeCardProps) {
  const [copied, setCopied] = useState(false)
  const [showCouncil, setShowCouncil] = useState(false)
  const [showPersonas, setShowPersonas] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(narrative.narrative_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: narrative.angle,
        text: narrative.narrative_text
      })
    } else {
      handleCopy()
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { gradient: 'from-yellow-400 to-yellow-600', icon: '🥇', shadow: 'shadow-yellow-300' }
    if (rank === 2) return { gradient: 'from-gray-300 to-gray-500', icon: '🥈', shadow: 'shadow-gray-300' }
    if (rank === 3) return { gradient: 'from-orange-400 to-orange-600', icon: '🥉', shadow: 'shadow-orange-300' }
    return { gradient: 'from-gray-500 to-gray-700', icon: '', shadow: 'shadow-gray-300' }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return { bg: 'bg-green-600', text: 'text-green-900', bar: 'bg-green-600' }
    if (score >= 7) return { bg: 'bg-yellow-500', text: 'text-yellow-900', bar: 'bg-yellow-500' }
    return { bg: 'bg-red-600', text: 'text-red-900', bar: 'bg-red-600' }
  }

  const badge = getRankBadge(narrative.rank)
  const overallColor = getScoreColor(narrative.overall_score)
  const productionColor = getScoreColor(narrative.production_avg)
  const audienceColor = getScoreColor(narrative.audience_avg)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden"
    >
      {/* Header with Scores */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-8 border-b-2 border-gray-200">
        {/* Rank and Title */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-16 h-16 rounded-xl bg-gradient-to-br flex flex-col items-center justify-center shadow-lg",
              badge.gradient,
              badge.shadow
            )}>
              <span className="text-3xl">{badge.icon}</span>
              <span className="text-xs font-bold text-white">#{narrative.rank}</span>
            </div>
            <div>
              <div className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-bold text-sm mb-2 inline-block">
                {narrative.angle}
              </div>
              {narrative.generation_type && (
                <div className={cn(
                  "px-3 py-1 rounded text-xs font-bold inline-block ml-2",
                  narrative.generation_type === 'ai_human'
                    ? "bg-gradient-to-r from-blue-500 to-green-500 text-white"
                    : "bg-gray-500 text-white"
                )}>
                  {narrative.generation_type === 'ai_human' ? '🤝 AI+Human' : '🤖 AI-Only'}
                </div>
              )}
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBookmark?.(narrative.id)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isBookmarked
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
              title="Bookmark"
            >
              <FiBookmark className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Share"
            >
              <FiShare2 className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Edit"
            >
              <FiEdit2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Large Visual Scores */}
        <div className="grid grid-cols-3 gap-4">
          {/* Overall Score */}
          <div className="text-center">
            <div className={cn("text-5xl font-bold mb-2", overallColor.text)}>
              {narrative.overall_score.toFixed(1)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", overallColor.bar)}
                style={{ width: `${(narrative.overall_score / 10) * 100}%` }}
              />
            </div>
            <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Overall Score
            </div>
          </div>

          {/* Production Score */}
          <div className="text-center">
            <div className={cn("text-5xl font-bold mb-2", productionColor.text)}>
              {narrative.production_avg.toFixed(1)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", productionColor.bar)}
                style={{ width: `${(narrative.production_avg / 10) * 100}%` }}
              />
            </div>
            <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Production Council
            </div>
          </div>

          {/* Audience Score */}
          <div className="text-center">
            <div className={cn("text-5xl font-bold mb-2", audienceColor.text)}>
              {narrative.audience_avg.toFixed(1)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", audienceColor.bar)}
                style={{ width: `${(narrative.audience_avg / 10) * 100}%` }}
              />
            </div>
            <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Audience Response
            </div>
          </div>
        </div>
      </div>

      {/* Narrative Text */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
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
            {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <p className="text-gray-900 text-lg leading-relaxed font-medium">
            {narrative.narrative_text}
          </p>
        </div>
      </div>

      {/* Expandable Council Discussion Section */}
      <div className="border-t-2 border-gray-200">
        <button
          onClick={() => setShowCouncil(!showCouncil)}
          className="w-full px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FiMessageSquare className="w-6 h-6 text-green-600" />
            <span className="font-bold text-gray-900 text-lg">Production Council Discussion</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-bold">
              {Object.keys(narrative.production_council).length} evaluations
            </span>
          </div>
          <motion.div
            animate={{ rotate: showCouncil ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <FiChevronDown className="w-6 h-6 text-gray-600" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showCouncil && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-8 pb-6">
                <CouncilDiscussionSection productionCouncil={narrative.production_council} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expandable Persona Reviews Section */}
      <div className="border-t-2 border-gray-200">
        <button
          onClick={() => setShowPersonas(!showPersonas)}
          className="w-full px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FiUsers className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-gray-900 text-lg">Audience Persona Reviews</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-bold">
              {Object.keys(narrative.audience_council).length} personas
            </span>
          </div>
          <motion.div
            animate={{ rotate: showPersonas ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <FiChevronDown className="w-6 h-6 text-gray-600" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showPersonas && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-8 pb-6">
                <PersonaReviewsSection audienceCouncil={narrative.audience_council} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Council Discussion Section Component
function CouncilDiscussionSection({ productionCouncil }: { productionCouncil: Record<string, any> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(productionCouncil).map(([roleId, evaluation]) => {
        const role = PRODUCTION_ROLES[roleId as keyof typeof PRODUCTION_ROLES]
        if (!role) return null

        return (
          <div key={roleId} className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{role.icon}</span>
                <span className="font-bold text-gray-900">{role.name}</span>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-lg font-bold text-lg shadow-sm",
                evaluation.score >= 8 ? "bg-green-600 text-white" :
                evaluation.score >= 7 ? "bg-yellow-500 text-white" :
                "bg-red-600 text-white"
              )}>
                {evaluation.score}/10
              </div>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed mb-2">
              {evaluation.reasoning}
            </p>
            {evaluation.recommendation && (
              <div className={cn(
                "inline-block px-2 py-1 rounded text-xs font-bold uppercase",
                evaluation.recommendation === 'approve' ? "bg-green-600 text-white" :
                evaluation.recommendation === 'revise' ? "bg-yellow-500 text-white" :
                "bg-red-600 text-white"
              )}>
                {evaluation.recommendation}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Persona Reviews Section Component
function PersonaReviewsSection({ audienceCouncil }: { audienceCouncil: Record<string, any> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(audienceCouncil).map(([personaId, evaluation]) => {
        const persona = AUDIENCE_PERSONAS[personaId as keyof typeof AUDIENCE_PERSONAS]
        if (!persona) return null

        return (
          <div key={personaId} className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-bold text-gray-900">{persona.name}</div>
                <div className="text-xs text-gray-700 font-semibold">
                  {persona.age}yo • {persona.segment}
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

            <p className="text-xs text-gray-800 leading-relaxed font-medium">
              {evaluation.impression || evaluation.reasoning || evaluation.why || 'No detailed feedback'}
            </p>
          </div>
        )
      })}
    </div>
  )
}
