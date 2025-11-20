import { useState } from 'react';
import type { Debt, PayoffStrategy } from '../../types';
import {
  calculateAvalancheStrategy,
  calculateSnowballStrategy,
  calculateMinimumStrategy,
  getRecommendedStrategy,
} from '../../utils/payoffCalculator';
import './PayoffStrategies.css';

interface PayoffStrategiesProps {
  debts: Debt[];
}

export default function PayoffStrategies({ debts }: PayoffStrategiesProps) {
  const [extraPayment, setExtraPayment] = useState('0');

  if (debts.length === 0) {
    return (
      <div className="payoff-strategies">
        <h3>Payoff Strategies</h3>
        <p className="no-data-message">Add debts to see payoff strategies</p>
      </div>
    );
  }

  const extra = parseFloat(extraPayment) || 0;
  const avalanche = calculateAvalancheStrategy(debts, extra);
  const snowball = calculateSnowballStrategy(debts, extra);
  const minimum = calculateMinimumStrategy(debts);
  const recommended = getRecommendedStrategy(debts, extra);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatMonths = (months: number) => {
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years} years`;
  };

  return (
    <div className="payoff-strategies">
      <div className="strategies-header">
        <h3>Debt Payoff Strategies</h3>
        <div className="extra-payment-input">
          <label htmlFor="extraPayment">Extra Monthly Payment ($):</label>
          <input
            type="number"
            id="extraPayment"
            step="10"
            min="0"
            value={extraPayment}
            onChange={(e) => setExtraPayment(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="strategies-grid">
        <StrategyCard
          strategy={recommended}
          isRecommended={true}
          formatCurrency={formatCurrency}
          formatMonths={formatMonths}
        />
        <StrategyCard
          strategy={avalanche}
          isRecommended={false}
          formatCurrency={formatCurrency}
          formatMonths={formatMonths}
        />
        <StrategyCard
          strategy={snowball}
          isRecommended={false}
          formatCurrency={formatCurrency}
          formatMonths={formatMonths}
        />
        <StrategyCard
          strategy={minimum}
          isRecommended={false}
          formatCurrency={formatCurrency}
          formatMonths={formatMonths}
        />
      </div>

      <div className="strategy-comparison">
        <h4>Strategy Comparison</h4>
        <div className="comparison-table">
          <div className="comparison-row header">
            <div>Strategy</div>
            <div>Total Interest</div>
            <div>Time to Payoff</div>
            <div>Monthly Payment</div>
          </div>
          {[recommended, avalanche, snowball, minimum].map((strategy) => (
            <div key={strategy.name} className="comparison-row">
              <div className="strategy-name">
                {strategy.name}
                {strategy.name === recommended.name && <span className="recommended-badge">Recommended</span>}
              </div>
              <div>{formatCurrency(strategy.totalInterest)}</div>
              <div>{formatMonths(strategy.monthsToPayoff)}</div>
              <div>{formatCurrency(strategy.monthlyPayment)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StrategyCardProps {
  strategy: PayoffStrategy;
  isRecommended: boolean;
  formatCurrency: (amount: number) => string;
  formatMonths: (months: number) => string;
}

function StrategyCard({ strategy, isRecommended, formatCurrency, formatMonths }: StrategyCardProps) {
  return (
    <div className={`strategy-card ${isRecommended ? 'recommended' : ''}`}>
      {isRecommended && <div className="recommended-badge">⭐ Recommended</div>}
      <h4>{strategy.name}</h4>
      <p className="strategy-description">{strategy.description}</p>
      <div className="strategy-metrics">
        <div className="metric">
          <span className="metric-label">Total Interest:</span>
          <span className="metric-value">{formatCurrency(strategy.totalInterest)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Time to Payoff:</span>
          <span className="metric-value">{formatMonths(strategy.monthsToPayoff)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Monthly Payment:</span>
          <span className="metric-value">{formatCurrency(strategy.monthlyPayment)}</span>
        </div>
      </div>
    </div>
  );
}

