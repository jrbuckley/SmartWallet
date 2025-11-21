import { useState, useEffect } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import type { Debt, DebtType } from '../../types';
import Alert from '../Common/Alert';
import './DebtForm.css';

interface DebtFormProps {
  debt?: Debt | null;
  onClose: () => void;
}

export default function DebtForm({ debt, onClose }: DebtFormProps) {
  const { addDebt, updateDebt } = useFinancial();
  const [formData, setFormData] = useState({
    name: '',
    type: 'credit_card' as DebtType,
    principalAmount: '',
    currentBalance: '',
    interestRate: '',
    minimumPayment: '',
    startDate: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  useEffect(() => {
    if (debt) {
      setFormData({
        name: debt.name,
        type: debt.type,
        principalAmount: debt.principalAmount.toString(),
        currentBalance: debt.currentBalance.toString(),
        interestRate: debt.interestRate.toString(),
        minimumPayment: debt.minimumPayment.toString(),
        startDate: debt.startDate.toISOString().split('T')[0],
        notes: debt.notes || '',
      });
    }
  }, [debt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const debtData = {
        name: formData.name,
        type: formData.type,
        principalAmount: parseFloat(formData.principalAmount),
        currentBalance: parseFloat(formData.currentBalance),
        interestRate: parseFloat(formData.interestRate),
        minimumPayment: parseFloat(formData.minimumPayment),
        startDate: new Date(formData.startDate),
        notes: formData.notes || undefined,
      };

      if (debt) {
        await updateDebt(debt.id, debtData);
      } else {
        await addDebt(debtData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving debt:', error);
      setAlert({ isOpen: true, message: 'Failed to save debt. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{debt ? 'Edit Debt' : 'Add New Debt'}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="debt-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Debt Type *</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as DebtType })}
              required
            >
              <option value="credit_card">Credit Card</option>
              <option value="personal_loan">Personal Loan</option>
              <option value="car_loan">Car Loan</option>
              <option value="student_loan">Student Loan</option>
              <option value="mortgage">Mortgage</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="principalAmount">Principal Amount ($) *</label>
              <input
                type="number"
                id="principalAmount"
                step="0.01"
                min="0"
                value={formData.principalAmount}
                onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="currentBalance">Current Balance ($) *</label>
              <input
                type="number"
                id="currentBalance"
                step="0.01"
                min="0"
                value={formData.currentBalance}
                onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="interestRate">Interest Rate (APR %) *</label>
              <input
                type="number"
                id="interestRate"
                step="0.01"
                min="0"
                max="100"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="minimumPayment">Minimum Payment ($) *</label>
              <input
                type="number"
                id="minimumPayment"
                step="0.01"
                min="0"
                value={formData.minimumPayment}
                onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : debt ? 'Update' : 'Add'} Debt
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}

