'use client'

/**
 * Stakeholder Interview Modal
 * Multi-step wizard for collecting strategic inputs from 4 core stakeholder roles
 * COMPULSORY before generation starts
 */

import { useState, useEffect, useRef } from 'react'
import { FiX, FiCheck, FiChevronLeft, FiChevronRight, FiMenu, FiDownload, FiUpload } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { logger } from '@/lib/logger'

interface StakeholderInterviewModalProps {
  contentId: string  // MongoDB ObjectId
  contentTitle: string
  onComplete: (responses: any) => void
  onCancel: () => void
}

// Define all questions according to STAKEHOLDER_QUESTIONNAIRE.md
const ROLES = [
  {
    id: 'content_head',
    name: 'Content Head',
    description: 'Business strategy, commercial viability, platform positioning',
    icon: '💼',
    color: 'blue'
  },
  {
    id: 'content_manager',
    name: 'Content Manager',
    description: 'Content integrity, audience expectations, genre accuracy',
    icon: '📋',
    color: 'green'
  },
  {
    id: 'marketing_manager',
    name: 'Marketing Manager',
    description: 'Market differentiation, positioning, messaging strategy',
    icon: '📊',
    color: 'purple'
  },
  {
    id: 'creative_head',
    name: 'Creative Head',
    description: 'Artistic vision, emotional core, tone, creative excellence',
    icon: '🎨',
    color: 'pink'
  }
]

