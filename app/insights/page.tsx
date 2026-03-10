'use client'

import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import InsightsView from '@/app/insights/_components/InsightsView'

export default function InsightsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <InsightsView />
      </Layout>
    </ProtectedRoute>
  )
}
