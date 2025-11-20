# SmartWallet - Financial Planner

A modern, comprehensive financial planning web application built with React and TypeScript. Track your expenses, monitor investments, and discover savings opportunities all in one place.

## Features

### 💰 Expense Tracking
- **Bills**: Track recurring and one-time bills
- **Loans**: Monitor loan payments and due dates
- **Credit Cards**: Keep track of credit card payments
- **Other Expenses**: Categorize and track any other expenses
- **Recurring Expenses**: Set up monthly, weekly, or yearly recurring expenses
- **Payment Status**: Mark expenses as paid/unpaid with automatic tracking
- **Filtering**: Filter expenses by category and payment status

### 📈 Investment Management
- **Multiple Asset Types**: Stocks, bonds, mutual funds, ETFs, cryptocurrency, real estate, and more
- **Portfolio Tracking**: View total investment value and performance
- **Gain/Loss Calculation**: Automatic calculation of gains and losses
- **Quick Price Updates**: Easily update current prices for your investments
- **Investment History**: Track purchase dates and prices

### 💡 Savings Opportunities
- **AI-Powered Insights**: Automatically identifies potential savings opportunities
- **Expense Reduction**: Highlights high recurring expenses that could be optimized
- **Debt Consolidation**: Suggests opportunities to reduce credit card debt
- **Investment Optimization**: Recommends portfolio diversification
- **Priority-Based Recommendations**: High, medium, and low priority suggestions

### 📊 Dashboard
- **Financial Overview**: Quick view of your financial health
- **Upcoming Expenses**: See what's due in the next 30 days
- **Summary Cards**: Total expenses, investments, and recurring costs at a glance

## Technology Stack

- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **date-fns** - Date manipulation and formatting
- **CSS3** - Modern styling with CSS variables

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd SmartWallet
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── Common/          # Shared components (Navigation)
│   ├── Dashboard/        # Dashboard components
│   ├── Expenses/         # Expense tracking components
│   ├── Investments/     # Investment management components
│   └── Savings/         # Savings opportunities components
├── contexts/            # React Context providers
│   └── FinancialContext.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── App.tsx             # Main app component with routing
└── main.tsx            # Application entry point
```

## Data Storage

Currently, the application uses **localStorage** to persist data locally in your browser. This means:
- Your data is stored on your device
- Data persists between sessions
- No backend or database required
- Perfect for single-user use

### Future Multi-User Support

The application is architected to support multi-user functionality in the future:
- All data models include `userId` fields
- Context structure can easily be extended to support user authentication
- Data layer can be swapped from localStorage to a backend API without major refactoring

## Usage Guide

### Adding Expenses

1. Navigate to the **Expenses** page
2. Click **"+ Add Expense"**
3. Fill in the expense details:
   - Name (e.g., "Electric Bill")
   - Category (Bill, Loan, Credit Card, Other)
   - Amount
   - Due Date
   - Recurring status (optional)
   - Notes (optional)
4. Click **"Add Expense"**

### Managing Investments

1. Navigate to the **Investments** page
2. Click **"+ Add Investment"**
3. Enter investment details:
   - Name and symbol (if applicable)
   - Type of investment
   - Quantity and purchase price
   - Current price
   - Purchase date
4. Update prices quickly using the price input field on each investment card

### Viewing Savings Opportunities

1. Navigate to the **Savings** page
2. Review the automatically generated savings opportunities
3. Opportunities are prioritized by potential impact
4. Each opportunity includes:
   - Description of the opportunity
   - Potential savings amount
   - Priority level
   - Actionable recommendations

## Features in Detail

### Expense Categories

- **Bills**: Regular utility bills, subscriptions, etc.
- **Loans**: Mortgage, car loans, personal loans
- **Credit Cards**: Credit card payments and balances
- **Other**: Any other expenses that don't fit the above categories

### Investment Types

- **Stock**: Individual company stocks
- **Bond**: Government or corporate bonds
- **Mutual Fund**: Professionally managed funds
- **ETF**: Exchange-traded funds
- **Crypto**: Cryptocurrencies
- **Real Estate**: Property investments
- **Other**: Other investment types

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project uses:
- TypeScript strict mode
- ESLint for code quality
- Modern React patterns (hooks, functional components)
- CSS variables for theming

## Future Enhancements

Potential features for future versions:
- User authentication and multi-user support
- Backend API integration
- Data export/import (CSV, PDF)
- Advanced analytics and charts
- Budget planning and goal setting
- Bill reminders and notifications
- Integration with financial institutions
- Mobile app version

## License

This project is for personal use. Feel free to modify and extend it for your needs.

## Support

For issues or questions, please check the code comments or refer to the component documentation.

---

Built with ❤️ using React and TypeScript
