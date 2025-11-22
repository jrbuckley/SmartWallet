import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Debt, Expense, Income, Investment, User, FinancialSummary, SavingsGoal, SavingsGoalRecommendation, Budget, BudgetSpending, BudgetCategory, BudgetEntry } from '../types';
import { supabase } from '../lib/supabase';
import { generateRecurringExpenses, generateRecurringIncome } from '../utils/recurringGenerator';

interface FinancialContextType {
  user: User | null;
  expenses: Expense[];
  income: Income[];
  debts: Debt[];
  investments: Investment[];
  savingsGoals: SavingsGoal[];
  budgets: Budget[];
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
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  getSavingsGoalRecommendations: () => SavingsGoalRecommendation[];
  addBudget: (budget: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addBudgetEntry: (entry: Omit<BudgetEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBudgetEntry: (id: string, updates: Partial<BudgetEntry>) => Promise<void>;
  deleteBudgetEntry: (id: string) => Promise<void>;
  getBudgetSpending: () => BudgetSpending[];
  getFinancialSummary: () => FinancialSummary;
  setDataFromFile: (data: { user: User | null; expenses: Expense[]; income: Income[]; debts: Debt[]; investments: Investment[] }) => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

// Default user ID for single-user mode
// In the future, this can be replaced with authenticated user ID
const DEFAULT_USER_ID = 'user-1';

// Helper function to convert Date to YYYY-MM-DD string for duplicate checking
function dateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
    budget_id: expense.budgetId || null,
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
    budgetId: dbExpense.budget_id || undefined,
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
  // Parse date from ISO string and create in local time to avoid timezone shifts
  // Extract YYYY-MM-DD from the ISO string and create date in local timezone
  const dateStr = dbIncome.date.split('T')[0]; // Get YYYY-MM-DD part
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day); // Create in local time
  
  return {
    id: dbIncome.id,
    userId: dbIncome.user_id,
    category: dbIncome.category,
    name: dbIncome.name,
    amount: dbIncome.amount,
    date: date,
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

function savingsGoalToDb(goal: SavingsGoal) {
  return {
    id: goal.id,
    user_id: goal.userId,
    name: goal.name,
    category: goal.category,
    target_amount: goal.targetAmount,
    current_amount: goal.currentAmount,
    target_date: goal.targetDate?.toISOString() || null,
    priority: goal.priority,
    notes: goal.notes || null,
    created_at: goal.createdAt.toISOString(),
    updated_at: goal.updatedAt.toISOString(),
  };
}

function savingsGoalFromDb(dbGoal: any): SavingsGoal {
  return {
    id: dbGoal.id,
    userId: dbGoal.user_id,
    name: dbGoal.name,
    category: dbGoal.category,
    targetAmount: dbGoal.target_amount,
    currentAmount: dbGoal.current_amount,
    targetDate: dbGoal.target_date ? new Date(dbGoal.target_date) : undefined,
    priority: dbGoal.priority,
    notes: dbGoal.notes || undefined,
    createdAt: new Date(dbGoal.created_at),
    updatedAt: new Date(dbGoal.updated_at),
  };
}

function budgetToDb(budget: Budget) {
  return {
    id: budget.id,
    user_id: budget.userId,
    name: budget.name,
    category: budget.category,
    monthly_limit: budget.monthlyLimit,
    period: budget.period,
    notes: budget.notes || null,
    created_at: budget.createdAt.toISOString(),
    updated_at: budget.updatedAt.toISOString(),
  };
}

function budgetFromDb(dbBudget: any): Budget {
  return {
    id: dbBudget.id,
    userId: dbBudget.user_id,
    name: dbBudget.name,
    category: dbBudget.category,
    monthlyLimit: dbBudget.monthly_limit,
    period: dbBudget.period,
    notes: dbBudget.notes || undefined,
    createdAt: new Date(dbBudget.created_at),
    updatedAt: new Date(dbBudget.updated_at),
  };
}

function budgetEntryToDb(entry: BudgetEntry) {
  return {
    id: entry.id,
    user_id: entry.userId,
    budget_id: entry.budgetId,
    amount: entry.amount,
    description: entry.description,
    date: entry.date.toISOString(),
    notes: entry.notes || null,
    created_at: entry.createdAt.toISOString(),
    updated_at: entry.updatedAt.toISOString(),
  };
}

function budgetEntryFromDb(dbEntry: any): BudgetEntry {
  return {
    id: dbEntry.id,
    userId: dbEntry.user_id,
    budgetId: dbEntry.budget_id,
    amount: dbEntry.amount,
    description: dbEntry.description,
    date: new Date(dbEntry.date),
    notes: dbEntry.notes || undefined,
    createdAt: new Date(dbEntry.created_at),
    updatedAt: new Date(dbEntry.updated_at),
  };
}

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetEntries, setBudgetEntries] = useState<BudgetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const recurringGeneratedRef = useRef(false);
  const isGeneratingRecurringRef = useRef(false);

  // Load data from Supabase on mount
  useEffect(() => {
    loadData();
  }, []);

  // Note: Recurring items generation is handled below with proper guards to prevent duplicate runs

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

      // Load savings goals
      const { data: savingsGoalsData, error: savingsGoalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .order('created_at', { ascending: false });

      if (savingsGoalsError) {
        console.error('Error loading savings goals:', savingsGoalsError);
      } else {
        setSavingsGoals(savingsGoalsData?.map(savingsGoalFromDb) || []);
      }

      // Load budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .order('created_at', { ascending: false });

      if (budgetsError) {
        console.error('Error loading budgets:', budgetsError);
      } else {
        setBudgets(budgetsData?.map(budgetFromDb) || []);
      }

      // Load budget entries
      const { data: budgetEntriesData, error: budgetEntriesError } = await supabase
        .from('budget_entries')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .order('created_at', { ascending: false });

      if (budgetEntriesError) {
        console.error('Error loading budget entries:', budgetEntriesError);
      } else {
        setBudgetEntries(budgetEntriesData?.map(budgetEntryFromDb) || []);
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
      budget_id: dbExpense.budget_id,
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

    // Check for duplicate in database before inserting
    // This prevents duplicates even if generateRecurringIncome is called multiple times
    // Compare by name, category, and date (ignoring time)
    const dateStr = dateToString(incomeData.date); // YYYY-MM-DD format
    const { data: existingData } = await (supabase
      .from('income') as any)
      .select('id, date')
      .eq('user_id', user.id)
      .eq('name', incomeData.name)
      .eq('category', incomeData.category);

    // Check if any existing entry has the same date (comparing date strings)
    if (existingData && existingData.length > 0) {
      for (const existing of existingData) {
        const existingDate = existing.date as string;
        const existingDateStr = dateToString(new Date(existingDate));
        if (existingDateStr === dateStr) {
          console.log('Duplicate income entry skipped:', incomeData.name, dateStr);
          return;
        }
      }
    }

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
      const newIncomeItem = incomeFromDb(data);
      setIncome(prev => [newIncomeItem, ...prev]);
      
      // Only generate recurring instances if:
      // 1. This is a recurring income
      // 2. We're NOT currently in the middle of generating recurring income (to prevent recursion)
      if (newIncomeItem.isRecurring && newIncomeItem.recurringFrequency && !isGeneratingRecurringRef.current) {
        // Set flag immediately to prevent recursive calls
        isGeneratingRecurringRef.current = true;
        setTimeout(() => {
          // Use functional update to get the absolute latest state
          setIncome(currentIncome => {
            generateRecurringIncome(currentIncome, addIncome)
              .then(() => {
                isGeneratingRecurringRef.current = false;
              })
              .catch(error => {
                console.error('Error generating recurring income after add:', error);
                isGeneratingRecurringRef.current = false;
              });
            return currentIncome; // Return unchanged to avoid unnecessary re-render
          });
        }, 150);
      }
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

    console.log('updateData', updateData);

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

  const addSavingsGoal = async (goalData: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const now = new Date();
    const newGoal: SavingsGoal = {
      ...goalData,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: now,
      updatedAt: now,
    };

    const dbGoal = savingsGoalToDb(newGoal);
    const { data, error } = await (supabase
      .from('savings_goals') as any)
      .insert(dbGoal)
      .select()
      .single();

    if (error) {
      console.error('Error adding savings goal:', error);
      throw error;
    }

    if (data) {
      setSavingsGoals(prev => [savingsGoalFromDb(data), ...prev]);
    }
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    const goal = savingsGoals.find(g => g.id === id);
    if (!goal) return;

    const updatedGoal = {
      ...goal,
      ...updates,
      updatedAt: new Date(),
    };

    const dbGoal = savingsGoalToDb(updatedGoal);
    const updateData: any = {
      name: dbGoal.name,
      category: dbGoal.category,
      target_amount: dbGoal.target_amount,
      current_amount: dbGoal.current_amount,
      target_date: dbGoal.target_date,
      priority: dbGoal.priority,
      notes: dbGoal.notes,
      updated_at: dbGoal.updated_at,
    };
    const { data, error } = await (supabase
      .from('savings_goals') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating savings goal:', error);
      throw error;
    }

    if (data) {
      setSavingsGoals(prev => prev.map(g => g.id === id ? savingsGoalFromDb(data) : g));
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting savings goal:', error);
      throw error;
    }

    setSavingsGoals(prev => prev.filter(g => g.id !== id));
  };

  const addBudget = async (budgetData: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const now = new Date();
    const newBudget: Budget = {
      ...budgetData,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: now,
      updatedAt: now,
    };

    const dbBudget = budgetToDb(newBudget);
    const { data, error } = await (supabase
      .from('budgets') as any)
      .insert(dbBudget)
      .select()
      .single();

    if (error) {
      console.error('Error adding budget:', error);
      throw error;
    }

    if (data) {
      setBudgets(prev => [budgetFromDb(data), ...prev]);
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    const budget = budgets.find(b => b.id === id);
    if (!budget) return;

    const updatedBudget = {
      ...budget,
      ...updates,
      updatedAt: new Date(),
    };

    const dbBudget = budgetToDb(updatedBudget);
    const updateData: any = {
      name: dbBudget.name,
      category: dbBudget.category,
      monthly_limit: dbBudget.monthly_limit,
      period: dbBudget.period,
      notes: dbBudget.notes,
      updated_at: dbBudget.updated_at,
    };
    const { data, error } = await (supabase
      .from('budgets') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating budget:', error);
      throw error;
    }

    if (data) {
      setBudgets(prev => prev.map(b => b.id === id ? budgetFromDb(data) : b));
    }
  };

  const deleteBudget = async (id: string) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }

    setBudgets(prev => prev.filter(b => b.id !== id));
    // Also delete associated budget entries
    setBudgetEntries(prev => prev.filter(e => e.budgetId !== id));
  };

  const addBudgetEntry = async (entryData: Omit<BudgetEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const now = new Date();
    const newEntry: BudgetEntry = {
      ...entryData,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: now,
      updatedAt: now,
    };

    const dbEntry = budgetEntryToDb(newEntry);
    const { data, error } = await (supabase
      .from('budget_entries') as any)
      .insert(dbEntry)
      .select()
      .single();

    if (error) {
      console.error('Error adding budget entry:', error);
      throw error;
    }

    if (data) {
      setBudgetEntries(prev => [budgetEntryFromDb(data), ...prev]);
    }
  };

  const updateBudgetEntry = async (id: string, updates: Partial<BudgetEntry>) => {
    const entry = budgetEntries.find(e => e.id === id);
    if (!entry) return;

    const updatedEntry = {
      ...entry,
      ...updates,
      updatedAt: new Date(),
    };

    const dbEntry = budgetEntryToDb(updatedEntry);
    const updateData: any = {
      budget_id: dbEntry.budget_id,
      amount: dbEntry.amount,
      description: dbEntry.description,
      date: dbEntry.date,
      notes: dbEntry.notes,
      updated_at: dbEntry.updated_at,
    };
    const { data, error } = await (supabase
      .from('budget_entries') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating budget entry:', error);
      throw error;
    }

    if (data) {
      setBudgetEntries(prev => prev.map(e => e.id === id ? budgetEntryFromDb(data) : e));
    }
  };

  const deleteBudgetEntry = async (id: string) => {
    const { error } = await supabase
      .from('budget_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting budget entry:', error);
      throw error;
    }

    setBudgetEntries(prev => prev.filter(e => e.id !== id));
  };

  const getBudgetSpending = (): BudgetSpending[] => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)

