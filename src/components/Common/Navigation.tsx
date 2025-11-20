import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>💰 SmartWallet</h1>
      </div>
      <div className="nav-links">
        <Link
          to="/"
          className={`nav-link ${isActive('/') ? 'active' : ''}`}
        >
          Dashboard
        </Link>
        <Link
          to="/expenses"
          className={`nav-link ${isActive('/expenses') ? 'active' : ''}`}
        >
          Expenses
        </Link>
        <Link
          to="/income"
          className={`nav-link ${isActive('/income') ? 'active' : ''}`}
        >
          Income
        </Link>
        <Link
          to="/debts"
          className={`nav-link ${isActive('/debts') ? 'active' : ''}`}
        >
          Debts
        </Link>
        <Link
          to="/investments"
          className={`nav-link ${isActive('/investments') ? 'active' : ''}`}
        >
          Investments
        </Link>
        <Link
          to="/savings"
          className={`nav-link ${isActive('/savings') ? 'active' : ''}`}
        >
          Savings
        </Link>
        <Link
          to="/settings"
          className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
        >
          Settings
        </Link>
      </div>
    </nav>
  );
}

