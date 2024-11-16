import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CalculatorState, CalculatorMode, HistoryItem, CustomFunction } from '../types';

type CalculatorAction =
  | { type: 'SET_DISPLAY'; payload: string }
  | { type: 'SET_EQUATION'; payload: string }
  | { type: 'SET_OPERATOR'; payload: string }
  | { type: 'SET_PREVIOUS_VALUE'; payload: number }
  | { type: 'SET_NEW_NUMBER'; payload: boolean }
  | { type: 'SET_MEMORY'; payload: number }
  | { type: 'ADD_TO_HISTORY'; payload: HistoryItem }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_MODE'; payload: CalculatorMode }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_BASE'; payload: number }
  | { type: 'ADD_CUSTOM_FUNCTION'; payload: CustomFunction }
  | { type: 'SET_PRECISION'; payload: number }
  | { type: 'CLEAR_ALL' };

const initialState: CalculatorState = {
  display: '0',
  equation: '',
  operator: '',
  previousValue: 0,
  newNumber: true,
  memory: 0,
  history: [],
  mode: 'standard',
  error: '',
  base: 10,
  customFunctions: [],
  theme: {
    primary: '#3182ce',
    secondary: '#2b6cb0',
    accent: '#48bb78',
    background: '#ffffff',
    text: '#1a202c'
  },
  precision: 8
};

const CalculatorContext = createContext<{
  state: CalculatorState;
  dispatch: React.Dispatch<CalculatorAction>;
} | undefined>(undefined);

function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'SET_DISPLAY':
      return { ...state, display: action.payload };
    case 'SET_EQUATION':
      return { ...state, equation: action.payload };
    case 'SET_OPERATOR':
      return { ...state, operator: action.payload };
    case 'SET_PREVIOUS_VALUE':
      return { ...state, previousValue: action.payload };
    case 'SET_NEW_NUMBER':
      return { ...state, newNumber: action.payload };
    case 'SET_MEMORY':
      return { ...state, memory: action.payload };
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        history: [action.payload, ...state.history].slice(0, 50)
      };
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_BASE':
      return { ...state, base: action.payload };
    case 'ADD_CUSTOM_FUNCTION':
      return {
        ...state,
        customFunctions: [...state.customFunctions, action.payload]
      };
    case 'SET_PRECISION':
      return { ...state, precision: action.payload };
    case 'CLEAR_ALL':
      return { ...initialState, theme: state.theme };
    default:
      return state;
  }
}

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);

  return (
    <CalculatorContext.Provider value={{ state, dispatch }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
}
