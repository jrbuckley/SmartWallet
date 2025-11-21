import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Debt } from '../../types';
import { generatePayoffPlan, calculatePayoffTimeline } from '../../utils/debtPayoffPlan';
import { format } from 'date-fns';
import './DebtPayoffPlan.css';

interface DebtPayoffPlanProps {
  debts: Debt[];
  extraPayment?: string;
  onExtraPaymentChange?: (value: string) => void;
}

export default function DebtPayoffPlan({ debts, extraPayment: externalExtraPayment, onExtraPaymentChange }: DebtPayoffPlanProps) {
  const [strategy, setStrategy] = useState<'avalanche' | 'snowball'>('avalanche');
  const [internalExtraPayment, setInternalExtraPayment] = useState('0');
  const extraPayment = externalExtraPayment !== undefined ? externalExtraPayment : internalExtraPayment;
  const setExtraPayment = onExtraPaymentChange || setInternalExtraPayment;
  const [showDetails, setShowDetails] = useState(false);

  if (debts.length === 0) {
    return (
      <div className="payoff-plan-container">
        <h3>Debt Payoff Plan</h3>
        <p className="no-data-message">Add debts to see your payoff plan</p>
      </div>
    );
  }

  const extra = parseFloat(extraPayment) || 0;
  const plan = generatePayoffPlan(debts, strategy, extra);
  const timeline = calculatePayoffTimeline(debts, strategy, extra);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatMonths = (months: number) => {
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years} years`;
  };

  // Group payments by month for summary
  const monthlySummary = new Map<number, { totalPayment: number; totalInterest: number; debts: string[] }>();
  plan.payments.forEach(payment => {
    const existing = monthlySummary.get(payment.month) || { totalPayment: 0, totalInterest: 0, debts: [] };
    existing.totalPayment += payment.payment;
    existing.totalInterest += payment.interest;
    if (!existing.debts.includes(payment.debtName)) {
      existing.debts.push(payment.debtName);
    }
    monthlySummary.set(payment.month, existing);
  });

  // Get first 12 months for preview
  const previewMonths = Array.from(monthlySummary.entries())
    .slice(0, 12)
    .map(([month, data]) => ({
      month,
      date: plan.payments.find(p => p.month === month)?.date || new Date(),
      totalPayment: data.totalPayment,
      totalInterest: data.totalInterest,
      debts: data.debts,
    }));

  return (
    <div className="payoff-plan-container">
      <div className="plan-header">
        <h3>Debt Payoff Plan</h3>
        <div className="plan-controls">
          <div className="strategy-selector">
            <label>Strategy:</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as 'avalanche' | 'snowball')}
            >
              <option value="avalanche">Avalanche (Highest Interest First)</option>
              <option value="snowball">Snowball (Smallest Balance First)</option>
            </select>
          </div>
          <div className="extra-payment-input">
            <label>Extra Monthly Payment ($):</label>
            <input
              type="number"
              step="10"
              min="0"
              value={extraPayment}
              onChange={(e) => setExtraPayment(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="plan-summary">
        <div className="summary-card">
          <div className="summary-label">Time to Payoff</div>
          <div className="summary-value">{formatMonths(plan.totalMonths)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Interest</div>
          <div className="summary-value expense">{formatCurrency(plan.totalInterest)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Monthly Payment</div>
          <div className="summary-value">{formatCurrency(plan.monthlyPayment)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Payments</div>
          <div className="summary-value">{formatCurrency(plan.totalPayments)}</div>
        </div>
      </div>

      <div className="plan-timeline-chart">
        <h4>Debt Reduction Timeline</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#d1d5db"
              label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              stroke="#d1d5db"
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="totalDebt" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Remaining Debt"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="totalInterestPaid" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Total Interest Paid"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="plan-preview">
        <div className="preview-header">
          <h4>Payment Schedule (First 12 Months)</h4>
          <button
            className="btn-toggle"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show All Months'}
          </button>
        </div>

        <div className="payment-schedule">
          {(showDetails 
            ? Array.from(monthlySummary.entries()).map(([month, data]) => ({ month, ...data }))
            : previewMonths
          ).map((item) => {
            const month = item.month;
            const data = showDetails ? item : { totalPayment: item.totalPayment, totalInterest: item.totalInterest, debts: item.debts };
            const monthPayments = plan.payments.filter(p => p.month === month);
            const monthDate = monthPayments[0]?.date || new Date();
            const remainingBalance = monthPayments[monthPayments.length - 1]?.remainingBalance || 0;
            
            return (
              <div key={month} className="payment-month">
                <div className="month-header">
                  <div className="month-info">
                    <span className="month-label">Month {month}</span>
                    <span className="month-date">{format(monthDate, 'MMM yyyy')}</span>
                  </div>
                  <div className="month-totals">
                    <span className="total-payment">Payment: {formatCurrency(data.totalPayment)}</span>
                    <span className="total-interest">Interest: {formatCurrency(data.totalInterest)}</span>
                    <span className="remaining-balance">Remaining: {formatCurrency(remainingBalance)}</span>
                  </div>
                </div>
                {showDetails && (
                  <div className="month-details">
                    {monthPayments.map((payment, idx) => (
                      <div key={idx} className="payment-detail">
                        <span className="debt-name">{payment.debtName}</span>
                        <span className="payment-amount">{formatCurrency(payment.payment)}</span>
                        <span className="payment-breakdown">
                          Principal: {formatCurrency(payment.principal)} | 
                          Interest: {formatCurrency(payment.interest)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

