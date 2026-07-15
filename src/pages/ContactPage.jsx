import React from 'react';
import { Container, Stack, Typography } from '@mui/material';
import { Navbar } from '../features/navigation/components/Navbar';
import { Footer } from '../features/footer/Footer';

export const ContactPage = () => {
  return (
    <>
      <Navbar />
      <Container sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={900}>
            Contact
          </Typography>
          <Typography color="text.secondary">
            This is a demo contact page. Add your email/phone form here.
          </Typography>
          <Typography>
            Email: support@example.com
          </Typography>
          <Typography>
            Phone: +91 00000 00000
          </Typography>
        </Stack>
      </Container>
      <Footer />
    </>
  );
};