const QUESTIONS = {
  content_head: [
    {
      id: 'business_objective',
      question: 'What is the #1 business goal for this content\'s marketing campaign?',
      type: 'single_choice',
      options: [
        { value: 'acquisition', label: 'Drive new subscriptions (acquisition focus)' },
        { value: 'retention', label: 'Boost engagement with existing users (retention focus)' },
        { value: 'expansion', label: 'Attract specific new demographic (expansion focus)' },
        { value: 'prestige', label: 'Build brand prestige/awards positioning (reputation focus)' },
        { value: 'competitive', label: 'Compete directly with specific competitor title (competitive focus)' }
      ]
    },
    {
      id: 'success_metric',
      question: 'Which metric matters most for measuring this campaign\'s success?',
      type: 'single_choice',
      options: [
        { value: 'ctr', label: 'Click-through rate (CTR) on promotional materials' },
        { value: 'conversion', label: 'Conversion rate (viewers who start watching)' },
        { value: 'completion', label: 'Completion rate (viewers who finish the content)' },
        { value: 'social', label: 'Social media engagement (shares, comments, buzz)' },
        { value: 'watch_time', label: 'Watch time / viewing hours generated' },
        { value: 'retention', label: 'Subscriber retention rate' }
      ]
    },
    {
      id: 'campaign_scale',
      question: 'How should this content be positioned in STAGE\'s portfolio?',
      type: 'single_choice',
      options: [
        { value: 'tentpole', label: 'Tentpole Release - Major marketing push, flagship positioning' },
        { value: 'standard', label: 'Standard Release - Regular promotional cycle' },
        { value: 'niche', label: 'Niche/Targeted - Focused on specific audience segment' },
        { value: 'experimental', label: 'Experimental/Prestige - Innovation or awards-focused' }
      ]
    },
    {
      id: 'competitive_context',
      question: 'How should this content position against competition? (Name 1-2 competitor titles and what we should do differently)',
      type: 'text',
      placeholder: 'Example: Competing with Netflix\'s Sacred Games. We should emphasize our faster pace and stronger female lead...'
    },
    {
      id: 'risk_tolerance',
      question: 'How bold/experimental should the marketing narrative be?',
      type: 'slider',
      min: 1,
      max: 5,
      labels: ['Play It Safe', 'Slightly Bold', 'Balanced', 'Quite Bold', 'Highly Experimental']
    },
    {
      id: 'additional_comments',
      question: 'Any additional thoughts, suggestions, or strategic considerations?',
      type: 'textarea',
      placeholder: 'Share any other insights, concerns, or ideas that would help shape the marketing narrative...',
      required: false
    }
  ],
  content_manager: [
    {
      id: 'usp',
      question: 'In 2-3 sentences, what makes this content truly special or different?',
      type: 'textarea',
      placeholder: 'What\'s the ONE thing only this content delivers? Why would someone choose this over everything else?'
    },
    {
      id: 'genre_positioning',
      question: 'How should this handle genre conventions?',
      type: 'single_choice',
      options: [
        { value: 'pure', label: 'Pure Genre - Deliver exactly what genre fans expect' },
        { value: 'plus', label: 'Genre-Plus - Core genre + elevated execution or deeper themes' },
        { value: 'bending', label: 'Genre-Bending - Mix two genres equally' },
        { value: 'subverting', label: 'Genre-Subverting - Deliberately challenge genre expectations' },
        { value: 'transcending', label: 'Genre-Transcending - Universal story using genre trappings' }
      ]
    },
    {
      id: 'target_audience',
      question: 'Who is the primary audience for this content? (Select up to 2)',
      type: 'multi_choice',
      max: 2,
      options: [
        { value: 'young_adults', label: 'Young Adults (18-25)' },
        { value: 'millennials', label: 'Millennials (26-35)' },
        { value: 'gen_x', label: 'Gen X (36-50)' },
        { value: 'mature', label: 'Mature Audiences (50+)' },
        { value: 'families', label: 'Families (Multi-generational)' },
        { value: 'genre_enthusiasts', label: 'Genre Enthusiasts (Age-agnostic)' }
      ]
    },
    {
      id: 'cultural_context',
      question: 'Any cultural nuances or regional preferences to consider? (Optional)',
      type: 'textarea',
      placeholder: 'Regional dialects, cultural sensitivities, local context that makes this more relatable...',
      required: false
    },
    {
      id: 'audience_desire',
      question: 'What specific need or desire does this content fulfill for viewers?',
      type: 'single_choice',
      options: [
        { value: 'escapism', label: 'Escapism - Take me away from reality' },
        { value: 'representation', label: 'Representation - Show people like me' },
        { value: 'social_currency', label: 'Social Currency - Give me something to talk about' },
        { value: 'emotional_release', label: 'Emotional Release - Let me feel deeply' },
        { value: 'intellectual', label: 'Intellectual Engagement - Make me think' },
        { value: 'comfort', label: 'Comfort/Familiarity - Give me what I know and love' },
        { value: 'discovery', label: 'Discovery - Show me something new' }
      ]
    },
    {
      id: 'additional_comments',
      question: 'Any additional thoughts, suggestions, or content insights?',
      type: 'textarea',
      placeholder: 'Share any other perspectives on positioning, audience appeal, or content differentiation...',
      required: false
    }
  ],
  marketing_manager: [
    {
      id: 'brand_alignment',
      question: 'How should this content reflect STAGE\'s brand identity? (Select up to 3)',
      type: 'multi_choice',
      max: 3,
      options: [
        { value: 'premium', label: 'Premium/High-quality' },
        { value: 'bold', label: 'Bold/Edgy/Provocative' },
        { value: 'family_friendly', label: 'Family-friendly/Inclusive' },
        { value: 'authentic', label: 'Authentic/Real/Gritty' },
        { value: 'innovative', label: 'Innovative/Cutting-edge' },
        { value: 'accessible', label: 'Accessible/Mass-appeal' },
        { value: 'prestige', label: 'Prestige/Award-worthy' },
        { value: 'entertaining', label: 'Entertaining/Fun' },
        { value: 'thoughtful', label: 'Thoughtful/Intelligent' },
        { value: 'regional', label: 'Regional/Rooted' }
      ]
    },
    {
      id: 'marketing_channels',
      question: 'Where will this campaign primarily run? (Select all that apply)',
      type: 'multi_choice',
      max: 10,
      options: [
        { value: 'social', label: 'Social Media (Instagram, Twitter, Facebook)' },
        { value: 'youtube', label: 'YouTube (trailers, teasers, behind-scenes)' },
        { value: 'tv', label: 'Traditional TV spots' },
        { value: 'outdoor', label: 'Outdoor (billboards, metro, bus shelters)' },
        { value: 'digital_ads', label: 'Digital display ads' },
        { value: 'influencer', label: 'Influencer partnerships / celebrity endorsements' },
        { value: 'pr', label: 'PR / Media coverage' },
        { value: 'partnerships', label: 'Partnerships (brand tie-ins, events)' },
        { value: 'in_app', label: 'In-app (STAGE app promos, push notifications)' }
      ]
    },
    {
      id: 'target_message',
      question: 'What\'s the ONE message the audience should take away from marketing? (Max 20 words)',
      type: 'text',
      placeholder: 'Complete: "After seeing the marketing, viewers should think..."',
      maxLength: 150
    },
    {
      id: 'messaging_constraints',
      question: 'Are there any topics, angles, or messaging we should avoid? (Optional)',
      type: 'textarea',
      placeholder: 'Sensitive topics, competitor mentions to avoid, political/religious sensitivities...',
      required: false
    },
    {
      id: 'cta_strategy',
      question: 'What action should marketing drive viewers toward?',
      type: 'single_choice',
      options: [
        { value: 'immediate_watch', label: 'Immediate Watch - "Watch now" urgency' },
        { value: 'subscribe', label: 'Subscribe to Watch - Acquisition-focused' },
        { value: 'watchlist', label: 'Add to Watchlist - Build anticipation' },
        { value: 'social_engagement', label: 'Social Engagement - "Share your reaction"' },
        { value: 'event', label: 'Event Participation - "Join the premiere"' },
        { value: 'binge', label: 'Binge Commitment - "Clear your weekend"' }
      ]
    },
    {
      id: 'additional_comments',
      question: 'Any additional thoughts, suggestions, or marketing ideas?',
      type: 'textarea',
      placeholder: 'Share any other campaign ideas, promotional angles, or marketing considerations...',
      required: false
    }
  ],
  creative_head: [
    {
      id: 'emotional_core',
      question: 'What primary emotion should viewers feel from the marketing?',
      type: 'single_choice',
      options: [
        { value: 'excitement', label: 'Excitement - Adrenaline, energy, action-packed' },
        { value: 'curiosity', label: 'Curiosity - Mystery, intrigue, "what happens?"' },
        { value: 'fear', label: 'Fear/Tension - Suspense, dread, edge-of-seat' },
        { value: 'empathy', label: 'Empathy - Connection, understanding, relatability' },
        { value: 'joy', label: 'Joy - Happiness, laughter, feel-good' },
        { value: 'awe', label: 'Awe - Wonder, amazement, spectacle' },
        { value: 'nostalgia', label: 'Nostalgia - Warmth, memory, comfort' },
        { value: 'anger', label: 'Anger/Outrage - Injustice, controversy, provocation' }
      ]
    },
    {
      id: 'tonal_scales',
      question: 'Define the desired tone using these scales (1-5)',
      type: 'multi_slider',
      scales: [
        { id: 'seriousness', label: 'Seriousness', low: 'Very Playful', high: 'Very Serious' },
        { id: 'darkness', label: 'Darkness', low: 'Very Light', high: 'Very Dark' },
        { id: 'realism', label: 'Realism', low: 'Stylized/Heightened', high: 'Grounded/Realistic' },
        { id: 'scale', label: 'Scale', low: 'Intimate', high: 'Epic' }
      ]
    },
    {
      id: 'creative_references',
      question: 'Name 2-3 titles whose MARKETING you admired, and explain why (Optional)',
      type: 'textarea',
      placeholder: 'Format: Title 1: [Name]\\nWhy it worked: [1-2 sentences]\\n\\nTitle 2: [Name]\\nWhy it worked: [1-2 sentences]',
      required: false
    },
    {
      id: 'visual_emphasis',
      question: 'What creative elements should marketing prioritize? (Rank top 3 by dragging)',
      type: 'ranked_choice',
      count: 3,
      options: [
        { value: 'color', label: 'Color palette / Visual style' },
        { value: 'music', label: 'Music / Sound design' },
        { value: 'cinematography', label: 'Cinematography / Shot composition' },
        { value: 'cast', label: 'Star power / Cast appeal' },
        { value: 'production_scale', label: 'Production scale / Budget on screen' },
        { value: 'locations', label: 'Locations / World-building' },
        { value: 'costume', label: 'Costume/Production design' },
        { value: 'editing', label: 'Editing / Pacing' },
        { value: 'vfx', label: 'VFX / Spectacle' }
      ]
    },
    {
      id: 'story_focus',
      question: 'What aspect of the story should marketing emphasize most?',
      type: 'single_choice',
      options: [
        { value: 'plot', label: 'Plot/Mystery - "What happens"' },
        { value: 'characters', label: 'Characters/Relationships - "Who they are"' },
        { value: 'world', label: 'World/Setting - "Where it happens"' },
        { value: 'theme', label: 'Theme/Message - "What it means"' },
        { value: 'spectacle', label: 'Spectacle/Action - "The experience"' },
        { value: 'emotion', label: 'Emotion/Journey - "How it feels"' }
      ]
    },
    {
      id: 'additional_comments',
      question: 'Any additional thoughts, suggestions, or creative ideas?',
      type: 'textarea',
      placeholder: 'Share any other creative considerations, visual concepts, or narrative angles...',
      required: false
    }
  ]
}

