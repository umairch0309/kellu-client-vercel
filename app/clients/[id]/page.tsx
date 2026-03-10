'use client'

import { use } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import ClientDetailView from '@/app/clients/_components/ClientDetailView'

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <ProtectedRoute>
      <Layout>
        <ClientDetailView clientId={parseInt(id)} />
      </Layout>
    </ProtectedRoute>
  )
}
