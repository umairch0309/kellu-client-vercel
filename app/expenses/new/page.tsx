'use client'

import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import NewExpenseForm from '@/app/expenses/_components/NewExpenseForm'

export default function NewExpensePage() {
  return (
    <ProtectedRoute>
      <Layout>
        <NewExpenseForm />
      </Layout>
    </ProtectedRoute>
  )
}