    return budgets.map(budget => {
      // Calculate spending for the current period
      const periodStart = budget.period === 'weekly' ? startOfWeek : startOfMonth;
      
      // Get expenses explicitly linked to this budget
      const linkedExpenses = expenses.filter(expense => {
        if (!expense.budgetId || expense.budgetId !== budget.id) return false;
        const expenseDate = expense.dueDate;
        return expenseDate >= periodStart;
      });

      // Get manual budget entries for this budget in the current period
      const manualEntries = budgetEntries.filter(entry => {
        if (entry.budgetId !== budget.id) return false;
        const entryDate = entry.date;
        return entryDate >= periodStart;
      });

      // Calculate total spending from both sources
      const expenseSpending = linkedExpenses.reduce((sum, e) => sum + e.amount, 0);
      const entrySpending = manualEntries.reduce((sum, e) => sum + e.amount, 0);
      const currentSpending = expenseSpending + entrySpending;
      
      const remaining = budget.monthlyLimit - currentSpending;
      const percentageUsed = budget.monthlyLimit > 0 ? (currentSpending / budget.monthlyLimit) * 100 : 0;
      const isOverBudget = currentSpending > budget.monthlyLimit;

      return {
        budgetId: budget.id,
        budgetName: budget.name,
        category: budget.category,
        monthlyLimit: budget.monthlyLimit,
        currentSpending,
        remaining,
        percentageUsed,
        isOverBudget,
        linkedExpenses,
        manualEntries,
      };
    });
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

