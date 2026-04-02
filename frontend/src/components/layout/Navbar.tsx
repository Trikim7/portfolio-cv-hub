'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    setIsLoggedIn(!!token)
  }, [])

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Portfolio CV Hub
        </Link>

        {!isLoggedIn && (
          <div className="flex gap-4">
            <Link href="/login" className="text-gray-700 hover:text-blue-600">
              Đăng nhập
            </Link>
            <Link href="/register" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

