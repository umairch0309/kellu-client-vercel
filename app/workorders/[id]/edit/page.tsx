'use client'

import { use } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import NewWorkorderForm from '@/components/NewWorkorderForm'

export default function EditWorkorderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <ProtectedRoute>
      <Layout>
        <NewWorkorderForm workorderId={parseInt(id)} />
      </Layout>
    </ProtectedRoute>
  )
}
