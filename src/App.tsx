import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Button,
  Text,
  Container,
  VStack,
  useToast,
  HStack,
  IconButton,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  List,
  ListItem,
  Switch,
  Kbd,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, HamburgerIcon } from '@chakra-ui/icons';

interface HistoryItem {
  calculation: string;
  result: string;
  timestamp: Date;
}

const App: React.FC = () => {
  const [display, setDisplay] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');
  const [operator, setOperator] = useState<string>('');
  const [previousValue, setPreviousValue] = useState<number>(0);
  const [newNumber, setNewNumber] = useState<boolean>(true);
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [scientificMode, setScientificMode] = useState<boolean>(false);
  const [keyboardEnabled, setKeyboardEnabled] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!keyboardEnabled) return;

      if (e.key >= '0' && e.key <= '9') {
        handleNumber(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        handleOperator(e.key);
      } else if (e.key === 'Enter') {
        handleEqual();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    if (keyboardEnabled) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [keyboardEnabled, display, operator, previousValue]);

  const addToHistory = (calc: string, res: string) => {
    const newItem: HistoryItem = {
      calculation: calc,
      result: res,
      timestamp: new Date()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 10));
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
      case 'pow':
        return Math.pow(a, b);
      case 'root':
        if (b < 0) {
          throw new Error('Negatif sayının kökü alınamaz!');
        }
        return Math.pow(a, 1/b);
      default:
        return b;
    }
  };

  const handleScientificOperation = (operation: string) => {
    const num = parseFloat(display);
    let result: number;

    try {
      switch (operation) {
        case 'sqrt':
          if (num < 0) throw new Error('Negatif sayının karekökü alınamaz!');
          result = Math.sqrt(num);
          break;
        case 'square':
          result = num * num;
          break;
        case 'sin':
          result = Math.sin((num * Math.PI) / 180);
          break;
        case 'cos':
          result = Math.cos((num * Math.PI) / 180);
          break;
        case 'tan':
          result = Math.tan((num * Math.PI) / 180);
          break;
        case 'log':
          if (num <= 0) throw new Error('Logaritma için pozitif sayı gerekli!');
          result = Math.log10(num);
          break;
        default:
          return;
      }
      
      setDisplay(result.toFixed(8).replace(/\.?0+$/, ''));
      addToHistory(`${operation}(${num})`, result.toString());
    } catch (error) {
      setError((error as Error).message);
      toast({
        title: 'Hata',
        description: (error as Error).message,
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleMemory = (operation: string) => {
    const currentValue = parseFloat(display);
    
    switch (operation) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setDisplay(memory.toString());
        setNewNumber(true);
        break;
      case 'M+':
        setMemory(memory + currentValue);
        setNewNumber(true);
        break;
      case 'M-':
        setMemory(memory - currentValue);
        setNewNumber(true);
        break;
    }

    toast({
      title: 'Bellek İşlemi',
      description: `${operation} işlemi başarılı`,
      status: 'success',
      duration: 1000,
      isClosable: true,
    });
  };

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
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
      addToHistory(`${previousValue} ${operator} ${current}`, result.toString());
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
    <Container centerContent py={8} maxW="container.md">
      <VStack spacing="4" align="stretch" width="100%">
        <HStack justifyContent="space-between">
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            onClick={onOpen}
          />
          <Switch
            isChecked={scientificMode}
            onChange={() => setScientificMode(!scientificMode)}
            mr={2}
          >
            Bilimsel Mod
          </Switch>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
          />
        </HStack>

        <Box
          p={4}
          borderWidth={1}
          borderRadius="lg"
          bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
          minH="80px"
        >
          {error && (
            <Text color="red.500" fontSize="sm">{error}</Text>
          )}
          <Text fontSize="sm" color="gray.500">{equation}</Text>
          <Text fontSize="3xl" textAlign="right">{display}</Text>
        </Box>

        {scientificMode && (
          <Grid templateColumns="repeat(4, 1fr)" gap={2}>
            <Button onClick={() => handleScientificOperation('sqrt')}>√</Button>
            <Button onClick={() => handleScientificOperation('square')}>x²</Button>
            <Button onClick={() => handleOperator('pow')}>xʸ</Button>
            <Button onClick={() => handleScientificOperation('log')}>log</Button>
            <Button onClick={() => handleScientificOperation('sin')}>sin</Button>
            <Button onClick={() => handleScientificOperation('cos')}>cos</Button>
            <Button onClick={() => handleScientificOperation('tan')}>tan</Button>
            <Button onClick={() => handleOperator('root')}>ʸ√x</Button>
          </Grid>
        )}

        <Grid templateColumns="repeat(4, 1fr)" gap={2}>
          <Button onClick={() => handleMemory('MC')}>MC</Button>
          <Button onClick={() => handleMemory('MR')}>MR</Button>
          <Button onClick={() => handleMemory('M+')}>M+</Button>
          <Button onClick={() => handleMemory('M-')}>M-</Button>

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

        <HStack justifyContent="space-between">
          <Text fontSize="sm">Klavye: {keyboardEnabled ? 'Açık' : 'Kapalı'}</Text>
          <Switch
            isChecked={keyboardEnabled}
            onChange={() => setKeyboardEnabled(!keyboardEnabled)}
          >
            Klavye Kontrolü
          </Switch>
        </HStack>
      </VStack>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Geçmiş İşlemler</DrawerHeader>
          <DrawerBody>
            <List spacing={3}>
              {history.map((item, index) => (
                <ListItem key={index}>
                  <Text fontSize="sm" color="gray.500">
                    {item.timestamp.toLocaleTimeString()}
                  </Text>
                  <Text>{item.calculation} = {item.result}</Text>
                </ListItem>
              ))}
            </List>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Container>
  );
};

export default App;
