'use client'

import { ReactNode } from 'react'
import { ClientRemindersProvider } from '@/context/ClientRemindersContext'

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <ClientRemindersProvider>{children}</ClientRemindersProvider>
}
