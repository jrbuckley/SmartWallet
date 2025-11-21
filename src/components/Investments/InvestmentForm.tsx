import { useState, useEffect } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import type { Investment } from '../../types';
import Alert from '../Common/Alert';
import './InvestmentForm.css';

interface InvestmentFormProps {
  investment?: Investment | null;
  onClose: () => void;
}

export default function InvestmentForm({ investment, onClose }: InvestmentFormProps) {
  const { addInvestment, updateInvestment } = useFinancial();
  const [formData, setFormData] = useState({
    name: '',
    type: 'stock' as Investment['type'],
    symbol: '',
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    purchaseDate: '',
    notes: '',
  });

  useEffect(() => {
    if (investment) {
      setFormData({
        name: investment.name,
        type: investment.type,
        symbol: investment.symbol || '',
        quantity: investment.quantity.toString(),
        purchasePrice: investment.purchasePrice.toString(),
        currentPrice: investment.currentPrice.toString(),
        purchaseDate: investment.purchaseDate.toISOString().split('T')[0],
        notes: investment.notes || '',
      });
    }
  }, [investment]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const investmentData = {
        name: formData.name,
        type: formData.type,
        symbol: formData.symbol || undefined,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        currentPrice: parseFloat(formData.currentPrice),
        purchaseDate: new Date(formData.purchaseDate),
        notes: formData.notes || undefined,
      };

      if (investment) {
        await updateInvestment(investment.id, investmentData);
      } else {
        await addInvestment(investmentData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving investment:', error);
      setAlert({ isOpen: true, message: 'Failed to save investment. Please try again.', type: 'error' });
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
          <h3>{investment ? 'Edit Investment' : 'Add New Investment'}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="investment-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Investment['type'] })}
              required
            >
              <option value="stock">Stock</option>
              <option value="bond">Bond</option>
              <option value="mutual_fund">Mutual Fund</option>
              <option value="etf">ETF</option>
              <option value="crypto">Cryptocurrency</option>
              <option value="real_estate">Real Estate</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="symbol">Symbol/Ticker (optional)</label>
            <input
              type="text"
              id="symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              placeholder="e.g., AAPL, BTC"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                step="0.0001"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="purchasePrice">Purchase Price ($) *</label>
              <input
                type="number"
                id="purchasePrice"
                step="0.01"
                min="0"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="currentPrice">Current Price ($) *</label>
              <input
                type="number"
                id="currentPrice"
                step="0.01"
                min="0"
                value={formData.currentPrice}
                onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="purchaseDate">Purchase Date *</label>
              <input
                type="date"
                id="purchaseDate"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : investment ? 'Update' : 'Add'} Investment
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}

