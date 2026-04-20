'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useProfile } from './useProfile'

type ProfileContextType = ReturnType<typeof useProfile>

const ProfileContext = createContext<ProfileContextType | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const profileHook = useProfile()

  useEffect(() => {
    profileHook.fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ProfileContext.Provider value={profileHook}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfileContext(): ProfileContextType {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileProvider')
  }
  return context
}
