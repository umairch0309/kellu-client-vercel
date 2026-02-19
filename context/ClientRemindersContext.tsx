'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type CustomerReminder = {
  date: string // YYYY-MM-DD
  time: string // HH:mm
  note: string
}

type RemindersState = Record<number, CustomerReminder>

type ContextValue = {
  getReminder: (clientId: number) => CustomerReminder | null
  setReminder: (clientId: number, reminder: CustomerReminder) => void
  deleteReminder: (clientId: number) => void
  isReminderDue: (reminder: CustomerReminder) => boolean
}

const ClientRemindersContext = createContext<ContextValue | null>(null)

export function ClientRemindersProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<RemindersState>({})

  const getReminder = useCallback((clientId: number) => reminders[clientId] ?? null, [reminders])

  const setReminder = useCallback((clientId: number, reminder: CustomerReminder) => {
    setReminders(prev => ({ ...prev, [clientId]: reminder }))
  }, [])

  const deleteReminder = useCallback((clientId: number) => {
    setReminders(prev => {
      const next = { ...prev }
      delete next[clientId]
      return next
    })
  }, [])

  const isReminderDue = useCallback((reminder: CustomerReminder) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const reminderDate = new Date(reminder.date + (reminder.time ? `T${reminder.time}` : 'T23:59'))
    reminderDate.setHours(0, 0, 0, 0)
    return today >= reminderDate
  }, [])

  const value: ContextValue = {
    getReminder,
    setReminder,
    deleteReminder,
    isReminderDue,
  }

  return (
    <ClientRemindersContext.Provider value={value}>
      {children}
    </ClientRemindersContext.Provider>
  )
}

export function useClientReminders() {
  const ctx = useContext(ClientRemindersContext)
  if (!ctx) throw new Error('useClientReminders must be used within ClientRemindersProvider')
  return ctx
}
