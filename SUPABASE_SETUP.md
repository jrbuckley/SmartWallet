# Supabase Setup Guide

This guide will help you set up Supabase for your SmartWallet application.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - **Name**: SmartWallet (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the closest region to you
4. Click "Create new project" and wait for it to be ready (2-3 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (this is your `VITE_SUPABASE_URL`)
   - **anon/public key** (this is your `VITE_SUPABASE_ANON_KEY`)

## Step 3: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace the placeholder values:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Create Database Tables

### For New Databases

Run the following SQL in your Supabase SQL Editor (Dashboard → SQL Editor):

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('bill', 'loan', 'credit_card', 'other')),
  name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('monthly', 'weekly', 'biweekly', 'semimonthly', 'yearly')),
  is_paid BOOLEAN DEFAULT FALSE,
  paid_date TIMESTAMPTZ,
  budget_id TEXT REFERENCES budgets(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create income table
CREATE TABLE IF NOT EXISTS income (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('salary', 'bonus', 'freelance', 'investment_returns', 'other')),
  name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('monthly', 'weekly', 'biweekly', 'semimonthly', 'yearly')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create debts table
CREATE TABLE IF NOT EXISTS debts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('personal_loan', 'car_loan', 'student_loan', 'credit_card', 'mortgage', 'other')),
  name TEXT NOT NULL,
  principal_amount DECIMAL(10, 2) NOT NULL,
  current_balance DECIMAL(10, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  minimum_payment DECIMAL(10, 2) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stock', 'bond', 'mutual_fund', 'etf', 'crypto', 'real_estate', 'other')),
  symbol TEXT,
  quantity DECIMAL(10, 4) NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  current_price DECIMAL(10, 2) NOT NULL,
  purchase_date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create savings_goals table
CREATE TABLE IF NOT EXISTS savings_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('emergency_fund', 'vacation', 'home', 'car', 'education', 'retirement', 'debt_payoff', 'other')),
  target_amount DECIMAL(10, 2) NOT NULL,
  current_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  target_date TIMESTAMPTZ,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('dining_out', 'food_delivery', 'shopping', 'entertainment', 'hobbies', 'subscriptions', 'personal_care', 'travel', 'other')),
  monthly_limit DECIMAL(10, 2) NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('monthly', 'weekly')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create budget_entries table for manual spending tracking
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_due_date ON expenses(due_date);
CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_income_date ON income(date);
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_interest_rate ON debts(interest_rate);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_budget_id ON expenses(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_entries_user_id ON budget_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_entries_budget_id ON budget_entries(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_entries_date ON budget_entries(date);
```

### For Existing Databases (Migration)

If you already have tables created and are adding budget tracking features, run this migration script instead:

```sql
-- Migration script for budget tracking features
-- Run this in Supabase SQL Editor if you already have existing tables

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
```

**Note**: This migration script safely handles existing tables by:
- Checking if columns exist before adding them
- Using `CREATE TABLE IF NOT EXISTS` for new tables
- Using `CREATE INDEX IF NOT EXISTS` with conditional checks

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create policies for single-user mode
-- Allow all operations for the default user (you can modify this later for multi-user)
CREATE POLICY "Allow all for default user" ON users
  FOR ALL USING (true);

CREATE POLICY "Allow all for default user expenses" ON expenses
  FOR ALL USING (user_id = 'user-1');

CREATE POLICY "Allow all for default user income" ON income
  FOR ALL USING (user_id = 'user-1');

CREATE POLICY "Allow all for default user debts" ON debts
  FOR ALL USING (user_id = 'user-1');

CREATE POLICY "Allow all for default user investments" ON investments
  FOR ALL USING (user_id = 'user-1');

CREATE POLICY "Allow all for default user savings_goals" ON savings_goals
  FOR ALL USING (user_id = 'user-1');

CREATE POLICY "Allow all for default user budgets" ON budgets
  FOR ALL USING (user_id = 'user-1');
```

## Step 5: Verify Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser
3. Try adding an expense, income entry, debt, or investment
4. Check your Supabase dashboard → Table Editor to see if data appears

## Updating Existing Tables

If you've already created the tables and need to add new options (like `semimonthly` for recurring frequency), see `UPDATE_INCOME_TABLE.md` for migration instructions.

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure your `.env` file exists and has the correct values
- Restart your dev server after creating/updating `.env`
- Make sure variable names start with `VITE_` (required for Vite)

### "relation does not exist" error
- Make sure you've run all the SQL commands from Step 4
- Check that tables were created in the Table Editor

### "new row violates row-level security policy" error
- Make sure RLS policies are created correctly
- Check that the user_id matches 'user-1' (or update the policy)

### Data not appearing
- Check the browser console for errors
- Check Supabase logs (Dashboard → Logs)
- Verify your API keys are correct

## Future: Multi-User Support

When you're ready to add authentication:
1. Enable Supabase Auth in your project
2. Update the `DEFAULT_USER_ID` in `FinancialContext.tsx` to use the authenticated user's ID
3. Update RLS policies to use `auth.uid()` instead of hardcoded 'user-1'
4. Add authentication UI components

## Security Notes

- The `anon` key is safe to use in client-side code (it's public)
- RLS policies protect your data at the database level
- Never commit your `.env` file to git (it's already in `.gitignore`)

