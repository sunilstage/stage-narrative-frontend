'use client'

/**
 * Narrative Filmstrip
 * Horizontal thumbnail navigation showing all narratives
 */

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import type { NarrativeCandidate } from '@/lib/types'

interface NarrativeFilmstripProps {
  narratives: NarrativeCandidate[]
  activeId: number
  onSelect: (id: number) => void
}

export default function NarrativeFilmstrip({
  narratives,
  activeId,
  onSelect
}: NarrativeFilmstripProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Scroll active narrative into view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector('[data-active="true"]')
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [activeId])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: 'from-yellow-400 to-yellow-600', icon: '🥇', text: 'text-yellow-900' }
    if (rank === 2) return { bg: 'from-gray-300 to-gray-500', icon: '🥈', text: 'text-gray-900' }
    if (rank === 3) return { bg: 'from-orange-400 to-orange-600', icon: '🥉', text: 'text-orange-900' }
    return { bg: 'from-gray-500 to-gray-700', icon: '', text: 'text-white' }
  }

  const getConflictTypeColor = (angle: string) => {
    const angleLower = angle.toLowerCase()
    if (angleLower.includes('internal')) return 'bg-purple-600'
    if (angleLower.includes('external')) return 'bg-blue-600'
    if (angleLower.includes('relational')) return 'bg-pink-600'
    if (angleLower.includes('societal')) return 'bg-orange-600'
    return 'bg-purple-600'
  }

  return (
    <div className="relative bg-white rounded-xl border-2 border-gray-200 shadow-md">
      <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-gray-200">
        <span className="text-sm font-bold text-gray-900">NARRATIVE NAVIGATION</span>
        <span className="px-2 py-0.5 bg-stage-red text-white rounded text-xs font-bold">
          {narratives.length}
        </span>
      </div>

      <div className="relative">
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-stage-red transition-colors border-2 border-gray-300"
          aria-label="Scroll left"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-stage-red transition-colors border-2 border-gray-300"
          aria-label="Scroll right"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>

        {/* Filmstrip Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-12 py-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {narratives.map((narrative) => {
            const isActive = narrative.id === activeId
            const badge = getRankBadge(narrative.rank)

            return (
              <motion.button
                key={narrative.id}
                onClick={() => onSelect(narrative.id)}
                data-active={isActive}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex-shrink-0 w-48 rounded-lg border-2 transition-all overflow-hidden",
                  isActive
                    ? "border-stage-red shadow-lg ring-2 ring-stage-red ring-offset-2"
                    : "border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
                )}
              >
                {/* Rank Badge */}
                <div className={cn(
                  "h-12 bg-gradient-to-br flex items-center justify-center gap-2 border-b-2 border-gray-300",
                  badge.bg
                )}>
                  <span className="text-2xl">{badge.icon}</span>
                  <span className={cn("text-sm font-bold", badge.text)}>
                    #{narrative.rank}
                  </span>
                </div>

                {/* Content */}
                <div className="p-3 bg-white">
                  <div className={cn(
                    "px-2 py-1 rounded text-xs font-bold text-white mb-2 truncate",
                    getConflictTypeColor(narrative.angle)
                  )}>
                    {narrative.angle}
                  </div>

                  <p className="text-xs text-gray-700 leading-tight line-clamp-3 font-medium mb-2">
                    {narrative.narrative_text}
                  </p>

                  {/* Scores */}
                  <div className="flex items-center justify-between gap-1 pt-2 border-t border-gray-200">
                    <div className="text-center flex-1">
                      <div className={cn(
                        "text-xs font-bold",
                        narrative.overall_score >= 8 ? "text-green-700" :
                        narrative.overall_score >= 7 ? "text-yellow-700" :
                        "text-red-700"
                      )}>
                        {narrative.overall_score.toFixed(1)}
                      </div>
                      <div className="text-[9px] text-gray-500 uppercase">Overall</div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-xs font-bold text-green-700">
                        {narrative.production_avg.toFixed(1)}
                      </div>
                      <div className="text-[9px] text-gray-500 uppercase">Prod</div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-xs font-bold text-blue-700">
                        {narrative.audience_avg.toFixed(1)}
                      </div>
                      <div className="text-[9px] text-gray-500 uppercase">Aud</div>
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
