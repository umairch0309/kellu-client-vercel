'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiBell, FiSearch, FiSettings, FiLogOut } from 'react-icons/fi'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    router.push('/login')
  }

  return (
    <header className="bg-white border-b border-neutral-light shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          {/* Mobile menu button - only show when sidebar is closed */}
          <button
            onClick={onMenuClick}
            className="lg:hidden text-neutral-dark hover:text-primary"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Search - hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 bg-neutral-light rounded-lg px-3 py-2">
            <FiSearch className="text-neutral-dark" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-48"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-neutral-dark hover:text-primary">
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></span>
          </button>

          {/* Settings */}
          <Link
            href="/settings"
            className="p-2 text-neutral-dark hover:text-primary"
            title="Settings"
          >
            <FiSettings size={20} />
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 text-neutral-dark hover:text-primary hidden md:block"
            title="Logout"
          >
            <FiLogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}

