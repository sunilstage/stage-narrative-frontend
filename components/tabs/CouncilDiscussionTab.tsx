'use client'

/**
 * Council Discussion Tab
 * Full conversation with narrative highlights and phase visualization
 * Sub-tabs: Meeting Insights | Full Discussion
 */

import { useState } from 'react'
import { FiMessageSquare, FiChevronDown, FiChevronUp, FiZap } from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { PRODUCTION_ROLES } from '@/lib/types'
import type { NarrativeCandidate } from '@/lib/types'

type SubTab = 'insights' | 'discussion'

export default function CouncilDiscussionTab({ conversation, narratives }: {
  conversation: any
  narratives: NarrativeCandidate[]
}) {
  const [subTab, setSubTab] = useState<SubTab>('insights')
  const [activePart, setActivePart] = useState<'part1' | 'part2' | 'combined'>('combined')

  // Check if we have the new 2-part structure
  const hasTwoParts = conversation?.part1_pure_ai && conversation?.part2_ai_human

  // For backward compatibility, support old single conversation format
  const isSingleConversation = conversation?.conversation && !hasTwoParts

  if (!conversation || (!hasTwoParts && !isSingleConversation)) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
        <FiMessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold text-lg">No council discussion available</p>
        <p className="text-gray-500 text-sm mt-2">The brainstorming conversation wasn't recorded for this session</p>
      </div>
    )
  }

  // Handle old format (single conversation)
  if (isSingleConversation) {
    const messages = conversation.conversation
    const insights = conversation.meeting_insights || []
    const narrativesCreated = conversation.narratives_created || []
    const narrativeMap = new Map()
    narratives.forEach(n => narrativeMap.set(n.narrative_text, n))

    return <LegacyCouncilView
      messages={messages}
      insights={insights}
      narrativesCreated={narrativesCreated}
      narrativeMap={narrativeMap}
      subTab={subTab}
      setSubTab={setSubTab}
    />
  }

  // New 2-part format
  const part1 = conversation.part1_pure_ai
  const part2 = conversation.part2_ai_human
  const stakeholderContext = conversation.stakeholder_context

  // Create a map of narratives by text for quick lookup
  const narrativeMap = new Map()
  narratives.forEach(n => {
    narrativeMap.set(n.narrative_text, n)
  })

  const part1Messages = part1?.conversation || []
  const part2Messages = part2?.conversation || []
  const totalMessages = part1Messages.length + part2Messages.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🗣️ Council Brainstorming Session (2-Part Hybrid)</h2>
        <p className="text-gray-700 font-medium mb-4">
          The council created narratives in two phases: pure AI brainstorming, then integrated stakeholder input
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="px-3 py-1.5 bg-white rounded-lg font-semibold text-purple-700 border-2 border-purple-200 text-sm">
            {totalMessages} total messages
          </span>
          <span className="px-3 py-1.5 bg-gray-500 text-white rounded-lg font-semibold text-sm">
            🤖 Part 1: {part1Messages.length} messages (AI-Only)
          </span>
          <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold text-sm">
            🤝 Part 2: {part2Messages.length} messages (AI+Stakeholder)
          </span>
        </div>
      </div>

      {/* Part Selection Tabs */}
      <div className="flex gap-3 bg-gray-100 p-2 rounded-xl">
        <button
          onClick={() => setActivePart('part1')}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg font-semibold transition-all",
            activePart === 'part1'
              ? "bg-gray-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50"
          )}
        >
          <div className="text-sm font-bold mb-1">🤖 Part 1: Pure AI</div>
          <div className="text-xs opacity-90">6 narratives from AI brainstorming</div>
        </button>
        <button
          onClick={() => setActivePart('part2')}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg font-semibold transition-all",
            activePart === 'part2'
              ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50"
          )}
        >
          <div className="text-sm font-bold mb-1">🤝 Part 2: AI + Stakeholder</div>
          <div className="text-xs opacity-90">6 narratives with strategic context</div>
        </button>
        <button
          onClick={() => setActivePart('combined')}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg font-semibold transition-all",
            activePart === 'combined'
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50"
          )}
        >
          <div className="text-sm font-bold mb-1">📊 Both Parts</div>
          <div className="text-xs opacity-90">View complete session</div>
        </button>
      </div>

      {/* Content based on active part */}
      {activePart === 'part1' && (
        <PartView
          part={part1}
          partLabel="Part 1: Pure AI Brainstorming"
          partDescription="Council discusses without stakeholder input, creating 6 narratives from pure creative exploration"
          narrativeMap={narrativeMap}
          badgeColor="bg-gray-600"
        />
      )}

      {activePart === 'part2' && stakeholderContext && (
        <div className="space-y-6">
          {/* Stakeholder Context Panel */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">📋 Stakeholder Strategic Input</h3>
            <p className="text-gray-700 text-sm">
              The council reviewed stakeholder interview responses before creating Part 2 narratives
            </p>
          </div>
          <PartView
            part={part2}
            partLabel="Part 2: AI + Stakeholder Integration"
            partDescription="Council integrates stakeholder business goals, target audience insights, and strategic direction into 6 new narratives"
            narrativeMap={narrativeMap}
            badgeColor="bg-gradient-to-r from-blue-500 to-green-500"
          />
        </div>
      )}

      {activePart === 'combined' && (
        <CombinedPartsView
          part1={part1}
          part2={part2}
          narrativeMap={narrativeMap}
        />
      )}
    </div>
  )
}

