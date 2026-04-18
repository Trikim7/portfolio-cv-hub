'use client'

import { apiClient } from '@/services/api'
import { OAuthProvider } from '@/types'

interface SocialLoginButtonsProps {
  /** Appears above the buttons (e.g. "Hoặc đăng nhập với"). */
  label?: string
  /** Which providers to expose. Defaults to all three. */
  providers?: OAuthProvider[]
  /** Disable the buttons (e.g. while the parent form is submitting). */
  disabled?: boolean
}

const PROVIDER_META: Record<
  OAuthProvider,
  { label: string; icon: string; className: string }
> = {
  google: {
    label: 'Google',
    icon: 'G',
    className: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
  },
  github: {
    label: 'GitHub',
    icon: 'GH',
    className: 'bg-gray-900 text-white hover:bg-gray-800',
  },
  facebook: {
    label: 'Facebook',
    icon: 'f',
    className: 'bg-blue-600 text-white hover:bg-blue-700',
  },
}

export default function SocialLoginButtons({
  label = 'Hoặc tiếp tục với',
  providers = ['google', 'github', 'facebook'],
  disabled = false,
}: SocialLoginButtonsProps) {
  const handleClick = (provider: OAuthProvider) => {
    if (disabled) return
    window.location.href = apiClient.getOAuthLoginUrl(provider)
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">{label}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {providers.map((p) => {
          const meta = PROVIDER_META[p]
          return (
            <button
              key={p}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(p)}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${meta.className}`}
              aria-label={`Đăng nhập bằng ${meta.label}`}
            >
              <span className="font-bold">{meta.icon}</span>
              <span className="hidden sm:inline">{meta.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
