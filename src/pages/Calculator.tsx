import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Button,
  Text,
  VStack,
  useToast,
  HStack,
  Switch,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  List,
  ListItem,
  Select,
  Input,
  useColorMode,
} from '@chakra-ui/react';
import { FaHistory, FaKeyboard, FaExchangeAlt, FaCalculator } from 'react-icons/fa';
import PageLayout from '../components/PageLayout';

interface HistoryItem {
  calculation: string;
  result: string;
  timestamp: Date;
}

interface UnitConversion {
  from: string;
  to: string;
  value: number;
  result: number;
}

const Calculator: React.FC = () => {
  // States
  const [display, setDisplay] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');
  const [operator, setOperator] = useState<string>('');
  const [previousValue, setPreviousValue] = useState<number>(0);
  const [newNumber, setNewNumber] = useState<boolean>(true);
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [scientificMode, setScientificMode] = useState<boolean>(false);
  const [keyboardEnabled, setKeyboardEnabled] = useState<boolean>(true);
  const [lastAnswer, setLastAnswer] = useState<string>('0');
  const [unitMode, setUnitMode] = useState<boolean>(false);
  const [unitConversion, setUnitConversion] = useState<UnitConversion>({
    from: 'meter',
    to: 'feet',
    value: 0,
    result: 0,
  });

  // Hooks
  const toast = useToast();
  // Renk modunu yönetmek için useColorMode hook'unu kullan
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Basic Operations
  const handleNumber = useCallback((num: string) => {
    setDisplay(prev => {
      if (newNumber) {
        setNewNumber(false);
        return num;
      }
      return prev === '0' ? num : prev + num;
    });
  }, [newNumber]);

  const handleDecimal = useCallback(() => {
    setDisplay(prev => {
      if (newNumber) {
        setNewNumber(false);
        return '0.';
      }
      if (!prev.includes('.')) {
        return prev + '.';
      }
      return prev;
    });
  }, [newNumber]);

  const handleOperator = useCallback((op: string) => {
    const current = parseFloat(display);
    if (operator && !newNumber) {
      calculate();
    } else {
      setPreviousValue(current);
    }
    setOperator(op);
    setNewNumber(true);
    setEquation(`${display} ${op}`);
  }, [display, operator, newNumber]);

  const calculate = useCallback(() => {
    const current = parseFloat(display);
    let result = 0;

    switch (operator) {
      case '+':
        result = previousValue + current;
        break;
      case '-':
        result = previousValue - current;
        break;
      case '×':
        result = previousValue * current;
        break;
      case '÷':
        if (current === 0) {
          toast({
            title: 'Error',
            description: 'Cannot divide by zero',
            status: 'error',
            duration: 2000,
          });
          return;
        }
        result = previousValue / current;
        break;
      default:
        return;
    }

    const resultStr = result.toString();
    setDisplay(resultStr);
    setPreviousValue(result);
    setEquation('');
    addToHistory(`${previousValue} ${operator} ${current}`, resultStr);
  }, [display, operator, previousValue, toast]);

  const handleEquals = useCallback(() => {
    if (!operator) return;
    calculate();
    setOperator('');
    setNewNumber(true);
    setLastAnswer(display);
  }, [operator, calculate, display]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setEquation('');
    setOperator('');
    setPreviousValue(0);
    setNewNumber(true);
  }, []);

  const handleMemory = useCallback((operation: string) => {
    const current = parseFloat(display);
    switch (operation) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setDisplay(memory.toString());
        setNewNumber(true);
        break;
      case 'M+':
        setMemory(prev => prev + current);
        break;
      case 'M-':
        setMemory(prev => prev - current);
        break;
    }
    toast({
      title: 'Memory Operation',
      description: `${operation} executed successfully`,
      status: 'success',
      duration: 1000,
    });
  }, [display, memory, toast]);

  const addToHistory = useCallback((calc: string, res: string) => {
    const newItem: HistoryItem = {
      calculation: calc,
      result: res,
      timestamp: new Date()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 10));
  }, []);

  // Scientific Operations
  const handleScientificOperation = (operation: string) => {
    const current = parseFloat(display);
    let result = 0;

    switch (operation) {
      case 'sin':
        result = Math.sin(current);
        break;
      case 'cos':
        result = Math.cos(current);
        break;
      case 'tan':
        result = Math.tan(current);
        break;
      case 'sqrt':
        if (current < 0) {
          toast({
            title: 'Error',
            description: 'Cannot calculate square root of negative number',
            status: 'error',
            duration: 2000,
          });
          return;
        }
        result = Math.sqrt(current);
        break;
      case 'square':
        result = Math.pow(current, 2);
        break;
      case 'cube':
        result = Math.pow(current, 3);
        break;
      case 'log':
        if (current <= 0) {
          toast({
            title: 'Error',
            description: 'Cannot calculate logarithm of non-positive number',
            status: 'error',
            duration: 2000,
          });
          return;
        }
        result = Math.log10(current);
        break;
      case 'ln':
        if (current <= 0) {
          toast({
            title: 'Error',
            description: 'Cannot calculate natural logarithm of non-positive number',
            status: 'error',
            duration: 2000,
          });
          return;
        }
        result = Math.log(current);
        break;
    }

    setDisplay(result.toString());
    addToHistory(`${operation}(${current})`, result.toString());
  };

  // Unit Conversion
  const handleUnitConversion = () => {
    const value = parseFloat(unitConversion.value.toString());
    let result = 0;

    switch (unitConversion.from + '_to_' + unitConversion.to) {
      case 'meter_to_feet':
        result = value * 3.28084;
        break;
      case 'feet_to_meter':
        result = value / 3.28084;
        break;
      case 'celsius_to_fahrenheit':
        result = (value * 9/5) + 32;
        break;
      case 'fahrenheit_to_celsius':
        result = (value - 32) * 5/9;
        break;
    }

    setUnitConversion(prev => ({ ...prev, result }));
  };

  // Percentage Calculation
  const handlePercentage = () => {
    const current = parseFloat(display);
    const result = (previousValue * current) / 100;
    setDisplay(result.toString());
    addToHistory(`${previousValue} * ${current}%`, result.toString());
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!keyboardEnabled) return;

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (/[0-9]/.test(e.key)) {
        e.preventDefault();
        handleNumber(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleDecimal();
      }

      switch (e.key) {
        case '+':
          e.preventDefault();
          handleOperator('+');
          break;
        case '-':
          e.preventDefault();
          handleOperator('-');
          break;
        case '*':
          e.preventDefault();
          handleOperator('×');
          break;
        case '/':
          e.preventDefault();
          handleOperator('÷');
          break;
        case 'Enter':
        case '=':
          e.preventDefault();
          handleEquals();
          break;
        case 'Escape':
          e.preventDefault();
          handleClear();
          break;
      }
    };

    if (keyboardEnabled) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [keyboardEnabled, handleNumber, handleDecimal, handleOperator, handleEquals, handleClear]);

  return (
    <PageLayout
      title="Hesap Makinesi"
      icon={FaCalculator}
      description="Gelişmiş hesaplama özellikleri ile bilimsel hesap makinesi"
    >
      <VStack spacing={6}>
        <HStack justifyContent="space-between" width="100%" bg="whiteAlpha.100" p={2} borderRadius="md">
          <Switch
            isChecked={scientificMode}
            onChange={() => setScientificMode(!scientificMode)}
            colorScheme="teal"
            size="md"
          />
          <Text fontSize="sm" fontWeight="medium">Scientific Mode</Text>
          <IconButton
            aria-label="Toggle keyboard"
            icon={<FaKeyboard />}
            colorScheme="teal"
            variant="ghost"
            onClick={() => setKeyboardEnabled(!keyboardEnabled)}
          />
          <IconButton
            aria-label="Show history"
            icon={<FaHistory />}
            colorScheme="teal"
            variant="ghost"
            onClick={onOpen}
          />
        </HStack>

        <Box
          w="100%"
          p={6}
          borderWidth={1}
          borderRadius="lg"
          boxShadow="lg"
          bg="whiteAlpha.50"
          backdropFilter="blur(10px)"
        >
          {equation && (
            <Text 
              fontSize="md" 
              color="gray.500" 
              textAlign="right" 
              mb={2}
              fontFamily="monospace"
            >
              {equation}
            </Text>
          )}
          <Text 
            fontSize="3xl" 
            textAlign="right"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {display}
          </Text>
        </Box>

        {unitMode ? (
          <VStack w="100%" spacing={4} p={4} borderRadius="lg" bg="whiteAlpha.50">
            <Select
              value={unitConversion.from}
              onChange={(e) => setUnitConversion(prev => ({ ...prev, from: e.target.value }))}
              size="md"
              variant="filled"
            >
              <option value="meter">Meter</option>
              <option value="feet">Feet</option>
              <option value="celsius">Celsius</option>
              <option value="fahrenheit">Fahrenheit</option>
            </Select>
            <Input
              type="number"
              value={unitConversion.value}
              onChange={(e) => setUnitConversion(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
              size="md"
              variant="filled"
            />
            <IconButton
              aria-label="Convert"
              icon={<FaExchangeAlt />}
              onClick={handleUnitConversion}
              colorScheme="teal"
              size="lg"
            />
            <Select
              value={unitConversion.to}
              onChange={(e) => setUnitConversion(prev => ({ ...prev, to: e.target.value }))}
              size="md"
              variant="filled"
            >
              <option value="meter">Meter</option>
              <option value="feet">Feet</option>
              <option value="celsius">Celsius</option>
              <option value="fahrenheit">Fahrenheit</option>
            </Select>
            <Text fontSize="xl" fontWeight="medium">Result: {unitConversion.result}</Text>
          </VStack>
        ) : (
          <Grid templateColumns="repeat(4, 1fr)" gap={3} w="100%">
            {scientificMode && (
              <>
                <Button onClick={() => handleScientificOperation('sin')} colorScheme="purple" variant="outline">sin</Button>
                <Button onClick={() => handleScientificOperation('cos')} colorScheme="purple" variant="outline">cos</Button>
                <Button onClick={() => handleScientificOperation('tan')} colorScheme="purple" variant="outline">tan</Button>
                <Button onClick={() => handleScientificOperation('sqrt')} colorScheme="purple" variant="outline">√</Button>
                <Button onClick={() => handleScientificOperation('square')} colorScheme="purple" variant="outline">x²</Button>
                <Button onClick={() => handleScientificOperation('cube')} colorScheme="purple" variant="outline">x³</Button>
                <Button onClick={() => handleScientificOperation('log')} colorScheme="purple" variant="outline">log</Button>
                <Button onClick={() => handleScientificOperation('ln')} colorScheme="purple" variant="outline">ln</Button>
              </>
            )}
            
            <Button onClick={() => handleMemory('MC')} colorScheme="orange" variant="ghost">MC</Button>
            <Button onClick={() => handleMemory('MR')} colorScheme="orange" variant="ghost">MR</Button>
            <Button onClick={() => handleMemory('M+')} colorScheme="orange" variant="ghost">M+</Button>
            <Button onClick={() => handleMemory('M-')} colorScheme="orange" variant="ghost">M-</Button>
            
            <Button onClick={() => handleNumber('7')} variant="solid">7</Button>
            <Button onClick={() => handleNumber('8')} variant="solid">8</Button>
            <Button onClick={() => handleNumber('9')} variant="solid">9</Button>
            <Button onClick={() => handleOperator('÷')} colorScheme="teal">÷</Button>
            
            <Button onClick={() => handleNumber('4')} variant="solid">4</Button>
            <Button onClick={() => handleNumber('5')} variant="solid">5</Button>
            <Button onClick={() => handleNumber('6')} variant="solid">6</Button>
            <Button onClick={() => handleOperator('×')} colorScheme="teal">×</Button>
            
            <Button onClick={() => handleNumber('1')} variant="solid">1</Button>
            <Button onClick={() => handleNumber('2')} variant="solid">2</Button>
            <Button onClick={() => handleNumber('3')} variant="solid">3</Button>
            <Button onClick={() => handleOperator('-')} colorScheme="teal">-</Button>
            
            <Button onClick={() => handleNumber('0')} variant="solid">0</Button>
            <Button onClick={handleDecimal} variant="solid">.</Button>
            <Button onClick={handleEquals} colorScheme="blue">=</Button>
            <Button onClick={() => handleOperator('+')} colorScheme="teal">+</Button>
            
            <Button onClick={handleClear} colorScheme="red">C</Button>
            <Button onClick={() => handlePercentage()} colorScheme="teal">%</Button>
            <Button onClick={() => setUnitMode(!unitMode)} colorScheme="cyan">Unit</Button>
            <Button onClick={() => setDisplay(lastAnswer)} colorScheme="blue">ANS</Button>
          </Grid>
        )}
      </VStack>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Calculation History</DrawerHeader>
          <DrawerBody>
            <List spacing={4}>
              {history.map((item, index) => (
                <ListItem 
                  key={index} 
                  p={3} 
                  borderRadius="md" 
                  bg="whiteAlpha.50"
                  _hover={{ bg: "whiteAlpha.100" }}
                >
                  <Text fontSize="sm" color="gray.500">
                    {item.timestamp.toLocaleTimeString()}
                  </Text>
                  <Text fontSize="lg" fontFamily="monospace">
                    {item.calculation} = {item.result}
                  </Text>
                </ListItem>
              ))}
            </List>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </PageLayout>
  );
};

export default Calculator;