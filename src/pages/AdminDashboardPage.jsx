import React from 'react'
import { AdminLayout } from '../features/admin/components/AdminLayout'
import { AdminStats } from '../features/admin/components/AdminStats'

export const AdminDashboardPage = () => {
  return (
    <AdminLayout>
      <AdminStats />
    </AdminLayout>
  )
}
