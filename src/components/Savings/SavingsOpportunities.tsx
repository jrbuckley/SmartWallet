import { useFinancial } from '../../contexts/FinancialContext';
import type { SavingsOpportunity } from '../../types';
import './SavingsOpportunities.css';

export default function SavingsOpportunities() {
  const { getFinancialSummary } = useFinancial();
  const summary = getFinancialSummary();
  const opportunities = summary.savingsOpportunities;

  const getPriorityColor = (priority: SavingsOpportunity['priority']) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981',
    };
    return colors[priority];
  };

  const getTypeIcon = (type: SavingsOpportunity['type']) => {
    const icons = {
      expense_reduction: '💰',
      investment_optimization: '📈',
      debt_consolidation: '💳',
      budget_optimization: '📊',
    };
    return icons[type];
  };

  return (
    <div className="savings-opportunities-container">
      <div className="savings-header">
        <h2>Savings Opportunities</h2>
        <p className="subtitle">
          AI-powered insights to help you save more and optimize your finances
        </p>
      </div>

      {opportunities.length === 0 ? (
        <div className="empty-state">
          <p>Great job! No immediate savings opportunities identified. Keep up the good financial management!</p>
        </div>
      ) : (
        <div className="opportunities-list">
          {opportunities.map(opportunity => (
            <div key={opportunity.id} className="opportunity-card">
              <div className="opportunity-header">
                <span className="opportunity-icon">{getTypeIcon(opportunity.type)}</span>
                <div className="opportunity-title-section">
                  <h3>{opportunity.title}</h3>
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(opportunity.priority) }}
                  >
                    {opportunity.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
              </div>
              <p className="opportunity-description">{opportunity.description}</p>
              {opportunity.potentialSavings > 0 && (
                <div className="potential-savings">
                  <span className="savings-label">Potential Savings:</span>
                  <span className="savings-amount">${opportunity.potentialSavings.toFixed(2)}</span>
                </div>
              )}
              {opportunity.actionable && (
                <div className="opportunity-actions">
                  <button className="btn-action">Take Action</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

