'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiFileText,
  FiCheckSquare,
  FiTool,
  FiEdit,
  FiCreditCard,
  FiTrendingUp,
} from 'react-icons/fi'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'

const menuItems = [
  { icon: FiHome,        label: 'Home',      href: '/' },
  { icon: FiCalendar,    label: 'Schedule',  href: '/schedule' },
  { icon: FiUsers,       label: 'Clients',   href: '/clients' },
  { icon: FiTool,        label: 'Workorder', href: '/workorders' },
  { icon: FiEdit,        label: 'Quotes',    href: '/quotes' },
  { icon: FiFileText,    label: 'Invoices',  href: '/invoices' },
  { icon: FiTrendingUp,  label: 'Insights',  href: '/insights' },
  { icon: FiCheckSquare, label: 'Tasks',     href: '/tasks' },
  { icon: FiCreditCard,  label: 'Expenses',  href: '/expenses' },
]

const BORDER_CLR = 'rgba(255,255,255,0.12)'

function CollapseToggle() {
  const { toggleSidebar, state } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <button
      onClick={toggleSidebar}
      className="w-full flex items-center justify-center py-3 text-white hover:opacity-70 transition-opacity duration-200"
      style={{ borderRadius: '4px' }}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms ease',
        }}
      >
        <line x1="20" y1="12" x2="6" y2="12" />
        <polyline points="12,6 6,12 12,18" />
      </svg>
    </button>
  )
}

export default function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <>
      <style>{`
        [data-sidebar="sidebar"] {
          --sidebar-background: #0F4C81 !important;
          --sidebar-foreground: #FFFFFF !important;
          --sidebar-border: rgba(255,255,255,0.12) !important;
          --sidebar-accent: #EAEBED !important;
          --sidebar-accent-foreground: #1F271B !important;
          --sidebar-ring: #0F4C81 !important;
          background-color: #0F4C81 !important;
        }
        [data-sidebar="sidebar"] * {
          border-color: rgba(255,255,255,0.12);
        }

        /* Override ShadCN's !important size clamps on menu buttons */
        [data-sidebar="sidebar"] [data-sidebar="menu-button"] {
          width: 100% !important;
          height: 2.75rem !important;
          min-height: 2.75rem !important;
          padding: 0 0.75rem !important;
        }
        [data-sidebar="sidebar"][data-state="collapsed"] [data-sidebar="menu-button"],
        .group[data-collapsible="icon"] [data-sidebar="menu-button"] {
          width: 100% !important;
          height: 2.75rem !important;
          min-height: 2.75rem !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        /* Scrollbar — WebKit (Chrome, Safari, Edge) */
        [data-sidebar="sidebar"] [data-sidebar="content"]::-webkit-scrollbar {
          width: 3px;
        }
        [data-sidebar="sidebar"] [data-sidebar="content"]::-webkit-scrollbar-track {
          background: transparent;
        }
        [data-sidebar="sidebar"] [data-sidebar="content"]::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.18);
          border-radius: 99px;
        }
        [data-sidebar="sidebar"] [data-sidebar="content"]::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.35);
        }

        /* Scrollbar — Firefox */
        [data-sidebar="sidebar"] [data-sidebar="content"] {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
        }
      `}</style>

      <Sidebar
        collapsible="icon"
        style={{ boxShadow: '2px 0 12px rgba(0,0,0,0.15)' }}
      >
        {/* Logo */}
        <SidebarHeader
          style={{
            borderBottom: `1px solid ${BORDER_CLR}`,
            padding: collapsed ? '1.5rem 0.5rem 1rem' : '1.5rem 1.25rem 1rem',
          }}
          className="flex items-center justify-center"
        >
          <Link href="/" className="flex items-center justify-center w-full">
            <Image
              src="/logo.png"
              alt="Kellu"
              width={collapsed ? 28 : 100}
              height={28}
              className={`${collapsed ? 'h-7 w-7 object-contain' : 'h-7 w-auto max-w-full'} brightness-0 invert`}
              priority
            />
          </Link>
        </SidebarHeader>

        {/* Nav items */}
        <SidebarContent className="px-2 py-3">
          <SidebarMenu>
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.label}
                    className="transition-all duration-200 hover:opacity-80 mb-1"
                    style={{
                      backgroundColor: active ? '#EAEBED' : 'transparent',
                      borderRadius: '6px',
                    }}
                  >
                    <Link
                      href={item.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        gap: '0.625rem',
                        width: '100%',
                        height: '100%',
                        color: active ? '#1F271B' : '#FFFFFF',
                      }}
                    >
                      <Icon
                        size={18}
                        style={{ color: active ? '#1F271B' : '#FFFFFF', flexShrink: 0 }}
                      />
                      {!collapsed && (
                        <span
                          className="text-sm truncate"
                          style={{ color: active ? '#1F271B' : '#FFFFFF' }}
                        >
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>

        {/* Bottom collapse toggle — desktop only */}
        <SidebarFooter
          style={{ borderTop: `1px solid ${BORDER_CLR}`, padding: '0.5rem' }}
          className="hidden md:block"
        >
          <CollapseToggle />
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </>
  )
}