import type { Debt, PayoffStrategy } from '../types';

/**
 * Calculate payoff strategy using the Avalanche method (highest interest first)
 */
export function calculateAvalancheStrategy(
  debts: Debt[],
  extraPayment: number = 0
): PayoffStrategy {
  // Sort by interest rate (highest first)
  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  
  let totalInterest = 0;
  let totalPayments = 0;
  let maxMonths = 0;
  const order: string[] = [];
  let availableExtra = extraPayment;
  
  // Calculate payoff for each debt in order
  for (const debt of sortedDebts) {
    order.push(debt.id);
    const monthlyRate = debt.interestRate / 100 / 12;
    let balance = debt.currentBalance;
    let debtInterest = 0;
    let debtMonths = 0;
    const payment = debt.minimumPayment + (debtMonths === 0 ? availableExtra : 0);
    
    while (balance > 0.01) {
      const interest = balance * monthlyRate;
      debtInterest += interest;
      const principalPayment = Math.min(payment - interest, balance);
      balance -= principalPayment;
      debtMonths++;
      
      if (debtMonths > 600) break; // Safety limit (50 years)
    }
    
    totalInterest += debtInterest;
    totalPayments += debt.currentBalance + debtInterest;
    maxMonths = Math.max(maxMonths, debtMonths);
    
    // After paying off, add minimum payment to available extra for next debt
    availableExtra += debt.minimumPayment;
  }
  
  const totalMinimumPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const monthlyPayment = totalMinimumPayments + extraPayment;
  
  return {
    name: 'Avalanche Method',
    description: 'Pay off debts with highest interest rates first to minimize total interest paid.',
    order,
    totalInterest,
    totalPayments,
    monthsToPayoff: maxMonths,
    monthlyPayment,
  };
}

/**
 * Calculate payoff strategy using the Snowball method (lowest balance first)
 */
export function calculateSnowballStrategy(
  debts: Debt[],
  extraPayment: number = 0
): PayoffStrategy {
  // Sort by balance (lowest first)
  const sortedDebts = [...debts].sort((a, b) => a.currentBalance - b.currentBalance);
  
  let totalInterest = 0;
  let totalPayments = 0;
  let maxMonths = 0;
  const order: string[] = [];
  let availableExtra = extraPayment;
  
  // Calculate payoff for each debt in order
  for (const debt of sortedDebts) {
    order.push(debt.id);
    const monthlyRate = debt.interestRate / 100 / 12;
    let balance = debt.currentBalance;
    let debtInterest = 0;
    let debtMonths = 0;
    const payment = debt.minimumPayment + (debtMonths === 0 ? availableExtra : 0);
    
    while (balance > 0.01) {
      const interest = balance * monthlyRate;
      debtInterest += interest;
      const principalPayment = Math.min(payment - interest, balance);
      balance -= principalPayment;
      debtMonths++;
      
      if (debtMonths > 600) break; // Safety limit
    }
    
    totalInterest += debtInterest;
    totalPayments += debt.currentBalance + debtInterest;
    maxMonths = Math.max(maxMonths, debtMonths);
    
    // After paying off, add minimum payment to available extra for next debt
    availableExtra += debt.minimumPayment;
  }
  
  const totalMinimumPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const monthlyPayment = totalMinimumPayments + extraPayment;
  
  return {
    name: 'Snowball Method',
    description: 'Pay off smallest debts first for psychological wins and momentum.',
    order,
    totalInterest,
    totalPayments,
    monthsToPayoff: maxMonths,
    monthlyPayment,
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

