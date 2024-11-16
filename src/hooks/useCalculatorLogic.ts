import { useCallback } from 'react';
import { useCalculator } from '../context/CalculatorContext';
import * as math from 'mathjs';
import { CustomFunction } from '../types';

export function useCalculatorLogic() {
  const { state, dispatch } = useCalculator();

  const setDisplay = useCallback((value: string) => {
    dispatch({ type: 'SET_DISPLAY', payload: value });
  }, [dispatch]);

  const setEquation = useCallback((value: string) => {
    dispatch({ type: 'SET_EQUATION', payload: value });
  }, [dispatch]);

  const setOperator = useCallback((value: string) => {
    dispatch({ type: 'SET_OPERATOR', payload: value });
  }, [dispatch]);

  const setPreviousValue = useCallback((value: number) => {
    dispatch({ type: 'SET_PREVIOUS_VALUE', payload: value });
  }, [dispatch]);

  const setNewNumber = useCallback((value: boolean) => {
    dispatch({ type: 'SET_NEW_NUMBER', payload: value });
  }, [dispatch]);

  const setError = useCallback((value: string) => {
    dispatch({ type: 'SET_ERROR', payload: value });
  }, [dispatch]);

  const addToHistory = useCallback((calculation: string, result: string) => {
    dispatch({
      type: 'ADD_TO_HISTORY',
      payload: { calculation, result, timestamp: new Date() }
    });
  }, [dispatch]);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, [dispatch]);

  const setMode = useCallback((mode: 'standard' | 'scientific' | 'programmer' | 'financial' | 'unit' | 'date') => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, [dispatch]);

  const setPrecision = useCallback((value: number) => {
    dispatch({ type: 'SET_PRECISION', payload: value });
  }, [dispatch]);

  const addCustomFunction = useCallback((func: CustomFunction) => {
    dispatch({ type: 'ADD_CUSTOM_FUNCTION', payload: func });
  }, [dispatch]);

  const evaluateExpression = useCallback((expression: string) => {
    try {
      const result = math.evaluate(expression);
      return Number(result.toFixed(state.precision));
    } catch (error) {
      setError((error as Error).message);
      return null;
    }
  }, [state.precision, setError]);

  const convertBase = useCallback((num: string, fromBase: number, toBase: number) => {
    try {
      const decimal = parseInt(num, fromBase);
      return decimal.toString(toBase).toUpperCase();
    } catch (error) {
      setError('Geçersiz sayı formatı');
      return '';
    }
  }, [setError]);

  const calculateFinancial = useCallback((
    principal: number,
    rate: number,
    time: number,
    type: 'loan' | 'investment' | 'mortgage'
  ) => {
    const monthlyRate = rate / 12 / 100;
    const months = time * 12;

    switch (type) {
      case 'loan':
      case 'mortgage': {
        // EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
        const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) 
                   / (Math.pow(1 + monthlyRate, months) - 1);
        return emi;
      }
      case 'investment': {
        // FV = P * (1 + r)^n
        const futureValue = principal * Math.pow(1 + monthlyRate, months);
        return futureValue;
      }
      default:
        return 0;
    }
  }, []);

  const calculateDate = useCallback((date1: Date, date2: Date, operation: 'diff' | 'add' | 'subtract') => {
    switch (operation) {
      case 'diff':
        return Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);
      case 'add':
        return new Date(date1.getTime() + date2.getTime());
      case 'subtract':
        return new Date(date1.getTime() - date2.getTime());
      default:
        return new Date();
    }
  }, []);

  return {
    state,
    setDisplay,
    setEquation,
    setOperator,
    setPreviousValue,
    setNewNumber,
    setError,
    addToHistory,
    clearAll,
    setMode,
    setPrecision,
    addCustomFunction,
    evaluateExpression,
    convertBase,
    calculateFinancial,
    calculateDate
  };
}
