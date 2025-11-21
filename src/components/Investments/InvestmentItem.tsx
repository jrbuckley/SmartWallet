import type { Investment } from '../../types';
import { format } from 'date-fns';
import './InvestmentItem.css';

interface InvestmentItemProps {
  investment: Investment;
  onEdit: (investment: Investment) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Investment>) => Promise<void>;
  isDeleting?: boolean;
}

export default function InvestmentItem({ investment, onEdit, onDelete, onUpdate, isDeleting = false }: InvestmentItemProps) {
  const getTypeLabel = (type: Investment['type']) => {
    const labels = {
      stock: 'Stock',
      bond: 'Bond',
      mutual_fund: 'Mutual Fund',
      etf: 'ETF',
      crypto: 'Crypto',
      real_estate: 'Real Estate',
      other: 'Other',
    };
    return labels[type];
  };

  const totalValue = investment.quantity * investment.currentPrice;
  const totalCost = investment.quantity * investment.purchasePrice;
  const gainLoss = totalValue - totalCost;
  const gainLossPercentage = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

  const handlePriceUpdate = async (newPrice: number) => {
    try {
      await onUpdate(investment.id, { currentPrice: newPrice });
    } catch (error) {
      console.error('Error updating price:', error);
      // Note: Alert would need to be passed as prop or use a context/state management solution
      // For now, we'll keep the console error and let the parent handle alerts if needed
    }
  };

  return (
    <div className="investment-item">
      <div className="investment-item-main">
        <div className="investment-item-info">
          <div className="investment-item-header">
            <h4>
              {investment.name}
              {investment.symbol && <span className="symbol">({investment.symbol})</span>}
            </h4>
            <span className="type-badge">{getTypeLabel(investment.type)}</span>
          </div>
          <div className="investment-item-details">
            <div className="detail-row">
              <span>Quantity: {investment.quantity}</span>
              <span>Purchase Date: {format(investment.purchaseDate, 'MMM dd, yyyy')}</span>
            </div>
            <div className="detail-row">
              <span>Purchase Price: ${investment.purchasePrice.toFixed(2)}</span>
              <span>Current Price: ${investment.currentPrice.toFixed(2)}</span>
            </div>
            <div className="detail-row">
              <span className="total-value">Total Value: ${totalValue.toFixed(2)}</span>
              <span className={`gain-loss ${gainLoss >= 0 ? 'positive' : 'negative'}`}>
                {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)} ({gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
          {investment.notes && <p className="investment-notes">{investment.notes}</p>}
        </div>
        <div className="investment-item-actions">
          <div className="quick-update">
            <input
              type="number"
              step="0.01"
              placeholder="Update price"
              className="price-input"
              onBlur={async (e) => {
                const newPrice = parseFloat(e.target.value);
                if (!isNaN(newPrice) && newPrice > 0) {
                  await handlePriceUpdate(newPrice);
                  e.target.value = '';
                }
              }}
            />
          </div>
          <button className="btn-edit" onClick={() => onEdit(investment)}>
            Edit
          </button>
          <button className="btn-delete" onClick={() => onDelete(investment.id)} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

