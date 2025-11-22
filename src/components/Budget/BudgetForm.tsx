import { useState, useEffect } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import type { Budget, BudgetCategory } from '../../types';
import Alert from '../Common/Alert';
import './BudgetForm.css';

interface BudgetFormProps {
  budget?: Budget | null;
  onClose: () => void;
}

export default function BudgetForm({ budget, onClose }: BudgetFormProps) {
  const { addBudget, updateBudget } = useFinancial();
  const [formData, setFormData] = useState({
    name: '',
    category: 'dining_out' as BudgetCategory,
    monthlyLimit: '',
    period: 'monthly' as 'monthly' | 'weekly',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name,
        category: budget.category,
        monthlyLimit: budget.monthlyLimit.toString(),
        period: budget.period,
        notes: budget.notes || '',
      });
    }
  }, [budget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const budgetData = {
        name: formData.name,
        category: formData.category,
        monthlyLimit: parseFloat(formData.monthlyLimit),
        period: formData.period,
        notes: formData.notes || undefined,
      };

      if (budget) {
        await updateBudget(budget.id, budgetData);
      } else {
        await addBudget(budgetData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving budget:', error);
      setAlert({ isOpen: true, message: 'Failed to save budget. Please try again.', type: 'error' });
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
            <h3>{budget ? 'Edit Budget' : 'Add New Budget'}</h3>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <form onSubmit={handleSubmit} className="budget-form">
            <div className="form-group">
              <label htmlFor="name">Budget Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Dining Out, Food Delivery, Shopping"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as BudgetCategory })}
                required
              >
                <option value="dining_out">Dining Out</option>
                <option value="food_delivery">Food Delivery</option>
                <option value="shopping">Shopping</option>
                <option value="entertainment">Entertainment</option>
                <option value="hobbies">Hobbies</option>
                <option value="subscriptions">Subscriptions</option>
                <option value="personal_care">Personal Care</option>
                <option value="travel">Travel</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="monthlyLimit">Budget Limit ($) *</label>
                <input
                  type="number"
                  id="monthlyLimit"
                  step="0.01"
                  min="0"
                  value={formData.monthlyLimit}
                  onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="period">Period *</label>
                <select
                  id="period"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as 'monthly' | 'weekly' })}
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Add any additional notes about this budget..."
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : budget ? 'Update' : 'Add'} Budget
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

