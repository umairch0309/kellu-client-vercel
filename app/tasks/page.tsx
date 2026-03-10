'use client'

import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import TasksList from '@/app/tasks/_components/TasksList'

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <TasksList />
      </Layout>
    </ProtectedRoute>
  )
}

