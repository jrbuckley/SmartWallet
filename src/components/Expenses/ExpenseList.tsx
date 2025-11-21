import { useState } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import type { Expense, ExpenseCategory } from '../../types';
import ExpenseForm from './ExpenseForm';
import ExpenseItem from './ExpenseItem';
import ExpenseCharts from './ExpenseCharts';
import ConfirmationModal from '../Common/ConfirmationModal';
import Alert from '../Common/Alert';
import './ExpenseList.css';

export default function ExpenseList() {
  const { expenses, deleteExpense, updateExpense, isLoading } = useFinancial();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleTogglePaid = async (expense: Expense) => {
    try {
      await updateExpense(expense.id, {
        isPaid: !expense.isPaid,
        paidDate: !expense.isPaid ? new Date() : undefined,
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      setAlert({ isOpen: true, message: 'Failed to update expense. Please try again.', type: 'error' });
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.id) return;
    setConfirmDelete({ isOpen: false, id: null });
    setDeletingId(confirmDelete.id);
    try {
      await deleteExpense(confirmDelete.id);
      setAlert({ isOpen: true, message: 'Expense deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting expense:', error);
      setAlert({ isOpen: true, message: 'Failed to delete expense. Please try again.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filterCategory !== 'all' && expense.category !== filterCategory) {
      return false;
    }
    if (filterPaid === 'paid' && !expense.isPaid) return false;
    if (filterPaid === 'unpaid' && expense.isPaid) return false;
    return true;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (a.isPaid !== b.isPaid) {
      return a.isPaid ? 1 : -1;
    }
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  const totalUnpaid = expenses
    .filter(e => !e.isPaid)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="expense-list-container">
      <div className="expense-list-header">
        <div>
          <h2>Expenses</h2>
          <p className="total-unpaid">Total Unpaid: ${totalUnpaid.toFixed(2)}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Expense
        </button>
      </div>

      <div className="expense-filters">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | 'all')}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          <option value="bill">Bills</option>
          <option value="loan">Loans</option>
          <option value="credit_card">Credit Cards</option>
          <option value="other">Other</option>
        </select>
        <select
          value={filterPaid}
          onChange={(e) => setFilterPaid(e.target.value as 'all' | 'paid' | 'unpaid')}
          className="filter-select"
        >
          <option value="all">All</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={handleFormClose}
        />
      )}

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
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

      {expenses.length > 0 && <ExpenseCharts expenses={expenses} />}

      {isLoading ? (
        <div className="empty-state">
          <p>Loading expenses...</p>
        </div>
      ) : (
        <div className="expense-items">
          {sortedExpenses.length === 0 ? (
            <div className="empty-state">
              <p>No expenses found. Add your first expense to get started!</p>
            </div>
          ) : (
            sortedExpenses.map(expense => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePaid={handleTogglePaid}
              isDeleting={deletingId === expense.id}
            />
            ))
          )}
        </div>
      )}
    </div>
  );
}

