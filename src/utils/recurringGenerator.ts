import type { Expense, Income } from '../types';

/**
 * Generate recurring expenses based on frequency
 * Creates new expense instances for recurring items that are due
 */
export function generateRecurringExpenses(
  existingExpenses: Expense[],
  addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
): Promise<void> {
  const now = new Date();
  const promises: Promise<void>[] = [];

  for (const expense of existingExpenses) {
    if (!expense.isRecurring || !expense.recurringFrequency) continue;

    // Find the most recent instance of this recurring expense
    const sameRecurringExpenses = existingExpenses.filter(
      e => e.name === expense.name &&
           e.category === expense.category &&
           e.isRecurring &&
           e.recurringFrequency === expense.recurringFrequency
    );

    // Get the latest due date for this recurring expense
    const latestDueDate = sameRecurringExpenses.reduce((latest, e) => {
      return e.dueDate > latest ? e.dueDate : latest;
    }, expense.dueDate);

    // For semi-monthly, create all instances from the original entry date up to today
    // For example, if you entered Nov 1 and today is Nov 20, create Nov 1 and Nov 15
    // But don't create Oct dates or any dates before the original entry
    if (expense.recurringFrequency === 'semimonthly') {
      // Start from the ORIGINAL entry date (not latestDueDate, to avoid going backwards)
      const originalDate = new Date(expense.dueDate);
      const originalYear = originalDate.getFullYear();
      const originalMonth = originalDate.getMonth();
      
      // Start checking from the month of the original entry
      let checkDate = new Date(originalYear, originalMonth, 1);
      checkDate.setHours(0, 0, 0, 0);
      
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Generate all semi-monthly dates from original entry month up to today
      while (checkDate.getFullYear() < currentYear || 
             (checkDate.getFullYear() === currentYear && checkDate.getMonth() <= currentMonth)) {
        const year = checkDate.getFullYear();
        const month = checkDate.getMonth();
        
        // Check both the 1st and 15th of each month
        const datesToCheck = [
          new Date(year, month, 1),
          new Date(year, month, 15),
        ];
        
        for (const dateToCheck of datesToCheck) {
          // Only create if:
          // 1. The date is on or before today (not future)
          // 2. The date is on or after the original entry date (don't go backwards)
          if (dateToCheck <= now && dateToCheck >= originalDate) {
            // Check if this instance already exists
            const alreadyExists = existingExpenses.some(
              e => e.name === expense.name &&
                   e.category === expense.category &&
                   e.dueDate.getTime() === dateToCheck.getTime() &&
                   e.isRecurring &&
                   e.recurringFrequency === expense.recurringFrequency
            );
            
            if (!alreadyExists) {
              promises.push(
                addExpense({
                  name: expense.name,
                  category: expense.category,
                  amount: expense.amount,
                  dueDate: dateToCheck,
                  isRecurring: true,
                  recurringFrequency: expense.recurringFrequency,
                  isPaid: false,
                  notes: expense.notes,
                })
              );
            }
          }
        }
        
        // Move to next month
        checkDate.setMonth(checkDate.getMonth() + 1);
        checkDate.setDate(1);
        
        // Safety check: don't go beyond current month
        if (checkDate.getFullYear() > currentYear || 
            (checkDate.getFullYear() === currentYear && checkDate.getMonth() > currentMonth)) {
          break;
        }
      }
    } else {
      // For other frequencies (weekly, bi-weekly, monthly, yearly), use the standard logic
      // But ensure we don't create dates before the original entry date
      const originalDate = new Date(expense.dueDate);
      const shouldCreate = shouldCreateRecurringItem(latestDueDate, expense.recurringFrequency, now);

      if (shouldCreate) {
        // Calculate how many instances to create (in case user hasn't opened app in a while)
        const instancesToCreate = calculateInstancesToCreate(
          latestDueDate,
          expense.recurringFrequency,
          now
        );

        let nextDueDate = new Date(latestDueDate);
        for (let i = 0; i < instancesToCreate; i++) {
          nextDueDate = getNextDueDate(nextDueDate, expense.recurringFrequency);
          
          // Only create if the date is on or before today (not future)
          // and on or after the original entry date (don't go backwards)
          if (nextDueDate <= now && nextDueDate >= originalDate) {
            // Check if this instance already exists
            const alreadyExists = existingExpenses.some(
              e => e.name === expense.name &&
                   e.category === expense.category &&
                   e.dueDate.getTime() === nextDueDate.getTime() &&
                   e.isRecurring &&
                   e.recurringFrequency === expense.recurringFrequency
            );

            if (!alreadyExists) {
              promises.push(
                addExpense({
                  name: expense.name,
                  category: expense.category,
                  amount: expense.amount,
                  dueDate: nextDueDate,
                  isRecurring: true,
                  recurringFrequency: expense.recurringFrequency,
                  isPaid: false,
                  notes: expense.notes,
                })
              );
            }
          }
        }
      }
    }
  }

  return Promise.all(promises).then(() => {});
}

