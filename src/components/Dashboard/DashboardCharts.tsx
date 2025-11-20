import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useFinancial } from '../../contexts/FinancialContext';
import './DashboardCharts.css';

export default function DashboardCharts() {
  const { getFinancialSummary } = useFinancial();
  const summary = getFinancialSummary();

  const cashFlowData = [
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
        <h3>Monthly Cash Flow</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={cashFlowData}>
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
              {cashFlowData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.name === 'Income' ? '#10b981' :
                    entry.name === 'Expenses' ? '#ef4444' :
                    entry.amount >= 0 ? '#10b981' : '#ef4444'
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

