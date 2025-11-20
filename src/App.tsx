import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FinancialProvider } from './contexts/FinancialContext';
import Navigation from './components/Common/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import ExpenseList from './components/Expenses/ExpenseList';
import InvestmentList from './components/Investments/InvestmentList';
import SavingsOpportunities from './components/Savings/SavingsOpportunities';
import DataManagement from './components/Common/DataManagement';
import './App.css';

function App() {
  return (
    <FinancialProvider>
      <Router>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/expenses" element={<ExpenseList />} />
              <Route path="/investments" element={<InvestmentList />} />
              <Route path="/savings" element={<SavingsOpportunities />} />
              <Route path="/settings" element={<DataManagement />} />
            </Routes>
          </main>
        </div>
      </Router>
    </FinancialProvider>
  );
}

export default App;
