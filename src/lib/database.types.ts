// Database types for Supabase
// These should match your Supabase database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string
          user_id: string
          category: 'bill' | 'loan' | 'credit_card' | 'other'
          name: string
          amount: number
          due_date: string
          is_recurring: boolean
          recurring_frequency: 'monthly' | 'weekly' | 'yearly' | null
          is_paid: boolean
          paid_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: 'bill' | 'loan' | 'credit_card' | 'other'
          name: string
          amount: number
          due_date: string
          is_recurring?: boolean
          recurring_frequency?: 'monthly' | 'weekly' | 'yearly' | null
          is_paid?: boolean
          paid_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: 'bill' | 'loan' | 'credit_card' | 'other'
          name?: string
          amount?: number
          due_date?: string
          is_recurring?: boolean
          recurring_frequency?: 'monthly' | 'weekly' | 'yearly' | null
          is_paid?: boolean
          paid_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      income: {
        Row: {
          id: string
          user_id: string
          category: 'salary' | 'bonus' | 'freelance' | 'investment_returns' | 'other'
          name: string
          amount: number
          date: string
          is_recurring: boolean
          recurring_frequency: 'monthly' | 'weekly' | 'yearly' | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: 'salary' | 'bonus' | 'freelance' | 'investment_returns' | 'other'
          name: string
          amount: number
          date: string
          is_recurring?: boolean
          recurring_frequency?: 'monthly' | 'weekly' | 'yearly' | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: 'salary' | 'bonus' | 'freelance' | 'investment_returns' | 'other'
          name?: string
          amount?: number
          date?: string
          is_recurring?: boolean
          recurring_frequency?: 'monthly' | 'weekly' | 'yearly' | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      investments: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'crypto' | 'real_estate' | 'other'
          symbol: string | null
          quantity: number
          purchase_price: number
          current_price: number
          purchase_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'crypto' | 'real_estate' | 'other'
          symbol?: string | null
          quantity: number
          purchase_price: number
          current_price: number
          purchase_date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'crypto' | 'real_estate' | 'other'
          symbol?: string | null
          quantity?: number
          purchase_price?: number
          current_price?: number
          purchase_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

