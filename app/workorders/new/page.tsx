'use client'

import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import NewWorkorderForm from '@/components/NewWorkorderForm'

export default function NewWorkorderPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <NewWorkorderForm />
      </Layout>
    </ProtectedRoute>
  )
}
