import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { useFinancial } from '../../contexts/FinancialContext';
import type { Income, Expense } from '../../types';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import './DashboardCharts.css';

export default function DashboardCharts() {
  const { getFinancialSummary, income, expenses } = useFinancial();
  const summary = getFinancialSummary();

  // Helper to convert recurring amount to monthly
  const convertToMonthly = (amount: number, frequency?: string): number => {
    if (!frequency) return 0;
    switch (frequency) {
      case 'weekly': return amount * 4.33;
      case 'biweekly': return amount * 2.17;
      case 'semimonthly': return amount * 2;
      case 'monthly': return amount;
      case 'yearly': return amount / 12;
      default: return 0;
    }
  };

  // Generate last 6 months of cash flow data
  const now = new Date();
  const sixMonthsAgo = subMonths(now, 5);
  const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });

  const monthlyData = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    // Calculate income for this month (recurring converted to monthly + actual income in month)
    // Group by name, category, and frequency to avoid double-counting
    const uniqueRecurringIncome = new Map<string, Income>();
    income
      .filter(i => i.isRecurring && i.recurringFrequency)
      .forEach(i => {
        const key = `${i.name}|${i.category}|${i.recurringFrequency}`;
        if (!uniqueRecurringIncome.has(key)) {
          uniqueRecurringIncome.set(key, i);
        }
      });
    
    const recurringIncome = Array.from(uniqueRecurringIncome.values())
      .reduce((sum, i) => sum + convertToMonthly(i.amount, i.recurringFrequency), 0);
    
    const actualIncome = income
      .filter(i => {
        const incomeDate = i.date;
        return incomeDate >= monthStart && incomeDate <= monthEnd && !i.isRecurring;
      })
      .reduce((sum, i) => sum + i.amount, 0);
    
    const totalIncome = recurringIncome + actualIncome;
    
    // Calculate expenses for this month
    // For recurring expenses, include all regardless of payment status (they represent ongoing obligations)
    // Group by name/category/frequency to avoid double-counting
    const uniqueRecurringExpenses = new Map<string, Expense>();
    expenses
      .filter(e => e.isRecurring && e.recurringFrequency)
      .forEach(e => {
        const key = `${e.name}|${e.category}|${e.recurringFrequency}`;
        if (!uniqueRecurringExpenses.has(key)) {
          uniqueRecurringExpenses.set(key, e);
        }
      });
    
    const recurringExpenses = Array.from(uniqueRecurringExpenses.values())
      .reduce((sum, e) => sum + convertToMonthly(e.amount, e.recurringFrequency), 0);
    
    // For actual (non-recurring) expenses, only count unpaid ones in the month
    const actualExpenses = expenses
      .filter(e => {
        const expenseDate = e.dueDate;
        return expenseDate >= monthStart && expenseDate <= monthEnd && !e.isRecurring && !e.isPaid;
      })
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalExpenses = recurringExpenses + actualExpenses;
    
    return {
      month: format(month, 'MMM yyyy'),
      income: totalIncome,
      expenses: totalExpenses,
      net: totalIncome - totalExpenses,
    };
  });

  const currentCashFlowData = [
    {
      name: 'Income',
      amount: summary.monthlyRecurringIncome,
    },
    {
      name: 'Expenses',
      amount: summary.monthlyRecurringExpenses,
    },
    {
      name: 'Net',
      amount: summary.netCashFlow,
    },
  ];

  return (
    <div className="dashboard-charts">
      <div className="chart-container">
        <h3>Monthly Cash Flow (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#d1d5db"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#d1d5db"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb',
              }}
            />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Income" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            <Bar dataKey="net" fill="#3b82f6" name="Net Cash Flow">
              {monthlyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill="#3b82f6"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Current Month Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={currentCashFlowData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#d1d5db"
            />
            <YAxis 
              stroke="#d1d5db"
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb',
              }}
            />
            <Bar dataKey="amount" fill="#8884d8">
              {currentCashFlowData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.name === 'Income' ? '#10b981' :
                    entry.name === 'Expenses' ? '#ef4444' :
                    '#3b82f6'
                  } 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

