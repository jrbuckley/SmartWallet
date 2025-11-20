import type { Income } from '../../types';
import { format } from 'date-fns';
import './IncomeItem.css';

interface IncomeItemProps {
  income: Income;
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export default function IncomeItem({ income, onEdit, onDelete, isDeleting = false }: IncomeItemProps) {
  const getCategoryLabel = (category: Income['category']) => {
    const labels = {
      salary: 'Salary',
      bonus: 'Bonus',
      freelance: 'Freelance',
      investment_returns: 'Investment Returns',
      other: 'Other',
    };
    return labels[category];
  };

  const getCategoryColor = (category: Income['category']) => {
    const colors = {
      salary: '#10b981',
      bonus: '#3b82f6',
      freelance: '#f59e0b',
      investment_returns: '#8b5cf6',
      other: '#6b7280',
    };
    return colors[category];
  };

  return (
    <div className="income-item">
      <div className="income-item-main">
        <div className="income-item-info">
          <div className="income-item-header">
            <h4>{income.name}</h4>
            <span
              className="category-badge"
              style={{ backgroundColor: getCategoryColor(income.category) }}
            >
              {getCategoryLabel(income.category)}
            </span>
          </div>
          <div className="income-item-details">
            <span className="amount">${income.amount.toFixed(2)}</span>
            <span className="date">
              Date: {format(income.date, 'MMM dd, yyyy')}
            </span>
            {income.isRecurring && (
              <span className="recurring-badge">
                {income.recurringFrequency === 'monthly' && '🔄 Monthly'}
                {income.recurringFrequency === 'weekly' && '🔄 Weekly'}
                {income.recurringFrequency === 'yearly' && '🔄 Yearly'}
              </span>
            )}
          </div>
          {income.notes && <p className="income-notes">{income.notes}</p>}
        </div>
        <div className="income-item-actions">
          <button className="btn-edit" onClick={() => onEdit(income)}>
            Edit
          </button>
          <button className="btn-delete" onClick={() => onDelete(income.id)} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

