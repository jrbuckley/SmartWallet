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
  totalInvestments: number;
  totalInvestmentValue: number;
  monthlyRecurringExpenses: number;
  upcomingExpenses: Expense[];
  savingsOpportunities: SavingsOpportunity[];
}

