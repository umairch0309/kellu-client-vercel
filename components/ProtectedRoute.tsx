'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const AUTH_VERIFIED_KEY = 'authVerified'

function getInitialLoading(): boolean {
  if (typeof window === 'undefined') return true
  return sessionStorage.getItem(AUTH_VERIFIED_KEY) !== '1'
}

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(getInitialLoading)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

    if (!isLoggedIn && pathname !== '/login') {
      sessionStorage.removeItem(AUTH_VERIFIED_KEY)
      router.push('/login')
      return
    }
    sessionStorage.setItem(AUTH_VERIFIED_KEY, '1')
    setIsLoading(false)
  }, [router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-neutral-dark">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}

