import { useState, useEffect } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import type { SavingsGoal, SavingsGoalCategory } from '../../types';
import Alert from '../Common/Alert';
import './SavingsGoalForm.css';

interface SavingsGoalFormProps {
  goal?: SavingsGoal | null;
  onClose: () => void;
}

export default function SavingsGoalForm({ goal, onClose }: SavingsGoalFormProps) {
  const { addSavingsGoal, updateSavingsGoal } = useFinancial();
  const [formData, setFormData] = useState({
    name: '',
    category: 'emergency_fund' as SavingsGoalCategory,
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  useEffect(() => {
    if (goal && goal.id) {
      // Only populate form if this is an existing goal (has an id)
      setFormData({
        name: goal.name,
        category: goal.category,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        targetDate: goal.targetDate ? goal.targetDate.toISOString().split('T')[0] : '',
        priority: goal.priority,
        notes: goal.notes || '',
      });
    } else if (goal && !goal.id) {
      // If goal object exists but has no id, it's from a recommendation - prefill but don't treat as edit
      setFormData({
        name: goal.name,
        category: goal.category,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        targetDate: goal.targetDate ? goal.targetDate.toISOString().split('T')[0] : '',
        priority: goal.priority,
        notes: goal.notes || '',
      });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const goalData = {
        name: formData.name,
        category: formData.category,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
        targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
        priority: formData.priority,
        notes: formData.notes || undefined,
      };

      // Only update if goal exists and has a valid id (is an existing goal)
      if (goal && goal.id) {
        await updateSavingsGoal(goal.id, goalData);
      } else {
        // Create new goal (either no goal prop, or goal without id from recommendation)
        await addSavingsGoal(goalData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving savings goal:', error);
      setAlert({ isOpen: true, message: 'Failed to save savings goal. Please try again.', type: 'error' });
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
            <h3>{goal && goal.id ? 'Edit Savings Goal' : 'Add New Savings Goal'}</h3>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <form onSubmit={handleSubmit} className="savings-goal-form">
            <div className="form-group">
              <label htmlFor="name">Goal Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Emergency Fund, Vacation, Home Down Payment"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as SavingsGoalCategory })}
                required
              >
                <option value="emergency_fund">Emergency Fund</option>
                <option value="vacation">Vacation</option>
                <option value="home">Home</option>
                <option value="car">Car</option>
                <option value="education">Education</option>
                <option value="retirement">Retirement</option>
                <option value="debt_payoff">Debt Payoff</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="targetAmount">Target Amount ($) *</label>
                <input
                  type="number"
                  id="targetAmount"
                  step="0.01"
                  min="0"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="currentAmount">Current Amount ($) *</label>
                <input
                  type="number"
                  id="currentAmount"
                  step="0.01"
                  min="0"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="targetDate">Target Date (Optional)</label>
                <input
                  type="date"
                  id="targetDate"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
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
                placeholder="Add any additional notes about this goal..."
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (goal && goal.id) ? 'Update' : 'Add'} Goal
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

