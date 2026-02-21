'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslation } from '@/lib/i18n'

export function Navbar() {
  const { language } = useLanguage()
  const t = useTranslation(language)

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/stage-logo.png"
                alt="STAGE"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
              <span className="text-lg font-semibold text-stage-black">
                {t.nav.narrativeEngine}
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-stage-red px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t.nav.dashboard}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
