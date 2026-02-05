'use client'

import { use } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import SendQuotePage from '@/components/SendQuotePage'

export default function SendQuoteRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <ProtectedRoute>
      <Layout>
        <SendQuotePage workorderId={parseInt(id)} />
      </Layout>
    </ProtectedRoute>
  )
}
