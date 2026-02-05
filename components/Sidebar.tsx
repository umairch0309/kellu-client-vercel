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
  FiChevronLeft,
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

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${collapsed ? 'w-16' : 'w-48'} bg-neutral-light
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
          border-r shadow-lg
        `}
        style={{ 
          borderRightColor: '#D1D5DB',
          borderRightWidth: '1px',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b lg:hidden py-2 px-3" style={{ borderBottomColor: '#D1D5DB', borderBottomWidth: '1px' }}>
          <Link href="/" onClick={onClose} className="flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Kellu" 
              width={100} 
              height={28}
              className="h-7 w-auto max-w-full"
              priority
            />
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-dark hover:bg-neutral-dark/5 rounded"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Desktop Logo */}
        {!collapsed && (
          <div className="hidden lg:flex items-center px-3 py-3 border-b" style={{ borderBottomColor: '#D1D5DB', borderBottomWidth: '1px' }}>
            <Link href="/" className="flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="Kellu" 
                width={120} 
                height={32}
                className="h-8 w-auto max-w-full"
                priority
              />
            </Link>
          </div>
        )}
        {collapsed && (
          <div className="hidden lg:flex items-center justify-center px-2 py-3 border-b" style={{ borderBottomColor: '#D1D5DB', borderBottomWidth: '1px' }}>
            <Link href="/" className="flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="Kellu" 
                width={32} 
                height={32}
                className="h-7 w-7 object-contain"
                priority
              />
            </Link>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-2.5">
            {menuItems.map((item) => {
              const Icon = item.icon
              // Check if active - for Clients and Workorders, also check if pathname starts with the href
              const isActive = pathname === item.href || 
                (item.href === '/clients' && pathname.startsWith('/clients')) ||
                (item.href === '/workorders' && pathname.startsWith('/workorders'))
              const isCreate = item.label === 'Create'
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose()
                      }
                    }}
                    className={`
                      group flex items-center ${collapsed ? 'justify-center px-2' : 'justify-start gap-2 px-2.5'} py-1.5
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-primary text-white font-medium shadow-sm'
                          : 'text-neutral-dark hover:bg-white/50'
                      }
                    `}
                    style={!isActive ? { borderRadius: '4px' } : { borderRadius: '4px' }}
                    title={collapsed ? item.label : ''}
                  >
                    <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-neutral-dark'} ${isActive ? '' : 'group-hover:text-neutral-dark'}`} />
                    {!collapsed && <span className={`text-xs truncate ${isActive ? 'text-white' : 'text-neutral-dark'}`}>{item.label}</span>}
                    {!collapsed && item.hasDropdown && (
                      <FiChevronDown size={14} className={`ml-auto flex-shrink-0 ${isActive ? 'text-white/60' : 'text-neutral-dark/60'}`} />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Collapse Button */}
        <div className="px-2 py-2 border-t" style={{ borderTopColor: '#D1D5DB', borderTopWidth: '1px' }}>
          <button
            onClick={onToggleCollapse}
            className={`
              w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start gap-2 px-2.5'} py-1.5
              text-neutral-dark hover:bg-secondary hover:text-white transition-colors duration-200
            `}
            style={{ borderRadius: '4px' }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <FiChevronLeft size={16} className={`flex-shrink-0 ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

