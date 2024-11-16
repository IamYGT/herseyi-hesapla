import React, { useState } from 'react';
import {
  Box,
  VStack,
  Grid,
  Button,
  Text,
  useColorModeValue,
  Select,
  HStack,
  Container,
  Card,
  CardBody,
  Tooltip,
  Badge,
  SimpleGrid,
  Heading,
  Divider,
  useToast
} from '@chakra-ui/react';
import { FaCode, FaUndo, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import PageLayout from '../components/PageLayout';
import { useCalculatorLogic } from '../hooks/useCalculatorLogic';

interface NumberSystem {
  value: number;
  label: string;
  prefix: string;
}

const numberSystems: NumberSystem[] = [
  { value: 2, label: 'Binary', prefix: '0b' },
  { value: 8, label: 'Octal', prefix: '0o' },
  { value: 10, label: 'Decimal', prefix: '' },
  { value: 16, label: 'Hexadecimal', prefix: '0x' }
];

const ProgrammerCalculator: React.FC = () => {
  const {
    state,
    setDisplay,
    clearAll
  } = useCalculatorLogic();

  const [lastOperation, setLastOperation] = useState<string>('');

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const displayBgColor = useColorModeValue('blue.50', 'blue.900');
  const displayTextColor = useColorModeValue('blue.800', 'blue.100');
  const operationBgColor = useColorModeValue('gray.100', 'gray.700');

  const handleNumberClick = (num: string) => {
    try {
      const currentBase = state.base;
      if (currentBase === 16 && /[A-F]/i.test(num)) {
        setDisplay(state.display === '0' ? num : state.display + num);
      } else if (/[0-9]/.test(num)) {
        const maxDigit = currentBase === 2 ? '1' : 
                        currentBase === 8 ? '7' : 
                        currentBase === 16 ? 'F' : '9';
        if (parseInt(num, currentBase) <= parseInt(maxDigit, currentBase)) {
          setDisplay(state.display === '0' ? num : state.display + num);
        }
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Geçersiz sayı girişi',
        status: 'error',
        duration: 2000,
        isClosable: true
      });
    }
  };

  const handleBaseChange = (newBase: number) => {
    try {
      const decimal = parseInt(state.display, state.base);
      const converted = decimal.toString(newBase).toUpperCase();
      setDisplay(converted);
      setLastOperation(`Taban Değiştirme: ${state.base} → ${newBase}`);
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Taban dönüşümü başarısız',
        status: 'error',
        duration: 2000,
        isClosable: true
      });
      clearAll();
    }
  };

  const handleBitwiseOperation = (operation: string) => {
    try {
      const decimal = parseInt(state.display, state.base);
      let result: number;
      let description: string;

      switch (operation) {
        case 'NOT':
          result = ~decimal;
          description = 'NOT (Bitwise NOT)';
          break;
        case 'LSH':
          result = decimal << 1;
          description = 'LSH (Left Shift)';
          break;
        case 'RSH':
          result = decimal >> 1;
          description = 'RSH (Right Shift)';
          break;
        default:
          return;
      }

      setDisplay(result.toString(state.base).toUpperCase());
      setLastOperation(description);
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Bit işlemi başarısız',
        status: 'error',
        duration: 2000,
        isClosable: true
      });
      clearAll();
    }
  };

  const handleClear = () => {
    clearAll();
    setLastOperation('Temizlendi');
  };

  return (
    <PageLayout
      title="Programcı Hesap Makinesi"
      icon={FaCode}
      description="Farklı sayı sistemlerinde hesaplama ve bit işlemleri"
    >
      <Container maxW="container.lg" py={4}>
        <Card bg={bgColor} shadow="xl" borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={6}>
              {/* Sayı Sistemleri Gösterimi */}
              <Card w="100%" bg={displayBgColor} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    {numberSystems.map(system => (
                      <Box key={system.value} textAlign="center">
                        <Text fontWeight="bold" mb={1}>{system.label}</Text>
                        <Badge p={2} borderRadius="md" variant="solid" colorScheme="blue">
                          {system.prefix}
                          {parseInt(state.display, state.base).toString(system.value).toUpperCase()}
                        </Badge>
                      </Box>
                    ))}
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Ana Ekran */}
              <Box w="100%" p={6} bg={displayBgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                <Text fontSize="sm" mb={2} color="gray.500">
                  {lastOperation || 'Hazır'}
                </Text>
                <Text fontSize="4xl" textAlign="right" fontFamily="monospace" color={displayTextColor}>
                  {state.display}
                </Text>
              </Box>

              {/* Taban Seçimi */}
              <Select
                size="lg"
                value={state.base}
                onChange={(e) => handleBaseChange(parseInt(e.target.value))}
                bg={operationBgColor}
              >
                {numberSystems.map(system => (
                  <option key={system.value} value={system.value}>
                    {system.label} (Base-{system.value})
                  </option>
                ))}
              </Select>

              {/* Bit İşlemleri */}
              <SimpleGrid columns={4} spacing={2} w="100%">
                <Tooltip label="Bitwise NOT">
                  <Button onClick={() => handleBitwiseOperation('NOT')} colorScheme="purple" leftIcon={<FaUndo />}>
                    NOT
                  </Button>
                </Tooltip>
                <Tooltip label="Left Shift">
                  <Button onClick={() => handleBitwiseOperation('LSH')} colorScheme="purple" leftIcon={<FaArrowLeft />}>
                    LSH
                  </Button>
                </Tooltip>
                <Tooltip label="Right Shift">
                  <Button onClick={() => handleBitwiseOperation('RSH')} colorScheme="purple" leftIcon={<FaArrowRight />}>
                    RSH
                  </Button>
                </Tooltip>
                <Button onClick={handleClear} colorScheme="red">
                  AC
                </Button>
              </SimpleGrid>

              <Divider />

              {/* Sayı Tuşları */}
              <Grid templateColumns="repeat(4, 1fr)" gap={2} width="100%">
                {state.base >= 16 && (
                  <>
                    <Button onClick={() => handleNumberClick('A')} colorScheme="blue" variant="outline">A</Button>
                    <Button onClick={() => handleNumberClick('B')} colorScheme="blue" variant="outline">B</Button>
                    <Button onClick={() => handleNumberClick('C')} colorScheme="blue" variant="outline">C</Button>
                    <Button onClick={() => handleNumberClick('D')} colorScheme="blue" variant="outline">D</Button>
                    <Button onClick={() => handleNumberClick('E')} colorScheme="blue" variant="outline">E</Button>
                    <Button onClick={() => handleNumberClick('F')} colorScheme="blue" variant="outline">F</Button>
                  </>
                )}

                <Button onClick={() => handleNumberClick('7')} isDisabled={state.base < 8}>7</Button>
                <Button onClick={() => handleNumberClick('8')} isDisabled={state.base < 9}>8</Button>
                <Button onClick={() => handleNumberClick('9')} isDisabled={state.base < 10}>9</Button>

                <Button onClick={() => handleNumberClick('4')}>4</Button>
                <Button onClick={() => handleNumberClick('5')}>5</Button>
                <Button onClick={() => handleNumberClick('6')}>6</Button>

                <Button onClick={() => handleNumberClick('1')}>1</Button>
                <Button onClick={() => handleNumberClick('2')} isDisabled={state.base < 2}>2</Button>
                <Button onClick={() => handleNumberClick('3')} isDisabled={state.base < 3}>3</Button>

                <Button onClick={() => handleNumberClick('0')} gridColumn="span 2">0</Button>
              </Grid>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </PageLayout>
  );
};

export default ProgrammerCalculator;
