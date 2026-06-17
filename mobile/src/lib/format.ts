import type { Transaction } from '../types';
import type { CategoryName } from '../theme';

export function formatMoney(amount: number, currency = '₹'): string {
  return `${currency}${amount.toLocaleString('en-IN')}`;
}

// "Today" / "Yesterday" / "12 Jun 2026"
export function friendlyDate(iso: string): string {
  const today = new Date();
  const d = new Date(iso + 'T00:00:00');
  const diffDays = Math.round((startOfDay(today).getTime() - startOfDay(d).getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function startOfDay(d: Date): Date {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

export interface DateGroup {
  label: string;
  date: string;
  items: Transaction[];
}

// Groups transactions into date sections, newest first.
export function groupByDate(transactions: Transaction[]): DateGroup[] {
  const map = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const arr = map.get(t.occurredAt) ?? [];
    arr.push(t);
    map.set(t.occurredAt, arr);
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, items]) => ({ date, label: friendlyDate(date), items }));
}

export interface Summary {
  income: number;
  expense: number;
  balance: number;
  byCategory: { categoryName: CategoryName; amount: number }[];
}

// Computes income/expense/balance + per-category expense breakdown for a set of transactions.
export function summarize(transactions: Transaction[]): Summary {
  let income = 0;
  let expense = 0;
  const cat: Record<string, number> = {};

  for (const t of transactions) {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expense += t.amount;
      cat[t.category] = (cat[t.category] ?? 0) + t.amount;
    }
  }

  const byCategory = Object.entries(cat)
    .map(([categoryName, amount]) => ({ categoryName: categoryName as CategoryName, amount }))
    .sort((a, b) => b.amount - a.amount);

  return { income, expense, balance: income - expense, byCategory };
}

// Returns transactions within the current calendar month.
export function thisMonth(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return transactions.filter((t) => t.occurredAt.startsWith(prefix));
}

export const MONTH_LABEL = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
