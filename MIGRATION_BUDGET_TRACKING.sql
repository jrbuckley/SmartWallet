-- Migration script for budget tracking features
-- Run this in Supabase SQL Editor if you already have existing tables
-- This script safely handles existing tables and won't cause errors if run multiple times

-- Step 1: Add budget_id column to expenses table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expenses' AND column_name = 'budget_id'
    ) THEN
        ALTER TABLE expenses ADD COLUMN budget_id TEXT REFERENCES budgets(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Step 2: Create budget_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS budget_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  budget_id TEXT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create indexes safely (only if columns/tables exist)
DO $$
BEGIN
    -- Only create index if budget_id column exists in expenses
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expenses' AND column_name = 'budget_id'
    ) THEN
        -- Check if index doesn't already exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'expenses' AND indexname = 'idx_expenses_budget_id'
        ) THEN
            CREATE INDEX idx_expenses_budget_id ON expenses(budget_id) WHERE budget_id IS NOT NULL;
        END IF;
    END IF;
    
    -- Only create indexes if budget_entries table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'budget_entries') THEN
        -- Check each index before creating
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'budget_entries' AND indexname = 'idx_budget_entries_user_id'
        ) THEN
            CREATE INDEX idx_budget_entries_user_id ON budget_entries(user_id);
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'budget_entries' AND indexname = 'idx_budget_entries_budget_id'
        ) THEN
            CREATE INDEX idx_budget_entries_budget_id ON budget_entries(budget_id);
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'budget_entries' AND indexname = 'idx_budget_entries_date'
        ) THEN
            CREATE INDEX idx_budget_entries_date ON budget_entries(date);
        END IF;
    END IF;
END $$;