// ============================================================================
// Sub-tab Button
// ============================================================================

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
          ? "border-purple-600 bg-purple-50"
          : "border-transparent hover:bg-gray-50"
      )}
    >
      {icon}
      <span className={active ? "text-gray-900" : "text-gray-600"}>{label}</span>
      <span className={cn(
        "px-2 py-0.5 rounded-full text-xs font-bold",
        active ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
      )}>
        {count}
      </span>
    </button>
  )
}

// ============================================================================
// Insights View
// ============================================================================

function InsightsView({ insights, messages }: { insights: string[]; messages: any[] }) {
  return (
    <div className="space-y-6">
      {/* Insights List */}
      {insights.length > 0 ? (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Key Takeaways from Council Brainstorming
          </h3>
          <ul className="space-y-3">
            {insights.map((insight: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <span className="text-blue-600 font-bold text-lg">•</span>
                <span className="text-gray-800 font-medium flex-1">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12">
          <FiZap className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No meeting insights available</p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Discussion View
// ============================================================================

function DiscussionView({ messages, narrativesCreated, narrativeMap }: {
  messages: any[]
  narrativesCreated: any[]
  narrativeMap: Map<string, NarrativeCandidate>
}) {
  return (
    <div className="space-y-6">
      {/* Phase Timeline */}
      <PhaseTimeline messages={messages} />

      {/* Conversation Messages */}
      <div className="space-y-6">
        {messages.map((message: any, idx: number) => {
          // Check if this message introduces a narrative
          const introducedNarrative = narrativesCreated.find((n: any) => {
            const narrativeText = typeof n === 'string' ? n : (n?.narrative || '')
            return narrativeText && message.message.toLowerCase().includes(narrativeText.toLowerCase().slice(0, 30))
          })

          return (
            <div key={idx}>
              <CouncilMessage
                message={message}
                index={idx}
              />

              {/* Show narrative card if introduced */}
              {introducedNarrative && (
                <NarrativeHighlight
                  narrative={introducedNarrative}
                  actualNarrative={narrativeMap.get(introducedNarrative.narrative)}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// Phase Timeline
// ============================================================================

function PhaseTimeline({ messages }: { messages: any[] }) {
  const phases = [
    { id: 'understanding', label: 'Understanding', color: 'blue' },
    { id: 'ideation', label: 'Ideation', color: 'green' },
    { id: 'refinement', label: 'Refinement', color: 'yellow' },
    { id: 'finalization', label: 'Finalization', color: 'purple' },
  ]

  // Count messages in each phase
  const phaseCounts = phases.map(phase => ({
    ...phase,
    count: messages.filter(m => m.phase === phase.id).length
  }))

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Discussion Phases</h3>
      <div className="flex items-center gap-2">
        {phaseCounts.map((phase, idx) => (
          <div key={phase.id} className="flex items-center flex-1">
            <div className="flex-1">
              <div
                className={cn(
                  "rounded-lg p-3 text-center border-2",
                  phase.color === 'blue' && "bg-blue-50 border-blue-300",
                  phase.color === 'green' && "bg-green-50 border-green-300",
                  phase.color === 'yellow' && "bg-yellow-50 border-yellow-300",
                  phase.color === 'purple' && "bg-purple-50 border-purple-300"
                )}
              >
                <div className="text-sm font-bold text-gray-900">{phase.label}</div>
                <div className="text-xs text-gray-600 mt-1">{phase.count} messages</div>
              </div>
            </div>
            {idx < phaseCounts.length - 1 && (
              <div className="w-8 h-1 bg-gray-300 mx-1"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Council Message
// ============================================================================

function CouncilMessage({ message, index }: { message: any; index: number }) {
  // Map speaker to role
  const roleKey = message.speaker
    ?.toLowerCase()
    .replace(/\s+/g, '_')

  const roleInfo = PRODUCTION_ROLES[roleKey as keyof typeof PRODUCTION_ROLES]

  // Phase colors for bubble
  const phaseColors = {
    understanding: 'bg-blue-50 border-blue-300',
    ideation: 'bg-green-50 border-green-300',
    refinement: 'bg-yellow-50 border-yellow-300',
    finalization: 'bg-purple-50 border-purple-300',
  }
  const phaseColor = phaseColors[message.phase as keyof typeof phaseColors] || 'bg-white border-gray-200'

  // Arrow colors (for the triangle)
  const arrowColors = {
    understanding: 'border-r-blue-50',
    ideation: 'border-r-green-50',
    refinement: 'border-r-yellow-50',
    finalization: 'border-r-purple-50',
  }
  const arrowColor = arrowColors[message.phase as keyof typeof arrowColors] || 'border-r-white'

  return (
    <div className="flex items-start gap-4">
      {/* Speaker Icon */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-2xl shadow-md">
          {roleInfo?.icon || '💬'}
        </div>
      </div>

      {/* Message Bubble with Arrow */}
      <div className="flex-1 relative">
        {/* Arrow/Triangle pointing to speaker */}
        <div
          className={cn(
            "absolute left-0 top-4 w-0 h-0 -ml-2",
            "border-t-8 border-t-transparent",
            "border-b-8 border-b-transparent",
            "border-r-8",
            arrowColor
          )}
        />

        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-2xl p-5 border-2 shadow-sm hover:shadow-md transition-shadow",
            phaseColor
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3 pb-3 border-b-2 border-gray-200">
            <div>
              <span className="font-bold text-gray-900 text-base">
                {message.speaker || 'Council Member'}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">Message #{index + 1}</span>
                {message.phase && (
                  <span className="px-2 py-0.5 bg-white rounded text-xs font-semibold text-gray-700 border border-gray-300">
                    {message.phase}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Message Content */}
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
            {processMessageWithHighlights(message.message)}
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Narrative Highlight
// ============================================================================

function NarrativeHighlight({ narrative, actualNarrative }: {
  narrative: any
  actualNarrative?: NarrativeCandidate
}) {
  return (
    <div className="my-4 ml-12 bg-yellow-50 rounded-xl p-5 border-2 border-yellow-300 shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-yellow-500 text-white rounded-lg flex items-center justify-center font-bold shadow-sm">
            {actualNarrative ? `#${actualNarrative.rank}` : '✨'}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-yellow-600 text-white rounded text-xs font-bold uppercase">
              Narrative Introduced
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-bold">
              {narrative.angle}
            </span>
          </div>
          <p className="text-gray-900 font-medium leading-relaxed mb-3">
            {narrative.narrative}
          </p>
          {actualNarrative && (
            <div className="flex items-center gap-4 pt-3 border-t border-yellow-300">
              <div className="text-xs">
                <span className="text-gray-600">Final Score:</span>
                <span className="ml-1 font-bold text-gray-900">{actualNarrative.overall_score.toFixed(1)}/10</span>
              </div>
              <div className="text-xs">
                <span className="text-gray-600">Production:</span>
                <span className="ml-1 font-bold text-green-700">{actualNarrative.production_avg.toFixed(1)}/10</span>
              </div>
              <div className="text-xs">
                <span className="text-gray-600">Audience:</span>
                <span className="ml-1 font-bold text-blue-700">{actualNarrative.audience_avg.toFixed(1)}/10</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Part View Component
// ============================================================================

function PartView({ part, partLabel, partDescription, narrativeMap, badgeColor }: {
  part: any
  partLabel: string
  partDescription: string
  narrativeMap: Map<string, any>
  badgeColor: string
}) {
  const [subTab, setSubTab] = useState<SubTab>('insights')
  const messages = part?.conversation || []
  const insights = part?.meeting_insights || []
  const narrativesCreated = part?.narratives_created || []

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      <div className={cn("p-4", badgeColor, "text-white")}>
        <h3 className="font-bold text-lg">{partLabel}</h3>
        <p className="text-sm opacity-90 mt-1">{partDescription}</p>
      </div>

      <div className="flex border-b-2 border-gray-200">
        <SubTabButton
          active={subTab === 'insights'}
          onClick={() => setSubTab('insights')}
          icon={<FiZap className="text-yellow-600" />}
          label="Meeting Insights"
          count={insights.length}
        />
        <SubTabButton
          active={subTab === 'discussion'}
          onClick={() => setSubTab('discussion')}
          icon={<FiMessageSquare className="text-purple-600" />}
          label="Full Discussion"
          count={messages.length}
        />
      </div>

      <div className="p-6">
        {subTab === 'insights' && (
          <InsightsView insights={insights} messages={messages} />
        )}
        {subTab === 'discussion' && (
          <DiscussionView
            messages={messages}
            narrativesCreated={narrativesCreated}
            narrativeMap={narrativeMap}
          />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Combined Parts View Component
// ============================================================================

function CombinedPartsView({ part1, part2, narrativeMap }: {
  part1: any
  part2: any
  narrativeMap: Map<string, any>
}) {
  return (
    <div className="space-y-6">
      <PartView
        part={part1}
        partLabel="Part 1: Pure AI Brainstorming"
        partDescription="6 narratives created through pure AI creative exploration"
        narrativeMap={narrativeMap}
        badgeColor="bg-gray-600"
      />
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="h-px bg-gray-300 w-20"></div>
          <span className="text-sm font-semibold">Then stakeholder input integrated</span>
          <div className="h-px bg-gray-300 w-20"></div>
        </div>
      </div>
      <PartView
        part={part2}
        partLabel="Part 2: AI + Stakeholder Integration"
        partDescription="6 narratives incorporating strategic business context and stakeholder insights"
        narrativeMap={narrativeMap}
        badgeColor="bg-gradient-to-r from-blue-500 to-green-500"
      />
    </div>
  )
}

// ============================================================================
// Legacy Council View (for backward compatibility)
// ============================================================================

function LegacyCouncilView({ messages, insights, narrativesCreated, narrativeMap, subTab, setSubTab }: {
  messages: any[]
  insights: any[]
  narrativesCreated: any[]
  narrativeMap: Map<string, any>
  subTab: SubTab
  setSubTab: (tab: SubTab) => void
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🗣️ Council Brainstorming Session</h2>
        <p className="text-gray-700 font-medium mb-4">
          Watch how the production council discussed and created these narrative candidates together
        </p>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1.5 bg-white rounded-lg font-semibold text-purple-700 border-2 border-purple-200 text-sm">
            {messages.length} messages
          </span>
          {insights.length > 0 && (
            <span className="px-3 py-1.5 bg-white rounded-lg font-semibold text-indigo-700 border-2 border-indigo-200 text-sm">
              {insights.length} key insights
            </span>
          )}
          {narrativesCreated.length > 0 && (
            <span className="px-3 py-1.5 bg-white rounded-lg font-semibold text-green-700 border-2 border-green-200 text-sm">
              {narrativesCreated.length} narratives created
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="flex border-b-2 border-gray-200">
          <SubTabButton
            active={subTab === 'insights'}
            onClick={() => setSubTab('insights')}
            icon={<FiZap className="text-yellow-600" />}
            label="Meeting Insights"
            count={insights.length}
          />
          <SubTabButton
            active={subTab === 'discussion'}
            onClick={() => setSubTab('discussion')}
            icon={<FiMessageSquare className="text-purple-600" />}
            label="Full Discussion"
            count={messages.length}
          />
        </div>

        <div className="p-6">
          {subTab === 'insights' && (
            <InsightsView insights={insights} messages={messages} />
          )}
          {subTab === 'discussion' && (
            <DiscussionView
              messages={messages}
              narrativesCreated={narrativesCreated}
              narrativeMap={narrativeMap}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Helper Functions
// ============================================================================

function processMessageWithHighlights(text: string): string {
  // For now, just return the text as-is
  // In the future, we could add regex-based highlighting for keywords
  return text
}
