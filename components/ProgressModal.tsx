'use client'

/**
 * Progress Modal
 * Shows real-time generation progress with phase indicators
 * Allows users to run in background and navigate away
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ProgressModalProps {
  sessionId: number
  contentTitle: string
  onComplete: () => void
  onBackground: () => void
}

interface Progress {
  phase: string
  percent: number
  message: string
  updated_at: string
}

const PHASES = [
  { id: 'starting', label: 'Starting', icon: '🚀', color: 'blue' },
  { id: 'analysis', label: 'Script Analysis', icon: '📖', color: 'indigo' },
  { id: 'council', label: 'Council Brainstorming', icon: '🗣️', color: 'purple' },
  { id: 'audience', label: 'Audience Evaluation', icon: '👥', color: 'green' },
  { id: 'complete', label: 'Complete', icon: '✨', color: 'emerald' },
]

export default function ProgressModal({ sessionId, contentTitle, onComplete, onBackground }: ProgressModalProps) {
  const [progress, setProgress] = useState<Progress | null>(null)
  const [status, setStatus] = useState<string>('generating')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Poll for progress every 2 seconds
    const interval = setInterval(async () => {
      try {
        const data = await api.narrative.getProgress(sessionId)
        setProgress(data.progress)
        setStatus(data.status)

        if (data.status === 'complete') {
          clearInterval(interval)
          setTimeout(() => {
            onComplete()
          }, 1000) // Wait 1 second to show 100% completion
        } else if (data.status === 'failed') {
          clearInterval(interval)
          setError('Generation failed. Please try again.')
        }
      } catch (err) {
        console.error('Failed to fetch progress:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch progress')
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [sessionId, onComplete])

  const currentPhaseIndex = PHASES.findIndex(p => p.id === progress?.phase)
  const percent = progress?.percent || 0

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'complete' ? '🎉 Generation Complete!' : '⚡ Generating Narratives'}
          </h2>
          <p className="text-gray-600 font-medium">
            {contentTitle}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-sm font-bold text-red-900">{error}</p>
          </div>
        )}

        {/* Overall Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-stage-red">{percent}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-stage-red to-red-600 transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          {progress?.message && (
            <p className="text-xs text-gray-600 mt-2 font-medium italic">
              {progress.message}
            </p>
          )}
        </div>

        {/* Phase Indicators */}
        <div className="space-y-4 mb-8">
          {PHASES.map((phase, index) => {
            const isActive = phase.id === progress?.phase
            const isComplete = index < currentPhaseIndex || status === 'complete'
            const isCurrent = index === currentPhaseIndex

            return (
              <div
                key={phase.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                  isActive && "bg-purple-50 border-purple-300 shadow-md scale-105",
                  isComplete && !isActive && "bg-green-50 border-green-300",
                  !isActive && !isComplete && "bg-gray-50 border-gray-200 opacity-60"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all",
                    isComplete && !isActive && "bg-green-500 text-white",
                    isActive && "bg-purple-500 text-white animate-pulse",
                    !isActive && !isComplete && "bg-gray-300 text-gray-600"
                  )}
                >
                  {isComplete && !isActive ? '✓' : phase.icon}
                </div>

                {/* Label */}
                <div className="flex-1">
                  <h3 className={cn(
                    "font-bold text-base",
                    isActive && "text-purple-900",
                    isComplete && !isActive && "text-green-900",
                    !isActive && !isComplete && "text-gray-600"
                  )}>
                    {phase.label}
                  </h3>
                  {isActive && progress?.message && (
                    <p className="text-xs text-purple-700 mt-1 font-medium">
                      {progress.message}
                    </p>
                  )}
                  {isComplete && !isActive && (
                    <p className="text-xs text-green-700 mt-1 font-medium">
                      ✓ Completed
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                {isActive && (
                  <div className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold">
                    In Progress
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {status !== 'complete' && (
            <>
              <button
                onClick={onBackground}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold transition-colors"
              >
                Run in Background
              </button>
              <div className="text-xs text-gray-500 font-medium">
                ⏱️ ~5 minutes
              </div>
            </>
          )}
          {status === 'complete' && (
            <button
              onClick={onComplete}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition-colors"
            >
              View Results →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
