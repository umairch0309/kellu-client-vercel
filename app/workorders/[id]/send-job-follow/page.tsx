'use client'

import { use } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import SendJobFollowPage from '@/app/workorders/_components/SendJobFollowPage'

export default function SendJobFollowRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <ProtectedRoute>
      <Layout>
        <SendJobFollowPage workorderId={parseInt(id)} />
      </Layout>
    </ProtectedRoute>
  )
}
