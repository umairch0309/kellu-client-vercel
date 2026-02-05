'use client'

import { use } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import EditClientForm from '@/components/EditClientForm'

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <ProtectedRoute>
      <Layout>
        <EditClientForm clientId={parseInt(id)} />
      </Layout>
    </ProtectedRoute>
  )
}
