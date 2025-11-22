import { useState, useEffect } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import type { Income, IncomeCategory } from '../../types';
import Alert from '../Common/Alert';
import './IncomeForm.css';

interface IncomeFormProps {
  income?: Income | null;
  onClose: () => void;
}

export default function IncomeForm({ income, onClose }: IncomeFormProps) {
  const { addIncome, updateIncome } = useFinancial();
  const [formData, setFormData] = useState({
    name: '',
    category: 'salary' as IncomeCategory,
    amount: '',
    date: '',
    isRecurring: false,
    recurringFrequency: 'monthly' as 'monthly' | 'weekly' | 'biweekly' | 'semimonthly' | 'yearly',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  useEffect(() => {
    if (income) {
      console.log('income props', income);

      setFormData({
        name: income.name,
        category: income.category,
        amount: income.amount.toString(),
        date: income.date.toISOString().split('T')[0],
        isRecurring: income.isRecurring,
        recurringFrequency: income.recurringFrequency || 'monthly',
        notes: income.notes || '',
      });
    }
  }, [income]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create date from YYYY-MM-DD string in local time (not UTC)
      // This ensures the date matches exactly what the user entered
      const [year, month, day] = formData.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      const incomeData = {
        name: formData.name,
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: date,
        isRecurring: formData.isRecurring,
        recurringFrequency: formData.isRecurring ? formData.recurringFrequency : undefined,
        notes: formData.notes || undefined,
      };

      console.log('incomeData', incomeData);

      if (income) {
        await updateIncome(income.id, incomeData);
      } else {
        await addIncome(incomeData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving income:', error);
      setAlert({ isOpen: true, message: 'Failed to save income. Please try again.', type: 'error' });
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
          <h3>{income ? 'Edit Income' : 'Add New Income'}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="income-form">
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
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as IncomeCategory })}
              required
            >
              <option value="salary">Salary</option>
              <option value="bonus">Bonus</option>
              <option value="freelance">Freelance</option>
              <option value="investment_returns">Investment Returns</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount ($) *</label>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              />
              Recurring Income
            </label>
          </div>

          {formData.isRecurring && (
            <div className="form-group">
              <label htmlFor="frequency">Frequency</label>
              <select
                id="frequency"
                value={formData.recurringFrequency}
                onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value as 'monthly' | 'weekly' | 'biweekly' | 'semimonthly' | 'yearly' })}
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-Weekly (Every 2 Weeks)</option>
                <option value="semimonthly">Semi-Monthly (1st & 15th)</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

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
              {isSubmitting ? 'Saving...' : income ? 'Update' : 'Add'} Income
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}

