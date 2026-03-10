'use client'

import BusinessDashboard from '@/components/common/Dashboard'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Home() {
  return (
    <ProtectedRoute>
      <Layout>
        <BusinessDashboard />
      </Layout>
    </ProtectedRoute>
  )
}

