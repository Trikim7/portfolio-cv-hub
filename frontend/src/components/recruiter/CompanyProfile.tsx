'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/services/api'
import { Company } from '@/types'
import { Toast, useToast } from '@/components/Toast'

export default function CompanyProfile() {
  const { t } = useTranslation()
  const [company, setCompany] = useState<Company | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast, showToast, closeToast } = useToast()

  const [formData, setFormData] = useState({
    company_name: '', industry: '', website: '',
    description: '', location: '', email: '', phone: '',
  })

  useEffect(() => { fetchCompany() }, [])

  const fetchCompany = async () => {
    try {
      const data = await apiClient.getCompanyProfile()
      setCompany(data)
      setFormData({
        company_name: data.company_name, industry: data.industry || '',
        website: data.website || '', description: data.description || '',
        location: data.location || '', email: data.email || '', phone: data.phone || '',
      })
    } catch {
      showToast(t('companyProfile.fetchError'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!formData.company_name) { showToast(t('companyProfile.nameRequired'), 'error'); return }
    try {
      const updated = await apiClient.updateCompanyProfile(formData)
      setCompany(updated)
      setEditing(false)
      showToast(t('companyProfile.updateSuccess'), 'success')
    } catch (err: any) {
      let errorMsg = t('companyProfile.updateFailed')
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map((e: any) => e.msg || e).join(', ')
        } else {
          errorMsg = err.response.data.detail
        }
      }
      showToast(errorMsg, 'error')
    }
  }

  if (loading) return <div className="text-center py-8">{t('companyProfile.loading')}</div>
  if (!company) return <div className="text-center py-8">{t('companyProfile.notFound')}</div>

  const statusColor = {
    pending:   'bg-amber-100 text-amber-800 border-amber-200',
    approved:  'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected:  'bg-red-100 text-red-800 border-red-200',
    suspended: 'bg-gray-100 text-gray-700 border-gray-200',
  }[company.status] || 'bg-gray-100 border-gray-200'

  const statusLabel = {
    pending:   t('companyProfile.statusPending'),
    approved:  t('companyProfile.statusApproved'),
    rejected:  t('companyProfile.statusRejected'),
    suspended: t('companyProfile.statusSuspended'),
  }[company.status] || company.status

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
      <div className="flex justify-between items-start gap-3">
        <h2 className="text-lg font-bold text-gray-900">{t('companyProfile.title')}</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {company.status === 'pending' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">{t('companyProfile.pendingWarning')}</p>
        </div>
      )}

      {!editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500">{t('companyProfile.companyName')}</label>
              <p className="text-lg font-semibold">{company.company_name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">{t('companyProfile.industry')}</label>
              <p className="text-lg font-semibold">{company.industry || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">{t('companyProfile.location')}</label>
              <p className="text-lg font-semibold">{company.location || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">{t('companyProfile.website')}</label>
              <p className="text-lg font-semibold">{company.website || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">{t('companyProfile.email')}</label>
              <p className="text-lg font-semibold">{company.email || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">{t('companyProfile.phone')}</label>
              <p className="text-lg font-semibold">{company.phone || '-'}</p>
            </div>
          </div>
          {company.description && (
            <div>
              <label className="text-sm text-gray-500">{t('companyProfile.description')}</label>
              <p className="text-base">{company.description}</p>
            </div>
          )}
          <button
            onClick={() => setEditing(true)}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            {t('companyProfile.edit')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('companyProfile.companyName')}</label>
            <input type="text" value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('companyProfile.industry')}</label>
              <input type="text" value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tech, Finance..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('companyProfile.location')}</label>
              <input type="text" value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('companyProfile.locationPlaceholder') || 'Hanoi, HCMC...'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('companyProfile.website')}</label>
              <input type="url" value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('companyProfile.email')}</label>
              <input type="email" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contact@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('companyProfile.phone')}</label>
              <input type="tel" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+84 123 456 789" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('companyProfile.companyDescription')}</label>
            <textarea value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('companyProfile.descPlaceholder')} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleUpdate}
              className="px-5 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition">
              {t('companyProfile.save')}
            </button>
            <button onClick={() => setEditing(false)}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">
              {t('companyProfile.cancel')}
            </button>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={closeToast} />}
    </div>
  )
}