export default function StakeholderInterviewModal({
  contentId,
  contentTitle,
  onComplete,
  onCancel
}: StakeholderInterviewModalProps) {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<any>({})
  const [isSaving, setIsSaving] = useState(false)
  const [completedRoles, setCompletedRoles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load saved responses from localStorage on mount
  useEffect(() => {
    logger.stateChange('StakeholderInterviewModal', 'Opened', { contentId })
    const savedData = localStorage.getItem(`stakeholder_interview_${contentId}`)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setResponses(parsed.responses || {})
        setCompletedRoles(parsed.completedRoles || [])
        logger.info('Restored saved interview data', {
          answersCount: Object.keys(parsed.responses).length
        })
      } catch (e) {
        logger.error('Failed to parse saved interview data', e)
      }
    }
  }, [contentId])

  // Save responses to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      localStorage.setItem(`stakeholder_interview_${contentId}`, JSON.stringify({
        responses,
        completedRoles,
        lastSaved: new Date().toISOString()
      }))
    }
  }, [responses, completedRoles, contentId])

  const currentRole = ROLES[currentRoleIndex]
  const currentQuestions = QUESTIONS[currentRole.id as keyof typeof QUESTIONS]
  const currentQuestion = currentQuestions[currentQuestionIndex]
  const totalQuestions = Object.values(QUESTIONS).flat().length
  const answeredCount = Object.keys(responses).length
  const progress = (answeredCount / totalQuestions) * 100

  const handleAnswer = (questionId: string, value: any) => {
    setResponses((prev: any) => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleNext = () => {
    logger.userAction('Interview Next Button', {
      role: currentRole.id,
      question: currentQuestionIndex + 1
    })

    // Check if current question is answered (unless optional)
    const isAnswered = responses[currentQuestion.id] !== undefined
    const isRequired = currentQuestion.required !== false

    if (isRequired && !isAnswered) {
      logger.warn('Question not answered', {
        role: currentRole.id,
        question: currentQuestion.id
      })
      alert('Please answer this question before continuing')
      return
    }

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Last question of current role - determine what happens next
      const isCurrentRoleAlreadyCompleted = completedRoles.includes(currentRole.id)

      // Calculate what the completed roles will be after this
      const updatedCompletedRoles = isCurrentRoleAlreadyCompleted
        ? completedRoles
        : [...completedRoles, currentRole.id]

      // Mark current role as completed
      if (!isCurrentRoleAlreadyCompleted) {
        setCompletedRoles(updatedCompletedRoles)
      }

      // Check if all roles will be completed
      if (updatedCompletedRoles.length === ROLES.length) {
        // All roles completed, submit!
        handleSubmit()
        return
      }

      // Find next incomplete role
      const nextIncompleteRoleIndex = ROLES.findIndex(
        (role) => !updatedCompletedRoles.includes(role.id)
      )

      if (nextIncompleteRoleIndex !== -1) {
        // Jump to next incomplete role
        setCurrentRoleIndex(nextIncompleteRoleIndex)
        setCurrentQuestionIndex(0)
      } else {
        // No incomplete roles found, stay on current (shouldn't happen)
        setCurrentQuestionIndex(0)
      }
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentRoleIndex > 0) {
      setCurrentRoleIndex(currentRoleIndex - 1)
      const prevQuestions = QUESTIONS[ROLES[currentRoleIndex - 1].id as keyof typeof QUESTIONS]
      setCurrentQuestionIndex(prevQuestions.length - 1)
    }
  }

  const handleSubmit = async () => {
    logger.userAction('Complete Stakeholder Interview', {
      contentId,
      totalResponses: Object.keys(responses).length,
      completedRoles: completedRoles.length
    })
    setIsSaving(true)
    try {
      // Convert responses to array format for backend
      // Backend expects: Array<{role: string, question: string, answer: any}>
      const structuredResponses: Array<{role: string, question: string, answer: any}> = []

      Object.entries(responses).forEach(([questionId, value]) => {
        // Find which role this question belongs to
        for (const [roleId, questions] of Object.entries(QUESTIONS)) {
          const question = questions.find((q: any) => q.id === questionId)
          if (question) {
            structuredResponses.push({
              role: roleId,
              question: question.question,
              answer: value
            })
            break // Stop after finding the question
          }
        }
      })

      logger.info('Structured responses', { count: structuredResponses.length })
      onComplete(structuredResponses)
      logger.success('Stakeholder interview completed')
    } catch (error) {
      logger.error('Stakeholder interview submission failed', error)
      alert('Failed to save responses. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    logger.userAction('Export Stakeholder Data', { contentId })
    try {
      // Get data from localStorage
      const savedData = localStorage.getItem(`stakeholder_interview_${contentId}`)

      if (!savedData) {
        logger.warn('No saved data to export', { contentId })
        alert('No saved data found to export.')
        return
      }

      const data = JSON.parse(savedData)

      // Create a formatted export object
      const exportData: any = {
        contentId,
        contentTitle,
        exportedAt: new Date().toISOString(),
        lastSaved: data.lastSaved,
        completedRoles: data.completedRoles || [],
        totalQuestions: Object.keys(data.responses || {}).length,
        responses: data.responses || {},
        humanReadable: {}
      }

      // Add human-readable version
      Object.entries(data.responses || {}).forEach(([questionId, answer]) => {
        // Find the question
        for (const [roleId, questions] of Object.entries(QUESTIONS)) {
          const question = questions.find((q: any) => q.id === questionId)
          if (question) {
            if (!exportData.humanReadable[roleId]) {
              exportData.humanReadable[roleId] = {}
            }
            exportData.humanReadable[roleId][questionId] = {
              question: question.question,
              answer: answer
            }
            break
          }
        }
      })

      // Create downloadable file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `stakeholder-interview-${contentId}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      logger.success('Stakeholder data exported', {
        responseCount: Object.keys(data.responses || {}).length
      })
      alert(`✅ Exported ${Object.keys(data.responses || {}).length} responses successfully!`)
    } catch (error) {
      logger.error('Export data failed', error)
      alert('Failed to export data. Please check console for details.')
    }
  }

  const handleImport = () => {
    logger.userAction('Import Stakeholder Data', { contentId })
    fileInputRef.current?.click()
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Read file content
      const text = await file.text()
      const importedData = JSON.parse(text)

      // Validate imported data structure
      if (!importedData.responses || typeof importedData.responses !== 'object') {
        alert('❌ Invalid file format: Missing or invalid "responses" field.')
        return
      }

      // Validate that all question IDs exist in our question set
      const allValidQuestionIds = new Set(
        Object.values(QUESTIONS).flat().map((q: any) => q.id)
      )

      const importedQuestionIds = Object.keys(importedData.responses)
      const invalidQuestionIds = importedQuestionIds.filter(
        id => !allValidQuestionIds.has(id)
      )

      if (invalidQuestionIds.length > 0) {
        console.warn('Found unknown question IDs:', invalidQuestionIds)
        if (!confirm(`⚠️ This file contains ${invalidQuestionIds.length} unknown question(s). They will be skipped. Continue import?`)) {
          return
        }
      }

      // Filter out invalid questions
      const validResponses: any = {}
      importedQuestionIds.forEach(id => {
        if (allValidQuestionIds.has(id)) {
          validResponses[id] = importedData.responses[id]
        }
      })

      // Determine which roles are completed based on imported responses
      const importedCompletedRoles: string[] = []
      for (const [roleId, questions] of Object.entries(QUESTIONS)) {
        const roleQuestions = questions as any[]
        const requiredQuestions = roleQuestions.filter(q => q.required !== false)
        const answeredRequiredQuestions = requiredQuestions.filter(
          q => validResponses[q.id] !== undefined
        )

        // Consider role completed if all required questions are answered
        if (answeredRequiredQuestions.length === requiredQuestions.length) {
          importedCompletedRoles.push(roleId)
        }
      }

      // Apply imported data
      setResponses(validResponses)
      setCompletedRoles(importedCompletedRoles)

      // Save to localStorage
      localStorage.setItem(`stakeholder_interview_${contentId}`, JSON.stringify({
        responses: validResponses,
        completedRoles: importedCompletedRoles,
        lastSaved: new Date().toISOString()
      }))

      logger.success('Stakeholder data imported', {
        responseCount: Object.keys(validResponses).length,
        completedRoles: importedCompletedRoles.length
      })
      alert(`✅ Successfully imported ${Object.keys(validResponses).length} responses!\n\n${importedCompletedRoles.length} role(s) completed:\n${importedCompletedRoles.map(id => ROLES.find(r => r.id === id)?.name).join(', ') || 'None'}`)

      // Reset to first incomplete role or stay on current
      const firstIncompleteRoleIndex = ROLES.findIndex(r => !importedCompletedRoles.includes(r.id))
      if (firstIncompleteRoleIndex !== -1) {
        setCurrentRoleIndex(firstIncompleteRoleIndex)
        setCurrentQuestionIndex(0)
      }
    } catch (error) {
      logger.error('Import data failed', error)
      alert(`❌ Failed to import file: ${error instanceof Error ? error.message : 'Invalid JSON format'}`)
    } finally {
      // Clear file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const renderQuestionInput = () => {
    const value = responses[currentQuestion.id]

    switch (currentQuestion.type) {
      case 'single_choice':
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option: any) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  value === option.value
                    ? 'border-stage-red bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    value === option.value ? 'border-stage-red' : 'border-gray-300'
                  }`}>
                    {value === option.value && (
                      <div className="w-3 h-3 rounded-full bg-stage-red" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        )

      case 'multi_choice':
        const selectedValues = value || []
        const maxSelections = (currentQuestion as any).max || 10
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-3">
              Select up to {maxSelections} option{maxSelections > 1 ? 's' : ''}
            </p>
            {currentQuestion.options?.map((option: any) => {
              const isSelected = selectedValues.includes(option.value)
              const canSelect = selectedValues.length < maxSelections || isSelected
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    if (isSelected) {
                      handleAnswer(
                        currentQuestion.id,
                        selectedValues.filter((v: string) => v !== option.value)
                      )
                    } else if (canSelect) {
                      handleAnswer(currentQuestion.id, [...selectedValues, option.value])
                    }
                  }}
                  disabled={!canSelect}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-stage-red bg-red-50'
                      : canSelect
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                      isSelected ? 'border-stage-red bg-stage-red' : 'border-gray-300'
                    }`}>
                      {isSelected && <FiCheck className="text-white w-3 h-3" />}
                    </div>
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )

      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
            placeholder={(currentQuestion as any).placeholder}
            maxLength={(currentQuestion as any).maxLength}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-stage-red focus:outline-none text-gray-900 placeholder:text-gray-400"
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
            placeholder={(currentQuestion as any).placeholder}
            rows={4}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-stage-red focus:outline-none resize-none text-gray-900 placeholder:text-gray-400"
          />
        )

      case 'slider':
        const sliderValue = value || 3
        return (
          <div className="space-y-4">
            <div className="px-2">
              <input
                type="range"
                min={(currentQuestion as any).min}
                max={(currentQuestion as any).max}
                value={sliderValue}
                onChange={(e) => handleAnswer(currentQuestion.id, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #E31E24 0%, #E31E24 ${((sliderValue - 1) / 4) * 100}%, #e5e7eb ${((sliderValue - 1) / 4) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
            <div className="grid grid-cols-5 gap-1 text-xs">
              {(currentQuestion as any).labels?.map((label: string, idx: number) => (
                <div
                  key={idx}
                  className={`text-center ${
                    sliderValue === idx + 1 ? 'font-bold text-stage-red' : 'text-gray-600'
                  }`}
                >
                  <div className="font-bold mb-1">{idx + 1}</div>
                  <div className="leading-tight">{label}</div>
                </div>
              ))}
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Selected: <span className="font-bold text-stage-red">{sliderValue}. {(currentQuestion as any).labels?.[sliderValue - 1]}</span></p>
            </div>
          </div>
        )

      case 'multi_slider':
        const sliderValues = value || {}
        return (
          <div className="space-y-6">
            {(currentQuestion as any).scales?.map((scale: any) => (
              <div key={scale.id} className="space-y-2">
                <label className="font-semibold text-gray-900">{scale.label}</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={sliderValues[scale.id] || 3}
                  onChange={(e) =>
                    handleAnswer(currentQuestion.id, {
                      ...sliderValues,
                      [scale.id]: parseInt(e.target.value)
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>1: {scale.low}</span>
                  <span>5: {scale.high}</span>
                </div>
              </div>
            ))}
          </div>
        )

      case 'ranked_choice':
        const rankedValues = value || []
        const maxRank = (currentQuestion as any).count || 3
        const availableOptions = (currentQuestion as any).options?.filter(
          (opt: any) => !rankedValues.includes(opt.value)
        ) || []

        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-3">
              Select your top {maxRank} priorities in order (drag to reorder if needed)
            </p>

            {/* Selected/Ranked Items */}
            {rankedValues.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Your Rankings:</p>
                {rankedValues.map((val: string, idx: number) => {
                  const option = (currentQuestion as any).options?.find((o: any) => o.value === val)
                  return (
                    <div
                      key={val}
                      className="flex items-center gap-3 p-3 bg-stage-red/10 border-2 border-stage-red rounded-lg"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <FiMenu className="text-gray-400 cursor-move" />
                        <span className="font-bold text-stage-red">#{idx + 1}</span>
                        <span className="font-medium text-gray-900">{option?.label}</span>
                      </div>
                      <button
                        onClick={() => {
                          handleAnswer(
                            currentQuestion.id,
                            rankedValues.filter((_: string, i: number) => i !== idx)
                          )
                        }}
                        className="p-1 hover:bg-red-200 rounded transition-colors"
                      >
                        <FiX className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Available Options to Select */}
            {rankedValues.length < maxRank && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Select {maxRank - rankedValues.length} more:
                </p>
                {availableOptions.map((option: any) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleAnswer(currentQuestion.id, [...rankedValues, option.value])
                    }}
                    className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
                  >
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {rankedValues.length === maxRank && (
              <p className="text-sm text-green-600 font-medium">
                ✓ All {maxRank} priorities selected
              </p>
            )}
          </div>
        )

      default:
        return (
          <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-lg">
            <p className="text-amber-800 font-medium mb-2">⚠️ Question type not yet implemented</p>
            <p className="text-sm text-amber-700 mb-4">This question is optional. Click Next to continue.</p>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Skip This Question
            </button>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Stakeholder Interview</h2>
              <p className="text-sm text-gray-600 mt-1">Required before generation • {contentTitle}</p>
              <p className="text-xs text-stage-red mt-1 font-medium">💡 Click any role below to complete them in any order</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                title="Import responses from a JSON file"
              >
                <FiUpload className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                title="Export your saved responses"
              >
                <FiDownload className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            {/* Hidden file input for import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileImport}
              className="hidden"
            />
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{answeredCount} of {totalQuestions} questions answered</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-stage-red h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Role Indicators */}
          <div className="flex gap-2 mt-4">
            {ROLES.map((role, idx) => {
              const isCompleted = completedRoles.includes(role.id)
              const isCurrent = idx === currentRoleIndex
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    setCurrentRoleIndex(idx)
                    setCurrentQuestionIndex(0)
                  }}
                  className={`flex-1 p-2 rounded-lg text-center text-sm font-medium transition-all hover:scale-105 ${
                    isCurrent
                      ? 'bg-stage-red text-white'
                      : isCompleted
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-lg mb-1 flex items-center justify-center gap-1">
                    {role.icon}
                    {isCompleted && <span className="text-sm">✓</span>}
                  </div>
                  <div className="text-xs">{role.name}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentRoleIndex}-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Role Header */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-stage-red">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{currentRole.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{currentRole.name}</h3>
                    <p className="text-sm text-gray-600">{currentRole.description}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Question {currentQuestionIndex + 1} of {currentQuestions.length}
                </div>
              </div>

              {/* Question */}
              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  {currentQuestion.question}
                  {currentQuestion.required === false && (
                    <span className="text-sm text-gray-500 font-normal ml-2">(Optional)</span>
                  )}
                </h4>
                {renderQuestionInput()}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={currentRoleIndex === 0 && currentQuestionIndex === 0}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
            >
              <FiChevronLeft />
              Back
            </button>

            <div className="text-sm text-center">
              <div className="text-gray-900 font-medium">
                {completedRoles.length}/{ROLES.length} roles completed
              </div>
              <div className="text-gray-600 text-xs">
                Question {currentQuestionIndex + 1}/{currentQuestions.length}
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={isSaving}
              className="px-6 py-3 bg-stage-red text-white rounded-lg hover:bg-stage-red-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
            >
              {currentQuestionIndex === currentQuestions.length - 1 ? (
                completedRoles.includes(currentRole.id) || completedRoles.length + 1 === ROLES.length ? (
                  isSaving ? 'Saving...' : 'Complete Interview'
                ) : (
                  <>
                    Complete {currentRole.name}
                    <FiCheck />
                  </>
                )
              ) : (
                <>
                  Next
                  <FiChevronRight />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
