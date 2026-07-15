import React from 'react';
import { Box, Stack, useMediaQuery, useTheme } from '@mui/material';
import { AdminSidebar } from './AdminSidebar';

export const AdminLayout = ({ children }) => {
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Stack
      direction={isNarrow ? 'column' : 'row'}
      alignItems="stretch"
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f7fb',
      }}
    >
      <AdminSidebar fullWidth={isNarrow} />
      <Box sx={{ flex: 1, width: '100%' }}>{children}</Box>
    </Stack>
  );
};

