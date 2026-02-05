'use client'

import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import InvoicesList from '@/components/InvoicesList'

export default function InvoicesPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <InvoicesList />
      </Layout>
    </ProtectedRoute>
  )
}

