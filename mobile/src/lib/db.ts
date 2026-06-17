import { supabase } from './supabase';
import { rowToTransaction, type Transaction, type NewTransaction } from '../types';
import type { SessionInfo } from './auth';

/** Fetch the user's transactions, newest first. */
export async function fetchTransactions(session: SessionInfo, limit = 500): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('workspace_id', session.workspaceId)
    .order('occurred_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Fetch failed: ${error.message}`);
  return (data ?? []).map(rowToTransaction);
}

/** Insert a transaction. Returns the persisted row mapped to a Transaction. */
export async function insertTransactionRow(
  session: SessionInfo,
  input: NewTransaction,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      workspace_id: session.workspaceId,
      user_id: session.userId,
      amount: input.amount,
      currency: 'INR',
      type: input.type,
      category: input.category,
      description: input.description,
      payee: input.payee ?? null,
      occurred_at: input.occurredAt,
      source: 'app',
    })
    .select('*')
    .single();
  if (error) throw new Error(`Insert failed: ${error.message}`);
  return rowToTransaction(data);
}

export async function deleteTransactionRow(session: SessionInfo, id: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('workspace_id', session.workspaceId);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}
