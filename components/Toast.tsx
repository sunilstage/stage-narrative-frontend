'use client'

/**
 * Toast Notification Component
 * Simple toast notifications for generation completion
 */

import { useEffect } from 'react'
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  duration?: number
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

export function ToastNotification({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const duration = toast.duration || 5000
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast, onClose])

  const icons = {
    success: <FiCheck className="w-6 h-6 text-green-600" />,
    error: <FiAlertCircle className="w-6 h-6 text-red-600" />,
    info: <FiCheck className="w-6 h-6 text-blue-600" />,
  }

  const bgColors = {
    success: 'bg-green-50 border-green-300',
    error: 'bg-red-50 border-red-300',
    info: 'bg-blue-50 border-blue-300',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`max-w-md w-full ${bgColors[toast.type]} rounded-xl shadow-2xl border-2 p-4 pointer-events-auto`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[toast.type]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            {toast.title}
          </h3>
          <p className="text-sm text-gray-700 font-medium">
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 p-1 hover:bg-white/50 rounded transition-colors"
        >
          <FiX className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-6 right-6 z-[60] space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastNotification key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  )
}
