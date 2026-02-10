'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  FiHome, 
  FiCalendar, 
  FiUsers, 
  FiFileText, 
  FiCheckSquare, 
  FiX,
  FiMenu,
  FiChevronDown,
  FiTool,
  FiEdit,
  FiCreditCard
} from 'react-icons/fi'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const menuItems = [
  { icon: FiHome, label: 'Home', href: '/', hasDropdown: false },
  { icon: FiCalendar, label: 'Schedule', href: '/schedule', hasDropdown: false },
  { icon: FiUsers, label: 'Clients', href: '/clients', hasDropdown: false },
  { icon: FiTool, label: 'Workorder', href: '/workorders', hasDropdown: false },
  { icon: FiEdit, label: 'Quotes', href: '/quotes', hasDropdown: false },
  { icon: FiFileText, label: 'Invoices', href: '/invoices', hasDropdown: false },
  { icon: FiCheckSquare, label: 'Tasks', href: '/tasks', hasDropdown: false },
  { icon: FiCreditCard, label: 'Expenses', href: '/expenses', hasDropdown: false },
]

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    router.push('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-neutral-dark bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Sapphire background, white text; selected: Platinum bg, Charcoal Brown text */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${collapsed ? 'w-16' : 'w-48'}
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
          border-r shadow-lg
        `}
        style={{ 
          backgroundColor: '#0F4C81',
          borderRightColor: 'rgba(255,255,255,0.12)',
          borderRightWidth: '1px',
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b lg:hidden pt-5 pb-3 pl-5 pr-3" style={{ borderBottomColor: 'rgba(255,255,255,0.2)' }}>
          <Link href="/" onClick={onClose} className="flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Kellu" 
              width={88} 
              height={24}
              className="h-6 w-auto max-w-full brightness-0 invert"
              priority
            />
          </Link>
          <button onClick={onClose} className="p-1.5 text-white hover:bg-white/10 rounded" aria-label="Close menu">
            <FiX size={18} />
          </button>
        </div>

        {/* Desktop Logo */}
        {!collapsed && (
          <div className="hidden lg:flex items-center pt-6 pb-4 pl-5 pr-3 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.2)' }}>
            <Link href="/" className="flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="Kellu" 
                width={100} 
                height={28}
                className="h-7 w-auto max-w-full brightness-0 invert"
                priority
              />
            </Link>
          </div>
        )}
        {collapsed && (
          <div className="hidden lg:flex items-center justify-center pt-6 pb-4 px-2 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.2)' }}>
            <Link href="/" className="flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="Kellu" 
                width={32} 
                height={32}
                className="h-8 w-8 object-contain brightness-0 invert"
                priority
              />
            </Link>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href === '/clients' && pathname.startsWith('/clients')) ||
                (item.href === '/workorders' && pathname.startsWith('/workorders'))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose()
                    }}
                    className={`
                      group flex items-center ${collapsed ? 'justify-center px-2' : 'justify-start gap-2 px-2.5'} py-2.5
                      transition-all duration-200 rounded
                      ${isActive ? 'font-medium' : ''}
                    `}
                    style={{
                      backgroundColor: isActive ? '#EAEBED' : 'transparent',
                      color: isActive ? '#1F271B' : '#FFFFFF',
                    }}
                    title={collapsed ? item.label : ''}
                  >
                    <Icon 
                      size={16} 
                      className="flex-shrink-0" 
                      style={{ color: isActive ? '#1F271B' : undefined }} 
                    />
                    {!collapsed && (
                      <span className="text-base truncate" style={{ color: isActive ? '#1F271B' : undefined }}>
                        {item.label}
                      </span>
                    )}
                    {!collapsed && item.hasDropdown && (
                      <FiChevronDown size={14} className="ml-auto flex-shrink-0 opacity-70" style={{ color: isActive ? '#1F271B' : undefined }} />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Collapse Button */}
        <div className="px-2 py-2 border-t" style={{ borderTopColor: 'rgba(255,255,255,0.2)' }}>
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center py-2.5 text-white hover:opacity-80 transition-opacity duration-200"
            style={{ borderRadius: '4px' }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              width={22}
              height={22}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`flex-shrink-0 ${collapsed ? 'rotate-180' : ''}`}
            >
              <line x1="20" y1="12" x2="6" y2="12" />
              <polyline points="12,6 6,12 12,18" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  )
}

