import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinancial } from '../../contexts/FinancialContext';
import type { SavingsGoal, SavingsGoalRecommendation, SavingsOpportunity } from '../../types';
import SavingsGoalForm from './SavingsGoalForm';
import SavingsGoalItem from './SavingsGoalItem';
import ConfirmationModal from '../Common/ConfirmationModal';
import Alert from '../Common/Alert';
import './SavingsGoalsList.css';

export default function SavingsGoalsList() {
  const navigate = useNavigate();
  const { savingsGoals, deleteSavingsGoal, getSavingsGoalRecommendations, getFinancialSummary, isLoading } = useFinancial();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [showOpportunities, setShowOpportunities] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const recommendations = getSavingsGoalRecommendations();
  const summary = getFinancialSummary();
  const opportunities = summary.savingsOpportunities;

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleDelete = (id: string) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.id) return;
    setConfirmDelete({ isOpen: false, id: null });
    setDeletingId(confirmDelete.id);
    try {
      await deleteSavingsGoal(confirmDelete.id);
      setAlert({ isOpen: true, message: 'Savings goal deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting savings goal:', error);
      setAlert({ isOpen: true, message: 'Failed to delete savings goal. Please try again.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateFromRecommendation = (recommendation: SavingsGoalRecommendation) => {
    setEditingGoal({
      id: '',
      userId: '',
      name: recommendation.name,
      category: recommendation.category,
      targetAmount: recommendation.recommendedAmount,
      currentAmount: 0,
      priority: recommendation.priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setShowForm(true);
  };

  const handleTakeAction = (opportunity: SavingsOpportunity) => {
    switch (opportunity.type) {
      case 'expense_reduction':
        navigate('/expenses');
        break;
      case 'debt_consolidation':
        navigate('/debts');
        break;
      case 'investment_optimization':
        navigate('/investments');
        break;
      case 'budget_optimization':
        navigate('/budgets');
        break;
      default:
        break;
    }
  };

  const getPriorityColor = (priority: SavingsOpportunity['priority']) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981',
    };
    return colors[priority];
  };

  const getTypeIcon = (type: SavingsOpportunity['type']) => {
    const icons = {
      expense_reduction: '💰',
      investment_optimization: '📈',
      debt_consolidation: '💳',
      budget_optimization: '📊',
    };
    return icons[type];
  };

  const totalProgress = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="savings-goals-list-container">
      <div className="savings-goals-header">
        <div>
          <h2>Savings Goals</h2>
          <div className="savings-summary">
            <p className="total-saved">Total Saved: ${totalProgress.toFixed(2)}</p>
            <p className="total-target">Total Target: ${totalTarget.toFixed(2)}</p>
            <p className="overall-progress">
              Overall Progress: {totalTarget > 0 ? ((totalProgress / totalTarget) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Goal
        </button>
      </div>

      {showForm && (
        <SavingsGoalForm
          goal={editingGoal}
          onClose={handleFormClose}
        />
      )}

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        title="Delete Savings Goal"
        message="Are you sure you want to delete this savings goal?"
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

      {opportunities.length > 0 && showOpportunities && (
        <div className="opportunities-section">
          <div className="opportunities-header">
            <h3>Savings Opportunities</h3>
            <p className="section-subtitle">Actionable insights to help you save more</p>
            <button 
              className="btn-link" 
              onClick={() => setShowOpportunities(false)}
            >
              Hide
            </button>
          </div>
          <div className="opportunities-list">
            {opportunities.map(opportunity => (
              <div key={opportunity.id} className="opportunity-card">
                <div className="opportunity-header">
                  <span className="opportunity-icon">{getTypeIcon(opportunity.type)}</span>
                  <div className="opportunity-title-section">
                    <h4>{opportunity.title}</h4>
                    <span
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(opportunity.priority) }}
                    >
                      {opportunity.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                </div>
                <p className="opportunity-description">{opportunity.description}</p>
                {opportunity.potentialSavings > 0 && (
                  <div className="potential-savings">
                    <span className="savings-label">Potential Savings:</span>
                    <span className="savings-amount">${opportunity.potentialSavings.toFixed(2)}</span>
                  </div>
                )}
                {opportunity.actionable && (
                  <div className="opportunity-actions">
                    <button 
                      className="btn-primary btn-sm"
                      onClick={() => handleTakeAction(opportunity)}
                    >
                      Take Action
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && showRecommendations && (
        <div className="recommendations-section">
          <div className="recommendations-header">
            <h3>Recommended Goals</h3>
            <button 
              className="btn-link" 
              onClick={() => setShowRecommendations(false)}
            >
              Hide
            </button>
          </div>
          <div className="recommendations-list">
            {recommendations.map(rec => (
              <div key={rec.id} className="recommendation-card">
                <div className="recommendation-header">
                  <h4>{rec.name}</h4>
                  <span
                    className="priority-badge"
                    style={{ 
                      backgroundColor: rec.priority === 'high' ? '#ef4444' : 
                                      rec.priority === 'medium' ? '#f59e0b' : '#10b981' 
                    }}
                  >
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <p className="recommendation-description">{rec.description}</p>
                <div className="recommendation-details">
                  <div className="recommended-amount">
                    <span className="label">Recommended:</span>
                    <span className="amount">${rec.recommendedAmount.toFixed(2)}</span>
                  </div>
                  <p className="recommendation-reason">{rec.reason}</p>
                </div>
                <button 
                  className="btn-primary btn-sm"
                  onClick={() => handleCreateFromRecommendation(rec)}
                >
                  Create Goal
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="empty-state">
          <p>Loading savings goals...</p>
        </div>
      ) : (
        <div className="savings-goals-items">
          {savingsGoals.length === 0 ? (
            <div className="empty-state">
              <p>No savings goals yet. Create your first goal to start tracking your progress!</p>
              {recommendations.length > 0 && !showRecommendations && (
                <button 
                  className="btn-secondary"
                  onClick={() => setShowRecommendations(true)}
                >
                  View Recommendations
                </button>
              )}
            </div>
          ) : (
            savingsGoals.map(goal => (
              <SavingsGoalItem
                key={goal.id}
                goal={goal}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deletingId === goal.id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

