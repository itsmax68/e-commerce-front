import React from 'react';
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SellIcon from '@mui/icons-material/Sell';
import CategoryIcon from '@mui/icons-material/Category';
import { Link, useLocation } from 'react-router-dom';

const sidebarItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: DashboardIcon },
  { label: 'Products', to: '/admin/products', icon: ShoppingBagIcon },
  { label: 'Orders', to: '/admin/orders', icon: ReceiptLongIcon },
  { label: 'Users', to: '/admin/users', icon: PeopleAltIcon },
  { label: 'Brands', to: '/admin/brands', icon: SellIcon },
  { label: 'Categories', to: '/admin/categories', icon: CategoryIcon },
];

export const AdminSidebar = ({ fullWidth = false }) => {
  const location = useLocation();

  const isActive = (to) => {
    if (to === '/admin/dashboard') return location.pathname === '/admin/dashboard';
    if (to === '/admin/products') {
      return (
        location.pathname === '/admin/products' ||
        location.pathname.startsWith('/admin/product-update/') ||
        location.pathname === '/admin/add-product'
      );
    }
    if (to === '/admin/orders') return location.pathname === '/admin/orders';
    if (to === '/admin/users') return location.pathname === '/admin/users';
    if (to === '/admin/brands') return location.pathname === '/admin/brands';
    if (to === '/admin/categories') return location.pathname === '/admin/categories';
    return location.pathname === to;
  };

  return (
    <Box
      sx={{
        width: fullWidth ? '100%' : 260,
        minHeight: fullWidth ? 'auto' : '100vh',
        bgcolor: '#0b1220',
        borderRight: fullWidth ? 'none' : '1px solid',
        borderBottom: fullWidth ? '1px solid' : 'none',
        borderColor: 'rgba(255,255,255,0.08)',
        p: 2,
        color: 'common.white',
      }}
    >
      <Stack spacing={0.5} mb={2}>
        <Typography variant="h6" fontWeight={700}>
          Admin
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Management
        </Typography>
      </Stack>

      <Divider sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.08)' }} />

      <List dense disablePadding>
        {sidebarItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={Link}
            to={item.to}
            selected={isActive(item.to)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              color: 'rgba(255,255,255,0.75)',
              '&.Mui-selected': {
                bgcolor: 'rgba(25,118,210,0.12)',
                color: 'primary.main',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <item.icon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.08)' }} />

      <List dense disablePadding>
        <ListItemButton
          component={Link}
          to="/logout"
          sx={{
            borderRadius: 1,
              color: 'rgba(255,255,255,0.75)',
              '&.Mui-selected': { bgcolor: 'rgba(25,118,210,0.12)' },
          }}
        >
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );
};

