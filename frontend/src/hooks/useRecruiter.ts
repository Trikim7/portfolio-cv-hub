import { useCallback, useState } from 'react'
import { apiClient } from '@/services/api'
import { Company, JobInvitation, CandidateSearchResult } from '@/types'

export const useRecruiter = () => {
  const [company, setCompany] = useState<Company | null>(null)
  const [invitations, setInvitations] = useState<JobInvitation[]>([])
  const [searchResults, setSearchResults] = useState<CandidateSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCompanyProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getCompanyProfile()
      setCompany(data)
      return data
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch company')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateCompanyProfile = useCallback(async (data: any) => {
    setLoading(true)
    try {
      const updated = await apiClient.updateCompanyProfile(data)
      setCompany(updated)
      return updated
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update company')
      return undefined
    } finally {
      setLoading(false)
    }
  }, [])

  const searchCandidates = useCallback(async (keyword?: string, skill?: string) => {
    setLoading(true)
    setError(null)
    try {
      const results = await apiClient.searchCandidates(keyword, skill)
      setSearchResults(results)
      return results
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Search failed')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const sendInvitation = useCallback(
    async (candidateId: number, jobTitle: string, message?: string) => {
      try {
        const invitation = await apiClient.sendJobInvitation(candidateId, jobTitle, message)
        setInvitations([...invitations, invitation])
        return invitation
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to send invitation')
        return undefined
      }
    },
    [invitations]
  )

  const fetchInvitations = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.getJobInvitations()
      setInvitations(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch invitations')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateInvitationStatus = useCallback(
    async (invitationId: number, status: string) => {
      try {
        const updated = await apiClient.updateJobInvitation(invitationId, status)
        setInvitations(invitations.map((i) => (i.id === invitationId ? updated : i)))
        return updated
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to update invitation')
        return undefined
      }
    },
    [invitations]
  )

  return {
    company,
    invitations,
    searchResults,
    loading,
    error,
    fetchCompanyProfile,
    updateCompanyProfile,
    searchCandidates,
    sendInvitation,
    fetchInvitations,
    updateInvitationStatus,
  }
}
