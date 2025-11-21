import type { Debt } from '../types';

export interface PaymentPlan {
  month: number;
  date: Date;
  debtId: string;
  debtName: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  totalPaid: number;
  totalInterestPaid: number;
}

export interface DebtPayoffPlan {
  strategy: string;
  totalMonths: number;
  totalInterest: number;
  totalPayments: number;
  monthlyPayment: number;
  payments: PaymentPlan[];
  debtOrder: string[];
}

export interface ActionItem {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  impact: string;
  debtId?: string;
}

/**
 * Generate a detailed month-by-month payoff plan
 * Correctly handles making minimum payments on all debts each month,
 * with extra payments going to the priority debt
 */
export function generatePayoffPlan(
  debts: Debt[],
  strategy: 'avalanche' | 'snowball',
  extraPayment: number = 0
): DebtPayoffPlan {
  // Sort debts based on strategy to determine priority order
  const sortedDebts = strategy === 'avalanche'
    ? [...debts].sort((a, b) => b.interestRate - a.interestRate)
    : [...debts].sort((a, b) => a.currentBalance - b.currentBalance);

  const payments: PaymentPlan[] = [];
  const debtOrder = sortedDebts.map(d => d.id);
  
  // Initialize balances and tracking
  const balances = new Map<string, number>();
  const totalPaid = new Map<string, number>();
  const totalInterestPaid = new Map<string, number>();
  const debtMap = new Map<string, Debt>();
  
  debts.forEach(debt => {
    balances.set(debt.id, debt.currentBalance);
    totalPaid.set(debt.id, 0);
    totalInterestPaid.set(debt.id, 0);
    debtMap.set(debt.id, debt);
  });

  const startDate = new Date();
  startDate.setDate(1); // Start of current month
  let month = 0;
  let totalInterest = 0;
  let totalPayments = 0;
  let availableExtra = extraPayment;

  // Continue until all debts are paid off
  while (true) {
    month++;
    const currentDate = new Date(startDate);
    currentDate.setMonth(startDate.getMonth() + month - 1);

    // Check if all debts are paid off
    const allPaid = Array.from(balances.values()).every(balance => balance <= 0.01);
    if (allPaid) break;

    // Find the priority debt (first unpaid debt in sorted order)
    const priorityDebt = sortedDebts.find(debt => balances.get(debt.id)! > 0.01);
    if (!priorityDebt) break;

    // Process each debt for this month
    for (const debt of debts) {
      const debtBalance = balances.get(debt.id)!;
      if (debtBalance <= 0.01) continue; // Skip paid-off debts

      const monthlyRate = debt.interestRate / 100 / 12;
      
      // Calculate payment: minimum for all debts, plus extra for priority debt
      let payment = debt.minimumPayment;
      if (debt.id === priorityDebt.id) {
        payment += availableExtra;
      }

      // Calculate interest and principal
      const interest = debtBalance * monthlyRate;
      const principal = Math.min(payment - interest, debtBalance);
      const newBalance = debtBalance - principal;
      
      // Update balances
      balances.set(debt.id, newBalance);
      
      // Update totals
      const currentTotalPaid = totalPaid.get(debt.id)! + payment;
      const currentTotalInterest = totalInterestPaid.get(debt.id)! + interest;
      totalPaid.set(debt.id, currentTotalPaid);
      totalInterestPaid.set(debt.id, currentTotalInterest);
      
      totalInterest += interest;
      totalPayments += payment;

      // Record payment
      payments.push({
        month,
        date: currentDate,
        debtId: debt.id,
        debtName: debt.name,
        payment,
        principal,
        interest,
        remainingBalance: newBalance,
        totalPaid: currentTotalPaid,
        totalInterestPaid: currentTotalInterest,
      });

      // If this debt was just paid off and it was the priority debt, roll its minimum into extra
      if (newBalance <= 0.01 && debt.id === priorityDebt.id) {
        availableExtra += debt.minimumPayment;
      }
    }

    // Safety limit
    if (month > 600) break;
  }

  const totalMinimumPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);

  return {
    strategy: strategy === 'avalanche' ? 'Avalanche Method' : 'Snowball Method',
    totalMonths: month,
    totalInterest,
    totalPayments: debts.reduce((sum, d) => sum + d.currentBalance, 0) + totalInterest,
    monthlyPayment: totalMinimumPayments + extraPayment,
    payments,
    debtOrder,
  };
}

/**
 * Generate action items for debt payoff
 */
