'use client'

/**
 * Round 2 Feedback Modal
 * Collects stakeholder feedback to start Round 2 council discussion
 */

import { useState } from 'react'
import { api } from '@/lib/api'

interface Round2ModalProps {
  sessionId: number
  onClose: () => void
  onSuccess: (round2SessionId: number) => void
}

export default function Round2Modal({ sessionId, onClose, onSuccess }: Round2ModalProps) {
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    // Validation
    if (feedback.trim().length < 50) {
      setError('Please provide at least 50 characters of feedback')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await api.narrative.startRound2(sessionId, feedback)
      onSuccess(response.round_2_session_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start Round 2')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🗣️ Start Round 2 Discussion
        </h2>

        <p className="text-gray-700 font-medium mb-6">
          Share what context or angles the council might have missed.
          They'll reconvene and create new candidates addressing your feedback.
        </p>

        {/* Feedback Input */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Your Feedback for the Council
          </label>
          <textarea
            value={feedback}
            onChange={(e) => {
              setFeedback(e.target.value)
              setError(null)
            }}
            className="w-full h-40 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium resize-none"
            placeholder="Example: Focus more on the emotional father-son redemption story. The heist is just the backdrop - the real narrative should be about second chances and sacrifice for family."
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs font-medium ${
              feedback.length < 50 ? 'text-red-600' : 'text-green-600'
            }`}>
              {feedback.length} characters {feedback.length < 50 ? `(${50 - feedback.length} more needed)` : '✓'}
            </span>
            <span className="text-xs text-gray-600 font-medium">
              💡 Tip: Be specific about missing angles or new directions
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-sm font-bold text-red-900">{error}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
          <p className="text-sm font-bold text-gray-900 mb-2">What happens next:</p>
          <ul className="text-sm text-gray-700 space-y-1 font-medium">
            <li>✅ Council reviews Round 1 results + your feedback</li>
            <li>✅ Discusses how to incorporate new context</li>
            <li>✅ Creates 10 new candidates (refined + fresh angles)</li>
            <li>✅ Audience personas evaluate Round 2 candidates</li>
            <li>⏱️ Takes ~5 minutes</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || feedback.length < 50}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Starting Round 2...
              </span>
            ) : (
              'Start Round 2 →'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