  // Helper function to convert recurring amount to monthly equivalent
  const convertToMonthly = (amount: number, frequency?: string): number => {
    if (!frequency) return 0;
    switch (frequency) {
      case 'weekly':
        return amount * 4.33; // Average weeks per month
      case 'biweekly':
        return amount * 2.17; // Bi-weekly payments per month
      case 'semimonthly':
        return amount * 2; // Twice per month
      case 'monthly':
        return amount;
      case 'yearly':
        return amount / 12;
      default:
        return 0;
    }
  };

  const getFinancialSummary = (): FinancialSummary => {
    const now = new Date();

    // Calculate total expenses (unpaid)
    const unpaidExpenses = expenses.filter(e => !e.isPaid);
    const totalExpenses = unpaidExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Calculate total income
    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);

    // Calculate monthly recurring income (convert all frequencies to monthly)
    // Group by name, category, and frequency to avoid double-counting (since we generate multiple instances)
    const uniqueRecurringIncome = new Map<string, Income>();
    income
      .filter(i => i.isRecurring && i.recurringFrequency)
      .forEach(i => {
        const key = `${i.name}|${i.category}|${i.recurringFrequency}`;
        if (!uniqueRecurringIncome.has(key)) {
          uniqueRecurringIncome.set(key, i);
        }
      });
    
