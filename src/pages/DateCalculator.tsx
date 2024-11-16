import React, { useState } from 'react';
import {
  Box,
  VStack,
  Grid,
  Button,
  Text,
  useColorModeValue,
  Input,
  Select,
  HStack,
  Container,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  InputGroup,
  InputLeftAddon,
  Divider,
  Heading,
  SimpleGrid,
  useToast
} from '@chakra-ui/react';
import { FaCalendarAlt, FaPlus, FaMinus, FaExchangeAlt } from 'react-icons/fa';
import PageLayout from '../components/PageLayout';

type DateOperation = 'diff' | 'add' | 'subtract';

export default function DateCalculator() {
  const [date1, setDate1] = useState<string>(new Date().toISOString().split('T')[0]);
  const [date2, setDate2] = useState<string>(new Date().toISOString().split('T')[0]);
  const [operation, setOperation] = useState<DateOperation>('diff');
  const [result, setResult] = useState<string>('');

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const resultBgColor = useColorModeValue('blue.50', 'blue.900');
  const resultTextColor = useColorModeValue('blue.600', 'blue.200');

  const calculateDate = () => {
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);

      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        throw new Error('Geçersiz tarih formatı');
      }

      switch (operation) {
        case 'diff': {
          const diffTime = Math.abs(d2.getTime() - d1.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const diffYears = Math.floor(diffDays / 365);
          const diffMonths = Math.floor((diffDays % 365) / 30);
          const remainingDays = diffDays % 30;
          
          setResult(`${diffYears} yıl, ${diffMonths} ay, ${remainingDays} gün`);
          break;
        }
        case 'add': {
          const resultDate = new Date(d1.getTime());
          resultDate.setDate(resultDate.getDate() + Math.ceil((d2.getTime() - new Date(0).getTime()) / (1000 * 60 * 60 * 24)));
          setResult(resultDate.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }));
          break;
        }
        case 'subtract': {
          const resultDate = new Date(d1.getTime());
          resultDate.setDate(resultDate.getDate() - Math.ceil((d2.getTime() - new Date(0).getTime()) / (1000 * 60 * 60 * 24)));
          setResult(resultDate.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }));
          break;
        }
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: (error as Error).message || 'Tarih hesaplanırken bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const addPeriod = (amount: number, unit: 'days' | 'months' | 'years') => {
    try {
      const date = new Date(date1);
      if (isNaN(date.getTime())) {
        throw new Error('Geçersiz tarih');
      }

      switch (unit) {
        case 'days':
          date.setDate(date.getDate() + amount);
          break;
        case 'months':
          date.setMonth(date.getMonth() + amount);
          break;
        case 'years':
          date.setFullYear(date.getFullYear() + amount);
          break;
      }
      setDate2(date.toISOString().split('T')[0]);
    } catch (error) {
      toast({
        title: 'Hata',
        description: (error as Error).message || 'Tarih hesaplanırken bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <PageLayout
      title="Tarih Hesaplayıcı"
      icon={FaCalendarAlt}
      description="Tarihler arası fark hesaplama ve tarih işlemleri"
    >
      <Container maxW="container.lg" py={4}>
        <Card bg={bgColor} shadow="xl" borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>İşlem Türü</FormLabel>
                <Select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value as DateOperation)}
                  size="lg"
                  icon={<FaExchangeAlt />}
                >
                  <option value="diff">Tarih Farkı</option>
                  <option value="add">Tarih Ekle</option>
                  <option value="subtract">Tarih Çıkar</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>1. Tarih</FormLabel>
                <Input
                  type="date"
                  value={date1}
                  onChange={(e) => setDate1(e.target.value)}
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel>2. Tarih</FormLabel>
                <Input
                  type="date"
                  value={date2}
                  onChange={(e) => setDate2(e.target.value)}
                  size="lg"
                />
              </FormControl>

              <Button
                colorScheme="blue"
                size="lg"
                onClick={calculateDate}
                leftIcon={<FaCalendarAlt />}
              >
                Hesapla
              </Button>

              {result && (
                <Box
                  p={6}
                  borderRadius="lg"
                  bg={resultBgColor}
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Text fontSize="xl" fontWeight="bold" textAlign="center">
                    Sonuç
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" textAlign="center" color={resultTextColor}>
                    {result}
                  </Text>
                </Box>
              )}

              <Divider my={4} />
              
              <Heading size="md" mb={4}>
                Hızlı Tarih Ekleme
              </Heading>

              <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                <Button leftIcon={<FaPlus />} onClick={() => addPeriod(1, 'days')} colorScheme="teal" variant="outline">1 Gün</Button>
                <Button leftIcon={<FaPlus />} onClick={() => addPeriod(1, 'months')} colorScheme="teal" variant="outline">1 Ay</Button>
                <Button leftIcon={<FaPlus />} onClick={() => addPeriod(1, 'years')} colorScheme="teal" variant="outline">1 Yıl</Button>

                <Button leftIcon={<FaPlus />} onClick={() => addPeriod(7, 'days')} colorScheme="teal" variant="outline">1 Hafta</Button>
                <Button leftIcon={<FaPlus />} onClick={() => addPeriod(3, 'months')} colorScheme="teal" variant="outline">3 Ay</Button>
                <Button leftIcon={<FaPlus />} onClick={() => addPeriod(5, 'years')} colorScheme="teal" variant="outline">5 Yıl</Button>

                <Button leftIcon={<FaMinus />} onClick={() => addPeriod(-1, 'days')} colorScheme="red" variant="outline">1 Gün</Button>
                <Button leftIcon={<FaMinus />} onClick={() => addPeriod(-1, 'months')} colorScheme="red" variant="outline">1 Ay</Button>
                <Button leftIcon={<FaMinus />} onClick={() => addPeriod(-1, 'years')} colorScheme="red" variant="outline">1 Yıl</Button>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </PageLayout>
  );
}
