import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Debt, Expense, Income, Investment, User, FinancialSummary } from '../types';
import { supabase } from '../lib/supabase';

interface FinancialContextType {
  user: User | null;
  expenses: Expense[];
  income: Income[];
  debts: Debt[];
  investments: Investment[];
  isLoading: boolean;
  addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addIncome: (income: Omit<Income, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIncome: (id: string, updates: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addDebt: (debt: Omit<Debt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDebt: (id: string, updates: Partial<Debt>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  addInvestment: (investment: Omit<Investment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInvestment: (id: string, updates: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  getFinancialSummary: () => FinancialSummary;
  setDataFromFile: (data: { user: User | null; expenses: Expense[]; income: Income[]; debts: Debt[]; investments: Investment[] }) => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

// Default user ID for single-user mode
// In the future, this can be replaced with authenticated user ID
const DEFAULT_USER_ID = 'user-1';

// Helper functions to convert between app types and database types
function expenseToDb(expense: Expense) {
  return {
    id: expense.id,
    user_id: expense.userId,
    category: expense.category,
    name: expense.name,
    amount: expense.amount,
    due_date: expense.dueDate.toISOString(),
    is_recurring: expense.isRecurring,
    recurring_frequency: expense.recurringFrequency || null,
    is_paid: expense.isPaid,
    paid_date: expense.paidDate?.toISOString() || null,
    notes: expense.notes || null,
    created_at: expense.createdAt.toISOString(),
    updated_at: expense.updatedAt.toISOString(),
  };
}

function expenseFromDb(dbExpense: any): Expense {
  return {
    id: dbExpense.id,
    userId: dbExpense.user_id,
    category: dbExpense.category,
    name: dbExpense.name,
    amount: dbExpense.amount,
    dueDate: new Date(dbExpense.due_date),
    isRecurring: dbExpense.is_recurring,
    recurringFrequency: dbExpense.recurring_frequency || undefined,
    isPaid: dbExpense.is_paid,
    paidDate: dbExpense.paid_date ? new Date(dbExpense.paid_date) : undefined,
    notes: dbExpense.notes || undefined,
    createdAt: new Date(dbExpense.created_at),
    updatedAt: new Date(dbExpense.updated_at),
  };
}

function incomeToDb(income: Income) {
  return {
    id: income.id,
    user_id: income.userId,
    category: income.category,
    name: income.name,
    amount: income.amount,
    date: income.date.toISOString(),
    is_recurring: income.isRecurring,
    recurring_frequency: income.recurringFrequency || null,
    notes: income.notes || null,
    created_at: income.createdAt.toISOString(),
    updated_at: income.updatedAt.toISOString(),
  };
}

function incomeFromDb(dbIncome: any): Income {
  return {
    id: dbIncome.id,
    userId: dbIncome.user_id,
    category: dbIncome.category,
    name: dbIncome.name,
    amount: dbIncome.amount,
    date: new Date(dbIncome.date),
    isRecurring: dbIncome.is_recurring,
    recurringFrequency: dbIncome.recurring_frequency || undefined,
    notes: dbIncome.notes || undefined,
    createdAt: new Date(dbIncome.created_at),
    updatedAt: new Date(dbIncome.updated_at),
  };
}

function debtToDb(debt: Debt) {
  return {
    id: debt.id,
    user_id: debt.userId,
    type: debt.type,
    name: debt.name,
    principal_amount: debt.principalAmount,
    current_balance: debt.currentBalance,
    interest_rate: debt.interestRate,
    minimum_payment: debt.minimumPayment,
    start_date: debt.startDate.toISOString(),
    notes: debt.notes || null,
    created_at: debt.createdAt.toISOString(),
    updated_at: debt.updatedAt.toISOString(),
  };
}

function debtFromDb(dbDebt: any): Debt {
  return {
    id: dbDebt.id,
    userId: dbDebt.user_id,
    type: dbDebt.type,
    name: dbDebt.name,
    principalAmount: dbDebt.principal_amount,
    currentBalance: dbDebt.current_balance,
    interestRate: dbDebt.interest_rate,
    minimumPayment: dbDebt.minimum_payment,
    startDate: new Date(dbDebt.start_date),
    notes: dbDebt.notes || undefined,
    createdAt: new Date(dbDebt.created_at),
    updatedAt: new Date(dbDebt.updated_at),
  };
}

function investmentToDb(investment: Investment) {
  return {
    id: investment.id,
    user_id: investment.userId,
    name: investment.name,
    type: investment.type,
    symbol: investment.symbol || null,
    quantity: investment.quantity,
    purchase_price: investment.purchasePrice,
    current_price: investment.currentPrice,
    purchase_date: investment.purchaseDate.toISOString(),
    notes: investment.notes || null,
    created_at: investment.createdAt.toISOString(),
    updated_at: investment.updatedAt.toISOString(),
  };
}

function investmentFromDb(dbInvestment: any): Investment {
  return {
    id: dbInvestment.id,
    userId: dbInvestment.user_id,
    name: dbInvestment.name,
    type: dbInvestment.type,
    symbol: dbInvestment.symbol || undefined,
    quantity: dbInvestment.quantity,
    purchasePrice: dbInvestment.purchase_price,
    currentPrice: dbInvestment.current_price,
    purchaseDate: new Date(dbInvestment.purchase_date),
    notes: dbInvestment.notes || undefined,
    createdAt: new Date(dbInvestment.created_at),
    updatedAt: new Date(dbInvestment.updated_at),
  };
}

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load or create user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', DEFAULT_USER_ID)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        // PGRST116 is "not found" - we'll create the user
        console.error('Error loading user:', userError);
      }

      if (!userData) {
        // Create default user
        const defaultUser = {
          id: DEFAULT_USER_ID,
          name: 'My Account',
          email: null,
        };
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert(defaultUser as any)
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
        } else if (newUser) {
          const user = newUser as any;
          setUser({
            id: user.id,
            name: user.name,
            email: user.email || undefined,
          });
        }
      } else {
        const user = userData as any;
        setUser({
          id: user.id,
          name: user.name,
          email: user.email || undefined,
        });
      }

      // Load expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .order('created_at', { ascending: false });

      if (expensesError) {
        console.error('Error loading expenses:', expensesError);
      } else {
        setExpenses(expensesData?.map(expenseFromDb) || []);
      }

      // Load income
      const { data: incomeData, error: incomeError } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .order('created_at', { ascending: false });

      if (incomeError) {
        console.error('Error loading income:', incomeError);
      } else {
        setIncome(incomeData?.map(incomeFromDb) || []);
      }

      // Load debts
      const { data: debtsData, error: debtsError } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .order('created_at', { ascending: false });

      if (debtsError) {
        console.error('Error loading debts:', debtsError);
      } else {
        setDebts(debtsData?.map(debtFromDb) || []);
      }

      // Load investments
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .order('created_at', { ascending: false });

      if (investmentsError) {
        console.error('Error loading investments:', investmentsError);
      } else {
        setInvestments(investmentsData?.map(investmentFromDb) || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const now = new Date();
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: now,
      updatedAt: now,
    };

    const dbExpense = expenseToDb(newExpense);
    const { data, error } = await (supabase
      .from('expenses') as any)
      .insert(dbExpense)
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      throw error;
    }

    if (data) {
      setExpenses(prev => [expenseFromDb(data), ...prev]);
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    const updatedExpense = {
      ...expense,
      ...updates,
      updatedAt: new Date(),
    };

    const dbExpense = expenseToDb(updatedExpense);
    const updateData: any = {
      category: dbExpense.category,
      name: dbExpense.name,
      amount: dbExpense.amount,
      due_date: dbExpense.due_date,
      is_recurring: dbExpense.is_recurring,
      recurring_frequency: dbExpense.recurring_frequency,
      is_paid: dbExpense.is_paid,
      paid_date: dbExpense.paid_date,
      notes: dbExpense.notes,
      updated_at: dbExpense.updated_at,
    };
    const { data, error } = await (supabase
      .from('expenses') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      throw error;
    }

    if (data) {
      setExpenses(prev => prev.map(e => e.id === id ? expenseFromDb(data) : e));
    }
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }

    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addIncome = async (incomeData: Omit<Income, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const now = new Date();
    const newIncome: Income = {
      ...incomeData,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: now,
      updatedAt: now,
    };

    const dbIncome = incomeToDb(newIncome);
    const { data, error } = await (supabase
      .from('income') as any)
      .insert(dbIncome)
      .select()
      .single();

    if (error) {
      console.error('Error adding income:', error);
      throw error;
    }

    if (data) {
      setIncome(prev => [incomeFromDb(data), ...prev]);
    }
  };

  const updateIncome = async (id: string, updates: Partial<Income>) => {
    const incomeItem = income.find(i => i.id === id);
    if (!incomeItem) return;

    const updatedIncome = {
      ...incomeItem,
      ...updates,
      updatedAt: new Date(),
    };

    const dbIncome = incomeToDb(updatedIncome);
    const updateData: any = {
      category: dbIncome.category,
      name: dbIncome.name,
      amount: dbIncome.amount,
      date: dbIncome.date,
      is_recurring: dbIncome.is_recurring,
      recurring_frequency: dbIncome.recurring_frequency,
      notes: dbIncome.notes,
      updated_at: dbIncome.updated_at,
    };
    const { data, error } = await (supabase
      .from('income') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating income:', error);
      throw error;
    }

    if (data) {
      setIncome(prev => prev.map(i => i.id === id ? incomeFromDb(data) : i));
    }
  };

  const deleteIncome = async (id: string) => {
    const { error } = await supabase
      .from('income')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting income:', error);
      throw error;
    }

    setIncome(prev => prev.filter(i => i.id !== id));
  };

  const addDebt = async (debtData: Omit<Debt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const now = new Date();
    const newDebt: Debt = {
      ...debtData,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: now,
      updatedAt: now,
    };

    const dbDebt = debtToDb(newDebt);
    const { data, error } = await (supabase
      .from('debts') as any)
      .insert(dbDebt)
      .select()
      .single();

    if (error) {
      console.error('Error adding debt:', error);
      throw error;
    }

    if (data) {
      setDebts(prev => [debtFromDb(data), ...prev]);
    }
  };

  const updateDebt = async (id: string, updates: Partial<Debt>) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    const updatedDebt = {
      ...debt,
      ...updates,
      updatedAt: new Date(),
    };

    const dbDebt = debtToDb(updatedDebt);
    const updateData: any = {
      type: dbDebt.type,
      name: dbDebt.name,
      principal_amount: dbDebt.principal_amount,
      current_balance: dbDebt.current_balance,
      interest_rate: dbDebt.interest_rate,
      minimum_payment: dbDebt.minimum_payment,
      start_date: dbDebt.start_date,
      notes: dbDebt.notes,
      updated_at: dbDebt.updated_at,
    };
    const { data, error } = await (supabase
      .from('debts') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating debt:', error);
      throw error;
    }

    if (data) {
      setDebts(prev => prev.map(d => d.id === id ? debtFromDb(data) : d));
    }
  };

  const deleteDebt = async (id: string) => {
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting debt:', error);
      throw error;
    }

    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const addInvestment = async (investmentData: Omit<Investment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const now = new Date();
    const newInvestment: Investment = {
      ...investmentData,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: now,
      updatedAt: now,
    };

    const dbInvestment = investmentToDb(newInvestment);
    const { data, error } = await (supabase
      .from('investments') as any)
      .insert(dbInvestment)
      .select()
      .single();

    if (error) {
      console.error('Error adding investment:', error);
      throw error;
    }

    if (data) {
      setInvestments(prev => [investmentFromDb(data), ...prev]);
    }
  };

  const updateInvestment = async (id: string, updates: Partial<Investment>) => {
    const investment = investments.find(i => i.id === id);
    if (!investment) return;

    const updatedInvestment = {
      ...investment,
      ...updates,
      updatedAt: new Date(),
    };

    const dbInvestment = investmentToDb(updatedInvestment);
    const updateData: any = {
      name: dbInvestment.name,
      type: dbInvestment.type,
      symbol: dbInvestment.symbol,
      quantity: dbInvestment.quantity,
      purchase_price: dbInvestment.purchase_price,
      current_price: dbInvestment.current_price,
      purchase_date: dbInvestment.purchase_date,
      notes: dbInvestment.notes,
      updated_at: dbInvestment.updated_at,
    };
    const { data, error } = await (supabase
      .from('investments') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating investment:', error);
      throw error;
    }

    if (data) {
      setInvestments(prev => prev.map(i => i.id === id ? investmentFromDb(data) : i));
    }
  };

  const deleteInvestment = async (id: string) => {
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting investment:', error);
      throw error;
    }

    setInvestments(prev => prev.filter(i => i.id !== id));
  };

  const setDataFromFile = async (data: { user: User | null; expenses: Expense[]; income: Income[]; debts: Debt[]; investments: Investment[] }) => {
    if (!data.user) return;

    try {
      // Update or create user
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email || null,
          updated_at: new Date().toISOString(),
        } as any);

      if (userError) {
        console.error('Error updating user:', userError);
        throw userError;
      }

      setUser(data.user);

      // Delete all existing expenses, income, debts, and investments for this user
      await supabase.from('expenses').delete().eq('user_id', data.user.id);
      await supabase.from('income').delete().eq('user_id', data.user.id);
      await supabase.from('debts').delete().eq('user_id', data.user.id);
      await supabase.from('investments').delete().eq('user_id', data.user.id);

      // Insert new expenses
      if (data.expenses.length > 0) {
        const dbExpenses = data.expenses.map(expenseToDb);
        const { error: expensesError } = await supabase
          .from('expenses')
          .insert(dbExpenses as any);

        if (expensesError) {
          console.error('Error importing expenses:', expensesError);
          throw expensesError;
        }
      }

      // Insert new income
      if (data.income.length > 0) {
        const dbIncome = data.income.map(incomeToDb);
        const { error: incomeError } = await supabase
          .from('income')
          .insert(dbIncome as any);

        if (incomeError) {
          console.error('Error importing income:', incomeError);
          throw incomeError;
        }
      }

      // Insert new debts
      if (data.debts.length > 0) {
        const dbDebts = data.debts.map(debtToDb);
        const { error: debtsError } = await supabase
          .from('debts')
          .insert(dbDebts as any);

        if (debtsError) {
          console.error('Error importing debts:', debtsError);
          throw debtsError;
        }
      }

      // Insert new investments
      if (data.investments.length > 0) {
        const dbInvestments = data.investments.map(investmentToDb);
        const { error: investmentsError } = await supabase
          .from('investments')
          .insert(dbInvestments as any);

        if (investmentsError) {
          console.error('Error importing investments:', investmentsError);
          throw investmentsError;
        }
      }

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  };

