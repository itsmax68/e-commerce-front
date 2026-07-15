import React from 'react';
import { Container, Stack, Typography } from '@mui/material';
import { Navbar } from '../features/navigation/components/Navbar';
import { Footer } from '../features/footer/Footer';

export const PrivacyPolicyPage = () => {
  return (
    <>
      <Navbar />
      <Container sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={900}>
            Privacy Policy
          </Typography>
          <Typography color="text.secondary">
            This is a demo privacy policy page. Replace this text with your real privacy policy.
          </Typography>
          <Typography>
            We collect only the information needed to provide the shopping experience (such as account
            details and order information). We do not sell personal data.
          </Typography>
        </Stack>
      </Container>
      <Footer />
    </>
  );
};