/**
 * Generate recurring income based on frequency
 */
export function generateRecurringIncome(
  existingIncome: Income[],
  addIncome: (income: Omit<Income, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
): Promise<void> {
  const now = new Date();
  const promises: Promise<void>[] = [];

  // Group recurring income by unique key (name + category + frequency)
  // This ensures we only process each unique recurring income once
  const recurringIncomeMap = new Map<string, Income[]>();
  
  for (const incomeItem of existingIncome) {
    if (!incomeItem.isRecurring || !incomeItem.recurringFrequency) continue;
    
    const key = `${incomeItem.name}|${incomeItem.category}|${incomeItem.recurringFrequency}`;
    if (!recurringIncomeMap.has(key)) {
      recurringIncomeMap.set(key, []);
    }
    recurringIncomeMap.get(key)!.push(incomeItem);
  }

  // Process each unique recurring income only once
  for (const sameRecurringIncome of recurringIncomeMap.values()) {
    // Find the EARLIEST original entry date (not latest)
    // This is the date the user originally created the recurring income
    const originalEntry = sameRecurringIncome.reduce((earliest, i) => {
      return i.date < earliest.date ? i : earliest;
    });
    
    // Skip if no recurring frequency (shouldn't happen, but TypeScript safety)
    if (!originalEntry.recurringFrequency) continue;
    
    const originalDate = new Date(originalEntry.date);
    originalDate.setHours(0, 0, 0, 0);
    const originalYear = originalDate.getFullYear();
    const originalMonth = originalDate.getMonth();
    const originalDay = originalDate.getDate();
    
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    // Get all existing dates for this recurring income (normalized to dates only)
    const existingDates = new Set(
      sameRecurringIncome.map(i => {
        const d = new Date(i.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );

    // For semi-monthly, create the next instance if it doesn't exist
    // If you enter Nov 1, it should create Nov 15 (the other semi-monthly date in that month)
    // Only create dates that are on or before today (not future dates)
    if (originalEntry.recurringFrequency === 'semimonthly') {
      // Determine the other semi-monthly date in the same month as the original entry
      let nextSemiMonthlyDate: Date | null = null;
      
      if (originalDay <= 15) {
        // If original is on 1st-15th, the other date is the 15th of the same month
        nextSemiMonthlyDate = new Date(originalYear, originalMonth, 15);
      } else {
        // If original is on 16th-31st, the other date is the 1st of next month
        nextSemiMonthlyDate = new Date(originalYear, originalMonth + 1, 1);
      }
      nextSemiMonthlyDate.setHours(0, 0, 0, 0);
      
      // Only create the next semi-monthly date if:
      // 1. It's on or before today (not future)
      // 2. It doesn't already exist
      // 3. It's NOT the same as the original date (don't recreate the original)
      if (nextSemiMonthlyDate <= today && 
          nextSemiMonthlyDate.getTime() !== originalDate.getTime() &&
          !existingDates.has(nextSemiMonthlyDate.getTime())) {
        promises.push(
          addIncome({
            name: originalEntry.name,
            category: originalEntry.category,
            amount: originalEntry.amount,
            date: nextSemiMonthlyDate,
            isRecurring: true,
            recurringFrequency: originalEntry.recurringFrequency,
            notes: originalEntry.notes,
          })
        );
        // Add to existing dates to prevent duplicates in the same run
        existingDates.add(nextSemiMonthlyDate.getTime());
      }
      
      // Also create any past instances from the month AFTER the original entry up to today
      // This handles cases where the user hasn't opened the app in a while
      // But only if the original date is in the past or today
      if (originalDate <= today) {
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        
        // Start from the month after the original entry (we already handled the same month above)
        // Ensure we never go before the original month
        let checkDate = new Date(originalYear, originalMonth + 1, 1);
        checkDate.setHours(0, 0, 0, 0);
        
        // Generate all semi-monthly dates from the month after original entry up to today
        while (checkDate.getFullYear() < currentYear || 
               (checkDate.getFullYear() === currentYear && checkDate.getMonth() <= currentMonth)) {
          const year = checkDate.getFullYear();
          const month = checkDate.getMonth();
          
          // Safety check: never process the month before the original entry
          if (year < originalYear || (year === originalYear && month < originalMonth)) {
            checkDate.setMonth(checkDate.getMonth() + 1);
            checkDate.setDate(1);
            continue;
          }
          
          // Check both the 1st and 15th of each month
          const datesToCheck = [
            new Date(year, month, 1),
            new Date(year, month, 15),
          ];
          
          for (const dateToCheck of datesToCheck) {
            dateToCheck.setHours(0, 0, 0, 0);
            
            // Only create if:
            // 1. The date is on or before today (not future)
            // 2. The date is STRICTLY after the original date (don't go backwards or recreate original)
            // 3. It doesn't already exist
            if (dateToCheck <= today && 
                dateToCheck > originalDate &&  // Use > instead of >= to ensure we never create the original
                !existingDates.has(dateToCheck.getTime())) {
              promises.push(
                addIncome({
                  name: originalEntry.name,
                  category: originalEntry.category,
                  amount: originalEntry.amount,
                  date: dateToCheck,
                  isRecurring: true,
                  recurringFrequency: originalEntry.recurringFrequency,
                  notes: originalEntry.notes,
                })
              );
              // Add to existing dates to prevent duplicates in the same run
              existingDates.add(dateToCheck.getTime());
            }
          }
          
          // Move to next month
          checkDate.setMonth(checkDate.getMonth() + 1);
          checkDate.setDate(1);
          
          // Safety check: don't go beyond current month
          if (checkDate.getFullYear() > currentYear || 
              (checkDate.getFullYear() === currentYear && checkDate.getMonth() > currentMonth)) {
            break;
          }
        }
      }
    } else {
      // For other frequencies (weekly, bi-weekly, monthly, yearly), use the standard logic
      // But ensure we don't create dates before the original entry date
      const latestDate = sameRecurringIncome.reduce((latest, i) => {
        return i.date > latest ? i.date : latest;
      }, originalEntry.date);
      
      const originalDate = new Date(originalEntry.date);
      originalDate.setHours(0, 0, 0, 0);
      
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const shouldCreate = shouldCreateRecurringItem(latestDate, originalEntry.recurringFrequency, now);

      if (shouldCreate) {
        // Calculate how many instances to create
        const instancesToCreate = calculateInstancesToCreate(
          latestDate,
          originalEntry.recurringFrequency,
          now
        );

        let nextDate = new Date(latestDate);
        for (let i = 0; i < instancesToCreate; i++) {
          nextDate = getNextDueDate(nextDate, originalEntry.recurringFrequency);
          nextDate.setHours(0, 0, 0, 0);
          
          // Only create if the date is on or before today (not future)
          // and on or after the original entry date (don't go backwards)
          if (nextDate <= today && nextDate >= originalDate) {
            // Check if this instance already exists (compare dates ignoring time)
            const alreadyExists = existingDates.has(nextDate.getTime());

            if (!alreadyExists) {
              promises.push(
                addIncome({
                  name: originalEntry.name,
                  category: originalEntry.category,
                  amount: originalEntry.amount,
                  date: nextDate,
                  isRecurring: true,
                  recurringFrequency: originalEntry.recurringFrequency,
                  notes: originalEntry.notes,
                })
              );
              // Add to existing dates to prevent duplicates in the same run
              existingDates.add(nextDate.getTime());
            }
          }
        }
      }
    }
  }

  return Promise.all(promises).then(() => {});
}

/**
 * Check if a recurring item should be created based on its frequency and current date
 */
function shouldCreateRecurringItem(
  lastDate: Date,
  frequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'yearly',
  now: Date
): boolean {
  const nextDate = getNextDueDate(lastDate, frequency);
  return nextDate <= now;
}

/**
 * Calculate how many instances should be created (handles cases where user hasn't opened app in a while)
 */
function calculateInstancesToCreate(
  lastDate: Date,
  frequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'yearly',
  now: Date
): number {
  let count = 0;
  let currentDate = new Date(lastDate);

  while (true) {
    currentDate = getNextDueDate(currentDate, frequency);
    if (currentDate > now) break;
    count++;
    // Safety limit: don't create more than 12 months worth at once
    if (count >= 12) break;
  }

  return count;
}

/**
 * Get the next due date based on frequency
 */
function getNextDueDate(currentDate: Date, frequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'yearly'): Date {
  const next = new Date(currentDate);
  
  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'semimonthly':
      // Semi-monthly: typically 1st and 15th of each month
      const dayOfMonth = next.getDate();
      if (dayOfMonth < 15) {
        // If before 15th, next payment is on the 15th
        next.setDate(15);
      } else {
        // If on or after 15th, next payment is 1st of next month
        next.setMonth(next.getMonth() + 1);
        next.setDate(1);
      }
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  
  return next;
}

