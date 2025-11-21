import type { Debt, PayoffStrategy } from '../types';

/**
 * Calculate payoff strategy using the Avalanche method (highest interest first)
 * Correctly handles making minimum payments on all debts each month
 */
export function calculateAvalancheStrategy(
  debts: Debt[],
  extraPayment: number = 0
): PayoffStrategy {
  // Sort by interest rate (highest first) to determine priority
  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  const order = sortedDebts.map(d => d.id);
  
  // Initialize balances
  const balances = new Map<string, number>();
  debts.forEach(debt => {
    balances.set(debt.id, debt.currentBalance);
  });

  let month = 0;
  let totalInterest = 0;
  let availableExtra = extraPayment;

  // Continue until all debts are paid off
  while (true) {
    month++;
    
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
      
      // Update balance
      balances.set(debt.id, newBalance);
      
      totalInterest += interest;

      // If this debt was just paid off and it was the priority debt, roll its minimum into extra
      if (newBalance <= 0.01 && debt.id === priorityDebt.id) {
        availableExtra += debt.minimumPayment;
      }
    }

    // Safety limit
    if (month > 600) break;
  }

  const totalMinimumPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const totalPayments = debts.reduce((sum, d) => sum + d.currentBalance, 0) + totalInterest;

  return {
    name: 'Avalanche Method',
    description: 'Pay off debts with highest interest rates first to minimize total interest paid.',
    order,
    totalInterest,
    totalPayments,
    monthsToPayoff: month,
    monthlyPayment: totalMinimumPayments + extraPayment,
  };
}

/**
 * Calculate payoff strategy using the Snowball method (lowest balance first)
 * Correctly handles making minimum payments on all debts each month
 */
export function calculateSnowballStrategy(
  debts: Debt[],
  extraPayment: number = 0
): PayoffStrategy {
  // Sort by balance (lowest first) to determine priority
  const sortedDebts = [...debts].sort((a, b) => a.currentBalance - b.currentBalance);
  const order = sortedDebts.map(d => d.id);
  
  // Initialize balances
  const balances = new Map<string, number>();
  debts.forEach(debt => {
    balances.set(debt.id, debt.currentBalance);
  });

  let month = 0;
  let totalInterest = 0;
  let availableExtra = extraPayment;

  // Continue until all debts are paid off
  while (true) {
    month++;
    
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
      
      // Update balance
      balances.set(debt.id, newBalance);
      
      totalInterest += interest;

      // If this debt was just paid off and it was the priority debt, roll its minimum into extra
      if (newBalance <= 0.01 && debt.id === priorityDebt.id) {
        availableExtra += debt.minimumPayment;
      }
    }

    // Safety limit
    if (month > 600) break;
  }

  const totalMinimumPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const totalPayments = debts.reduce((sum, d) => sum + d.currentBalance, 0) + totalInterest;

  return {
    name: 'Snowball Method',
    description: 'Pay off smallest debts first for psychological wins and momentum.',
    order,
    totalInterest,
    totalPayments,
    monthsToPayoff: month,
    monthlyPayment: totalMinimumPayments + extraPayment,
  };
}

/**
 * Calculate minimum payment strategy (just paying minimums)
 */
export function calculateMinimumStrategy(debts: Debt[]): PayoffStrategy {
  let totalInterest = 0;
  let totalPayments = 0;
  let maxMonths = 0;
  
  for (const debt of debts) {
    const monthlyRate = debt.interestRate / 100 / 12;
    let balance = debt.currentBalance;
    let debtInterest = 0;
    let months = 0;
    
    while (balance > 0.01) {
      const interest = balance * monthlyRate;
      debtInterest += interest;
      const principalPayment = Math.min(debt.minimumPayment - interest, balance);
      balance -= principalPayment;
      months++;
      
      if (months > 600) break; // Safety limit
    }
    
    totalInterest += debtInterest;
    totalPayments += debt.currentBalance + debtInterest;
    maxMonths = Math.max(maxMonths, months);
  }
  
  const totalMinimumPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  
  return {
    name: 'Minimum Payments',
    description: 'Continue paying only minimum payments on all debts.',
    order: debts.map(d => d.id),
    totalInterest,
    totalPayments,
    monthsToPayoff: maxMonths,
    monthlyPayment: totalMinimumPayments,
  };
}

/**
 * Get recommended strategy (usually Avalanche for savings)
 */
export function getRecommendedStrategy(debts: Debt[], extraPayment: number = 0): PayoffStrategy {
  const avalanche = calculateAvalancheStrategy(debts, extraPayment);
  const snowball = calculateSnowballStrategy(debts, extraPayment);
  
  // Recommend the one with lower total interest
  return avalanche.totalInterest < snowball.totalInterest ? avalanche : snowball;
}

