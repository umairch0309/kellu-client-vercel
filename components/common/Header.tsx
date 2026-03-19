'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiBell, FiSearch, FiSettings, FiLogOut, FiDollarSign, FiPackage, FiFileText, FiUser } from 'react-icons/fi'
import { SidebarTrigger } from '@/components/ui/sidebar'

const USER = { name: 'Test User', email: 'matcareapp@gmail.com' }

const MOCK_ACTIVITIES = [
  { id: 1, type: 'invoice', text: 'test u created an invoice - $889.00', detail: 'Invoice #1 - Testing', client: 'client test', ago: '19 hours ago', icon: FiDollarSign, iconBg: '#2B50AA' },
  { id: 2, type: 'job', text: 'test u created a job', detail: 'Job #2 - Testing', client: 'client test', ago: '5 days ago', icon: FiPackage, iconBg: '#28AFB0' },
  { id: 3, type: 'quote', text: 'test u created a quote - $195.00', detail: 'Quote #1 - Exterior Window Cleaning', client: 'client test', ago: '7 days ago', icon: FiFileText, iconBg: '#DC2626' },
  { id: 4, type: 'job', text: 'test u created a job', detail: 'Job #1 - Testing', client: 'client test', ago: '7 days ago', icon: FiPackage, iconBg: '#28AFB0' },
  { id: 5, type: 'lead', text: 'test u created a lead', detail: '', client: 'client test', ago: '8 days ago', icon: FiUser, iconBg: '#6B7280' },
]

export default function Header() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
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
          {/* Mobile only — desktop uses the arrow in the sidebar footer */}
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

          <button
            type="button"
            onClick={() => setActivityOpen((o) => !o)}
            className="relative p-2 rounded hover:bg-black/5"
            style={{ color: '#1F271B' }}
            aria-label="Notifications"
            aria-expanded={activityOpen}
          >
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#28AFB0' }} />
          </button>

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
              <FiSettings size={18} className="shrink-0" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-72 rounded-lg shadow-lg border py-2 z-50 bg-white"
                style={{ borderColor: '#EAEBED' }}
              >
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

                <nav className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-black/5 transition-colors"
                    style={{ color: '#1F271B' }}
                  >
                    <FiSettings size={16} style={{ opacity: 0.7 }} />
                    Settings
                  </Link>
                  <div className="mx-3 my-1 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-black/5 transition-colors"
                    style={{ color: '#1F271B' }}
                  >
                    Manage Team
                  </Link>
                  <div className="mx-3 my-1 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
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

      {/* Activity Feed panel */}
      {activityOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" aria-hidden onClick={() => setActivityOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col border-l" style={{ borderColor: '#EAEBED' }}>
            <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: '#EAEBED' }}>
              <h2 className="text-xl font-bold" style={{ color: '#1F271B' }}>Activity Feed</h2>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => {}} className="text-sm font-medium" style={{ color: '#28AFB0' }}>Customize Feed</button>
                <button type="button" onClick={() => setActivityOpen(false)} className="p-1.5 rounded hover:bg-black/5" style={{ color: '#1F271B' }} aria-label="Close">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-0">
                {MOCK_ACTIVITIES.map((a, i) => (
                  <li key={a.id} className="flex gap-3 py-3 border-b first:pt-0" style={{ borderColor: '#EAEBED', backgroundColor: i === 1 ? 'rgba(254, 243, 199, 0.4)' : 'transparent' }}>
                    <div className="w-9 h-9 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: a.iconBg, color: 'white' }}>
                      <a.icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm" style={{ color: '#1F271B' }}>{a.text}</p>
                      {a.detail && <p className="text-sm" style={{ color: '#1F271B', opacity: 0.8 }}>{a.detail}</p>}
                      <p className="text-xs mt-0.5" style={{ color: '#1F271B', opacity: 0.6 }}>{a.client} · {a.ago}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </header>
  )
}