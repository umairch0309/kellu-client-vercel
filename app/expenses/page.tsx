'use client'

import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import ExpensesList from '@/app/expenses/_components/ExpensesList'

export default function ExpensesPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <ExpensesList />
      </Layout>
    </ProtectedRoute>
  )
}

