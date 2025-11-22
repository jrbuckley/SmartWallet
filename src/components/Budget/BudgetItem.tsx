import { useState } from 'react';
import type { BudgetSpending, BudgetEntry } from '../../types';
import { format } from 'date-fns';
import BudgetEntryForm from './BudgetEntryForm';
import './BudgetItem.css';

interface BudgetItemProps {
  spending: BudgetSpending;
  onEdit: (budgetId: string) => void;
  onDelete: (budgetId: string) => void;
  onEditEntry?: (budgetId: string, entryId: string) => void;
  onDeleteEntry?: (entryId: string) => void;
  isDeleting?: boolean;
}

export default function BudgetItem({ spending, onEdit, onDelete, onEditEntry, onDeleteEntry, isDeleting = false }: BudgetItemProps) {
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BudgetEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const getCategoryLabel = (category: BudgetSpending['category']) => {
    const labels = {
      dining_out: 'Dining Out',
      food_delivery: 'Food Delivery',
      shopping: 'Shopping',
      entertainment: 'Entertainment',
      hobbies: 'Hobbies',
      subscriptions: 'Subscriptions',
      personal_care: 'Personal Care',
      travel: 'Travel',
      other: 'Other',
    };
    return labels[category];
  };

  const getCategoryIcon = (category: BudgetSpending['category']) => {
    const icons = {
      dining_out: '🍽️',
      food_delivery: '🍕',
      shopping: '🛍️',
      entertainment: '🎬',
      hobbies: '🎨',
      subscriptions: '📺',
      personal_care: '💅',
      travel: '✈️',
      other: '📌',
    };
    return icons[category];
  };

  const progressColor = spending.isOverBudget 
    ? '#ef4444' 
    : spending.percentageUsed > 80 
    ? '#f59e0b' 
    : '#10b981';

  const handleAddEntry = () => {
    setEditingEntry(null);
    setShowEntryForm(true);
  };

  const handleEditEntry = (entry: BudgetEntry) => {
    setEditingEntry(entry);
    setShowEntryForm(true);
  };

  const handleEntryFormClose = () => {
    setShowEntryForm(false);
    setEditingEntry(null);
  };

  const totalEntries = (spending.linkedExpenses?.length || 0) + (spending.manualEntries?.length || 0);

  return (
    <div className={`budget-item ${spending.isOverBudget ? 'over-budget' : ''}`}>
      <div className="budget-item-main">
        <div className="budget-item-info">
          <div className="budget-item-header">
            <div className="budget-title-section">
              <span className="budget-icon">{getCategoryIcon(spending.category)}</span>
              <h4>{spending.budgetName}</h4>
            </div>
            <span className="category-badge">
              {getCategoryLabel(spending.category)}
            </span>
          </div>
          
          <div className="budget-progress-section">
            <div className="budget-amounts">
              <div className="amount-display">
                <span className="current-spending">${spending.currentSpending.toFixed(2)}</span>
                <span className="budget-limit">of ${spending.monthlyLimit.toFixed(2)}</span>
              </div>
              <div className="progress-percentage" style={{ color: progressColor }}>
                {spending.percentageUsed.toFixed(1)}%
              </div>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${Math.min(100, spending.percentageUsed)}%`,
                  backgroundColor: progressColor
                }}
              />
            </div>
            <div className="budget-details">
              <span className={`remaining-amount ${spending.isOverBudget ? 'over-budget-text' : ''}`}>
                {spending.isOverBudget 
                  ? `$${Math.abs(spending.remaining).toFixed(2)} over budget`
                  : `$${spending.remaining.toFixed(2)} remaining`
                }
              </span>
              {totalEntries > 0 && (
                <button 
                  className="btn-link-details"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide' : 'Show'} Details ({totalEntries})
                </button>
              )}
            </div>
          </div>

          {showDetails && (
            <div className="budget-details-section">
              {spending.linkedExpenses && spending.linkedExpenses.length > 0 && (
                <div className="budget-expenses-list">
                  <h5>Linked Expenses:</h5>
                  <ul>
                    {spending.linkedExpenses.map(expense => (
                      <li key={expense.id}>
                        <span className="expense-name">{expense.name}</span>
                        <span className="expense-amount">${expense.amount.toFixed(2)}</span>
                        <span className="expense-date">{format(expense.dueDate, 'MMM dd, yyyy')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {spending.manualEntries && spending.manualEntries.length > 0 && (
                <div className="budget-entries-list">
                  <h5>Manual Entries:</h5>
                  <ul>
                    {spending.manualEntries.map(entry => (
                      <li key={entry.id}>
                        <span className="entry-description">{entry.description}</span>
                        <span className="entry-amount">${entry.amount.toFixed(2)}</span>
                        <span className="entry-date">{format(entry.date, 'MMM dd, yyyy')}</span>
                        {onEditEntry && (
                          <button 
                            className="btn-edit-entry"
                            onClick={() => handleEditEntry(entry)}
                            title="Edit entry"
                          >
                            ✏️
                          </button>
                        )}
                        {onDeleteEntry && (
                          <button 
                            className="btn-delete-entry"
                            onClick={() => onDeleteEntry(entry.id)}
                            title="Delete entry"
                          >
                            🗑️
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {totalEntries === 0 && (
                <p className="no-entries-message">
                  No spending tracked yet. Link expenses or add manual entries to track spending.
                </p>
              )}
            </div>
          )}
        </div>
        <div className="budget-item-actions">
          <button className="btn-add-entry" onClick={handleAddEntry} title="Add manual spending entry">
            + Add Entry
          </button>
          <button className="btn-edit" onClick={() => onEdit(spending.budgetId)}>
            Edit
          </button>
          <button className="btn-delete" onClick={() => onDelete(spending.budgetId)} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {showEntryForm && (
        <BudgetEntryForm
          budgetId={spending.budgetId}
          budgetName={spending.budgetName}
          entry={editingEntry}
          onClose={handleEntryFormClose}
        />
      )}
    </div>
  );
}

