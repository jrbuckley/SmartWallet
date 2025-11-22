import type { SavingsGoal } from '../../types';
import { format } from 'date-fns';
import './SavingsGoalItem.css';

interface SavingsGoalItemProps {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export default function SavingsGoalItem({ goal, onEdit, onDelete, isDeleting = false }: SavingsGoalItemProps) {
  const getCategoryLabel = (category: SavingsGoal['category']) => {
    const labels = {
      emergency_fund: 'Emergency Fund',
      vacation: 'Vacation',
      home: 'Home',
      car: 'Car',
      education: 'Education',
      retirement: 'Retirement',
      debt_payoff: 'Debt Payoff',
      other: 'Other',
    };
    return labels[category];
  };

  const getCategoryIcon = (category: SavingsGoal['category']) => {
    const icons = {
      emergency_fund: '🛡️',
      vacation: '✈️',
      home: '🏠',
      car: '🚗',
      education: '🎓',
      retirement: '💰',
      debt_payoff: '💳',
      other: '📌',
    };
    return icons[category];
  };

  const getPriorityColor = (priority: SavingsGoal['priority']) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981',
    };
    return colors[priority];
  };

  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <div className="savings-goal-item">
      <div className="savings-goal-item-main">
        <div className="savings-goal-item-info">
          <div className="savings-goal-item-header">
            <div className="goal-title-section">
              <span className="goal-icon">{getCategoryIcon(goal.category)}</span>
              <h4>{goal.name}</h4>
            </div>
            <div className="goal-badges">
              <span
                className="category-badge"
              >
                {getCategoryLabel(goal.category)}
              </span>
              <span
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(goal.priority) }}
              >
                {goal.priority.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="goal-progress-section">
            <div className="goal-amounts">
              <div className="amount-display">
                <span className="current-amount">${goal.currentAmount.toFixed(2)}</span>
                <span className="target-amount">of ${goal.targetAmount.toFixed(2)}</span>
              </div>
              <div className="progress-percentage">
                {progress.toFixed(1)}%
              </div>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
            <div className="goal-details">
              <span className="remaining-amount">
                ${remaining.toFixed(2)} remaining
              </span>
              {goal.targetDate && (
                <span className="target-date">
                  Target: {format(goal.targetDate, 'MMM dd, yyyy')}
                </span>
              )}
            </div>
          </div>

          {goal.notes && <p className="goal-notes">{goal.notes}</p>}
        </div>
        <div className="savings-goal-item-actions">
          <button className="btn-edit" onClick={() => onEdit(goal)}>
            Edit
          </button>
          <button className="btn-delete" onClick={() => onDelete(goal.id)} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

