import { useState } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import type { Budget } from '../../types';
import BudgetForm from './BudgetForm';
import BudgetItem from './BudgetItem';
import ConfirmationModal from '../Common/ConfirmationModal';
import Alert from '../Common/Alert';
import './BudgetList.css';

export default function BudgetList() {
  const { budgets, deleteBudget, getBudgetSpending, deleteBudgetEntry, isLoading } = useFinancial();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const budgetSpending = getBudgetSpending();

  const handleEdit = (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (budget) {
      setEditingBudget(budget);
      setShowForm(true);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  const handleDelete = (id: string) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.id) return;
    setConfirmDelete({ isOpen: false, id: null });
    setDeletingId(confirmDelete.id);
    try {
      await deleteBudget(confirmDelete.id);
      setAlert({ isOpen: true, message: 'Budget deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting budget:', error);
      setAlert({ isOpen: true, message: 'Failed to delete budget. Please try again.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteBudgetEntry(entryId);
      setAlert({ isOpen: true, message: 'Budget entry deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting budget entry:', error);
      setAlert({ isOpen: true, message: 'Failed to delete budget entry. Please try again.', type: 'error' });
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpending = budgetSpending.reduce((sum, bs) => sum + bs.currentSpending, 0);
  const overBudgetCount = budgetSpending.filter(bs => bs.isOverBudget).length;

  return (
    <div className="budget-list-container">
      <div className="budget-list-header">
        <div>
          <h2>Budgets</h2>
          <div className="budget-summary">
            <p className="total-budget">Total Budget: ${totalBudget.toFixed(2)}</p>
            <p className="total-spending">Total Spending: ${totalSpending.toFixed(2)}</p>
            <p className={`over-budget-count ${overBudgetCount > 0 ? 'has-over-budget' : ''}`}>
              {overBudgetCount > 0 
                ? `${overBudgetCount} ${overBudgetCount === 1 ? 'budget' : 'budgets'} over limit`
                : 'All budgets on track'
              }
            </p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Budget
        </button>
      </div>

      {showForm && (
        <BudgetForm
          budget={editingBudget}
          onClose={handleFormClose}
        />
      )}

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        title="Delete Budget"
        message="Are you sure you want to delete this budget?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />

      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      {isLoading ? (
        <div className="empty-state">
          <p>Loading budgets...</p>
        </div>
      ) : (
        <div className="budget-items">
          {budgets.length === 0 ? (
            <div className="empty-state">
              <p>No budgets yet. Create your first budget to start tracking your spending!</p>
              <p className="empty-state-hint">
                Budgets help you control non-essential expenses like dining out, shopping, and entertainment.
              </p>
            </div>
          ) : (
            budgetSpending.map(spending => (
              <BudgetItem
                key={spending.budgetId}
                spending={spending}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDeleteEntry={handleDeleteEntry}
                isDeleting={deletingId === spending.budgetId}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

