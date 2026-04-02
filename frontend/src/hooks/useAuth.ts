import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { apiClient } from '@/services/api'
import { TokenResponse, User } from '@/types'

export const useAuth = () => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const register = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response: TokenResponse = await apiClient.register(email, password)
      localStorage.setItem('access_token', response.access_token)
      setUser(response.user)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }, [router])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response: TokenResponse = await apiClient.login(email, password)
      localStorage.setItem('access_token', response.access_token)
      setUser(response.user)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }, [router])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    setUser(null)
    router.push('/login')
  }, [router])

  return { user, loading, error, register, login, logout }
}
