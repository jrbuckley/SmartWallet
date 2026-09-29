// Domain types and data access. Reads hit Postgres via lib/db.ts;
// aggregates stay pure functions over arrays so they (and lib/insights.ts)
// remain easily testable.
import { asc, eq } from "drizzle-orm";
import { db, DEMO_USER_ID } from "./db";
import { expenses, investments } from "./schema";

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

export async function getExpenses(): Promise<Expense[]> {
  const rows = await db()
    .select()
    .from(expenses)
    .where(eq(expenses.userId, DEMO_USER_ID))
    .orderBy(asc(expenses.createdAt));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    amount: Number(r.amount),
    category: r.category,
    type: r.type,
    frequency: r.frequency as Frequency,
    dueDate: r.dueDate,
    paid: r.paid,
  }));
}

export async function getInvestments(): Promise<Investment[]> {
  const rows = await db()
    .select()
    .from(investments)
    .where(eq(investments.userId, DEMO_USER_ID))
    .orderBy(asc(investments.createdAt));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    assetType: r.assetType,
    quantity: Number(r.quantity),
    purchasePrice: Number(r.purchasePrice),
    currentPrice: Number(r.currentPrice),
    purchaseDate: r.purchaseDate,
  }));
}

export interface DashboardSummary {
  monthlyExpenses: number;
  investmentsValue: number;
  unpaidCount: number;
}

export function getDashboardSummary(
  expenses: Expense[],
  investments: Investment[],
): DashboardSummary {
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

export function getUpcomingExpenses(
  expenses: Expense[],
  days: number,
): Expense[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  return expenses
    .filter((e) => e.dueDate !== null && new Date(e.dueDate) <= cutoff)
    .sort((a, b) => (a.dueDate as string).localeCompare(b.dueDate as string));
}

export function getInvestmentTotals(investments: Investment[]): {
  totalValue: number;
  totalGainLoss: number;
} {
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
