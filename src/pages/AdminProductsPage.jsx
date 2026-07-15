import React from 'react';
import { AdminLayout } from '../features/admin/components/AdminLayout';
import { AdminProducts } from '../features/admin/components/AdminProducts';

export const AdminProductsPage = () => {
  return (
    <AdminLayout>
      <AdminProducts />
    </AdminLayout>
  );
};

