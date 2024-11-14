import React, { useState } from 'react';
import {
  Box,
  Grid,
  Button,
  Text,
  Container,
  VStack,
  useToast,
  StackProps,
  forwardRef
} from '@chakra-ui/react';

const App: React.FC = () => {
  const [display, setDisplay] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');
  const [operator, setOperator] = useState<string>('');
  const [previousValue, setPreviousValue] = useState<number>(0);
  const [newNumber, setNewNumber] = useState<boolean>(true);
  const toast = useToast();

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        if (b === 0) {
          throw new Error('Sıfıra bölünemez!');
        }
        return a / b;
      default:
        return b;
    }
  };

  const handleOperator = (op: string) => {
    const current = parseFloat(display);
    
    if (operator && !newNumber) {
      try {
        const result = calculate(previousValue, current, operator);
        setDisplay(String(result));
        setEquation(`${result} ${op}`);
        setPreviousValue(result);
      } catch (error) {
        toast({
          title: 'Hata',
          description: (error as Error).message,
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
        handleClear();
        return;
      }
    } else {
      setEquation(`${display} ${op}`);
      setPreviousValue(current);
    }
    
    setOperator(op);
    setNewNumber(true);
  };

  const handleEqual = () => {
    if (!operator || newNumber) return;

    const current = parseFloat(display);
    try {
      const result = calculate(previousValue, current, operator);
      setDisplay(String(result));
      setEquation('');
      setPreviousValue(result);
      setOperator('');
      setNewNumber(true);
    } catch (error) {
      toast({
        title: 'Hata',
        description: (error as Error).message,
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      handleClear();
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setOperator('');
    setPreviousValue(0);
    setNewNumber(true);
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  return (
    <Container centerContent py={8}>
      <VStack
        spacing="4"
        align="stretch"
        width="300px"
      >
        <Box
          p={4}
          borderWidth={1}
          borderRadius="lg"
          bg="gray.100"
          minH="60px"
        >
          <Text fontSize="sm" color="gray.600">{equation}</Text>
          <Text fontSize="2xl" textAlign="right">{display}</Text>
        </Box>

        <Grid templateColumns="repeat(4, 1fr)" gap={2}>
          <Button onClick={() => handleNumber('7')}>7</Button>
          <Button onClick={() => handleNumber('8')}>8</Button>
          <Button onClick={() => handleNumber('9')}>9</Button>
          <Button colorScheme="orange" onClick={() => handleOperator('/')}>/</Button>

          <Button onClick={() => handleNumber('4')}>4</Button>
          <Button onClick={() => handleNumber('5')}>5</Button>
          <Button onClick={() => handleNumber('6')}>6</Button>
          <Button colorScheme="orange" onClick={() => handleOperator('*')}>×</Button>

          <Button onClick={() => handleNumber('1')}>1</Button>
          <Button onClick={() => handleNumber('2')}>2</Button>
          <Button onClick={() => handleNumber('3')}>3</Button>
          <Button colorScheme="orange" onClick={() => handleOperator('-')}>-</Button>

          <Button onClick={() => handleNumber('0')}>0</Button>
          <Button onClick={handleDecimal}>.</Button>
          <Button colorScheme="green" onClick={handleEqual}>=</Button>
          <Button colorScheme="orange" onClick={() => handleOperator('+')}>+</Button>

          <Button
            colorScheme="red"
            gridColumn="span 4"
            onClick={handleClear}
          >
            Temizle
          </Button>
        </Grid>
      </VStack>
    </Container>
  );
};

export default App;
