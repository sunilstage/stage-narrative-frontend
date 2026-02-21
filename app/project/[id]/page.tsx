'use client'

/**
 * Project Detail Page - ORIGINAL 4-TAB STRUCTURE (RESTORED)
 * Tab 1: Project Overview
 * Tab 2: Narratives (DEFAULT)
 * Tab 3: Council Discussion
 * Tab 4: Persona Reviews
 */

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useState } from 'react'
import { FiChevronLeft } from 'react-icons/fi'
import { cn } from '@/lib/utils'
import ProjectOverviewTab from '@/components/tabs/ProjectOverviewTab'
import NarrativesTab from '@/components/tabs/NarrativesTab'
import CouncilDiscussionTab from '@/components/tabs/CouncilDiscussionTab'
import PersonaReviewsTab from '@/components/tabs/PersonaReviewsTab'

type TabType = 'overview' | 'narratives' | 'council' | 'personas'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = params.id as string  // MongoDB ObjectId string

  // Get active tab from URL or default to 'narratives'
  const urlTab = searchParams.get('tab') as TabType
  const [activeTab, setActiveTab] = useState<TabType>(urlTab || 'narratives')

  // Fetch content/project data
  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ['content', projectId],
    queryFn: () => api.content.get(projectId),
  })

  // Fetch all rounds for this content
  const { data: roundsData, isLoading: roundsLoading } = useQuery({
    queryKey: ['content-rounds', projectId],
    queryFn: () => api.narrative.getRounds(projectId),
  })

  // Get session ID from URL or use latest completed round
  const urlSessionId = searchParams.get('session')
  const activeSessionId = urlSessionId
    ? urlSessionId  // Already a string (MongoDB ObjectId)
    : roundsData?.find((r: any) => r.status === 'completed')?.id

  // Fetch session details if available
  const { data: sessionData } = useQuery({
    queryKey: ['session', activeSessionId],
    queryFn: () => api.narrative.getSession(activeSessionId!),
    enabled: !!activeSessionId,
  })

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    router.push(url.pathname + url.search, { scroll: false })
  }

  const handleRoundChange = (sessionId: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('session', sessionId.toString())
    router.push(url.pathname + url.search, { scroll: false })
  }

  const handleNavigateToCouncil = () => {
    handleTabChange('council')
  }

  if (contentLoading || roundsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-stage-red mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <p className="text-red-900 font-medium">Project not found</p>
        </div>
      </div>
    )
  }

  const candidates = sessionData?.candidates || []
  const councilConversation = sessionData?.council_conversation

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to projects"
              >
                <FiChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  {content.genre && (
                    <span className="text-sm text-gray-600">{content.genre}</span>
                  )}
                  {(roundsData?.length ?? 0) > 0 && (
                    <span className="text-sm text-gray-500">
                      • {roundsData!.length} round{roundsData!.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Round Selector */}
            {roundsData && roundsData.length > 1 && (
              <div className="flex gap-2">
                {roundsData.map((round: any) => (
                  <button
                    key={round.id}
                    onClick={() => handleRoundChange(round.id)}
                    className={cn(
                      "px-4 py-2 rounded-lg font-bold border-2 transition-colors",
                      activeSessionId === round.id
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                    )}
                  >
                    Round {round.round_number}
                    {round.round_number > 1 && ' ✨'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 border-b border-gray-200">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => handleTabChange('overview')}
              label="Project Overview"
            />
            <TabButton
              active={activeTab === 'narratives'}
              onClick={() => handleTabChange('narratives')}
              label="Narratives"
              badge={candidates.length > 0 ? candidates.length : undefined}
            />
            <TabButton
              active={activeTab === 'council'}
              onClick={() => handleTabChange('council')}
              label="Council Discussion"
              disabled={!councilConversation}
            />
            <TabButton
              active={activeTab === 'personas'}
              onClick={() => handleTabChange('personas')}
              label="Persona Reviews"
              disabled={candidates.length === 0}
            />
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <ProjectOverviewTab content={content} sessions={roundsData || []} />
        )}

        {activeTab === 'narratives' && (
          <NarrativesTab
            session={sessionData}
            onNavigateToCouncil={handleNavigateToCouncil}
            councilConversation={councilConversation}
          />
        )}

        {activeTab === 'council' && councilConversation && (
          <CouncilDiscussionTab
            conversation={councilConversation}
            narratives={candidates}
          />
        )}

        {activeTab === 'personas' && candidates.length > 0 && (
          <PersonaReviewsTab
            candidates={candidates}
          />
        )}
      </div>
    </div>
  )
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  label,
  badge,
  disabled = false,
}: {
  active: boolean
  onClick: () => void
  label: string
  badge?: number
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative px-6 py-3 font-bold text-sm transition-all",
        "border-b-4 -mb-px",
        active
          ? "border-stage-red text-stage-red"
          : disabled
          ? "border-transparent text-gray-400 cursor-not-allowed"
          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
      )}
    >
      <span className="flex items-center gap-2">
        {label}
        {badge !== undefined && (
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-bold",
            active
              ? "bg-stage-red text-white"
              : "bg-gray-200 text-gray-700"
          )}>
            {badge}
          </span>
        )}
      </span>
    </button>
  )
}
