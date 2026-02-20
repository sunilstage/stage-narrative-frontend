'use client'

/**
 * Background Jobs Indicator - ENHANCED
 * Shows detailed progress for all running generation jobs
 * Appears as a floating widget in the bottom-right corner
 */

import { useBackgroundJobs } from '@/contexts/BackgroundJobsContext'
import { useRouter } from 'next/navigation'
import { FiX, FiLoader, FiCheck, FiAlertCircle, FiChevronDown, FiChevronUp, FiClock, FiLock, FiUnlock } from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

export default function BackgroundJobsIndicator() {
  const { jobs, removeJob } = useBackgroundJobs()
  const router = useRouter()
  const [expandedJobs, setExpandedJobs] = useState<Set<number>>(new Set())
  const [pinnedJobs, setPinnedJobs] = useState<Set<number>>(new Set())
  const [isHovered, setIsHovered] = useState(false)

  // Persist expanded and pinned state in localStorage
  useEffect(() => {
    const savedExpanded = localStorage.getItem('bgJobs_expanded')
    const savedPinned = localStorage.getItem('bgJobs_pinned')

    if (savedExpanded) {
      try {
        const parsed = JSON.parse(savedExpanded)
        setExpandedJobs(new Set(parsed))
      } catch (e) {
        console.error('Failed to parse expanded jobs state:', e)
      }
    }

    if (savedPinned) {
      try {
        const parsed = JSON.parse(savedPinned)
        setPinnedJobs(new Set(parsed))
      } catch (e) {
        console.error('Failed to parse pinned jobs state:', e)
      }
    }
  }, [])

  // Save expanded state whenever it changes
  useEffect(() => {
    localStorage.setItem('bgJobs_expanded', JSON.stringify(Array.from(expandedJobs)))
  }, [expandedJobs])

  // Save pinned state whenever it changes
  useEffect(() => {
    localStorage.setItem('bgJobs_pinned', JSON.stringify(Array.from(pinnedJobs)))
  }, [pinnedJobs])

  // Auto-expand new generating jobs
  useEffect(() => {
    jobs.forEach(job => {
      if (job.status === 'generating' && !expandedJobs.has(job.sessionId)) {
        // Auto-expand generating jobs that aren't already expanded
        setExpandedJobs(prev => {
          const newSet = new Set(prev)
          newSet.add(job.sessionId)
          return newSet
        })
      }
    })
  }, [jobs, expandedJobs]) // Run when jobs OR expandedJobs changes

  // Clean up expanded and pinned state for removed jobs
  useEffect(() => {
    const currentJobIds = new Set(jobs.map(j => j.sessionId))

    setExpandedJobs(prev => {
      const newSet = new Set(prev)
      let changed = false
      prev.forEach(sessionId => {
        if (!currentJobIds.has(sessionId)) {
          newSet.delete(sessionId)
          changed = true
        }
      })
      return changed ? newSet : prev
    })

    setPinnedJobs(prev => {
      const newSet = new Set(prev)
      let changed = false
      prev.forEach(sessionId => {
        if (!currentJobIds.has(sessionId)) {
          newSet.delete(sessionId)
          changed = true
        }
      })
      return changed ? newSet : prev
    })
  }, [jobs])

  if (jobs.length === 0) return null

  const toggleExpanded = (sessionId: number) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId)
      } else {
        newSet.add(sessionId)
      }
      return newSet
    })
  }

  const togglePinned = (sessionId: number) => {
    setPinnedJobs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId)
      } else {
        newSet.add(sessionId)
        // Also expand when pinning
        setExpandedJobs(prevExpanded => {
          const newExpanded = new Set(prevExpanded)
          newExpanded.add(sessionId)
          return newExpanded
        })
      }
      return newSet
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-md pointer-events-auto">
      {jobs.map((job) => {
        const isExpanded = expandedJobs.has(job.sessionId)
        const isPinned = pinnedJobs.has(job.sessionId)

        return (
          <div
            key={job.sessionId}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
              "bg-white rounded-xl shadow-2xl border-2 transition-all duration-300",
              job.status === 'generating' && "border-purple-300 hover:shadow-purple-200",
              job.status === 'complete' && "border-green-300 hover:shadow-green-200",
              job.status === 'failed' && "border-red-300 hover:shadow-red-200",
              isHovered && "scale-105"
            )}
          >
            {/* Header */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 mr-3">
                  <h4 className="font-bold text-gray-900 text-sm mb-1">
                    {job.contentTitle}
                  </h4>
                  <div className="flex items-center gap-2">
                    {job.status === 'generating' && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        <span className="text-xs text-purple-700 font-bold">
                          Generating Round {job.roundNumber || '?'}
                        </span>
                      </div>
                    )}
                    {job.status === 'complete' && (
                      <span className="text-xs text-green-700 font-bold">
                        ✓ Round {job.roundNumber || '?'} Complete!
                      </span>
                    )}
                    {job.status === 'failed' && (
                      <span className="text-xs text-red-700 font-bold">
                        ✗ Generation Failed
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Icon */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {job.status === 'generating' && (
                    <FiLoader className="w-5 h-5 text-purple-600 animate-spin" />
                  )}
                  {job.status === 'complete' && (
                    <FiCheck className="w-5 h-5 text-green-600" />
                  )}
                  {job.status === 'failed' && (
                    <FiAlertCircle className="w-5 h-5 text-red-600" />
                  )}

                  {/* Close Button */}
                  <button
                    onClick={() => removeJob(job.sessionId)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    aria-label="Dismiss"
                  >
                    <FiX className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {job.status === 'generating' && job.progress && (
                <div className="mb-3">
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500 transition-all duration-500 animate-pulse"
                      style={{ width: `${job.progress.percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-purple-700 font-bold">
                      {job.progress.percent}%
                    </span>
                    <TimeElapsed startedAt={job.startedAt} />
                  </div>
                </div>
              )}

              {/* Current Stage - Always Visible */}
              {job.status === 'generating' && job.progress && (
                <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-3 mb-2">
                  <div className="text-xs font-bold text-purple-900 mb-1">
                    {getStageEmoji(job.progress.stage)} {getStageName(job.progress.stage)}
                  </div>
                  <div className="text-xs text-purple-700 font-medium">
                    {job.progress.message}
                  </div>
                </div>
              )}

              {/* Expand/Collapse & Pin Buttons */}
              {job.status === 'generating' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePinned(job.sessionId)}
                    className={cn(
                      "flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-lg transition-colors",
                      isPinned
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                    )}
                    title={isPinned ? "Unpin (auto-collapse on blur)" : "Pin (keep expanded)"}
                  >
                    {isPinned ? <FiLock className="w-3 h-3" /> : <FiUnlock className="w-3 h-3" />}
                    {isPinned ? 'Pinned' : 'Pin'}
                  </button>
                  <button
                    onClick={() => toggleExpanded(job.sessionId)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <FiChevronUp className="w-4 h-4" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <FiChevronDown className="w-4 h-4" />
                        Show Details
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Expanded Details */}
            {isExpanded && job.status === 'generating' && job.progress && (
              <div className="px-4 pb-4 pt-0 border-t-2 border-gray-100">
                <div className="space-y-2 mt-3">
                  {/* Session Info */}
                  <DetailRow label="Session ID" value={`#${job.sessionId}`} />
                  <DetailRow label="Stage" value={job.progress.stage || 'unknown'} />
                  <DetailRow label="Phase" value={job.progress.phase || 'starting'} />

                  {/* Stage-specific details */}
                  {job.progress.current_narrative && (
                    <DetailRow
                      label="Current"
                      value={`${job.progress.current_narrative}/${job.progress.total_narratives || '?'} narratives`}
                    />
                  )}

                  {job.progress.narratives_created && (
                    <DetailRow
                      label="Created"
                      value={`${job.progress.narratives_created} narratives`}
                      highlight
                    />
                  )}
                </div>
              </div>
            )}

            {/* Action Button */}
            {job.status === 'complete' && (
              <div className="px-4 pb-4">
                <button
                  onClick={() => router.push(`/project/${job.contentId}?tab=narratives&session=${job.sessionId}`)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  View Results →
                </button>
              </div>
            )}

            {job.status === 'failed' && (
              <div className="px-4 pb-4">
                <button
                  onClick={() => removeJob(job.sessionId)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-sm transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TimeElapsed({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
      setElapsed(seconds)
    }, 1000)

    return () => clearInterval(interval)
  }, [startedAt])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  return (
    <div className="flex items-center gap-1 text-xs text-gray-600">
      <FiClock className="w-3 h-3" />
      <span className="font-medium">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  )
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn(
      "flex justify-between items-center py-1.5 px-2 rounded text-xs",
      highlight ? "bg-green-50 font-bold" : "bg-gray-50"
    )}>
      <span className="text-gray-600 font-semibold">{label}:</span>
      <span className={cn(
        "font-bold",
        highlight ? "text-green-700" : "text-gray-900"
      )}>{value}</span>
    </div>
  )
}

function getStageEmoji(stage?: string): string {
  if (!stage) return '⏳'
  if (stage.includes('analysis')) return '📊'
  if (stage.includes('council') || stage.includes('brainstorm')) return '🗣️'
  if (stage.includes('evaluation') || stage.includes('testing')) return '👥'
  if (stage.includes('complete')) return '✅'
  return '⚙️'
}

function getStageName(stage?: string): string {
  if (!stage) return 'Starting'
  if (stage.includes('analysis')) return 'Analyzing Content'
  if (stage.includes('council')) return 'Council Brainstorming'
  if (stage.includes('evaluation')) return 'Audience Evaluation'
  if (stage.includes('complete')) return 'Finalizing'
  return stage.charAt(0).toUpperCase() + stage.slice(1)
}
