import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Expense } from '../../types';
import './ExpenseCharts.css';

interface ExpenseChartsProps {
  expenses: Expense[];
}

const COLORS = {
  bill: '#3b82f6',
  loan: '#ef4444',
  credit_card: '#f59e0b',
  other: '#6b7280',
};

const categoryLabels = {
  bill: 'Bills',
  loan: 'Loans',
  credit_card: 'Credit Cards',
  other: 'Other',
};

export default function ExpenseCharts({ expenses }: ExpenseChartsProps) {
  // Calculate breakdown by category (unpaid expenses)
  const unpaidExpenses = expenses.filter(e => !e.isPaid);
  const categoryBreakdown = unpaidExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryBreakdown).map(([category, amount]) => ({
    name: categoryLabels[category as keyof typeof categoryLabels],
    value: amount,
    category,
  }));

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <h3>Expense Breakdown by Category</h3>
        <p className="no-data-message">No unpaid expenses to display</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3>Expense Breakdown by Category (Unpaid)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: any) => {
              const { name, percent } = props;
              return `${name || ''}: ${percent ? (percent * 100).toFixed(0) : 0}%`;
            }}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.category as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

