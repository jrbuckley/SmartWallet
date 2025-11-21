import type { Debt } from '../../types';
import { generateActionItems } from '../../utils/debtPayoffPlan';
import './DebtActionItems.css';

interface DebtActionItemsProps {
  debts: Debt[];
  extraPayment: number;
}

export default function DebtActionItems({ debts, extraPayment }: DebtActionItemsProps) {
  if (debts.length === 0) {
    return null;
  }

  const actionItems = generateActionItems(debts, extraPayment);

  if (actionItems.length === 0) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return priority;
    }
  };

  return (
    <div className="action-items-container">
      <h3>Debt Payoff Action Items</h3>
      <p className="action-items-subtitle">
        Prioritized recommendations to help you pay off debt faster and save money
      </p>
      
      <div className="action-items-list">
        {actionItems.map((item) => (
          <div key={item.id} className="action-item">
            <div className="action-item-header">
              <div className="action-item-priority">
                <span
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(item.priority) }}
                >
                  {getPriorityLabel(item.priority)}
                </span>
              </div>
              <h4>{item.title}</h4>
            </div>
            
            <p className="action-item-description">{item.description}</p>
            
            <div className="action-item-details">
              <div className="action-detail">
                <span className="action-label">Action:</span>
                <span className="action-value">{item.action}</span>
              </div>
              <div className="action-detail">
                <span className="action-label">Impact:</span>
                <span className="action-value impact">{item.impact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

