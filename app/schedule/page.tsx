'use client'

import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import ScheduleView from '@/components/ScheduleView'

export default function SchedulePage() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-white overflow-hidden">
        <ScheduleView />
      </div>
    </ProtectedRoute>
  )
}

