'use client'

import { use } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import WorkorderDetailView from '@/app/workorders/_components/WorkorderDetailView'

export default function WorkorderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <ProtectedRoute>
      <Layout>
        <WorkorderDetailView workorderId={id} />
      </Layout>
    </ProtectedRoute>
  )
}
