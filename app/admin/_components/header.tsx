'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiBell, FiSearch, FiSettings, FiLogOut } from 'react-icons/fi'
import { SidebarTrigger } from '@/components/ui/sidebar'

const USER = { name: 'Test User', email: 'matcareapp@gmail.com' }

export default function AdminHeader() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) {
      document.addEventListener('click', close)
      return () => document.removeEventListener('click', close)
    }
  }, [menuOpen])

  const handleLogout = () => {
    setMenuOpen(false)
    localStorage.removeItem('isLoggedIn')
    router.push('/login')
  }

  const initials = USER.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header className="bg-white border-b shadow-sm" style={{ borderColor: '#EAEBED' }}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger
            className="md:hidden p-2 rounded hover:bg-black/5"
            style={{ color: '#1F271B' }}
          />
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: '#EAEBED' }}>
            <FiSearch size={18} style={{ color: '#1F271B', opacity: 0.6 }} />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-base w-48"
              style={{ color: '#1F271B' }}
            />
          </div>

          {/* Notifications — navigates to /admin/notifications */}
          <Link
            href="/admin/notifications"
            className="relative p-2 rounded hover:bg-black/5"
            style={{ color: '#1F271B' }}
            aria-label="Notifications"
          >
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#28AFB0' }} />
          </Link>

          {/* Settings — navigates to /admin/settings */}
          <Link
            href="/admin/settings"
            className="p-2 rounded hover:bg-black/5 transition-colors"
            style={{ color: '#1F271B' }}
            aria-label="Settings"
          >
            <FiSettings size={20} />
          </Link>

          {/* Avatar — opens logout-only dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-black/5 transition-colors"
              style={{ color: '#1F271B' }}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-label="Account menu"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                style={{ backgroundColor: '#EAEBED', color: '#1F271B' }}
              >
                {initials}
              </div>
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-64 rounded-lg shadow-lg border py-2 z-50 bg-white"
                style={{ borderColor: '#EAEBED' }}
              >
                {/* User info */}
                <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: '#EAEBED' }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                    style={{ backgroundColor: '#EAEBED', color: '#1F271B' }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate" style={{ color: '#1F271B' }}>{USER.name}</p>
                    <p className="text-sm truncate" style={{ color: '#1F271B', opacity: 0.7 }}>{USER.email}</p>
                  </div>
                </div>

                {/* Logout only */}
                <nav className="py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-black/5 transition-colors"
                    style={{ color: '#1F271B' }}
                  >
                    <FiLogOut size={16} />
                    Log out
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}