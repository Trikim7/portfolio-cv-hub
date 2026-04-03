'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

export function useToast() {
  const [toast, setToast] = useState<ToastProps | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
    setToast({ message, type, duration })
  }

  const closeToast = () => {
    setToast(null)
  }

  return { toast, showToast, closeToast }
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps & { onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type]

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }[type]

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-pulse z-50`}>
      <span className="font-bold text-lg">{icon}</span>
      <span>{message}</span>
    </div>
  )
}
