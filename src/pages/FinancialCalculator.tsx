import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Container,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftAddon,
  useColorModeValue,
  Divider,
  TableContainer,
  Card,
  CardBody
} from '@chakra-ui/react';
import { FaMoneyBillWave, FaCalculator, FaHome } from 'react-icons/fa';
import PageLayout from '../components/PageLayout';

type CalculationType = 'loan' | 'investment' | 'mortgage';

interface AmortizationRow {
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export default function FinancialCalculator() {
  const [type, setType] = useState<CalculationType>('loan');
  const [amount, setAmount] = useState<string>('10000');
  const [rate, setRate] = useState<string>('5');
  const [years, setYear] = useState<string>('1');
  const [result, setResult] = useState<string>('');
  const [schedule, setSchedule] = useState<AmortizationRow[]>([]);
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const resultBgColor = useColorModeValue('blue.50', 'blue.900');
  const resultTextColor = useColorModeValue('blue.600', 'blue.200');

  const calculateLoanPayment = useCallback((
    principal: number,
    annualRate: number,
    years: number
  ): number => {
    const monthlyRate = annualRate / 12 / 100;
    const numberOfPayments = years * 12;
    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    );
  }, []);

  const calculateInvestment = useCallback((
    principal: number,
    annualRate: number,
    years: number
  ): number => {
    const monthlyRate = annualRate / 12 / 100;
    const numberOfPayments = years * 12;
    return principal * Math.pow(1 + monthlyRate, numberOfPayments);
  }, []);

  const generateAmortizationSchedule = useCallback((
    principal: number,
    annualRate: number,
    years: number,
    monthlyPayment: number
  ): AmortizationRow[] => {
    const schedule: AmortizationRow[] = [];
    let balance = principal;
    const monthlyRate = annualRate / 12 / 100;

    for (let i = 1; i <= years * 12; i++) {
      const interest = balance * monthlyRate;
      const principalPart = monthlyPayment - interest;
      balance -= principalPart;

      schedule.push({
        payment: monthlyPayment,
        principal: principalPart,
        interest: interest,
        balance: Math.max(0, balance)
      });

      if (balance <= 0) break;
    }

    return schedule;
  }, []);

  const calculate = useCallback(() => {
    try {
      const principalAmount = parseFloat(amount);
      const annualRate = parseFloat(rate);
      const term = parseFloat(years);

      if (isNaN(principalAmount) || isNaN(annualRate) || isNaN(term)) {
        throw new Error('Lütfen geçerli sayılar girin');
      }

      if (principalAmount <= 0 || annualRate <= 0 || term <= 0) {
        throw new Error('Değerler pozitif olmalıdır');
      }

      let calculatedResult: number;
      let amortizationSchedule: AmortizationRow[] = [];

      switch (type) {
        case 'loan':
        case 'mortgage': {
          const monthlyPayment = calculateLoanPayment(principalAmount, annualRate, term);
          calculatedResult = monthlyPayment;
          amortizationSchedule = generateAmortizationSchedule(
            principalAmount,
            annualRate,
            term,
            monthlyPayment
          );
          break;
        }
        case 'investment': {
          calculatedResult = calculateInvestment(principalAmount, annualRate, term);
          break;
        }
        default:
          throw new Error('Geçersiz hesaplama tipi');
      }

      setResult(calculatedResult.toFixed(2));
      setSchedule(amortizationSchedule);
    } catch (error) {
      toast({
        title: 'Hata',
        description: (error as Error).message,
        status: 'error',
        duration: 2000,
        isClosable: true
      });
    }
  }, [amount, rate, years, type, calculateLoanPayment, calculateInvestment, generateAmortizationSchedule, toast]);

  return (
    <PageLayout
      title="Finansal Hesaplayıcı"
      icon={FaMoneyBillWave}
      description="Kredi, yatırım ve mortgage hesaplamaları yapın"
    >
      <Container maxW="container.lg" py={4}>
        <Card bg={bgColor} shadow="xl" borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value as CalculationType)}
                  size="lg"
                  icon={type === 'mortgage' ? <FaHome /> : <FaMoneyBillWave />}
                >
                  <option value="loan">Kredi Hesaplama</option>
                  <option value="investment">Yatırım Hesaplama</option>
                  <option value="mortgage">Mortgage Hesaplama</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Miktar</FormLabel>
                <InputGroup size="lg">
                  <InputLeftAddon children="₺" />
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ana para"
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Faiz Oranı</FormLabel>
                <InputGroup size="lg">
                  <InputLeftAddon children="%" />
                  <Input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="Yıllık faiz oranı"
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Vade</FormLabel>
                <InputGroup size="lg">
                  <InputLeftAddon children="Yıl" />
                  <Input
                    type="number"
                    value={years}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="Vade süresi"
                  />
                </InputGroup>
              </FormControl>

              <Button
                colorScheme="blue"
                size="lg"
                onClick={calculate}
                leftIcon={<FaCalculator />}
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
                    {type === 'investment' ? 'Toplam Birikim' : 'Aylık Ödeme'}
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" textAlign="center" color={resultTextColor}>
                    ₺{Number(result).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Text>
                </Box>
              )}

              {schedule.length > 0 && (type === 'loan' || type === 'mortgage') && (
                <>
                  <Divider my={4} />
                  <Text fontSize="xl" fontWeight="bold" mb={4}>
                    Ödeme Planı
                  </Text>
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Ay</Th>
                          <Th isNumeric>Ödeme</Th>
                          <Th isNumeric>Ana Para</Th>
                          <Th isNumeric>Faiz</Th>
                          <Th isNumeric>Kalan</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {schedule.map((row, index) => (
                          <Tr key={index}>
                            <Td>{index + 1}</Td>
                            <Td isNumeric>₺{row.payment.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Td>
                            <Td isNumeric>₺{row.principal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Td>
                            <Td isNumeric>₺{row.interest.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Td>
                            <Td isNumeric>₺{row.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </PageLayout>
  );
}
