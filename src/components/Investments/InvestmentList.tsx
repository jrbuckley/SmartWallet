import { useState } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import type { Investment } from '../../types';
import InvestmentForm from './InvestmentForm';
import InvestmentItem from './InvestmentItem';
import InvestmentCharts from './InvestmentCharts';
import ConfirmationModal from '../Common/ConfirmationModal';
import Alert from '../Common/Alert';
import './InvestmentList.css';

export default function InvestmentList() {
  const { investments, deleteInvestment, updateInvestment, isLoading } = useFinancial();
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [filterType, setFilterType] = useState<Investment['type'] | 'all'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingInvestment(null);
  };

  const handleDelete = (id: string) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.id) return;
    setConfirmDelete({ isOpen: false, id: null });
    setDeletingId(confirmDelete.id);
    try {
      await deleteInvestment(confirmDelete.id);
      setAlert({ isOpen: true, message: 'Investment deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting investment:', error);
      setAlert({ isOpen: true, message: 'Failed to delete investment. Please try again.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredInvestments = investments.filter(investment => {
    if (filterType !== 'all' && investment.type !== filterType) {
      return false;
    }
    return true;
  });

  const totalValue = filteredInvestments.reduce(
    (sum, inv) => sum + inv.quantity * inv.currentPrice,
    0
  );
  const totalCost = filteredInvestments.reduce(
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

      <div className="investment-filters">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as Investment['type'] | 'all')}
          className="filter-select"
        >
          <option value="all">All Types</option>
          <option value="stock">Stock</option>
          <option value="bond">Bond</option>
          <option value="mutual_fund">Mutual Fund</option>
          <option value="etf">ETF</option>
          <option value="crypto">Crypto</option>
          <option value="real_estate">Real Estate</option>
          <option value="other">Other</option>
        </select>
      </div>

      {showForm && (
        <InvestmentForm
          investment={editingInvestment}
          onClose={handleFormClose}
        />
      )}

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        title="Delete Investment"
        message="Are you sure you want to delete this investment?"
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

      {investments.length > 0 && <InvestmentCharts investments={investments} />}

      {isLoading ? (
        <div className="empty-state">
          <p>Loading investments...</p>
        </div>
      ) : (
        <div className="investment-items">
          {filteredInvestments.length === 0 ? (
            <div className="empty-state">
              <p>No investments found{filterType !== 'all' ? ` in ${filterType} category` : ''}. Add your first investment to get started!</p>
            </div>
          ) : (
            filteredInvestments.map(investment => (
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

