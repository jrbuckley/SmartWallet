import { useState } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import type { Expense, ExpenseCategory } from '../../types';
import ExpenseForm from './ExpenseForm';
import ExpenseItem from './ExpenseItem';
import './ExpenseList.css';

export default function ExpenseList() {
  const { expenses, deleteExpense, updateExpense, isLoading } = useFinancial();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');

  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      alert('Failed to update expense. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteExpense(id);
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
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

