import type { Debt } from '../../types';
import { format } from 'date-fns';
import './DebtItem.css';

interface DebtItemProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export default function DebtItem({ debt, onEdit, onDelete, isDeleting = false }: DebtItemProps) {
  const getTypeLabel = (type: Debt['type']) => {
    const labels = {
      credit_card: 'Credit Card',
      personal_loan: 'Personal Loan',
      car_loan: 'Car Loan',
      student_loan: 'Student Loan',
      mortgage: 'Mortgage',
      other: 'Other',
    };
    return labels[type];
  };

  const getTypeColor = (type: Debt['type']) => {
    const colors = {
      credit_card: '#f59e0b',
      personal_loan: '#ef4444',
      car_loan: '#3b82f6',
      student_loan: '#8b5cf6',
      mortgage: '#06b6d4',
      other: '#6b7280',
    };
    return colors[type];
  };

  const monthlyInterest = (debt.currentBalance * debt.interestRate) / 100 / 12;
  const principalPaid = debt.principalAmount - debt.currentBalance;
  const principalPercentage = (principalPaid / debt.principalAmount) * 100;

  return (
    <div className="debt-item">
      <div className="debt-item-main">
        <div className="debt-item-info">
          <div className="debt-item-header">
            <h4>{debt.name}</h4>
            <span
              className="type-badge"
              style={{ backgroundColor: getTypeColor(debt.type) }}
            >
              {getTypeLabel(debt.type)}
            </span>
          </div>
          <div className="debt-item-details">
            <div className="debt-amounts">
              <div className="amount-row">
                <span className="label">Current Balance:</span>
                <span className="amount balance">${debt.currentBalance.toFixed(2)}</span>
              </div>
              <div className="amount-row">
                <span className="label">Original Amount:</span>
                <span className="amount">${debt.principalAmount.toFixed(2)}</span>
              </div>
              <div className="amount-row">
                <span className="label">Interest Rate:</span>
                <span className="amount interest">{debt.interestRate.toFixed(2)}% APR</span>
              </div>
              <div className="amount-row">
                <span className="label">Minimum Payment:</span>
                <span className="amount">${debt.minimumPayment.toFixed(2)}/month</span>
              </div>
            </div>
            <div className="debt-meta">
              <span className="meta-item">Start Date: {format(debt.startDate, 'MMM dd, yyyy')}</span>
              <span className="meta-item">Monthly Interest: ${monthlyInterest.toFixed(2)}</span>
              <span className="meta-item">Paid: {principalPercentage.toFixed(1)}%</span>
            </div>
          </div>
          {debt.notes && <p className="debt-notes">{debt.notes}</p>}
        </div>
        <div className="debt-item-actions">
          <button className="btn-edit" onClick={() => onEdit(debt)}>
            Edit
          </button>
          <button className="btn-delete" onClick={() => onDelete(debt.id)} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

