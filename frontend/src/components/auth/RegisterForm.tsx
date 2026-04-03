'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterForm() {
  const { register, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const getPasswordByteLength = (str: string) => {
    return new TextEncoder().encode(str).length
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (password !== confirmPassword) {
      setPasswordError('Mật khẩu không khớp')
      return
    }

    if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (getPasswordByteLength(password) > 30) {
      setPasswordError('Mật khẩu quá dài (tối đa 30 ký tự). Vui lòng sử dụng mật khẩu ngắn hơn.')
      return
    }

    register(email, password)
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Đăng ký</h1>

      {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu
            <span className={`ml-2 text-xs ${getPasswordByteLength(password) > 30 ? 'text-red-600' : getPasswordByteLength(password) > 20 ? 'text-yellow-600' : 'text-gray-500'}`}>
              ({getPasswordByteLength(password)}/30)
            </span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        {passwordError && (
          <div className="p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded">{passwordError}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition"
        >
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-blue-500 hover:underline">
          Đăng nhập tại đây
        </Link>
      </p>
    </div>
  )
}
