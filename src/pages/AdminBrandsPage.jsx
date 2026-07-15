import React from 'react';
import { AdminLayout } from '../features/admin/components/AdminLayout';
import { AdminBrands } from '../features/admin/components/AdminBrands';

export const AdminBrandsPage = () => {
  return (
    <AdminLayout>
      <AdminBrands />
    </AdminLayout>
  );
};

