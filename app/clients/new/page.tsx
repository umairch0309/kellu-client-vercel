'use client'

import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import NewClientForm from '@/components/NewClientForm'

export default function NewClientPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <NewClientForm />
      </Layout>
    </ProtectedRoute>
  )
}
