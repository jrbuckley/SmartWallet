import { useState } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import type { Investment } from '../../types';
import InvestmentForm from './InvestmentForm';
import InvestmentItem from './InvestmentItem';
import './InvestmentList.css';

export default function InvestmentList() {
  const { investments, deleteInvestment, updateInvestment, isLoading } = useFinancial();
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingInvestment(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this investment?')) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteInvestment(id);
    } catch (error) {
      console.error('Error deleting investment:', error);
      alert('Failed to delete investment. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const totalValue = investments.reduce(
    (sum, inv) => sum + inv.quantity * inv.currentPrice,
    0
  );
  const totalCost = investments.reduce(
    (sum, inv) => sum + inv.quantity * inv.purchasePrice,
    0
  );
  const totalGainLoss = totalValue - totalCost;
  const gainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  return (
    <div className="investment-list-container">
      <div className="investment-list-header">
        <div>
          <h2>Investments</h2>
          <div className="investment-summary">
            <div className="summary-item">
              <span className="summary-label">Total Value:</span>
              <span className="summary-value">${totalValue.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Cost:</span>
              <span className="summary-value">${totalCost.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Gain/Loss:</span>
              <span
                className={`summary-value ${totalGainLoss >= 0 ? 'positive' : 'negative'}`}
              >
                ${totalGainLoss >= 0 ? '+' : ''}{totalGainLoss.toFixed(2)} ({gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Investment
        </button>
      </div>

      {showForm && (
        <InvestmentForm
          investment={editingInvestment}
          onClose={handleFormClose}
        />
      )}

      {isLoading ? (
        <div className="empty-state">
          <p>Loading investments...</p>
        </div>
      ) : (
        <div className="investment-items">
          {investments.length === 0 ? (
            <div className="empty-state">
              <p>No investments found. Add your first investment to get started!</p>
            </div>
          ) : (
            investments.map(investment => (
              <InvestmentItem
                key={investment.id}
                investment={investment}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdate={updateInvestment}
                isDeleting={deletingId === investment.id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

