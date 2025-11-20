import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Income } from '../../types';
import './IncomeCharts.css';

interface IncomeChartsProps {
  income: Income[];
}

const COLORS = {
  salary: '#10b981',
  bonus: '#3b82f6',
  freelance: '#f59e0b',
  investment_returns: '#8b5cf6',
  other: '#6b7280',
};

const categoryLabels = {
  salary: 'Salary',
  bonus: 'Bonus',
  freelance: 'Freelance',
  investment_returns: 'Investment Returns',
  other: 'Other',
};

export default function IncomeCharts({ income }: IncomeChartsProps) {
  // Calculate breakdown by category
  const categoryBreakdown = income.reduce((acc, incomeItem) => {
    acc[incomeItem.category] = (acc[incomeItem.category] || 0) + incomeItem.amount;
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
        <h3>Income Breakdown by Category</h3>
        <p className="no-data-message">No income data to display</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3>Income Breakdown by Category</h3>
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

