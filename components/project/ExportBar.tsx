'use client'

/**
 * Export Bar
 * Fixed bottom bar for selecting and exporting narratives
 */

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FiDownload, FiX, FiCheck } from 'react-icons/fi'

interface ExportBarProps {
  selectedIds: number[]
  totalCount: number
  onExport: () => void
  onClear: () => void
}

export default function ExportBar({
  selectedIds,
  totalCount,
  onExport,
  onClear
}: ExportBarProps) {
  const hasSelection = selectedIds.length > 0

  return (
    <AnimatePresence>
      {hasSelection && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-40"
        >
          <div className="bg-gradient-to-r from-stage-red to-red-700 shadow-2xl border-t-4 border-red-900">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Selection Info */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <FiCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">
                        {selectedIds.length} {selectedIds.length === 1 ? 'Narrative' : 'Narratives'} Selected
                      </div>
                      <div className="text-white/80 text-sm">
                        out of {totalCount} total
                      </div>
                    </div>
                  </div>

                  {/* Selection Progress Bar */}
                  <div className="hidden md:block ml-4">
                    <div className="w-48 bg-white/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-white h-full transition-all duration-300"
                        style={{ width: `${(selectedIds.length / totalCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClear}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors border-2 border-white/30 flex items-center gap-2"
                  >
                    <FiX className="w-4 h-4" />
                    Clear Selection
                  </button>

                  <button
                    onClick={onExport}
                    className="px-6 py-3 bg-white text-stage-red rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <FiDownload className="w-5 h-5" />
                    Export Selected ({selectedIds.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Selection Checkbox Component for Narrative Cards
export function SelectionCheckbox({
  id,
  isSelected,
  onToggle
}: {
  id: number
  isSelected: boolean
  onToggle: (id: number) => void
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggle(id)
      }}
      className={cn(
        "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all",
        isSelected
          ? "bg-stage-red border-stage-red"
          : "bg-white border-gray-300 hover:border-stage-red"
      )}
    >
      <AnimatePresence mode="wait">
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <FiCheck className="w-5 h-5 text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
