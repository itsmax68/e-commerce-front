import React from 'react'
import { AdminOrders } from '../features/admin/components/AdminOrders'
import { AdminLayout } from '../features/admin/components/AdminLayout'

export const AdminOrdersPage = () => {
  return (
    <AdminLayout>
      <AdminOrders />
    </AdminLayout>
  )
}
