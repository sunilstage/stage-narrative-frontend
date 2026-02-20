'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import type { Language } from '@/lib/i18n'

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
          language === 'en'
            ? 'bg-white text-stage-red shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
          language === 'hi'
            ? 'bg-white text-stage-red shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        हिं
      </button>
    </div>
  )
}
