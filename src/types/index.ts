// User type - designed to support multi-user in the future
export interface User {
  id: string;
  name: string;
  email?: string;
}

// Expense types
export type ExpenseCategory = 'bill' | 'loan' | 'credit_card' | 'other';

export interface Expense {
  id: string;
  userId: string; // For future multi-user support
  category: ExpenseCategory;
  name: string;
  amount: number;
  dueDate: Date;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'weekly' | 'yearly';
  isPaid: boolean;
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Income types
export type IncomeCategory = 'salary' | 'bonus' | 'freelance' | 'investment_returns' | 'other';

export interface Income {
  id: string;
  userId: string; // For future multi-user support
  category: IncomeCategory;
  name: string;
  amount: number;
  date: Date;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'weekly' | 'yearly';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Debt types
export type DebtType = 'personal_loan' | 'car_loan' | 'student_loan' | 'credit_card' | 'mortgage' | 'other';

export interface Debt {
  id: string;
  userId: string; // For future multi-user support
  type: DebtType;
  name: string;
  principalAmount: number; // Original loan amount
  currentBalance: number; // Current remaining balance
  interestRate: number; // Annual interest rate (APR) as percentage
  minimumPayment: number; // Minimum monthly payment
  startDate: Date; // Loan start/origination date
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payoff strategy types
export interface PayoffStrategy {
  name: string;
  description: string;
  order: string[]; // Debt IDs in recommended payoff order
  totalInterest: number;
  totalPayments: number;
  monthsToPayoff: number;
  monthlyPayment: number;
}

// Investment types
export interface Investment {
  id: string;
  userId: string; // For future multi-user support
  name: string;
  type: 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'crypto' | 'real_estate' | 'other';
  symbol?: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Savings opportunity types
export interface SavingsOpportunity {
  id: string;
  type: 'expense_reduction' | 'investment_optimization' | 'debt_consolidation' | 'budget_optimization';
  title: string;
  description: string;
  potentialSavings: number;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

// Financial summary
export interface FinancialSummary {
  totalExpenses: number;
  totalIncome: number;
  monthlyRecurringIncome: number;
  monthlyRecurringExpenses: number;
  netCashFlow: number;
  totalDebt: number;
  totalMinimumPayments: number;
  totalInvestments: number;
  totalInvestmentValue: number;
  upcomingExpenses: Expense[];
  recentIncome: Income[];
  savingsOpportunities: SavingsOpportunity[];
}

