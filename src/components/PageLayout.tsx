import React, { ReactNode } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  useColorModeValue,
  Text,
  Icon,
  HStack,
} from '@chakra-ui/react';
import { IconType } from 'react-icons';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  icon: IconType;
  description?: string;
}

export default function PageLayout({ children, title, icon, description }: PageLayoutProps) {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box bg={bgColor} minH="calc(100vh - 60px)" py={8}>
      <Container maxW="container.lg">
        <VStack spacing={6} align="stretch">
          <Box textAlign="center" py={4}>
            <HStack justifyContent="center" spacing={3} mb={2}>
              <Icon as={icon} boxSize={8} color="teal.500" />
              <Heading size="lg">{title}</Heading>
            </HStack>
            {description && (
              <Text color="gray.500" fontSize="md">
                {description}
              </Text>
            )}
          </Box>
          <Box
            bg={cardBg}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            p={6}
            boxShadow="lg"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              bgGradient: 'linear(to-r, teal.500, blue.500)',
            }}
          >
            {children}
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
