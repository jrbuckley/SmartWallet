import { useFinancial } from '../../contexts/FinancialContext';
import { format } from 'date-fns';
import DashboardCharts from './DashboardCharts';
import './Dashboard.css';

export default function Dashboard() {
  const { getFinancialSummary } = useFinancial();
  const summary = getFinancialSummary();

  return (
    <div className="dashboard-container">
      <h1>Financial Dashboard</h1>
      
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Total Income</h3>
          <p className="summary-value income">${summary.totalIncome.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Monthly Recurring Income</h3>
          <p className="summary-value income">${summary.monthlyRecurringIncome.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Monthly Recurring Expenses</h3>
          <p className="summary-value expense">${summary.monthlyRecurringExpenses.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Net Cash Flow</h3>
          <p className={`summary-value ${summary.netCashFlow >= 0 ? 'income' : 'expense'}`}>
            ${summary.netCashFlow >= 0 ? '+' : ''}${summary.netCashFlow.toFixed(2)}
          </p>
        </div>
        <div className="summary-card">
          <h3>Investment Value</h3>
          <p className="summary-value investment">${summary.totalInvestmentValue.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Unpaid Expenses</h3>
          <p className="summary-value expense">${summary.totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      <DashboardCharts />

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>Recent Income (Last 30 Days)</h2>
          {summary.recentIncome.length === 0 ? (
            <p className="empty-message">No income recorded in the last 30 days.</p>
          ) : (
            <div className="recent-income">
              {summary.recentIncome.map(incomeItem => (
                <div key={incomeItem.id} className="recent-income-item">
                  <div className="recent-income-info">
                    <h4>{incomeItem.name}</h4>
                    <p>{format(incomeItem.date, 'MMM dd, yyyy')}</p>
                  </div>
                  <p className="recent-income-amount">${incomeItem.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Upcoming Expenses (Next 30 Days)</h2>
          {summary.upcomingExpenses.length === 0 ? (
            <p className="empty-message">No upcoming expenses in the next 30 days.</p>
          ) : (
            <div className="upcoming-expenses">
              {summary.upcomingExpenses.slice(0, 5).map(expense => (
                <div key={expense.id} className="upcoming-expense-item">
                  <div className="upcoming-expense-info">
                    <h4>{expense.name}</h4>
                    <p>{format(expense.dueDate, 'MMM dd, yyyy')}</p>
                  </div>
                  <p className="upcoming-expense-amount">${expense.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Top Savings Opportunities</h2>
          {summary.savingsOpportunities.length === 0 ? (
            <p className="empty-message">No savings opportunities identified at this time.</p>
          ) : (
            <div className="savings-preview">
              {summary.savingsOpportunities.slice(0, 3).map(opportunity => (
                <div key={opportunity.id} className="savings-preview-item">
                  <h4>{opportunity.title}</h4>
                  {opportunity.potentialSavings > 0 && (
                    <p className="savings-amount">Potential: ${opportunity.potentialSavings.toFixed(2)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

