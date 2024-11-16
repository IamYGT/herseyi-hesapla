import React from 'react';
import { Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { CalculatorProvider } from '../context/CalculatorContext';

export default function AppLayout() {
  return (
    <CalculatorProvider>
      <Box minH="100vh">
        <Navigation />
        <Box>
          <Outlet />
        </Box>
      </Box>
    </CalculatorProvider>
  );
}
