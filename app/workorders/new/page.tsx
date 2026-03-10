'use client'

import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import NewWorkorderForm from '@/app/workorders/_components/NewWorkorderForm'

export default function NewWorkorderPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <NewWorkorderForm />
      </Layout>
    </ProtectedRoute>
  )
}
