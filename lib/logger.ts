/**
 * Structured Logging Utility
 * Provides comprehensive logging for all user actions, API calls, and errors
 */

export const logger = {
  // API Calls
  apiRequest: (endpoint: string, method: string, data?: any) => {
    console.log(`🔵 [API Request] ${method} ${endpoint}`, data ? { data } : '')
  },
  apiResponse: (endpoint: string, status: number, data?: any) => {
    console.log(`🟢 [API Response] ${status} ${endpoint}`, data ? { data } : '')
  },
  apiError: (endpoint: string, error: any) => {
    console.error(`🔴 [API Error] ${endpoint}`, { error: error.message, details: error })
  },

  // User Actions
  userAction: (action: string, details?: any) => {
    console.log(`👤 [User Action] ${action}`, details || '')
  },

  // State Changes
  stateChange: (component: string, change: string, data?: any) => {
    console.log(`📊 [State] ${component}: ${change}`, data || '')
  },

  // Navigation
  navigation: (from: string, to: string) => {
    console.log(`🧭 [Navigation] ${from} → ${to}`)
  },

  // Errors
  error: (context: string, error: any) => {
    console.error(`❌ [Error] ${context}`, { error: error.message, stack: error.stack })
  },

  // Info
  info: (message: string, data?: any) => {
    console.log(`ℹ️ [Info] ${message}`, data || '')
  },

  // Success
  success: (message: string, data?: any) => {
    console.log(`✅ [Success] ${message}`, data || '')
  },

  // Warning
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ [Warning] ${message}`, data || '')
  }
}
