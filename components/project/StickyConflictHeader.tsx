'use client'

/**
 * Sticky Conflict Header
 * Expands/collapses on scroll, showing primary conflict and story context
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

interface StickyConflictHeaderProps {
  conflict: {
    statement: string
    type?: string
    why_this_is_primary?: string
    marketing_angle?: string
  }
  themes?: string[]
  characterArcs?: Array<{ name: string; journey: string }>
  contentAnalysis?: any
}

export default function StickyConflictHeader({
  conflict,
  themes = [],
  characterArcs = [],
  contentAnalysis
}: StickyConflictHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Collapse header after scrolling 200px
      if (window.scrollY > 200 && !isCollapsed) {
        setIsCollapsed(true)
        setIsExpanded(false)
      } else if (window.scrollY <= 200 && isCollapsed) {
        setIsCollapsed(false)
        setIsExpanded(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isCollapsed])

  // Determine conflict type color
  const getConflictColor = (type?: string) => {
    if (!type) return 'from-purple-600 to-purple-800'

    const typeMap: Record<string, string> = {
      'internal': 'from-purple-600 to-indigo-800',
      'external': 'from-blue-600 to-cyan-800',
      'relational': 'from-pink-600 to-rose-800',
      'societal': 'from-orange-600 to-red-800',
      'existential': 'from-gray-700 to-slate-900',
    }

    return typeMap[type.toLowerCase()] || 'from-purple-600 to-purple-800'
  }

  return (
    <motion.div
      className={cn(
        "sticky top-0 z-30 bg-gradient-to-r shadow-lg transition-all duration-300",
        getConflictColor(conflict.type),
        isCollapsed ? 'h-12' : 'h-20'
      )}
      initial={false}
      animate={{ height: isCollapsed ? '48px' : '80px' }}
    >
      <div className="max-w-7xl mx-auto px-6 h-full">
        {/* Collapsed State */}
        <AnimatePresence>
          {isCollapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full h-12 text-white"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="px-2 py-1 bg-white/20 rounded text-xs font-bold border border-white/30">
                  {conflict.type || 'PRIMARY CONFLICT'}
                </span>
                <p className="text-sm font-bold truncate italic">
                  "{conflict.statement}"
                </p>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <FiChevronDown className="w-5 h-5 flex-shrink-0" />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Expanded State */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-20 flex items-center"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 bg-white/20 rounded text-xs font-bold text-white border border-white/30 uppercase">
                    {conflict.type || 'Primary Conflict'}
                  </span>
                  <span className="text-xs text-white/80">Marketing Anchor</span>
                </div>
                <p className="text-white font-bold text-lg leading-tight truncate italic">
                  "{conflict.statement}"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded Dropdown Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute left-0 right-0 top-full bg-white shadow-2xl border-t-4 border-purple-600 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Primary Conflict Details */}
                  <div className="md:col-span-3 bg-purple-50 rounded-xl p-5 border-2 border-purple-200 mb-2">
                    <h3 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <span className="text-xl">⭐</span>
                      PRIMARY CONFLICT
                    </h3>
                    <p className="text-gray-900 font-bold text-base leading-relaxed italic mb-3">
                      "{conflict.statement}"
                    </p>
                    {conflict.marketing_angle && (
                      <div className="bg-white rounded-lg p-3 border-2 border-purple-300">
                        <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                          Marketing Angle:
                        </span>
                        <p className="text-gray-800 text-sm mt-1">{conflict.marketing_angle}</p>
                      </div>
                    )}
                  </div>

                  {/* Themes */}
                  {themes.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-lg">🎭</span>
                        THEMES
                      </h3>
                      <div className="space-y-2">
                        {themes.slice(0, 4).map((theme, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-1.5 bg-white rounded-lg text-sm font-semibold text-blue-900 border border-blue-300"
                          >
                            {theme}
                          </div>
                        ))}
                        {themes.length > 4 && (
                          <p className="text-xs text-gray-600 mt-2">
                            +{themes.length - 4} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Character Arcs */}
                  {characterArcs.length > 0 && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-lg">👥</span>
                        CHARACTER ARCS
                      </h3>
                      <div className="space-y-3">
                        {characterArcs.slice(0, 2).map((char, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-green-300">
                            <div className="font-bold text-gray-900 text-xs mb-1">{char.name}</div>
                            <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                              {char.journey}
                            </p>
                          </div>
                        ))}
                        {characterArcs.length > 2 && (
                          <p className="text-xs text-gray-600">
                            +{characterArcs.length - 2} more characters
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Content Highlights */}
                  {contentAnalysis?.logline && (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-200">
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-lg">✨</span>
                        LOGLINE
                      </h3>
                      <p className="text-sm text-gray-800 leading-relaxed italic font-medium">
                        "{contentAnalysis.logline}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-semibold text-sm transition-colors"
                  >
                    <FiChevronUp className="w-4 h-4" />
                    Collapse
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