    const monthlyRecurringIncome = Array.from(uniqueRecurringIncome.values())
      .reduce((sum, i) => sum + convertToMonthly(i.amount, i.recurringFrequency), 0);

    // Calculate monthly recurring expenses (convert all frequencies to monthly)
    // Include all recurring expenses regardless of payment status - they represent ongoing obligations
    // Group by name, category, and frequency to avoid double-counting (since we generate multiple instances)
    const uniqueRecurringExpenses = new Map<string, Expense>();
    expenses
      .filter(e => e.isRecurring && e.recurringFrequency)
      .forEach(e => {
        const key = `${e.name}|${e.category}|${e.recurringFrequency}`;
        if (!uniqueRecurringExpenses.has(key)) {
          uniqueRecurringExpenses.set(key, e);
        }
      });
    
    const monthlyRecurringExpenses = Array.from(uniqueRecurringExpenses.values())
      .reduce((sum, e) => sum + convertToMonthly(e.amount, e.recurringFrequency), 0);

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

  // Generate recurring items after data loads and functions are available
  // Only run once per data load to avoid infinite loops
  useEffect(() => {
    if (!isLoading && expenses.length > 0 && user && !recurringGeneratedRef.current) {
      // Use a small delay to ensure addExpense is available
      const timer = setTimeout(() => {
        generateRecurringExpenses(expenses, addExpense)
          .then(() => {
            recurringGeneratedRef.current = true;
          })
          .catch(error => {
            console.error('Error generating recurring expenses:', error);
          });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, expenses.length, user, addExpense]);

  useEffect(() => {
    // Only generate on initial load (when isLoading becomes false), not when income changes
    // This prevents the useEffect from running when generateRecurringIncome adds new items
    if (!isLoading && income.length > 0 && user && !recurringGeneratedRef.current && !isGeneratingRecurringRef.current) {
      // Use a small delay to ensure addIncome is available
      const timer = setTimeout(() => {
        isGeneratingRecurringRef.current = true;
        generateRecurringIncome(income, addIncome)
          .then(() => {
            recurringGeneratedRef.current = true;
            isGeneratingRecurringRef.current = false;
          })
          .catch(error => {
            console.error('Error generating recurring income:', error);
            isGeneratingRecurringRef.current = false;
          });
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]); // Only depend on isLoading, not income.length or user

  // Reset the ref when data is reloaded
  useEffect(() => {
    if (isLoading) {
      recurringGeneratedRef.current = false;
    }
  }, [isLoading]);

  const getSavingsGoalRecommendations = (): SavingsGoalRecommendation[] => {
    const recommendations: SavingsGoalRecommendation[] = [];
    const summary = getFinancialSummary();
    const existingCategories = new Set(savingsGoals.map(g => g.category));

    // Emergency fund recommendation
    if (!existingCategories.has('emergency_fund')) {
      const monthlyExpenses = summary.monthlyRecurringExpenses || summary.totalExpenses / 12;
      const recommendedAmount = monthlyExpenses * 6; // 6 months of expenses
      recommendations.push({
        id: 'rec-emergency-fund',
        category: 'emergency_fund',
        name: 'Emergency Fund',
        description: 'Build a safety net to cover unexpected expenses',
        recommendedAmount: Math.round(recommendedAmount),
        reason: `Based on your monthly expenses of $${monthlyExpenses.toFixed(2)}, aim for $${recommendedAmount.toFixed(2)} (6 months of expenses)`,
        priority: 'high',
      });
    }

    // Debt payoff recommendation
    if (summary.totalDebt > 0 && !existingCategories.has('debt_payoff')) {
      recommendations.push({
        id: 'rec-debt-payoff',
        category: 'debt_payoff',
        name: 'Debt Payoff Fund',
        description: 'Accelerate your debt repayment',
        recommendedAmount: Math.round(summary.totalDebt * 0.1),
        reason: `You have $${summary.totalDebt.toFixed(2)} in debt. Consider saving 10% as an initial goal`,
        priority: 'high',
      });
    }

    // Retirement recommendation
    if (!existingCategories.has('retirement')) {
      const monthlyIncome = summary.monthlyRecurringIncome || summary.totalIncome / 12;
      const recommendedAmount = monthlyIncome * 12 * 0.15; // 15% of annual income
      recommendations.push({
        id: 'rec-retirement',
        category: 'retirement',
        name: 'Retirement Savings',
        description: 'Start building your retirement nest egg',
        recommendedAmount: Math.round(recommendedAmount),
        reason: `Financial experts recommend saving 15% of your annual income for retirement`,
        priority: 'medium',
      });
    }

    // Vacation recommendation
    if (!existingCategories.has('vacation')) {
      recommendations.push({
        id: 'rec-vacation',
        category: 'vacation',
        name: 'Vacation Fund',
        description: 'Plan for your next getaway',
        recommendedAmount: 2000,
        reason: 'A typical vacation costs around $2,000. Start saving for your dream trip!',
        priority: 'low',
      });
    }

    // Home down payment recommendation
    if (!existingCategories.has('home') && summary.monthlyRecurringIncome > 0) {
      const monthlyIncome = summary.monthlyRecurringIncome;
      const recommendedAmount = monthlyIncome * 12 * 0.2; // 20% down payment estimate
      recommendations.push({
        id: 'rec-home',
        category: 'home',
        name: 'Home Down Payment',
        description: 'Save for your future home',
        recommendedAmount: Math.round(recommendedAmount),
        reason: 'Aim for 20% down payment to avoid PMI and get better mortgage rates',
        priority: 'medium',
      });
    }

    return recommendations;
  };

  return (
    <FinancialContext.Provider
      value={{
        user,
        expenses,
        income,
        debts,
        investments,
        savingsGoals,
        budgets,
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
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        getSavingsGoalRecommendations,
        addBudget,
        updateBudget,
        deleteBudget,
        addBudgetEntry,
        updateBudgetEntry,
        deleteBudgetEntry,
        getBudgetSpending,
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
