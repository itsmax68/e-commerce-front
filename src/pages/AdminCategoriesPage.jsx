import React from 'react';
import { AdminLayout } from '../features/admin/components/AdminLayout';
import { AdminCategories } from '../features/admin/components/AdminCategories';

export const AdminCategoriesPage = () => {
  return (
    <AdminLayout>
      <AdminCategories />
    </AdminLayout>
  );
};