  const getFinancialSummary = (): FinancialSummary => {
    const now = new Date();

    // Calculate total expenses (unpaid)
    const unpaidExpenses = expenses.filter(e => !e.isPaid);
    const totalExpenses = unpaidExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Calculate total income
    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);

    // Calculate monthly recurring income
    const monthlyRecurringIncome = income
      .filter(i => i.isRecurring && i.recurringFrequency === 'monthly')
      .reduce((sum, i) => sum + i.amount, 0);

    // Calculate monthly recurring expenses
    const monthlyRecurringExpenses = expenses
      .filter(e => e.isRecurring && e.recurringFrequency === 'monthly' && !e.isPaid)
      .reduce((sum, e) => sum + e.amount, 0);

    // Calculate net cash flow
    const netCashFlow = monthlyRecurringIncome - monthlyRecurringExpenses;

    // Calculate total debt
    const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);
    const totalMinimumPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);

    // Get upcoming expenses (next 30 days)
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const upcomingExpenses = expenses
      .filter(e => !e.isPaid && e.dueDate >= now && e.dueDate <= thirtyDaysFromNow)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    // Get recent income (last 30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentIncome = income
      .filter(i => i.date >= thirtyDaysAgo)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);

    // Calculate investment totals
    const totalInvestments = investments.length;
    const totalInvestmentValue = investments.reduce(
      (sum, inv) => sum + inv.quantity * inv.currentPrice,
      0
    );

    // Generate savings opportunities
    const savingsOpportunities = generateSavingsOpportunities(expenses, investments);

    return {
      totalExpenses,
      totalIncome,
      monthlyRecurringIncome,
      monthlyRecurringExpenses,
      netCashFlow,
      totalDebt,
      totalMinimumPayments,
      totalInvestments,
      totalInvestmentValue,
      upcomingExpenses,
      recentIncome,
      savingsOpportunities,
    };
  };

  return (
    <FinancialContext.Provider
      value={{
        user,
        expenses,
        income,
        debts,
        investments,
        isLoading,
        addExpense,
        updateExpense,
        deleteExpense,
        addIncome,
        updateIncome,
        deleteIncome,
        addDebt,
        updateDebt,
        deleteDebt,
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
      potentialSavings: expense.amount * 0.1,
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
      potentialSavings: creditCardDebt * 0.15,
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
        potentialSavings: 0,
        priority: 'medium',
        actionable: true,
      });
    }
  }

  return opportunities;
}
