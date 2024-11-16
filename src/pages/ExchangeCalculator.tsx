import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Select,
  Button,
  Text,
  useColorModeValue,
  Spinner,
  useToast,
  IconButton,
  Tooltip,
  Container,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider,
  Badge,
  SimpleGrid,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FaExchangeAlt, FaSync, FaMoneyBillWave } from 'react-icons/fa';
import PageLayout from '../components/PageLayout';

interface ExchangeRate {
  code: string;
  name: string;
  rate: number;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_EXCHANGE_API_KEY: string;
    }
  }
}

const API_KEY = process.env.REACT_APP_EXCHANGE_API_KEY;
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

export default function ExchangeCalculator() {
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const statBgColor = useColorModeValue('blue.50', 'blue.900');
  const resultTextColor = useColorModeValue('blue.600', 'blue.200');

  // API çağrısı için debounce
  const debounceTimeout = useRef<NodeJS.Timeout>();

  const fetchExchangeRates = useCallback(async () => {
    try {
      if (!API_KEY) {
        throw new Error('API anahtarı bulunamadı');
      }

      setLoading(true);
      setError('');

      const response = await fetch(`${BASE_URL}/${API_KEY}/latest/${fromCurrency}`);
      const data = await response.json();

      if (data.result === 'success') {
        const rates: ExchangeRate[] = Object.entries(data.conversion_rates)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([code, rate]) => ({
            code,
            name: new Intl.DisplayNames(['tr'], { type: 'currency' }).of(code) || code,
            rate: rate as number
          }));

        setExchangeRates(rates);
        setLastUpdate(new Date().toLocaleString('tr-TR'));
        if (amount) {
          calculateExchange(amount, rates);
        }
      } else {
        throw new Error(data.error || 'Döviz kurları alınamadı');
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(errorMessage);
      toast({
        title: 'Hata',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  }, [fromCurrency, amount, toast]);

  const calculateExchange = useCallback((value: string, rates: ExchangeRate[] = exchangeRates) => {
    try {
      // Input değeri boşsa
      if (!value || value === '.') {
        setResult('');
        return;
      }

      // Sayısal değer kontrolü
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        setResult('');
        return;
      }

      // Negatif değer kontrolü
      if (numValue < 0) {
        setAmount('0');
        setResult('0');
        return;
      }

      // Döviz kuru kontrolü
      const rate = rates.find(r => r.code === toCurrency)?.rate;
      if (!rate) {
        setResult('');
        return;
      }

      const calculated = numValue * rate;
      
      // Çok büyük sayıları bilimsel gösterimle formatla
      let formattedResult;
      if (calculated > 999999999999) {
        formattedResult = calculated.toExponential(2);
      } else {
        formattedResult = calculated.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4
        });
      }
      
      setResult(formattedResult);
    } catch (error) {
      console.error('Hesaplama hatası:', error);
      setResult('');
    }
  }, [exchangeRates, toCurrency]);

  const handleAmountChange = useCallback((value: string) => {
    // Sadece sayılar ve tek bir nokta karakterine izin ver
    let sanitizedValue = value.replace(/[^\d.]/g, '');
    
    // İlk karakterin nokta olmasını engelle
    if (sanitizedValue.startsWith('.')) {
      sanitizedValue = '0' + sanitizedValue;
    }
    
    // Birden fazla nokta varsa sadece ilkini koru
    const parts = sanitizedValue.split('.');
    if (parts.length > 2) {
      sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Maksimum 12 karakter sınırı
    if (sanitizedValue.length > 12) {
      sanitizedValue = sanitizedValue.slice(0, 12);
    }

    // Değer boşsa veya geçersizse
    if (!sanitizedValue || isNaN(Number(sanitizedValue))) {
      setAmount('');
      setResult('');
      return;
    }

    setAmount(sanitizedValue);
    calculateExchange(sanitizedValue);
  }, [calculateExchange]);

  const handleSwapCurrencies = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    // Para birimleri değiştiğinde yeni kurları al
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      fetchExchangeRates();
    }, 500);
  }, [fromCurrency, toCurrency, fetchExchangeRates]);

  useEffect(() => {
    fetchExchangeRates();
    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000); // Her 5 dakikada bir güncelle
    return () => {
      clearInterval(interval);
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [fetchExchangeRates]);

  return (
    <PageLayout
      title="Döviz Çevirici"
      icon={FaExchangeAlt}
      description="Güncel kurlarla döviz çevirme işlemleri"
    >
      <Container maxW="container.lg" py={4}>
        <Card bg={bgColor} shadow="xl" borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between" align="center">
                <Badge colorScheme="blue" p={2} borderRadius="md">
                  <HStack spacing={2}>
                    <FaSync />
                    <Text>Son Güncelleme: {lastUpdate || 'Henüz güncellenmedi'}</Text>
                  </HStack>
                </Badge>
                <Tooltip label="Kurları Güncelle" placement="left">
                  <IconButton
                    aria-label="Refresh rates"
                    icon={<FaSync />}
                    onClick={fetchExchangeRates}
                    isLoading={loading}
                    colorScheme="blue"
                  />
                </Tooltip>
              </HStack>

              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <FormControl>
                <FormLabel>Miktar ve Kaynak Para Birimi</FormLabel>
                <HStack spacing={4}>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <FaMoneyBillWave color="gray.300" />
                    </InputLeftElement>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="Miktar giriniz"
                      maxLength={12}
                    />
                  </InputGroup>
                  <Select
                    size="lg"
                    value={fromCurrency}
                    onChange={(e) => {
                      setFromCurrency(e.target.value);
                      if (debounceTimeout.current) {
                        clearTimeout(debounceTimeout.current);
                      }
                      debounceTimeout.current = setTimeout(() => {
                        fetchExchangeRates();
                      }, 500);
                    }}
                    isDisabled={loading}
                  >
                    {exchangeRates.map((rate) => (
                      <option key={rate.code} value={rate.code}>
                        {rate.code} - {rate.name}
                      </option>
                    ))}
                  </Select>
                </HStack>
              </FormControl>

              <Button
                leftIcon={<FaExchangeAlt />}
                onClick={handleSwapCurrencies}
                colorScheme="teal"
                size="lg"
                isDisabled={loading}
              >
                Para Birimlerini Değiştir
              </Button>

              <FormControl>
                <FormLabel>Hedef Para Birimi ve Sonuç</FormLabel>
                <HStack spacing={4}>
                  <Select
                    size="lg"
                    value={toCurrency}
                    onChange={(e) => {
                      setToCurrency(e.target.value);
                      calculateExchange(amount);
                    }}
                    isDisabled={loading}
                  >
                    {exchangeRates.map((rate) => (
                      <option key={rate.code} value={rate.code}>
                        {rate.code} - {rate.name}
                      </option>
                    ))}
                  </Select>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <FaMoneyBillWave color="gray.300" />
                    </InputLeftElement>
                    <Input
                      value={result}
                      isReadOnly
                      placeholder="Sonuç"
                      bg={statBgColor}
                      color={resultTextColor}
                      fontWeight="bold"
                    />
                  </InputGroup>
                </HStack>
              </FormControl>

              {loading ? (
                <Box textAlign="center" py={4}>
                  <Spinner size="xl" color="blue.500" />
                  <Text mt={2} color="gray.500">Döviz Kurları Yükleniyor...</Text>
                </Box>
              ) : (
                <>
                  <Divider my={4} />
                  <Text fontSize="xl" fontWeight="bold" mb={4}>
                    Dönüşüm Kurları
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Stat
                      bg={statBgColor}
                      p={4}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <StatLabel>1 {fromCurrency} =</StatLabel>
                      <StatNumber color={resultTextColor}>
                        {exchangeRates.find(r => r.code === toCurrency)?.rate.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {toCurrency}
                      </StatNumber>
                    </Stat>
                    <Stat
                      bg={statBgColor}
                      p={4}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <StatLabel>1 {toCurrency} =</StatLabel>
                      <StatNumber color={resultTextColor}>
                        {(1 / (exchangeRates.find(r => r.code === toCurrency)?.rate || 1)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {fromCurrency}
                      </StatNumber>
                    </Stat>
                  </SimpleGrid>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </PageLayout>
  );
}
