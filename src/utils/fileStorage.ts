// File storage utilities for exporting/importing data as JSON backups
// Used for creating backups of Supabase data

import type { Expense, Investment, User } from '../types';

export interface FinancialData {
  user: User | null;
  expenses: Expense[];
  investments: Investment[];
}

/**
 * Export data as JSON string (for backup purposes)
 */
export function exportDataAsJSON(data: FinancialData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON string
 */
export function importDataFromJSON(jsonString: string): FinancialData | null {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}
