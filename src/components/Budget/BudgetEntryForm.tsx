import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFinancial } from '../../contexts/FinancialContext';
import type { BudgetEntry } from '../../types';
import Alert from '../Common/Alert';
import './BudgetEntryForm.css';

interface BudgetEntryFormProps {
  budgetId: string;
  budgetName: string;
  entry?: BudgetEntry | null;
  onClose: () => void;
}

export default function BudgetEntryForm({ budgetId, budgetName, entry, onClose }: BudgetEntryFormProps) {
  const { addBudgetEntry, updateBudgetEntry } = useFinancial();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        amount: entry.amount.toString(),
        description: entry.description,
        date: entry.date.toISOString().split('T')[0],
        notes: entry.notes || '',
      });
    }
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const entryData = {
        budgetId: budgetId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: new Date(formData.date),
        notes: formData.notes || undefined,
      };

      if (entry && entry.id) {
        await updateBudgetEntry(entry.id, entryData);
      } else {
        await addBudgetEntry(entryData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving budget entry:', error);
      setAlert({ isOpen: true, message: 'Failed to save budget entry. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
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
            <h3>
              {entry && entry.id ? 'Edit Budget Entry' : `Add Spending to ${budgetName}`}
            </h3>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <form onSubmit={handleSubmit} className="budget-entry-form">
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
              <label htmlFor="description">Description *</label>
              <input
                type="text"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="e.g., Dinner at restaurant, Online purchase"
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

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Add any additional notes..."
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : entry && entry.id ? 'Update' : 'Add'} Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  // Use portal to render modal outside the component tree, directly to document.body
  return createPortal(modalContent, document.body);
}

