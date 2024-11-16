export interface HistoryItem {
  calculation: string;
  result: string;
  timestamp: Date;
}

export interface UnitConversion {
  from: string;
  to: string;
  value: number;
}

export interface FinancialCalculation {
  type: 'loan' | 'investment' | 'mortgage';
  amount: number;
  rate: number;
  term: number;
  result: number;
}

export interface CustomFunction {
  name: string;
  expression: string;
  variables: string[];
}

export type CalculatorMode = 'standard' | 'scientific' | 'programmer' | 'financial' | 'unit' | 'date';

export interface CalculatorTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface CalculatorState {
  display: string;
  equation: string;
  operator: string;
  previousValue: number;
  newNumber: boolean;
  memory: number;
  history: HistoryItem[];
  mode: CalculatorMode;
  error: string;
  base: number; // For programmer mode (2, 8, 10, 16)
  customFunctions: CustomFunction[];
  theme: CalculatorTheme;
  precision: number;
}
