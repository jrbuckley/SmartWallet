import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Expense, Investment, User, FinancialSummary } from '../types';

interface FinancialContextType {
  user: User | null;
  expenses: Expense[];
  investments: Investment[];
  addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addInvestment: (investment: Omit<Investment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateInvestment: (id: string, updates: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  getFinancialSummary: () => FinancialSummary;
  setDataFromFile: (data: { user: User | null; expenses: Expense[]; investments: Investment[] }) => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

const STORAGE_KEY = 'smartwallet_data';

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.user) {
          setUser(parsed.user);
        }
        if (parsed.expenses) {
          setExpenses(parsed.expenses.map((e: any) => ({
            ...e,
            dueDate: new Date(e.dueDate),
            paidDate: e.paidDate ? new Date(e.paidDate) : undefined,
            createdAt: new Date(e.createdAt),
            updatedAt: new Date(e.updatedAt),
          })));
        }
        if (parsed.investments) {
          setInvestments(parsed.investments.map((i: any) => ({
            ...i,
            purchaseDate: new Date(i.purchaseDate),
            createdAt: new Date(i.createdAt),
            updatedAt: new Date(i.updatedAt),
          })));
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    } else {
      // Initialize with default user
      const defaultUser: User = {
        id: 'user-1',
        name: 'My Account',
      };
      setUser(defaultUser);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      const dataToSave = {
        user,
        expenses,
        investments,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [user, expenses, investments]);

  const addExpense = (expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    const newExpense: Expense = {
      ...expenseData,
      id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(expense =>
        expense.id === id
          ? { ...expense, ...updates, updatedAt: new Date() }
          : expense
      )
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const addInvestment = (investmentData: Omit<Investment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    const newInvestment: Investment = {
      ...investmentData,
      id: `investment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setInvestments(prev => [...prev, newInvestment]);
  };

  const updateInvestment = (id: string, updates: Partial<Investment>) => {
    setInvestments(prev =>
      prev.map(investment =>
        investment.id === id
          ? { ...investment, ...updates, updatedAt: new Date() }
          : investment
      )
    );
  };

  const deleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(investment => investment.id !== id));
  };

  const setDataFromFile = (data: { user: User | null; expenses: Expense[]; investments: Investment[] }) => {
    if (data.user) {
      setUser(data.user);
    }
    if (data.expenses) {
      setExpenses(data.expenses.map((e: any) => ({
        ...e,
        dueDate: new Date(e.dueDate),
        paidDate: e.paidDate ? new Date(e.paidDate) : undefined,
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt),
      })));
    }
    if (data.investments) {
      setInvestments(data.investments.map((i: any) => ({
        ...i,
        purchaseDate: new Date(i.purchaseDate),
        createdAt: new Date(i.createdAt),
        updatedAt: new Date(i.updatedAt),
      })));
    }
  };

  const getFinancialSummary = (): FinancialSummary => {
    const now = new Date();

    // Calculate total expenses (unpaid)
    const unpaidExpenses = expenses.filter(e => !e.isPaid);
    const totalExpenses = unpaidExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Calculate monthly recurring expenses
    const monthlyRecurring = expenses
      .filter(e => e.isRecurring && e.recurringFrequency === 'monthly' && !e.isPaid)
      .reduce((sum, e) => sum + e.amount, 0);

    // Get upcoming expenses (next 30 days)
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const upcomingExpenses = expenses
      .filter(e => !e.isPaid && e.dueDate >= now && e.dueDate <= thirtyDaysFromNow)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    // Calculate investment totals
    const totalInvestments = investments.length;
    const totalInvestmentValue = investments.reduce(
      (sum, inv) => sum + inv.quantity * inv.currentPrice,
      0
    );

    // Generate savings opportunities (simplified for now)
    const savingsOpportunities = generateSavingsOpportunities(expenses, investments);

    return {
      totalExpenses,
      totalInvestments,
      totalInvestmentValue,
      monthlyRecurringExpenses: monthlyRecurring,
      upcomingExpenses,
      savingsOpportunities,
    };
  };

  return (
    <FinancialContext.Provider
      value={{
        user,
        expenses,
        investments,
        addExpense,
        updateExpense,
        deleteExpense,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        getFinancialSummary,
        setDataFromFile,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
}

// Helper function to generate savings opportunities
function generateSavingsOpportunities(
  expenses: Expense[],
  investments: Investment[]
): import('../types').SavingsOpportunity[] {
  const opportunities: import('../types').SavingsOpportunity[] = [];

  // Check for high recurring expenses
  const highRecurringExpenses = expenses
    .filter(e => e.isRecurring && e.amount > 100)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  highRecurringExpenses.forEach(expense => {
    opportunities.push({
      id: `opp-${expense.id}`,
      type: 'expense_reduction',
      title: `Review ${expense.name}`,
      description: `This recurring expense costs $${expense.amount.toFixed(2)} per ${expense.recurringFrequency}. Consider shopping around for better rates.`,
      potentialSavings: expense.amount * 0.1, // Assume 10% potential savings
      priority: expense.amount > 200 ? 'high' : 'medium',
      actionable: true,
    });
  });

  // Check for unpaid credit card debt
  const creditCardDebt = expenses
    .filter(e => e.category === 'credit_card' && !e.isPaid)
    .reduce((sum, e) => sum + e.amount, 0);

  if (creditCardDebt > 0) {
    opportunities.push({
      id: 'opp-cc-debt',
      type: 'debt_consolidation',
      title: 'Credit Card Debt',
      description: `You have $${creditCardDebt.toFixed(2)} in unpaid credit card debt. Consider consolidating or paying off high-interest debt first.`,
      potentialSavings: creditCardDebt * 0.15, // Assume 15% interest savings
      priority: 'high',
      actionable: true,
    });
  }

  // Check for investment diversification
  if (investments.length > 0) {
    const totalValue = investments.reduce((sum, inv) => sum + inv.quantity * inv.currentPrice, 0);
    const singleTypePercentage = Math.max(
      ...Object.values(
        investments.reduce((acc, inv) => {
          acc[inv.type] = (acc[inv.type] || 0) + inv.quantity * inv.currentPrice;
          return acc;
        }, {} as Record<string, number>)
      )
    ) / totalValue;

    if (singleTypePercentage > 0.7) {
      opportunities.push({
        id: 'opp-diversification',
        type: 'investment_optimization',
        title: 'Portfolio Diversification',
        description: 'Your portfolio may be too concentrated in one asset type. Consider diversifying to reduce risk.',
        potentialSavings: 0, // Not a direct savings, but risk reduction
        priority: 'medium',
        actionable: true,
      });
    }
  }

  return opportunities;
}

