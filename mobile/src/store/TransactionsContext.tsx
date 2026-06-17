import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Transaction, NewTransaction } from '../types';
import { rowToTransaction } from '../types';
import { fetchTransactions, insertTransactionRow, deleteTransactionRow } from '../lib/db';
import { supabase } from '../lib/supabase';
import { useSession } from './SessionContext';

const CACHE_KEY = '@autonance/transactions_cache';

interface TransactionsContextValue {
  transactions: Transaction[];
  loading: boolean;
  syncing: boolean;
  error: string | null;
  addTransaction: (input: NewTransaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const txRef = useRef<Transaction[]>([]);
  txRef.current = transactions;

  const setAndCache = useCallback(async (next: Transaction[]) => {
    setTransactions(next);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next));
  }, []);

  // Load cache instantly, then fetch fresh from Supabase.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (!cancelled && cached) {
        setTransactions(JSON.parse(cached));
        setLoading(false);
      }

      if (!session) return;

      try {
        setSyncing(true);
        const fresh = await fetchTransactions(session);
        if (!cancelled) await setAndCache(fresh);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) {
          setSyncing(false);
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [session, setAndCache]);

  // Realtime subscription — new rows from WhatsApp appear instantly.
  useEffect(() => {
    if (!session) return;
    const channel = supabase
      .channel(`tx:${session.workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `workspace_id=eq.${session.workspaceId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const t = rowToTransaction(payload.new);
            // Skip if already present (we inserted it ourselves)
            if (txRef.current.find((x) => x.id === t.id)) return;
            setAndCache([t, ...txRef.current]);
          } else if (payload.eventType === 'DELETE') {
            const id = String((payload.old as any).id);
            setAndCache(txRef.current.filter((x) => x.id !== id));
          } else if (payload.eventType === 'UPDATE') {
            const t = rowToTransaction(payload.new);
            setAndCache(txRef.current.map((x) => (x.id === t.id ? t : x)));
          }
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session, setAndCache]);

  const addTransaction = useCallback(async (input: NewTransaction) => {
    if (!session) throw new Error('No session');
    // Optimistic insert
    const tempId = `temp_${Date.now()}`;
    const optimistic: Transaction = {
      id: tempId,
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
    await setAndCache([optimistic, ...txRef.current]);

    try {
      const saved = await insertTransactionRow(session, input);
      // Swap optimistic row with real one
      await setAndCache(txRef.current.map((x) => (x.id === tempId ? saved : x)));
    } catch (e: any) {
      // Roll back on failure
      await setAndCache(txRef.current.filter((x) => x.id !== tempId));
      throw e;
    }
  }, [session, setAndCache]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!session) throw new Error('No session');
    const snapshot = txRef.current;
    await setAndCache(snapshot.filter((x) => x.id !== id));
    try {
      await deleteTransactionRow(session, id);
    } catch (e: any) {
      // Roll back on failure
      await setAndCache(snapshot);
      throw e;
    }
  }, [session, setAndCache]);

  const refresh = useCallback(async () => {
    if (!session) return;
    setSyncing(true);
    try {
      const fresh = await fetchTransactions(session);
      await setAndCache(fresh);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  }, [session, setAndCache]);

  return (
    <TransactionsContext.Provider
      value={{ transactions, loading, syncing, error, addTransaction, deleteTransaction, refresh }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error('useTransactions must be used inside TransactionsProvider');
  return ctx;
}
