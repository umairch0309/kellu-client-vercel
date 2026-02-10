'use client'

import { Suspense } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import SettingsView from '@/components/SettingsView'

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <Suspense fallback={<div className="p-6">Loading settings…</div>}>
          <SettingsView />
        </Suspense>
      </Layout>
    </ProtectedRoute>
  )
}

