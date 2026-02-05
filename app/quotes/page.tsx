'use client'

import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import QuotesList from '@/components/QuotesList'

export default function QuotesPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <QuotesList />
      </Layout>
    </ProtectedRoute>
  )
}

