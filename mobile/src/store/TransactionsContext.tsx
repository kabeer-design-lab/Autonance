import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Transaction, NewTransaction } from '../types';
import type { CategoryName } from '../theme';

const STORAGE_KEY = '@autonance/transactions';

// Seed data so the app feels alive on first open.
function seed(): Transaction[] {
  const today = new Date();
  const d = (offset: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - offset);
    return dt.toISOString().slice(0, 10);
  };
  const t = (
    id: string, amount: number, type: Transaction['type'], category: CategoryName,
    description: string, payee: string | null, occurredAt: string,
    source: Transaction['source'] = 'app',
  ): Transaction => ({
    id, amount, currency: '₹', type, category, description, payee,
    paymentMode: null, occurredAt, source,
  });

  return [
    t('s1', 830, 'expense', 'Food', 'Swiggy Instamart', 'Groceries for the week', d(0), 'whatsapp'),
    t('s2', 60, 'expense', 'Transport', 'Auto rickshaw', 'To the office', d(0)),
    t('s3', 1299, 'expense', 'Entertainment', 'Netflix', 'Monthly plan', d(1)),
    t('s4', 420, 'expense', 'Transport', 'Ola', 'Ride to airport', d(2), 'whatsapp'),
    t('s5', 85000, 'income', 'Business', 'Salary', 'June payout from Razorpay', d(3)),
    t('s6', 2400, 'expense', 'Shopping', 'Myntra', 'New running shoes', d(4)),
    t('s7', 540, 'expense', 'Food', 'Blue Tokai', 'Coffee with Priya', d(5), 'whatsapp'),
    t('s8', 3200, 'expense', 'Bills', 'Electricity', 'BESCOM June bill', d(6)),
    t('s9', 150, 'expense', 'Health', 'Apollo Pharmacy', 'Vitamins', d(8)),
    t('s10', 5000, 'income', 'Other', 'Freelance', 'Logo design for a friend', d(10)),
  ];
}

interface TransactionsContextValue {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (input: NewTransaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from storage (or seed) on mount.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setTransactions(JSON.parse(raw));
        } else {
          const initial = seed();
          setTransactions(initial);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        }
      } catch {
        setTransactions(seed());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Transaction[]) => {
    setTransactions(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addTransaction = useCallback(async (input: NewTransaction) => {
    const tx: Transaction = {
      id: `t_${Date.now()}`,
      amount: input.amount,
      currency: '₹',
      type: input.type,
      category: input.category,
      description: input.description,
      payee: input.payee ?? null,
      paymentMode: null,
      occurredAt: input.occurredAt,
      source: 'app',
    };
    await persist([tx, ...transactions]);
  }, [transactions, persist]);

  const deleteTransaction = useCallback(async (id: string) => {
    await persist(transactions.filter((t) => t.id !== id));
  }, [transactions, persist]);

  return (
    <TransactionsContext.Provider value={{ transactions, loading, addTransaction, deleteTransaction }}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error('useTransactions must be used inside TransactionsProvider');
  return ctx;
}
