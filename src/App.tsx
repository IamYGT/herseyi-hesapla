import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CalculatorPage from './pages/Calculator';
import ExchangePage from './pages/ExchangeCalculator';
import CoinFlipPage from './pages/CoinFlipPage';
import InvestmentTracker from './pages/InvestmentTracker';
import AppLayout from './layouts/AppLayout';
import FinancialCalculator from './pages/FinancialCalculator';
import DateCalculator from './pages/DateCalculator';
import ProgrammerCalculator from './pages/ProgrammerCalculator';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import { ActivityProvider } from './context/ActivityContext';
import { useAuth } from './context/AuthContext';

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user } = useAuth();
  return user ? element : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ActivityProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<PrivateRoute element={<HomePage />} />} />
            <Route path="/calculator" element={<PrivateRoute element={<CalculatorPage />} />} />
            <Route path="/calculator/financial" element={<PrivateRoute element={<FinancialCalculator />} />} />
            <Route path="/calculator/programmer" element={<PrivateRoute element={<ProgrammerCalculator />} />} />
            <Route path="/exchange" element={<PrivateRoute element={<ExchangePage />} />} />
            <Route path="/coinflip" element={<PrivateRoute element={<CoinFlipPage />} />} />
            <Route path="/investments" element={<PrivateRoute element={<InvestmentTracker />} />} />
            <Route path="/date-calculator" element={<PrivateRoute element={<DateCalculator />} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </ActivityProvider>
    </AuthProvider>
  );
};

export default App;