import { createClient } from '@supabase/supabase-js';
import { ParsedTransaction } from '../types';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export async function getUserByPhone(phone: string) {
  // Meta sends numbers without +, app stores them with +. Normalise both ways.
  const withPlus = phone.startsWith('+') ? phone : `+${phone}`;
  const withoutPlus = phone.startsWith('+') ? phone.slice(1) : phone;

  const { data } = await supabase
    .from('whatsapp_links')
    .select('user_id, workspace_id')
    .or(`phone.eq.${withPlus},phone.eq.${withoutPlus}`)
    .single();
  return data;
}

export async function insertTransaction(
  workspaceId: string,
  userId: string,
  parsed: ParsedTransaction,
  rawMessage: string,
  source: 'whatsapp' | 'app' = 'whatsapp',
) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      amount: parsed.amount,
      currency: parsed.currency,
      type: parsed.type,
      category: parsed.category,
      description: parsed.description,
      payee: parsed.payee,
      payment_mode: parsed.paymentMode,
      occurred_at: parsed.date,
      source,
      raw_message: rawMessage,
      parser_confidence: parsed.confidence,
    })
    .select()
    .single();

  if (error) throw new Error(`DB insert failed: ${error.message}`);
  return data;
}

export async function getMonthlySummary(workspaceId: string, year: number, month: number) {
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const to = `${year}-${String(month).padStart(2, '0')}-31`;

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount, category')
    .eq('workspace_id', workspaceId)
    .gte('occurred_at', from)
    .lte('occurred_at', to);

  if (error) throw new Error(`DB query failed: ${error.message}`);

  const rows = data || [];
  const totalIncome = rows.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0);
  const totalExpense = rows.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0);

  const byCategory: Record<string, number> = {};
  rows.filter(r => r.type === 'expense').forEach(r => {
    byCategory[r.category] = (byCategory[r.category] || 0) + Number(r.amount);
  });

  return { totalIncome, totalExpense, byCategory, transactionCount: rows.length };
}
