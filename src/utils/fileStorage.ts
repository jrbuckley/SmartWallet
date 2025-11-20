// File storage utilities for persisting data to local files
// Uses File System Access API when available, falls back to download/upload

import type { Expense, Investment, User } from '../types';

export interface FinancialData {
  user: User | null;
  expenses: Expense[];
  investments: Investment[];
}

const DEFAULT_FILENAME = 'smartwallet-data.json';

/**
 * Save data to a file using File System Access API (if available)
 * Falls back to downloading the file
 */
export async function saveDataToFile(data: FinancialData): Promise<boolean> {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Try File System Access API (Chrome, Edge, Opera)
    if ('showSaveFilePicker' in window) {
      try {
        // @ts-ignore - File System Access API types may not be available
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: DEFAULT_FILENAME,
          types: [{
            description: 'JSON files',
            accept: { 'application/json': ['.json'] },
          }],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      } catch (error: any) {
        // User cancelled the save dialog
        if (error.name !== 'AbortError') {
          console.error('Error saving file:', error);
        }
        return false;
      }
    }

    // Fallback: Download file
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = DEFAULT_FILENAME;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error saving data to file:', error);
    return false;
  }
}

/**
 * Load data from a file using File System Access API (if available)
 * Falls back to file input
 */
export async function loadDataFromFile(): Promise<FinancialData | null> {
  return new Promise((resolve) => {
    // Try File System Access API
    if ('showOpenFilePicker' in window) {
      // @ts-ignore - File System Access API types may not be available
      window.showOpenFilePicker({
        types: [{
          description: 'JSON files',
          accept: { 'application/json': ['.json'] },
        }],
        multiple: false,
      })
        .then(async ([fileHandle]) => {
          const file = await fileHandle.getFile();
          const text = await file.text();
          try {
            const data = JSON.parse(text);
            resolve(data);
          } catch (error) {
            console.error('Error parsing file:', error);
            resolve(null);
          }
        })
        .catch((error: any) => {
          // User cancelled
          if (error.name !== 'AbortError') {
            console.error('Error loading file:', error);
          }
          resolve(null);
        });
    } else {
      // Fallback: Use file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const text = event.target?.result as string;
              const data = JSON.parse(text);
              resolve(data);
            } catch (error) {
              console.error('Error parsing file:', error);
              resolve(null);
            }
          };
          reader.readAsText(file);
        } else {
          resolve(null);
        }
      };
      input.click();
    }
  });
}

/**
 * Export data as JSON string (for manual copy/paste or other uses)
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

