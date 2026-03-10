'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { ClientRemindersProvider } from '@/context/ClientRemindersContext'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function ClientProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Routes that should NOT have the sidebar layout
  const isAuthRoute = pathname?.startsWith('/login') || pathname?.startsWith('/register')

  if (isAuthRoute) {
    return (
      <ClientRemindersProvider>
        {children}
      </ClientRemindersProvider>
    )
  }

  return (
    <SidebarProvider>
      <ClientRemindersProvider>{children}</ClientRemindersProvider>
    </SidebarProvider>
  )
}