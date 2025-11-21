import { useState } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import type { Debt, DebtType } from '../../types';
import DebtForm from './DebtForm';
import DebtItem from './DebtItem';
import PayoffStrategies from './PayoffStrategies';
import DebtPayoffPlan from './DebtPayoffPlan';
import DebtActionItems from './DebtActionItems';
import './DebtList.css';

export default function DebtList() {
  const { debts, deleteDebt, isLoading } = useFinancial();
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [filterType, setFilterType] = useState<DebtType | 'all'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDebt(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this debt?')) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteDebt(id);
    } catch (error) {
      console.error('Error deleting debt:', error);
      alert('Failed to delete debt. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDebts = debts.filter(debt => {
    if (filterType !== 'all' && debt.type !== filterType) {
      return false;
    }
    return true;
  });

  const sortedDebts = [...filteredDebts].sort((a, b) => {
    // Sort by interest rate (highest first) to show most expensive debt first
    return b.interestRate - a.interestRate;
  });

  const [extraPayment, setExtraPayment] = useState('0');

  const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);
  const totalMinimumPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const totalInterestRate = debts.length > 0
    ? debts.reduce((sum, d) => sum + (d.currentBalance * d.interestRate), 0) / totalDebt
    : 0;

  return (
    <div className="debt-list-container">
      <div className="debt-list-header">
        <div>
          <h2>Debts</h2>
          <div className="debt-summary">
            <p className="total-debt">Total Debt: ${totalDebt.toFixed(2)}</p>
            <p className="total-minimum">Total Minimum Payments: ${totalMinimumPayments.toFixed(2)}/month</p>
            <p className="avg-interest">Weighted Avg Interest: {totalInterestRate.toFixed(2)}%</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Debt
        </button>
      </div>

      <div className="debt-filters">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as DebtType | 'all')}
          className="filter-select"
        >
          <option value="all">All Types</option>
          <option value="credit_card">Credit Cards</option>
          <option value="personal_loan">Personal Loans</option>
          <option value="car_loan">Car Loans</option>
          <option value="student_loan">Student Loans</option>
          <option value="mortgage">Mortgage</option>
          <option value="other">Other</option>
        </select>
      </div>

      {showForm && (
        <DebtForm
          debt={editingDebt}
          onClose={handleFormClose}
        />
      )}

      {debts.length > 0 && (
        <>
          <DebtActionItems debts={debts} extraPayment={parseFloat(extraPayment) || 0} />
          <DebtPayoffPlan debts={debts} extraPayment={extraPayment} onExtraPaymentChange={setExtraPayment} />
          <PayoffStrategies debts={debts} extraPayment={extraPayment} onExtraPaymentChange={setExtraPayment} />
        </>
      )}

      {isLoading ? (
        <div className="empty-state">
          <p>Loading debts...</p>
        </div>
      ) : (
        <div className="debt-items">
          {sortedDebts.length === 0 ? (
            <div className="empty-state">
              <p>No debts found{filterType !== 'all' ? ` in ${filterType} category` : ''}. Add your first debt to get started!</p>
            </div>
          ) : (
            sortedDebts.map(debt => (
              <DebtItem
                key={debt.id}
                debt={debt}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deletingId === debt.id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

