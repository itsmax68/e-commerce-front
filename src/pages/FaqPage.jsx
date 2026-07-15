import React from 'react';
import { Container, Stack, Typography } from '@mui/material';
import { Navbar } from '../features/navigation/components/Navbar';
import { Footer } from '../features/footer/Footer';

export const FaqPage = () => {
  return (
    <>
      <Navbar />
      <Container sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h4" fontWeight={900}>
            FAQ
          </Typography>

          <Stack spacing={1}>
            <Typography fontWeight={700}>1. Can I browse without an account?</Typography>
            <Typography color="text.secondary">
              Yes. You can view products and categories without logging in.
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <Typography fontWeight={700}>2. Do I need login to add to cart?</Typography>
            <Typography color="text.secondary">
              Yes. Login is required to place orders.
            </Typography>
          </Stack>
        </Stack>
      </Container>
      <Footer />
    </>
  );
};

