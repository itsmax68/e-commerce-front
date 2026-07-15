import React from 'react';
import { Container, Stack, Typography } from '@mui/material';
import { Navbar } from '../features/navigation/components/Navbar';
import { Footer } from '../features/footer/Footer';

export const TermsOfUsePage = () => {
  return (
    <>
      <Navbar />
      <Container sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={900}>
            Terms Of Use
          </Typography>
          <Typography color="text.secondary">
            This is a demo terms page. Replace this text with your real terms of use.
          </Typography>
          <Typography>
            By using this website, you agree to comply with applicable laws and to use the service
            responsibly.
          </Typography>
        </Stack>
      </Container>
      <Footer />
    </>
  );
};

