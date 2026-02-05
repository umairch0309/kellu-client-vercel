'use client'

import { use } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import SendBookingConfirmationPage from '@/components/SendBookingConfirmationPage'

export default function SendBookingConfirmationRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <ProtectedRoute>
      <Layout>
        <SendBookingConfirmationPage workorderId={parseInt(id)} />
      </Layout>
    </ProtectedRoute>
  )
}
