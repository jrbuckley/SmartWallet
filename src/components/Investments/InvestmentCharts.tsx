import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { Investment } from '../../types';
import './InvestmentCharts.css';

interface InvestmentChartsProps {
  investments: Investment[];
}

const TYPE_COLORS = {
  stock: '#3b82f6',
  bond: '#10b981',
  mutual_fund: '#f59e0b',
  etf: '#8b5cf6',
  crypto: '#ef4444',
  real_estate: '#06b6d4',
  other: '#6b7280',
};

const typeLabels = {
  stock: 'Stock',
  bond: 'Bond',
  mutual_fund: 'Mutual Fund',
  etf: 'ETF',
  crypto: 'Crypto',
  real_estate: 'Real Estate',
  other: 'Other',
};

export default function InvestmentCharts({ investments }: InvestmentChartsProps) {
  // Calculate breakdown by type (by value)
  const typeBreakdown = investments.reduce((acc, investment) => {
    const value = investment.quantity * investment.currentPrice;
    acc[investment.type] = (acc[investment.type] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(typeBreakdown).map(([type, value]) => ({
    name: typeLabels[type as keyof typeof typeLabels],
    value: value,
    type,
  }));

  // Calculate gain/loss per investment for bar chart
  const performanceData = investments.map(investment => {
    const totalValue = investment.quantity * investment.currentPrice;
    const totalCost = investment.quantity * investment.purchasePrice;
    const gainLoss = totalValue - totalCost;
    return {
      name: investment.name.length > 15 ? investment.name.substring(0, 15) + '...' : investment.name,
      gainLoss: gainLoss,
      value: totalValue,
    };
  }).sort((a, b) => b.value - a.value).slice(0, 10); // Top 10 by value

  if (investments.length === 0) {
    return (
      <div className="charts-section">
        <div className="chart-container">
          <h3>Investment Breakdown by Type</h3>
          <p className="no-data-message">No investments to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-section">
      <div className="chart-container">
        <h3>Investment Breakdown by Type (Value)</h3>
        {pieChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
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
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.type as keyof typeof TYPE_COLORS]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="no-data-message">No investment data to display</p>
        )}
      </div>

      {performanceData.length > 0 && (
        <div className="chart-container">
          <h3>Top Investments Performance (Gain/Loss)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                stroke="#d1d5db"
                fontSize={12}
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
              <Bar dataKey="gainLoss" fill="#8884d8">
                {performanceData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.gainLoss >= 0 ? '#10b981' : '#ef4444'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