export function generateActionItems(
  debts: Debt[],
  currentExtraPayment: number = 0
): ActionItem[] {
  const items: ActionItem[] = [];
  const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);
  const totalMinimumPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const highestInterestDebt = [...debts].sort((a, b) => b.interestRate - a.interestRate)[0];
  const smallestDebt = [...debts].sort((a, b) => a.currentBalance - b.currentBalance)[0];

  // High priority: Pay off highest interest debt
  if (highestInterestDebt) {
    const monthlyInterest = (highestInterestDebt.currentBalance * highestInterestDebt.interestRate) / 100 / 12;
    items.push({
      id: 'action-1',
      priority: 'high',
      title: `Focus on ${highestInterestDebt.name}`,
      description: `This debt has the highest interest rate (${highestInterestDebt.interestRate.toFixed(2)}% APR) and costs you $${monthlyInterest.toFixed(2)} in interest per month.`,
      action: `Pay an extra $${Math.max(50, Math.round(highestInterestDebt.minimumPayment * 0.2))} per month to ${highestInterestDebt.name}`,
      impact: `Could save approximately $${(monthlyInterest * 0.3).toFixed(2)} per month in interest`,
      debtId: highestInterestDebt.id,
    });
  }

  // High priority: Increase minimum payments
  if (currentExtraPayment === 0) {
    items.push({
      id: 'action-2',
      priority: 'high',
      title: 'Start Making Extra Payments',
      description: `You're currently only paying minimums ($${totalMinimumPayments.toFixed(2)}/month). Even a small extra payment can significantly reduce interest.`,
      action: `Add $${Math.max(25, Math.round(totalMinimumPayments * 0.1))} extra per month to your highest interest debt`,
      impact: `Could reduce total interest by 15-25% and payoff time by several months`,
    });
  }

  // Medium priority: Pay off smallest debt for quick win
  if (smallestDebt && smallestDebt.currentBalance < totalDebt * 0.1) {
    items.push({
      id: 'action-3',
      priority: 'medium',
      title: `Quick Win: Pay Off ${smallestDebt.name}`,
      description: `This is your smallest debt ($${smallestDebt.currentBalance.toFixed(2)}). Paying it off quickly will free up $${smallestDebt.minimumPayment.toFixed(2)}/month.`,
      action: `Pay an extra $${Math.round(smallestDebt.currentBalance / 3)} per month to pay it off in ~3 months`,
      impact: `Frees up $${smallestDebt.minimumPayment.toFixed(2)}/month to put toward other debts`,
      debtId: smallestDebt.id,
    });
  }

  // Medium priority: Consolidate high-interest debt
  const highInterestDebts = debts.filter(d => d.interestRate > 15);
  if (highInterestDebts.length > 1) {
    const totalHighInterest = highInterestDebts.reduce((sum, d) => sum + d.currentBalance, 0);
    items.push({
      id: 'action-4',
      priority: 'medium',
      title: 'Consider Debt Consolidation',
      description: `You have $${totalHighInterest.toFixed(2)} in high-interest debt (over 15% APR). Consolidating could lower your interest rate.`,
      action: 'Research balance transfer cards or consolidation loans with lower rates',
      impact: `Could reduce interest rates by 5-10%, saving hundreds per year`,
    });
  }

  // Low priority: Review and optimize
  if (debts.length > 3) {
    items.push({
      id: 'action-5',
      priority: 'low',
      title: 'Review All Debts Regularly',
      description: `You have ${debts.length} active debts. Review them monthly to ensure you're following your payoff strategy.`,
      action: 'Set a monthly reminder to review your debt payoff progress',
      impact: 'Helps you stay on track and adjust strategy as needed',
    });
  }

  // Low priority: Emergency fund while paying debt
  const monthlyInterest = debts.reduce((sum, d) => {
    return sum + (d.currentBalance * d.interestRate) / 100 / 12;
  }, 0);
  if (monthlyInterest > 200) {
    items.push({
      id: 'action-6',
      priority: 'low',
      title: 'Balance Debt Payoff with Emergency Fund',
      description: `You're paying $${monthlyInterest.toFixed(2)}/month in interest. Consider building a small emergency fund while paying debt.`,
      action: 'Save $500-1000 emergency fund, then focus extra payments on debt',
      impact: 'Prevents taking on new debt if unexpected expenses arise',
    });
  }

  return items.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Calculate debt payoff timeline
 */
export function calculatePayoffTimeline(
  debts: Debt[],
  strategy: 'avalanche' | 'snowball',
  extraPayment: number = 0
): { month: number; totalDebt: number; totalInterestPaid: number }[] {
  const plan = generatePayoffPlan(debts, strategy, extraPayment);
  const timeline: { month: number; totalDebt: number; totalInterestPaid: number }[] = [];
  
  const monthlyDebt = new Map<number, number>();
  const monthlyInterest = new Map<number, number>();
  
  plan.payments.forEach(payment => {
    const existingDebt = monthlyDebt.get(payment.month) || 0;
    const existingInterest = monthlyInterest.get(payment.month) || 0;
    
    monthlyDebt.set(payment.month, existingDebt + payment.remainingBalance);
    monthlyInterest.set(payment.month, existingInterest + payment.totalInterestPaid);
  });
  
  for (let month = 1; month <= plan.totalMonths; month++) {
    timeline.push({
      month,
      totalDebt: monthlyDebt.get(month) || 0,
      totalInterestPaid: monthlyInterest.get(month) || 0,
    });
  }
  
  return timeline;
}

