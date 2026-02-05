'use client'

import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import SettingsView from '@/components/SettingsView'

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <SettingsView />
      </Layout>
    </ProtectedRoute>
  )
}

