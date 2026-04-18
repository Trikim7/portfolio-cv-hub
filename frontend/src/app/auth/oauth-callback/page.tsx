'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Status = 'processing' | 'success' | 'error'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('processing')
  const [message, setMessage] = useState('Đang xác thực tài khoản...')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const parseFragment = (): Record<string, string> => {
      const raw = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash
      const out: Record<string, string> = {}
      if (!raw) return out
      for (const part of raw.split('&')) {
        const [k, v] = part.split('=')
        if (k) out[decodeURIComponent(k)] = decodeURIComponent(v || '')
      }
      return out
    }

    const params = parseFragment()
    const search = new URLSearchParams(window.location.search)
    const err = params.error || search.get('error')

    if (err) {
      setStatus('error')
      setMessage(decodeURIComponent(err))
      return
    }

    const token = params.token
    const role = params.role || 'candidate'
    const provider = params.provider || ''
    const isNew = params.new_account === '1'
    const isLinked = params.linked === '1'

    if (!token) {
      setStatus('error')
      setMessage('Không nhận được token từ máy chủ.')
      return
    }

    try {
      localStorage.setItem('access_token', token)
      localStorage.setItem('role', role)
      window.dispatchEvent(new Event('login'))
    } catch {
      setStatus('error')
      setMessage('Không thể lưu phiên đăng nhập. Kiểm tra trình duyệt của bạn.')
      return
    }

    setStatus('success')
    setMessage(
      isLinked
        ? `Đã liên kết ${provider} thành công. Đang chuyển hướng...`
        : isNew
          ? `Tài khoản ${provider} đã được tạo. Đang chuyển hướng...`
          : `Đăng nhập ${provider} thành công. Đang chuyển hướng...`,
    )

    window.history.replaceState(null, '', '/auth/oauth-callback')

    const target =
      role === 'admin'
        ? '/admin/dashboard'
        : role === 'recruiter'
        ? '/recruiter/dashboard'
        : '/dashboard'

    const timer = window.setTimeout(() => router.push(target), 800)
    return () => window.clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-xl shadow-xl max-w-md w-full text-center space-y-6">
        {status === 'processing' && (
          <>
            <div className="animate-spin text-5xl">⏳</div>
            <h1 className="text-2xl font-bold text-gray-900">
              Đang xử lý đăng nhập
            </h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl">✅</div>
            <h1 className="text-2xl font-bold text-green-700">
              Đăng nhập thành công
            </h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl">❌</div>
            <h1 className="text-2xl font-bold text-red-700">
              Đăng nhập thất bại
            </h1>
            <p className="text-gray-600 break-words">{message}</p>
            <Link
              href="/login"
              className="inline-block mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Quay lại trang đăng nhập
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
