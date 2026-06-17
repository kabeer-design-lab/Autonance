import type { CategoryName } from './theme';

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: TransactionType;
  category: CategoryName;
  description: string;       // shows as row title
  payee: string | null;      // shows as row subtitle
  paymentMode: string | null;
  occurredAt: string;        // ISO date YYYY-MM-DD
  source: 'whatsapp' | 'app';
}

export interface NewTransaction {
  amount: number;
  type: TransactionType;
  category: CategoryName;
  description: string;
  payee?: string | null;
  occurredAt: string;
}

// Maps a Supabase `transactions` row to our app Transaction shape.
export function rowToTransaction(row: any): Transaction {
  return {
    id: String(row.id),
    amount: Number(row.amount),
    currency: row.currency ?? '₹',
    type: row.type,
    category: row.category,
    description: row.description ?? '',
    payee: row.payee ?? null,
    paymentMode: row.payment_mode ?? null,
    occurredAt: (row.occurred_at ?? '').slice(0, 10),
    source: row.source ?? 'app',
  };
}
