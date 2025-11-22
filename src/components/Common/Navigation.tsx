import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Navigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    transactions: true,
    planning: true,
    assets: true,
  });

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('navCollapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('navCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Add class to body for CSS targeting
  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add('nav-collapsed');
    } else {
      document.body.classList.remove('nav-collapsed');
    }
    return () => {
      document.body.classList.remove('nav-collapsed');
    };
  }, [isCollapsed]);

  const isActive = (path: string) => location.pathname === path;

  const navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { path: '/', label: 'Dashboard', icon: '📊' },
      ],
    },
    {
      title: 'Transactions',
      items: [
        { path: '/expenses', label: 'Expenses', icon: '💸' },
        { path: '/income', label: 'Income', icon: '💰' },
      ],
    },
    {
      title: 'Planning',
      items: [
        { path: '/budgets', label: 'Budgets', icon: '📋' },
        { path: '/savings-goals', label: 'Savings Goals', icon: '🎯' },
      ],
    },
    {
      title: 'Assets & Liabilities',
      items: [
        { path: '/investments', label: 'Investments', icon: '📈' },
        { path: '/debts', label: 'Debts', icon: '💳' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { path: '/settings', label: 'Settings', icon: '⚙️' },
      ],
    },
  ];

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    // Auto-expand sections when expanding sidebar
    if (isCollapsed) {
      setExpandedSections({
        transactions: true,
        planning: true,
        assets: true,
      });
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar navigation */}
      <nav className={`navigation ${isMobileMenuOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="nav-brand">
          {!isCollapsed && <h1>💰 SmartWallet</h1>}
          {isCollapsed && <h1 className="collapsed-brand">💰</h1>}
          <button 
            className="collapse-button"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '▶' : '◀'}
          </button>
        </div>
        
        <div className="nav-sections">
          {navSections.map((section) => (
            <div key={section.title} className="nav-section">
              {section.items.length > 1 ? (
                <>
                  {!isCollapsed && (
                    <button
                      className="nav-section-header"
                      onClick={() => toggleSection(section.title)}
                    >
                      <span className="section-title">{section.title}</span>
                      <span className={`section-arrow ${expandedSections[section.title] ? 'expanded' : ''}`}>
                        ▼
                      </span>
                    </button>
                  )}
                  {(!isCollapsed && expandedSections[section.title]) || isCollapsed ? (
                    <div className="nav-section-items">
                      {section.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                          onClick={closeMobileMenu}
                          title={isCollapsed ? item.label : ''}
                        >
                          <span className="nav-icon">{item.icon}</span>
                          {!isCollapsed && <span className="nav-label">{item.label}</span>}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <Link
                  to={section.items[0].path}
                  className={`nav-link ${isActive(section.items[0].path) ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                  title={isCollapsed ? section.items[0].label : ''}
                >
                  <span className="nav-icon">{section.items[0].icon}</span>
                  {!isCollapsed && <span className="nav-label">{section.items[0].label}</span>}
                </Link>
              )}
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}

