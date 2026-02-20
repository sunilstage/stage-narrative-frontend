'use client'

/**
 * Project Overview Tab
 * Shows content analysis and project metrics with progressive disclosure
 */

import { useState } from 'react'
import Link from 'next/link'
import { FiFilm, FiClock, FiUsers, FiCalendar, FiCheckCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProjectOverviewTab({ content, sessions, compact = false }: {
  content: any
  sessions: any[]
  compact?: boolean
}) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['conflict']))
  const contentAnalysis = content.content_analysis
  const stakeholderResponses = content.stakeholder_responses

  const completedSessions = sessions.filter(s => s.status === 'complete')

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <div className="space-y-6">
      {/* Stakeholder Strategic Input - Now uses StakeholderInputDrawer component in main page */}
      {!compact && stakeholderResponses && (
        <CollapsibleSection
          title="Stakeholder Strategic Input"
          icon="🤝"
          isExpanded={expandedSections.has('stakeholder')}
          onToggle={() => toggleSection('stakeholder')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(stakeholderResponses).map(([role, responses]: [string, any]) => {
              const roleLabel = role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              // Get a few key responses to show
              const keyResponses = Object.entries(responses as Record<string, any>)
                .filter(([key]) => !key.startsWith('additional_'))
                .slice(0, 3)

              return (
                <div key={role} className="bg-white rounded-lg p-4 border-2 border-gray-200">
                  <div className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
                    <span className="text-blue-600">👤</span>
                    {roleLabel}
                  </div>
                  <div className="space-y-2">
                    {keyResponses.map(([key, value]) => {
                      if (!value || typeof value !== 'string') return null
                      return (
                        <div key={key} className="text-xs">
                          <span className="text-gray-600 font-semibold">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                          </span>
                          <span className="text-gray-800 ml-1">
                            {value.length > 80 ? value.substring(0, 80) + '...' : value}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Story Architect Conflict Analysis */}
      {contentAnalysis && (contentAnalysis.conflicts_identified || contentAnalysis.primary_conflict) && (
        <CollapsibleSection
          title="Story Architect: Conflict Analysis"
          icon="🎭"
          isExpanded={expandedSections.has('conflict')}
          onToggle={() => toggleSection('conflict')}
          defaultExpanded={true}
        >
          <div className="space-y-4">

            {/* Primary Conflict */}
            {contentAnalysis.primary_conflict && (
              <div className="bg-white rounded-lg border-2 border-purple-300 p-6 mb-4">
              <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                PRIMARY CONFLICT (Marketing Anchor)
              </h3>
              <div className="bg-purple-50 rounded-lg p-4 mb-4 border-2 border-purple-200">
                <p className="text-gray-900 font-bold text-lg leading-relaxed italic">
                  "{contentAnalysis.primary_conflict.statement}"
                </p>
              </div>
              {contentAnalysis.primary_conflict.why_this_is_primary && (
                <div className="mb-3">
                  <span className="text-sm font-bold text-gray-700">Why This is Primary:</span>
                  <p className="text-gray-800 mt-1">{contentAnalysis.primary_conflict.why_this_is_primary}</p>
                </div>
              )}
              {contentAnalysis.primary_conflict.marketing_angle && (
                <div>
                  <span className="text-sm font-bold text-gray-700">Marketing Angle:</span>
                  <p className="text-gray-800 mt-1">{contentAnalysis.primary_conflict.marketing_angle}</p>
                </div>
              )}
            </div>
          )}

          {/* All Conflicts Identified */}
          {contentAnalysis.conflicts_identified && contentAnalysis.conflicts_identified.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                All Conflicts Identified ({contentAnalysis.conflicts_identified.length})
              </h3>
              <div className="space-y-3">
                {contentAnalysis.conflicts_identified.map((conflict: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded font-bold text-xs">
                        {conflict.conflict_id || `C${idx + 1}`}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">{conflict.description}</div>
                        <div className="text-xs text-gray-600 mb-2">
                          <span className="font-semibold">Type:</span> {conflict.type?.replace(/_/g, ' ')}
                          {conflict.who_vs_what && (
                            <span className="ml-3">
                              <span className="font-semibold">Conflict:</span> {conflict.who_vs_what}
                            </span>
                          )}
                        </div>
                        {conflict.scores && (
                          <div className="flex gap-2 flex-wrap">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                              Appeal: {conflict.scores.audience_appeal}/10
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                              Unique: {conflict.scores.uniqueness}/10
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                              Intensity: {conflict.scores.dramatic_intensity}/10
                            </span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                              Total: {conflict.scores.total}/50
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </CollapsibleSection>
      )}

      {/* Content Analysis */}
      {contentAnalysis && (
        <CollapsibleSection
          title="Content Analysis"
          icon="📊"
          isExpanded={expandedSections.has('content')}
          onToggle={() => toggleSection('content')}
        >
          <div className="space-y-6">
            {/* Logline */}
            {contentAnalysis.logline && (
              <Section title="Logline" icon={<FiFilm />}>
                <p className="text-gray-900 font-medium leading-relaxed text-lg italic">
                  "{contentAnalysis.logline}"
                </p>
              </Section>
            )}

            {/* Brief */}
            {contentAnalysis.brief && (
              <Section title="Brief">
                <p className="text-gray-800 leading-relaxed">
                  {contentAnalysis.brief}
                </p>
              </Section>
            )}

            {/* USPs */}
            {contentAnalysis.usps && contentAnalysis.usps.length > 0 && (
              <Section title="Unique Selling Points">
                <ul className="space-y-2">
                  {contentAnalysis.usps.map((usp: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-stage-red font-bold mt-1">•</span>
                      <span className="text-gray-800 font-medium">{usp}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Themes */}
            {contentAnalysis.themes && contentAnalysis.themes.length > 0 && (
              <Section title="Themes">
                <div className="flex flex-wrap gap-2">
                  {contentAnalysis.themes.map((theme: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-semibold border-2 border-purple-200"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Best Moments */}
            {contentAnalysis.best_moments && contentAnalysis.best_moments.length > 0 && (
              <Section title="Memorable Scenes">
                <div className="space-y-3">
                  {contentAnalysis.best_moments.map((moment: string, idx: number) => (
                    <div key={idx} className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                      <div className="flex items-start gap-3">
                        <span className="px-2 py-1 bg-yellow-500 text-white rounded font-bold text-xs">
                          #{idx + 1}
                        </span>
                        <p className="text-gray-800 font-medium flex-1">{moment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Characters */}
            {contentAnalysis.core_characters && contentAnalysis.core_characters.length > 0 && (
              <Section title="Main Characters">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contentAnalysis.core_characters.map((char: any, idx: number) => (
                    <div key={idx} className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                      <div className="font-bold text-gray-900 text-base mb-1">{char.name}</div>
                      <div className="text-xs text-blue-700 font-semibold mb-2">{char.role}</div>
                      <p className="text-sm text-gray-700">{char.journey}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Genre & Positioning */}
            {contentAnalysis.genre_positioning && (
              <Section title="Genre & Positioning">
                <p className="text-gray-800 leading-relaxed">{contentAnalysis.genre_positioning}</p>
              </Section>
            )}

            {/* Target Audience Insights */}
            {contentAnalysis.target_audience_insights && (
              <Section title="Target Audience Insights">
                <p className="text-gray-800 leading-relaxed">{contentAnalysis.target_audience_insights}</p>
              </Section>
            )}

            {/* Hook Potential */}
            {contentAnalysis.hook_potential && (
              <Section title="Marketing Hook">
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <p className="text-gray-800 font-medium leading-relaxed">{contentAnalysis.hook_potential}</p>
                </div>
              </Section>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Original Content/Script */}
      {!compact && (content.summary || content.script) && (
        <CollapsibleSection
          title="Original Story Content"
          icon="📄"
          isExpanded={expandedSections.has('script')}
          onToggle={() => toggleSection('script')}
        >
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 max-h-96 overflow-y-auto">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {content.summary || content.script}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            📄 {(content.summary || content.script).length.toLocaleString()} characters
          </p>
        </CollapsibleSection>
      )}

      {/* Project Metadata */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.genre && (
            <MetricCard
              icon={<FiFilm className="text-purple-600" />}
              label="Genre"
              value={content.genre}
            />
          )}
          {content.runtime && (
            <MetricCard
              icon={<FiClock className="text-blue-600" />}
              label="Runtime"
              value={`${content.runtime} minutes`}
            />
          )}
          {content.targetAudience && (
            <MetricCard
              icon={<FiUsers className="text-green-600" />}
              label="Target Audience"
              value={content.targetAudience}
            />
          )}
          {content.created_at && (
            <MetricCard
              icon={<FiCalendar className="text-orange-600" />}
              label="Created"
              value={formatDate(content.created_at)}
            />
          )}
        </div>
      </div>

      {/* Sessions */}
      {completedSessions.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Generation History ({completedSessions.length} Round{completedSessions.length > 1 ? 's' : ''})
          </h2>
          <div className="space-y-3">
            {completedSessions.map((session: any) => (
              <Link
                key={session.session_id}
                href={`/project/${content.id}?tab=narratives&session=${session.session_id}`}
                className="block p-4 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-stage-red hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="text-green-600 text-xl" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Round {session.round_number}{session.round_number > 1 ? ' ✨' : ''}
                      </div>
                      <div className="text-sm text-gray-600">
                        {session.candidates_count} narratives • {formatDate(session.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.top_score && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                        Top: {session.top_score.toFixed(1)}/10
                      </span>
                    )}
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                      ✓ Complete
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, icon, children }: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="border-b-2 border-gray-100 pb-6 last:border-0">
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-xl">{icon}</span>}
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function MetricCard({ icon, label, value }: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {label}
          </div>
          <div className="text-base font-bold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  )
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  defaultExpanded = false,
  children
}: {
  title: string
  icon: string
  isExpanded: boolean
  onToggle: () => void
  defaultExpanded?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-purple-100/50 transition-colors"
      >
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h2>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiChevronDown className="w-6 h-6 text-gray-700" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t-2 border-purple-200"
          >
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
