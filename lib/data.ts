// Domain types, seed data, and pure helpers.
// Week 2 replaces the seed data with Postgres reads via lib/db.ts.

export type ExpenseType = "bill" | "loan" | "card" | "other";
export type Frequency = "once" | "weekly" | "monthly" | "yearly";

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: ExpenseType;
  frequency: Frequency;
  dueDate: string | null; // ISO date
  paid: boolean;
}

export interface Investment {
  id: string;
  name: string;
  assetType: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string; // ISO date
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const SEED_EXPENSES: Expense[] = [
  {
    id: "e1",
    name: "Rent",
    amount: 1500,
    category: "Housing",
    type: "bill",
    frequency: "monthly",
    dueDate: daysFromNow(4),
    paid: false,
  },
  {
    id: "e2",
    name: "Amex payment",
    amount: 850,
    category: "Debt",
    type: "card",
    frequency: "monthly",
    dueDate: daysFromNow(9),
    paid: false,
  },
  {
    id: "e3",
    name: "Car loan",
    amount: 433,
    category: "Transport",
    type: "loan",
    frequency: "monthly",
    dueDate: daysFromNow(12),
    paid: true,
  },
  {
    id: "e4",
    name: "Streaming bundle",
    amount: 32,
    category: "Entertainment",
    type: "bill",
    frequency: "monthly",
    dueDate: daysFromNow(20),
    paid: false,
  },
  {
    id: "e5",
    name: "Gym",
    amount: 80,
    category: "Health",
    type: "bill",
    frequency: "monthly",
    dueDate: daysFromNow(25),
    paid: false,
  },
];

const SEED_INVESTMENTS: Investment[] = [
  {
    id: "i1",
    name: "VTI",
    assetType: "ETF",
    quantity: 40,
    purchasePrice: 240,
    currentPrice: 285.5,
    purchaseDate: "2024-03-15",
  },
  {
    id: "i2",
    name: "AAPL",
    assetType: "Stock",
    quantity: 25,
    purchasePrice: 175,
    currentPrice: 232.8,
    purchaseDate: "2023-11-02",
  },
  {
    id: "i3",
    name: "BTC",
    assetType: "Crypto",
    quantity: 0.15,
    purchasePrice: 62000,
    currentPrice: 97500,
    purchaseDate: "2024-06-20",
  },
];

export function getExpenses(): Expense[] {
  return SEED_EXPENSES;
}

export function getInvestments(): Investment[] {
  return SEED_INVESTMENTS;
}

export interface DashboardSummary {
  monthlyExpenses: number;
  investmentsValue: number;
  unpaidCount: number;
}

export function getDashboardSummary(): DashboardSummary {
  const expenses = getExpenses();
  const investments = getInvestments();
  return {
    monthlyExpenses: expenses
      .filter((e) => e.frequency === "monthly")
      .reduce((sum, e) => sum + e.amount, 0),
    investmentsValue: investments.reduce(
      (sum, i) => sum + i.quantity * i.currentPrice,
      0,
    ),
    unpaidCount: expenses.filter((e) => !e.paid).length,
  };
}

export function getUpcomingExpenses(days: number): Expense[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  return getExpenses()
    .filter((e) => e.dueDate !== null && new Date(e.dueDate) <= cutoff)
    .sort((a, b) => (a.dueDate as string).localeCompare(b.dueDate as string));
}

export function getInvestmentTotals(): {
  totalValue: number;
  totalGainLoss: number;
} {
  const investments = getInvestments();
  return {
    totalValue: investments.reduce(
      (sum, i) => sum + i.quantity * i.currentPrice,
      0,
    ),
    totalGainLoss: investments.reduce(
      (sum, i) => sum + (i.currentPrice - i.purchasePrice) * i.quantity,
      0,
    ),
  };
}
