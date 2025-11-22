import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FinancialProvider } from './contexts/FinancialContext';
import Navigation from './components/Common/Navigation';
import ScrollToTop from './components/Common/ScrollToTop';
import Dashboard from './components/Dashboard/Dashboard';
import ExpenseList from './components/Expenses/ExpenseList';
import IncomeList from './components/Income/IncomeList';
import DebtList from './components/Debt/DebtList';
import InvestmentList from './components/Investments/InvestmentList';
import SavingsGoalsList from './components/Savings/SavingsGoalsList';
import BudgetList from './components/Budget/BudgetList';
import DataManagement from './components/Common/DataManagement';
import './App.css';

function App() {
  return (
    <FinancialProvider>
      <Router>
        <ScrollToTop />
        <div className="app">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/expenses" element={<ExpenseList />} />
              <Route path="/income" element={<IncomeList />} />
              <Route path="/debts" element={<DebtList />} />
              <Route path="/investments" element={<InvestmentList />} />
              <Route path="/savings-goals" element={<SavingsGoalsList />} />
              <Route path="/budgets" element={<BudgetList />} />
              <Route path="/settings" element={<DataManagement />} />
            </Routes>
          </main>
        </div>
      </Router>
    </FinancialProvider>
  );
}

export default App;
