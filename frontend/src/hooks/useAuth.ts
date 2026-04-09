import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { apiClient } from '@/services/api'
import { TokenResponse, User } from '@/types'

// Helper function to decode JWT and extract role
const decodeToken = (token: string): { role?: string } => {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch {
    return {}
  }
}

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
      // Extract role from token and save to localStorage
      const decoded = decodeToken(response.access_token)
      localStorage.setItem('role', decoded.role || 'candidate')
      console.log('✓ Role saved to localStorage:', decoded.role || 'candidate')
      setUser(response.user)
      // Dispatch custom event to notify navbar of login
      window.dispatchEvent(new Event('login'))
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
      // Extract role from token and save to localStorage
      const decoded = decodeToken(response.access_token)
      const userRole = decoded.role || 'candidate'
      localStorage.setItem('role', userRole)
      console.log('✓ Role saved to localStorage:', userRole)
      setUser(response.user)
      // Dispatch custom event to notify navbar of login
      window.dispatchEvent(new Event('login'))
      // Redirect based on role
      if (userRole === 'admin') {
        router.push('/admin/dashboard')
      } else if (userRole === 'recruiter') {
        router.push('/recruiter/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }, [router])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('role')
    setUser(null)
    // Dispatch custom event to notify navbar of logout
    window.dispatchEvent(new Event('logout'))
    router.push('/login')
  }, [router])

  return { user, loading, error, register, login, logout }
}
