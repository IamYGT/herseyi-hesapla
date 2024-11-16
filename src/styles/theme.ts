import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    calculator: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'normal',
      },
      variants: {
        operator: {
          bg: 'orange.400',
          color: 'white',
          _hover: {
            bg: 'orange.500',
          },
        },
        number: {
          bg: 'gray.100',
          _hover: {
            bg: 'gray.200',
          },
        },
        function: {
          bg: 'blue.400',
          color: 'white',
          _hover: {
            bg: 'blue.500',
          },
        },
      },
    },
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
      },
    }),
  },
});

export default theme;
