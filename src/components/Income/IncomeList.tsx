import { useState } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import type { Income, IncomeCategory } from '../../types';
import IncomeForm from './IncomeForm';
import IncomeItem from './IncomeItem';
import IncomeCharts from './IncomeCharts';
import './IncomeList.css';

export default function IncomeList() {
  const { income, deleteIncome, isLoading } = useFinancial();
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [filterCategory, setFilterCategory] = useState<IncomeCategory | 'all'>('all');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (incomeItem: Income) => {
    setEditingIncome(incomeItem);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingIncome(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income entry?')) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteIncome(id);
    } catch (error) {
      console.error('Error deleting income:', error);
      alert('Failed to delete income. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredIncome = income.filter(incomeItem => {
    if (filterCategory !== 'all' && incomeItem.category !== filterCategory) {
      return false;
    }
    return true;
  });

  const sortedIncome = [...filteredIncome].sort((a, b) => {
    return b.date.getTime() - a.date.getTime(); // Most recent first
  });

  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const monthlyRecurring = income
    .filter(i => i.isRecurring && i.recurringFrequency === 'monthly')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="income-list-container">
      <div className="income-list-header">
        <div>
          <h2>Income</h2>
          <div className="income-summary">
            <p className="total-income">Total Income: ${totalIncome.toFixed(2)}</p>
            <p className="monthly-recurring">Monthly Recurring: ${monthlyRecurring.toFixed(2)}</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Income
        </button>
      </div>

      <div className="income-filters">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as IncomeCategory | 'all')}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          <option value="salary">Salary</option>
          <option value="bonus">Bonus</option>
          <option value="freelance">Freelance</option>
          <option value="investment_returns">Investment Returns</option>
          <option value="other">Other</option>
        </select>
      </div>

      {showForm && (
        <IncomeForm
          income={editingIncome}
          onClose={handleFormClose}
        />
      )}

      {income.length > 0 && <IncomeCharts income={income} />}

      {isLoading ? (
        <div className="empty-state">
          <p>Loading income...</p>
        </div>
      ) : (
        <div className="income-items">
          {sortedIncome.length === 0 ? (
            <div className="empty-state">
              <p>No income entries found. Add your first income to get started!</p>
            </div>
          ) : (
            sortedIncome.map(incomeItem => (
              <IncomeItem
                key={incomeItem.id}
                income={incomeItem}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deletingId === incomeItem.id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

