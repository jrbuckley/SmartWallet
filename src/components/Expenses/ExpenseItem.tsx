import type { Expense } from '../../types';
import { format } from 'date-fns';
import './ExpenseItem.css';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (expense: Expense) => void;
  isDeleting?: boolean;
}

export default function ExpenseItem({ expense, onEdit, onDelete, onTogglePaid, isDeleting = false }: ExpenseItemProps) {
  const getCategoryLabel = (category: Expense['category']) => {
    const labels = {
      bill: 'Bill',
      loan: 'Loan',
      credit_card: 'Credit Card',
      other: 'Other',
    };
    return labels[category];
  };

  const getCategoryColor = (category: Expense['category']) => {
    const colors = {
      bill: '#3b82f6',
      loan: '#ef4444',
      credit_card: '#f59e0b',
      other: '#6b7280',
    };
    return colors[category];
  };

  const isOverdue = !expense.isPaid && expense.dueDate < new Date();

  return (
    <div className={`expense-item ${expense.isPaid ? 'paid' : ''} ${isOverdue ? 'overdue' : ''}`}>
      <div className="expense-item-main">
        <div className="expense-item-info">
          <div className="expense-item-header">
            <h4>{expense.name}</h4>
            <span
              className="category-badge"
              style={{ backgroundColor: getCategoryColor(expense.category) }}
            >
              {getCategoryLabel(expense.category)}
            </span>
          </div>
          <div className="expense-item-details">
            <span className="amount">${expense.amount.toFixed(2)}</span>
            <span className="due-date">
              Due: {format(expense.dueDate, 'MMM dd, yyyy')}
              {isOverdue && <span className="overdue-badge">Overdue</span>}
            </span>
            {expense.isRecurring && (
              <span className="recurring-badge">
                {expense.recurringFrequency === 'monthly' && '🔄 Monthly'}
                {expense.recurringFrequency === 'weekly' && '🔄 Weekly'}
                {expense.recurringFrequency === 'yearly' && '🔄 Yearly'}
              </span>
            )}
          </div>
          {expense.notes && <p className="expense-notes">{expense.notes}</p>}
        </div>
        <div className="expense-item-actions">
          <button
            className={`btn-toggle ${expense.isPaid ? 'paid' : 'unpaid'}`}
            onClick={() => onTogglePaid(expense)}
          >
            {expense.isPaid ? '✓ Paid' : 'Mark Paid'}
          </button>
          <button className="btn-edit" onClick={() => onEdit(expense)}>
            Edit
          </button>
          <button className="btn-delete" onClick={() => onDelete(expense.id)} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

