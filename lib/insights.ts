import type { Expense, Investment } from "./data";

export type InsightPriority = "high" | "medium" | "low";

export interface Insight {
  id: string;
  title: string;
  description: string;
  priority: InsightPriority;
  category: string;
}

// Port of the original app's rule-based savings insights, extracted as pure
// functions so the logic is testable. Phase 3 replaces this engine with a
// real LLM-backed analysis.
export function buildInsights(
  expenses: Expense[],
  investments: Investment[],
): Insight[] {
  const insights: Insight[] = [];

  // 1. High recurring expenses worth optimizing.
  const recurring = expenses
    .filter((e) => e.frequency !== "once")
    .sort((a, b) => b.amount - a.amount);
  const top = recurring[0];
  if (top && top.amount >= 50) {
    insights.push({
      id: "recurring",
      title: `Review your ${top.name.toLowerCase()} spend`,
      description:
        `${top.name} costs $${top.amount.toFixed(2)}/${top.frequency.slice(0, -2) || top.frequency}. ` +
        `Recurring charges are the easiest wins — check for a cheaper plan or cancel if unused.`,
      priority: top.amount >= 200 ? "high" : "medium",
      category: "Expense reduction",
    });
  }

  // 2. Unpaid credit-card balances → consolidation nudge.
  const cardDebt = expenses
    .filter((e) => e.type === "card" && !e.paid)
    .reduce((sum, e) => sum + e.amount, 0);
  if (cardDebt > 0) {
    insights.push({
      id: "card-debt",
      title: "Tackle credit-card balances",
      description:
        `You have $${cardDebt.toFixed(2)} in unpaid card balances. ` +
        `Card APRs dwarf any investment return — paying these down beats the market.`,
      priority: "high",
      category: "Debt consolidation",
    });
  }

  // 3. Portfolio concentration check.
  const totalValue = investments.reduce(
    (sum, i) => sum + i.quantity * i.currentPrice,
    0,
  );
  if (totalValue > 0) {
    const largest = investments
      .map((i) => ({
        name: i.name,
        value: i.quantity * i.currentPrice,
      }))
      .sort((a, b) => b.value - a.value)[0];
    if (largest && largest.value / totalValue > 0.5) {
      insights.push({
        id: "concentration",
        title: `${largest.name} dominates your portfolio`,
        description:
          `${largest.name} is ${Math.round((largest.value / totalValue) * 100)}% of your holdings. ` +
          `Consider rebalancing into broad-market funds to cut single-asset risk.`,
        priority: "medium",
        category: "Investment optimization",
      });
    }
  }

  // 4. Paid-off wins worth acknowledging (keeps the list non-empty).
  const paidThisMonth = expenses.filter((e) => e.paid).length;
  if (paidThisMonth > 0 && insights.length < 3) {
    insights.push({
      id: "momentum",
      title: "Keep the momentum",
      description:
        `You've already paid ${paidThisMonth} expense${paidThisMonth === 1 ? "" : "s"} ` +
        `this cycle. Rolling those freed dollars into the highest-APR debt compounds the win.`,
      priority: "low",
      category: "Habits",
    });
  }

  return insights;
}
