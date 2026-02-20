'use client'

/**
 * Stakeholder Input Drawer
 * Collapsible drawer showing stakeholder Q&A responses
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FiChevronDown, FiChevronUp, FiUsers } from 'react-icons/fi'

interface StakeholderInputDrawerProps {
  stakeholderResponses: Record<string, any>
  defaultExpanded?: boolean
}

export default function StakeholderInputDrawer({
  stakeholderResponses,
  defaultExpanded = false
}: StakeholderInputDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  if (!stakeholderResponses || Object.keys(stakeholderResponses).length === 0) {
    return null
  }

  const responseCount = Object.keys(stakeholderResponses).length

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 overflow-hidden shadow-md">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-blue-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <FiUsers className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900">
              Stakeholder Strategic Input
            </h3>
            <p className="text-sm text-gray-700">
              {responseCount} {responseCount === 1 ? 'stakeholder' : 'stakeholders'} interviewed
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiChevronDown className="w-6 h-6 text-gray-700" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t-2 border-blue-200"
          >
            <div className="p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(stakeholderResponses).map(([role, responses]: [string, any]) => {
                  const roleLabel = role
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase())

                  // Get key responses to show (filter out additional_ fields and take first 4)
                  const keyResponses = Object.entries(responses as Record<string, any>)
                    .filter(([key]) => !key.startsWith('additional_'))
                    .slice(0, 4)

                  return (
                    <div
                      key={role}
                      className="bg-gradient-to-br from-white to-blue-50 rounded-lg p-4 border-2 border-blue-200"
                    >
                      <div className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
                        <span className="text-blue-600 text-xl">👤</span>
                        {roleLabel}
                      </div>

                      <div className="space-y-3">
                        {keyResponses.map(([key, value]) => {
                          if (!value || typeof value !== 'string') return null

                          const questionLabel = key
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, l => l.toUpperCase())

                          return (
                            <div key={key} className="text-sm">
                              <div className="text-blue-800 font-bold mb-1 text-xs uppercase tracking-wide">
                                {questionLabel}
                              </div>
                              <div className="text-gray-900 leading-relaxed bg-white rounded p-2 border border-blue-200">
                                {value.length > 150 ? value.substring(0, 150) + '...' : value}
                              </div>
                            </div>
                          )
                        })}

                        {Object.keys(responses).length > 4 && (
                          <div className="text-xs text-gray-600 italic pt-2 border-t border-blue-200">
                            +{Object.keys(responses).length - 4} more responses
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
