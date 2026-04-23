'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface AuthContextType {
  isLoggedIn: boolean
  role: string | null
  checkAuth: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy initialisers read localStorage synchronously on the first client
  // render — this eliminates the flash of "Đăng nhập" that appeared before
  // the useEffect ran (FOUC / Flash of Unauthenticated Content).
  // On the server typeof window === 'undefined' so they return the default.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('access_token')
  })
  const [role, setRole] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('role')
  })
  // loading stays true on SSR so the navbar stays blank until hydration is
  // complete and the effect has run a final consistency check.
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    // If we already read from localStorage, we are sync ready — no spinner needed.
    return false
  })

  const checkAuth = useCallback(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      const userRole = localStorage.getItem('role')
      // Keep role in sync with token: stale "role" without a token caused
      // recruiter pages to call APIs with no Authorization header (401).
      if (!token) {
        if (userRole) {
          localStorage.removeItem('role')
        }
        setIsLoggedIn(false)
        setRole(null)
        console.log('✓ Auth checked:', { isLoggedIn: false, role: null })
      } else {
        setIsLoggedIn(true)
        setRole(userRole)
        console.log('✓ Auth checked:', { isLoggedIn: true, role: userRole })
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // Initial check
    checkAuth()

    // Listen for storage changes (tab sync or programmatic updates)
    const handleStorageChange = () => {
      console.log('📌 Storage changed, rechecking auth...')
      checkAuth()
    }

    // Listen for custom events
    const handleLoginEvent = () => {
      console.log('📌 Login event received, rechecking auth...')
      checkAuth()
    }

    const handleLogoutEvent = () => {
      console.log('📌 Logout event received, rechecking auth...')
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('login', handleLoginEvent)
    window.addEventListener('logout', handleLogoutEvent)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('login', handleLoginEvent)
      window.removeEventListener('logout', handleLogoutEvent)
    }
  }, [checkAuth])

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, checkAuth, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
