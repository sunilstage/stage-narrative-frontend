'use client'

/**
 * Background Jobs Context
 * Tracks all running generation jobs globally
 * Persists across page navigation
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { api } from '@/lib/api'

interface BackgroundJob {
  sessionId: string
  contentId: string
  contentTitle: string
  roundNumber?: number
  status: 'generating' | 'complete' | 'failed'
  progress: {
    phase: string
    percent: number
    message: string
    stage?: string
    current_narrative?: number
    total_narratives?: number
    narratives_created?: number
  } | null
  startedAt: string
}

interface BackgroundJobsContextType {
  jobs: BackgroundJob[]
  addJob: (job: Omit<BackgroundJob, 'status' | 'progress' | 'startedAt'>) => void
  removeJob: (sessionId: string) => void
  updateJob: (sessionId: string, updates: Partial<BackgroundJob>) => void
  getJob: (sessionId: string) => BackgroundJob | undefined
}

const BackgroundJobsContext = createContext<BackgroundJobsContextType | undefined>(undefined)

export function BackgroundJobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<BackgroundJob[]>([])

  // Load jobs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('background_jobs')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setJobs(parsed)
      } catch (e) {
        console.error('Failed to parse stored jobs:', e)
      }
    }
  }, [])

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('background_jobs', JSON.stringify(jobs))
  }, [jobs])

  // Poll for progress on all active jobs
  useEffect(() => {
    const activeJobs = jobs.filter(j => j.status === 'generating')

    if (activeJobs.length === 0) return

    const interval = setInterval(async () => {
      for (const job of activeJobs) {
        try {
          const data = await api.narrative.getProgress(job.sessionId)

          // Transform progress number to object format
          const progressObj = typeof data.progress === 'number' ? {
            phase: data.progress >= 100 ? 'complete' :
                   data.progress >= 70 ? 'audience' :
                   data.progress >= 30 ? 'council' :
                   data.progress >= 10 ? 'analysis' : 'starting',
            percent: data.progress,
            message: data.progress >= 100 ? 'Generation complete!' :
                     data.progress >= 70 ? 'Evaluating with audience personas...' :
                     data.progress >= 30 ? 'Production council brainstorming...' :
                     data.progress >= 10 ? 'Analyzing content...' : 'Starting generation...'
          } : data.progress

          setJobs(prev => prev.map(j =>
            j.sessionId === job.sessionId
              ? {
                  ...j,
                  status: data.status === 'completed' ? 'complete' : data.status as any,
                  progress: progressObj
                }
              : j
          ))

          // Show browser notification on completion
          if (data.status === 'complete' && job.status !== 'complete') {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('✨ Generation Complete!', {
                body: `Narratives ready for "${job.contentTitle}"`,
                icon: '/favicon.ico',
                tag: `generation-${job.sessionId}`
              })
            }
          }

          // Remove completed/failed jobs after 10 seconds
          if (data.status === 'complete' || data.status === 'failed') {
            setTimeout(() => {
              setJobs(prev => prev.filter(j => j.sessionId !== job.sessionId))
            }, 10000)
          }
        } catch (err) {
          console.error(`Failed to fetch progress for session ${job.sessionId}:`, err)
        }
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [jobs])

  const addJob = (job: Omit<BackgroundJob, 'status' | 'progress' | 'startedAt'>) => {
    const newJob: BackgroundJob = {
      ...job,
      status: 'generating',
      progress: null,
      startedAt: new Date().toISOString()
    }
    setJobs(prev => [...prev, newJob])

    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const removeJob = (sessionId: string) => {
    setJobs(prev => prev.filter(j => j.sessionId !== sessionId))
  }

  const updateJob = (sessionId: string, updates: Partial<BackgroundJob>) => {
    setJobs(prev => prev.map(j =>
      j.sessionId === sessionId ? { ...j, ...updates } : j
    ))
  }

  const getJob = (sessionId: string) => {
    return jobs.find(j => j.sessionId === sessionId)
  }

  return (
    <BackgroundJobsContext.Provider value={{ jobs, addJob, removeJob, updateJob, getJob }}>
      {children}
    </BackgroundJobsContext.Provider>
  )
}

export function useBackgroundJobs() {
  const context = useContext(BackgroundJobsContext)
  if (!context) {
    throw new Error('useBackgroundJobs must be used within BackgroundJobsProvider')
  }
  return context
}
