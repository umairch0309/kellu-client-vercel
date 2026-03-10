'use client'

import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import WorkordersList from '@/app/workorders/_components/WorkordersList'

export default function WorkordersPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <WorkordersList />
      </Layout>
    </ProtectedRoute>
  )
}

