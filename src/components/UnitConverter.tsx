import React, { useState, useCallback } from 'react';
import {
  Box,
  Select,
  Input,
  VStack,
  HStack,
  Text,
  useToast
} from '@chakra-ui/react';

const units = {
  length: {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    mile: 1609.34,
    yard: 0.9144,
    foot: 0.3048,
    inch: 0.0254
  },
  mass: {
    kg: 1,
    g: 0.001,
    mg: 0.000001,
    lb: 0.453592,
    oz: 0.0283495
  },
  temperature: {
    C: 'celsius',
    F: 'fahrenheit',
    K: 'kelvin'
  },
  area: {
    'm2': 1,
    'km2': 1000000,
    'cm2': 0.0001,
    'mm2': 0.000001,
    'hectare': 10000,
    'acre': 4046.86
  },
  volume: {
    'l': 1,
    'ml': 0.001,
    'm3': 1000,
    'cm3': 0.001,
    'gallon': 3.78541
  },
  time: {
    s: 1,
    min: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2592000,
    year: 31536000
  }
};

type UnitType = keyof typeof units;

export function UnitConverter() {
  const [unitType, setUnitType] = useState<UnitType>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('km');
  const [value, setValue] = useState<string>('1');
  const [result, setResult] = useState<string>('0.001');
  
  const toast = useToast();

  const convertTemperature = useCallback((value: number, from: string, to: string): number => {
    let celsius: number;
    
    // Convert to Celsius first
    switch (from) {
      case 'C':
        celsius = value;
        break;
      case 'F':
        celsius = (value - 32) * 5/9;
        break;
      case 'K':
        celsius = value - 273.15;
        break;
      default:
        return value;
    }

    // Convert from Celsius to target unit
    switch (to) {
      case 'C':
        return celsius;
      case 'F':
        return (celsius * 9/5) + 32;
      case 'K':
        return celsius + 273.15;
      default:
        return celsius;
    }
  }, []);

  const convert = useCallback(() => {
    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        throw new Error('Geçersiz sayı');
      }

      let convertedValue: number;

      if (unitType === 'temperature') {
        convertedValue = convertTemperature(numValue, fromUnit, toUnit);
      } else {
        const fromFactor = units[unitType][fromUnit as keyof typeof units[UnitType]];
        const toFactor = units[unitType][toUnit as keyof typeof units[UnitType]];
        convertedValue = (numValue * fromFactor) / toFactor;
      }

      setResult(convertedValue.toPrecision(6));
    } catch (error) {
      toast({
        title: 'Hata',
        description: (error as Error).message,
        status: 'error',
        duration: 2000,
        isClosable: true
      });
    }
  }, [value, unitType, fromUnit, toUnit, convertTemperature, toast]);

  return (
    <Box p={4}>
      <VStack spacing={4}>
        <Select
          value={unitType}
          onChange={(e) => {
            const newType = e.target.value as UnitType;
            setUnitType(newType);
            setFromUnit(Object.keys(units[newType])[0]);
            setToUnit(Object.keys(units[newType])[1]);
          }}
        >
          {Object.keys(units).map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </Select>

        <HStack width="100%" spacing={4}>
          <VStack flex={1}>
            <Input
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                convert();
              }}
              type="number"
              placeholder="Değer"
            />
            <Select
              value={fromUnit}
              onChange={(e) => {
                setFromUnit(e.target.value);
                convert();
              }}
            >
              {Object.keys(units[unitType]).map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </Select>
          </VStack>

          <Text fontSize="2xl">=</Text>

          <VStack flex={1}>
            <Input value={result} isReadOnly />
            <Select
              value={toUnit}
              onChange={(e) => {
                setToUnit(e.target.value);
                convert();
              }}
            >
              {Object.keys(units[unitType]).map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </Select>
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );
}
