'use client'

/**
 * Content Details Page
 * Displays detailed information about a specific content piece
 */

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function ContentDetails() {
  const params = useParams()
  const contentId = parseInt(params.id as string)

  const { data: content, isLoading, error } = useQuery({
    queryKey: ['content', contentId],
    queryFn: () => api.content.get(contentId),
    enabled: !!contentId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-stage-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          Error loading content: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Link
              href="/"
              className="text-base font-medium text-stage-red hover:text-stage-red-dark mb-3 inline-block transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-stage-black mt-2">{content.title}</h1>
            {content.genre && (
              <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-stage-red/10 text-stage-red">
                {content.genre}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {content.runtime && (
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-xs text-gray-500">Runtime</p>
                <p className="font-medium">{content.runtime} minutes</p>
              </div>
            </div>
          )}

          {content.target_audience && (
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <div>
                <p className="text-xs text-gray-500">Target Audience</p>
                <p className="font-medium">{content.target_audience}</p>
              </div>
            </div>
          )}

          {content.created_at && (
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="font-medium">{formatDate(content.created_at)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {content.summary && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-stage-black mb-4">Summary</h2>
          <p className="text-lg text-gray-800 leading-relaxed">{content.summary}</p>
        </div>
      )}

      {/* Themes and Tone */}
      {(content.themes || content.tone) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.themes && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-stage-black mb-4">Themes</h2>
              <p className="text-lg text-gray-800 leading-relaxed">{content.themes}</p>
            </div>
          )}

          {content.tone && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-stage-black mb-4">Tone</h2>
              <p className="text-lg text-gray-800 leading-relaxed">{content.tone}</p>
            </div>
          )}
        </div>
      )}

      {/* Script */}
      {content.script && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-stage-black mb-4">
            Script / Storyline
          </h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-gray-900 font-sans text-base leading-relaxed">
              {content.script}
            </pre>
          </div>
        </div>
      )}

      {/* Metadata */}
      {content.content_metadata && Object.keys(content.content_metadata).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Metadata</h2>
          <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded overflow-x-auto">
            {JSON.stringify(content.content_metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
