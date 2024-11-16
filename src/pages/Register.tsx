import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useColorModeValue,
  Container,
  Heading,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Hata',
        description: 'Şifreler eşleşmiyor.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (register(username, password)) {
      toast({
        title: 'Kayıt başarılı',
        description: 'Giriş sayfasına yönlendiriliyorsunuz.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
    } else {
      toast({
        title: 'Kayıt başarısız',
        description: 'Bu kullanıcı adı zaten kullanılıyor.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={useColorModeValue('gray.50', 'gray.900')}
      py={12}
      px={4}
    >
      <Container maxW="lg">
        <Box
          bg={bgColor}
          p={8}
          borderRadius="xl"
          boxShadow="2xl"
          border="1px"
          borderColor={borderColor}
        >
          <VStack spacing={8}>
            <Heading
              color={textColor}
              fontSize={{ base: '2xl', md: '3xl' }}
              textAlign="center"
            >
              Yeni Hesap Oluştur
            </Heading>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel color={textColor}>Kullanıcı Adı</FormLabel>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Kullanıcı adınızı belirleyin"
                    size="lg"
                    bg={useColorModeValue('white', 'gray.700')}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Şifre</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Şifrenizi belirleyin"
                      size="lg"
                      bg={useColorModeValue('white', 'gray.700')}
                    />
                    <InputRightElement h="full">
                      <IconButton
                        aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Şifre Tekrar</FormLabel>
                  <InputGroup>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Şifrenizi tekrar girin"
                      size="lg"
                      bg={useColorModeValue('white', 'gray.700')}
                    />
                    <InputRightElement h="full">
                      <IconButton
                        aria-label={showConfirmPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                        icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        variant="ghost"
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  mt={4}
                >
                  Kayıt Ol
                </Button>
              </VStack>
            </form>
            <Text color={textColor} textAlign="center">
              Zaten hesabınız var mı?{' '}
              <Button
                variant="link"
                color="blue.500"
                onClick={() => navigate('/login')}
              >
                Giriş Yap
              </Button>
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};
