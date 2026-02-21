'use client'

/**
 * Dashboard Page
 * Main page showing content list and create content form
 */

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Content, ContentCreate } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslation } from '@/lib/i18n'
import { useBackgroundJobs } from '@/contexts/BackgroundJobsContext'
import ProgressModal from '@/components/ProgressModal'
import StakeholderInterviewModal from '@/components/StakeholderInterviewModal'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger'

export default function Dashboard() {
  const { language } = useLanguage()
  const t = useTranslation(language)
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [extractedScript, setExtractedScript] = useState('')
  const [pdfFileName, setPdfFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Fetch content list
  const { data: contents, isLoading, error } = useQuery({
    queryKey: ['contents'],
    queryFn: () => api.content.list(),
  })

  // Create content mutation
  const createMutation = useMutation({
    mutationFn: (data: ContentCreate) => {
      logger.info('Creating content', { title: data.title })
      return api.content.create(data)
    },
    onSuccess: (data) => {
      logger.success('Content created', { id: data.id, title: data.title })
      queryClient.invalidateQueries({ queryKey: ['contents'] })
      setShowCreateForm(false)
      setExtractedScript('')
      setPdfFileName('')
    },
    onError: (error: any) => {
      logger.error('Content creation failed', error)
    },
  })

  // PDF upload mutation
  const pdfUploadMutation = useMutation({
    mutationFn: (file: File) => {
      logger.userAction('Upload PDF', { filename: file.name, size: file.size })
      return api.content.uploadPDF(file)
    },
    onSuccess: (data) => {
      logger.success('PDF extracted', {
        filename: data.filename,
        pages: data.pages,
        characters: data.character_count
      })
      setExtractedScript(data.extracted_text)
      setPdfFileName(data.filename)
    },
    onError: (error: any) => {
      logger.error('PDF upload failed', error)
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    logger.userAction('Create Project - Form Submit')
    const formData = new FormData(e.currentTarget)

    const data: ContentCreate = {
      title: formData.get('title') as string,
      genre: formData.get('genre') as string,
      runtime: parseInt(formData.get('runtime') as string) || undefined,
      targetAudience: formData.get('target_audience') as string,
      summary: formData.get('summary') as string,
      script: extractedScript || (formData.get('script') as string),
      themes: formData.get('themes') as string,
      tone: formData.get('tone') as string,
    }

    createMutation.mutate(data)
  }

  const handlePDFUpload = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }
    pdfUploadMutation.mutate(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handlePDFUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handlePDFUpload(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stage-black">{t.dashboard.title}</h1>
          <p className="mt-2 text-base text-gray-600">
            {t.dashboard.subtitle}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-stage-red text-white rounded-lg hover:bg-stage-red-dark transition-colors font-medium"
        >
          {showCreateForm ? t.dashboard.cancel : t.dashboard.newContent}
        </button>
      </div>

      {/* Create Content Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-stage-black mb-6">{t.dashboard.createContent}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.form.titleRequired}
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stage-red focus:border-stage-red text-gray-900 bg-white placeholder:text-gray-400"
                  placeholder={t.form.titlePlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.form.genre}
                </label>
                <input
                  type="text"
                  name="genre"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stage-red focus:border-stage-red text-gray-900 bg-white placeholder:text-gray-400"
                  placeholder={t.form.genrePlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.form.runtime}
                </label>
                <input
                  type="number"
                  name="runtime"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stage-red focus:border-stage-red text-gray-900 bg-white placeholder:text-gray-400"
                  placeholder={t.form.runtimePlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.form.targetAudience}
                </label>
                <input
                  type="text"
                  name="target_audience"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stage-red focus:border-stage-red text-gray-900 bg-white placeholder:text-gray-400"
                  placeholder={t.form.audiencePlaceholder}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.form.summary}
              </label>
              <textarea
                name="summary"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stage-red focus:border-stage-red text-gray-900 bg-white placeholder:text-gray-400"
                placeholder={t.form.summaryPlaceholder}
              />
            </div>

            {/* PDF Upload Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {t.form.script}
              </label>

              {/* Drag & Drop Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                  isDragging
                    ? 'border-stage-red bg-red-50'
                    : 'border-gray-300 hover:border-stage-red'
                }`}
              >
                <input
                  type="file"
                  id="pdf-upload"
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {pdfUploadMutation.isPending ? (
                  <div className="py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stage-red mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">{t.pdf.extracting}</p>
                  </div>
                ) : pdfFileName ? (
                  <div className="py-2">
                    <svg
                      className="w-12 h-12 mx-auto text-green-500 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm font-medium text-gray-900">✓ {pdfFileName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t.pdf.success} • {extractedScript.length} {t.pdf.characters}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setExtractedScript('')
                        setPdfFileName('')
                      }}
                      className="mt-2 text-xs text-stage-red hover:text-stage-red-dark"
                    >
                      {t.pdf.remove}
                    </button>
                  </div>
                ) : (
                  <div className="py-4">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-400 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {t.pdf.dropHere}{' '}
                      <label
                        htmlFor="pdf-upload"
                        className="text-stage-red hover:text-stage-red-dark cursor-pointer"
                      >
                        {t.pdf.browse}
                      </label>
                    </p>
                    <p className="text-xs text-gray-500">
                      {t.pdf.autoExtract}
                    </p>
                  </div>
                )}

                {pdfUploadMutation.isError && (
                  <p className="text-xs text-red-600 mt-2">
                    Error: {pdfUploadMutation.error instanceof Error
                      ? pdfUploadMutation.error.message
                      : 'Failed to process PDF'}
                  </p>
                )}
              </div>

              {/* Script Textarea */}
              <textarea
                name="script"
                value={extractedScript}
                onChange={(e) => setExtractedScript(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stage-red focus:border-stage-red text-gray-900 bg-white placeholder:text-gray-400"
                placeholder={t.form.scriptPlaceholder}
              />
              {extractedScript && (
                <p className="text-xs text-gray-500">
                  {t.pdf.canEdit}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.form.themes}
                </label>
                <input
                  type="text"
                  name="themes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stage-red focus:border-stage-red text-gray-900 bg-white placeholder:text-gray-400"
                  placeholder={t.form.themesPlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.form.tone}
                </label>
                <input
                  type="text"
                  name="tone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stage-red focus:border-stage-red text-gray-900 bg-white placeholder:text-gray-400"
                  placeholder={t.form.tonePlaceholder}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t.dashboard.cancel}
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-stage-red text-white rounded-md hover:bg-stage-red-dark disabled:bg-gray-400 transition-colors font-medium"
              >
                {createMutation.isPending ? t.dashboard.creating : t.dashboard.createButton}
              </button>
            </div>

            {createMutation.isError && (
              <div className="text-red-600 text-sm">
                Error: {createMutation.error instanceof Error ? createMutation.error.message : 'Failed to create content'}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Content List */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stage-red mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.dashboard.loadingContent}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            {t.error.loading}: {error instanceof Error ? error.message : t.error.unknown}
          </p>
        </div>
      )}

      {contents && contents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t.dashboard.noContent}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {t.dashboard.noContentSubtext}
          </p>
        </div>
      )}

      {contents && contents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((content: Content) => (
            <ContentCard key={content.id} content={content} language={language} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Content Card Component
 */
function ContentCard({ content, language }: { content: Content; language: import('@/lib/i18n').Language }) {
  const t = useTranslation(language)
  const queryClient = useQueryClient()
  const router = useRouter()
  const { addJob } = useBackgroundJobs()
  const [showProgress, setShowProgress] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)  // MongoDB ObjectId
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showInterviewModal, setShowInterviewModal] = useState(false)

  // Check for existing sessions
  const { data: sessionsData } = useQuery({
    queryKey: ['content-sessions', content.id],
    queryFn: () => api.narrative.getContentSessions(content.id),
  })

  // Check for stakeholder responses
  const { data: stakeholderData, isLoading: isLoadingStakeholder, error: stakeholderError } = useQuery({
    queryKey: ['stakeholder-responses', content.id],
    queryFn: async () => {
      console.log('🔍 Fetching stakeholder responses for content', content.id)
      const data = await api.content.getStakeholderResponses(content.id)
      console.log('📥 Received stakeholder data:', data)
      return data
    },
  })

  const hasStakeholderResponses = stakeholderData?.has_responses || false

  if (stakeholderError) {
    console.error('❌ Error fetching stakeholder responses:', stakeholderError)
  }

  // Get all completed sessions, sorted by newest first
  const completedSessions = sessionsData?.sessions?.filter(
    (s) => s.status === 'complete'
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || []

  const generateMutation = useMutation({
    mutationFn: (contentId: string) => {
      logger.userAction('Generate Narratives', { contentId })
      return api.narrative.generate(contentId, 10)
    },
    onSuccess: (data) => {
      logger.success('Generation started', { sessionId: data.session_id })
      // Generation started - show progress modal
      setActiveSessionId(data.session_id)
      setShowProgress(true)
      queryClient.invalidateQueries({ queryKey: ['contents'] })
      queryClient.invalidateQueries({ queryKey: ['content-sessions', content.id] })
    },
    onError: (error: any) => {
      logger.error('Generation failed', error)
      alert(`Failed to generate narratives: ${error.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (contentId: string) => {
      logger.userAction('Delete Content', { contentId })
      return api.content.delete(contentId)
    },
    onSuccess: () => {
      logger.success('Content deleted', { contentId: content.id })
      queryClient.invalidateQueries({ queryKey: ['contents'] })
      setShowDeleteConfirm(false)
    },
    onError: (error: any) => {
      logger.error('Content deletion failed', error)
    },
  })

  const saveStakeholderMutation = useMutation({
    mutationFn: (responses: any) => {
      logger.userAction('Save Stakeholder Responses', {
        contentId: content.id,
        responseCount: Array.isArray(responses) ? responses.length : 0
      })
      return api.content.saveStakeholderResponses(content.id, responses)
    },
    onSuccess: (data) => {
      logger.success('Stakeholder responses saved', { contentId: content.id })
      queryClient.invalidateQueries({ queryKey: ['stakeholder-responses', content.id] })
      setShowInterviewModal(false)
      // Now start generation
      generateMutation.mutate(content.id)
    },
    onError: (error) => {
      logger.error('Stakeholder save failed', error)
      alert('Failed to save interview responses. Please try again.')
      setShowInterviewModal(false)
    },
  })

  const handleGenerate = () => {
    logger.userAction('Generate Button Clicked', { contentId: content.id })
    logger.info('Checking stakeholder responses', { hasResponses: hasStakeholderResponses })

    // Check if stakeholder interview is complete
    if (!hasStakeholderResponses) {
      // Show interview modal first
      logger.warn('No stakeholder responses - opening interview modal', { contentId: content.id })
      setShowInterviewModal(true)
    } else {
      // Already have responses, start generation
      logger.info('Stakeholder responses exist - starting generation', { contentId: content.id })
      generateMutation.mutate(content.id)
    }
  }

  const handleDelete = () => {
    logger.userAction('Confirm Delete', { contentId: content.id })
    deleteMutation.mutate(content.id)
  }

  const handleInterviewComplete = (responses: any) => {
    saveStakeholderMutation.mutate(responses)
  }

  const handleComplete = () => {
    setShowProgress(false)
    router.push(`/project/${content.id}?tab=narratives&session=${activeSessionId}`)
  }

  const handleBackground = async () => {
    // Add to background jobs with round number
    if (activeSessionId) {
      try {
        // Fetch session data to get round number
        const sessionData = await api.narrative.getSession(activeSessionId)
        addJob({
          sessionId: activeSessionId,
          contentId: content.id,
          contentTitle: content.title,
          roundNumber: sessionData.round_number
        })
      } catch (err) {
        console.error('Failed to fetch session data:', err)
        // Add job without round number as fallback
        addJob({
          sessionId: activeSessionId,
          contentId: content.id,
          contentTitle: content.title
        })
      }
    }
    setShowProgress(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link
            href={`/content/${content.id}`}
            className="text-xl font-bold text-stage-black hover:text-stage-red transition-colors"
          >
            {content.title}
          </Link>
          {content.genre && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stage-red/10 text-stage-red">
              {content.genre}
            </span>
          )}
        </div>
        {/* Delete Button */}
        <button
          onClick={() => {
            logger.userAction('Delete Button Clicked', { contentId: content.id })
            setShowDeleteConfirm(true)
            logger.stateChange('ContentCard', 'Delete modal opened')
          }}
          className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Delete project"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {content.summary && (
        <p className="text-base text-gray-700 mb-4 line-clamp-3 leading-relaxed">
          {content.summary}
        </p>
      )}

      <div className="space-y-2 mb-4">
        {content.runtime && (
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {content.runtime} minutes
          </div>
        )}
        {content.targetAudience && (
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {content.targetAudience}
          </div>
        )}
      </div>

      {content.created_at && (
        <p className="text-xs text-gray-400 mb-4">
          {t.dashboard.created} {formatDate(content.created_at)}
        </p>
      )}

      {/* Stakeholder Interview Status */}
      <div className="mb-4">
        {hasStakeholderResponses ? (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Stakeholder Interview Complete</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">Interview Required Before Generation</span>
          </div>
        )}
      </div>

      {completedSessions.length > 0 ? (
        <div className="space-y-2">
          {/* Show all completed sessions */}
          <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
            {/* View Project Button */}
          <Link
            href={`/project/${content.id}`}
            className="block w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-stage-red hover:bg-red-50 transition-colors text-center font-semibold text-gray-700 hover:text-stage-red"
          >
            View Project →
          </Link>

          {/* Session History */}
          <div className="mt-2 space-y-1">
            {completedSessions.slice(0, 3).map((session: any) => (
              <Link
                key={session.id}
                href={`/project/${content.id}?tab=narratives`}
                className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md hover:border-gray-300 transition-colors text-xs text-gray-600"
              >
                <div className="flex items-center justify-between">
                  <span>Session #{session.id} • {session.candidates_count} narratives</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium text-[10px]">
                    ✓ Complete
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full px-4 py-2 bg-stage-red text-white rounded-md hover:bg-stage-red-dark disabled:bg-gray-400 transition-colors text-sm font-medium"
          >
            {generateMutation.isPending ? t.dashboard.generating : t.dashboard.generateNewSet}
          </button>
        </div>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          className="w-full px-4 py-2 bg-stage-red text-white rounded-md hover:bg-stage-red-dark disabled:bg-gray-400 transition-colors text-sm font-medium"
        >
          {generateMutation.isPending ? t.dashboard.generating : t.dashboard.generateNarratives}
        </button>
      )}

      {generateMutation.isError && (
        <p className="mt-2 text-xs text-red-600">
          {t.error.generating}: {generateMutation.error instanceof Error ? generateMutation.error.message : t.error.unknown}
        </p>
      )}

      {/* Progress Modal */}
      {showProgress && activeSessionId && (
        <ProgressModal
          sessionId={activeSessionId}
          contentTitle={content.title}
          onComplete={handleComplete}
          onBackground={handleBackground}
        />
      )}

      {/* Stakeholder Interview Modal */}
      {showInterviewModal && (
        <StakeholderInterviewModal
          contentId={content.id}
          contentTitle={content.title}
          onComplete={handleInterviewComplete}
          onCancel={() => setShowInterviewModal(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Project?</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-1">"{content.title}"</p>
              <p className="text-xs text-gray-600">
                All sessions, narratives, and evaluations will be permanently deleted.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>

            {deleteMutation.isError && (
              <p className="mt-3 text-xs text-red-600 text-center">
                Error: {deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Failed to delete'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
