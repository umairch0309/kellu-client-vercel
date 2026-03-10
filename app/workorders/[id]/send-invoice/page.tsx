'use client'

import { use } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import SendInvoicePage from '@/app/workorders/_components/SendInvoicePage'

export default function SendInvoiceRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <ProtectedRoute>
      <Layout>
        <SendInvoicePage workorderId={parseInt(id)} />
      </Layout>
    </ProtectedRoute>
  )
}
