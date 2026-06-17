import { parseExpense, LOW_CONFIDENCE_THRESHOLD } from './parseExpense';
import { insertTransaction, getMonthlySummary, getUserByPhone } from './db';
import { sendWhatsAppMessage, formatConfirmation, formatSummary } from './whatsapp';
import { WhatsAppMessage } from '../types';

const REPORT_KEYWORDS = /\b(summary|report|show|spent|spending|total|balance|how much|income|expense|this week|this month|today|yesterday|january|february|march|april|may|june|july|august|september|october|november|december)\b/i;
const TRANSACTION_PATTERN = /[\d,]+(\.\d+)?|₹|\$|£|€|inr|usd|eur|spent|paid|received|salary|bought|purchased|income|expense/i;
const HELP_KEYWORDS = /\b(help|hi|hello|start|commands|what can|how)\b/i;

export async function processMessage(msg: WhatsAppMessage): Promise<void> {
  const text = msg.text.trim();
  const lower = text.toLowerCase();

  // Route: help / greeting
  if (HELP_KEYWORDS.test(lower) && !TRANSACTION_PATTERN.test(text)) {
    await sendWhatsAppMessage(msg.from, helpText());
    return;
  }

  // Route: report/summary request
  if (REPORT_KEYWORDS.test(lower) && !TRANSACTION_PATTERN.test(text)) {
    await handleSummaryRequest(msg);
    return;
  }

  // Route: transaction (has amounts/keywords)
  if (TRANSACTION_PATTERN.test(text)) {
    await handleTransaction(msg);
    return;
  }

  // Fallback
  await sendWhatsAppMessage(msg.from, `I didn't understand that. Reply *help* to see what I can do.`);
}

async function handleTransaction(msg: WhatsAppMessage): Promise<void> {
  let parsed;
  try {
    parsed = await parseExpense(msg.text);
  } catch (err) {
    console.error('[parseExpense] error:', err);
    await sendWhatsAppMessage(msg.from, `Sorry, I couldn't read that. Try: "Spent 500 on lunch" or "Received 10000 salary".`);
    return;
  }

  // AI guardrail: ask for clarification if confidence is low
  if (parsed.confidence < LOW_CONFIDENCE_THRESHOLD) {
    await sendWhatsAppMessage(
      msg.from,
      `I'm not sure I understood correctly. Could you clarify?\n\nI read: *${parsed.type}* of *${parsed.currency} ${parsed.amount}* under *${parsed.category}*.\n\nIs that right? Reply *yes* to save or send the correct details.`,
    );
    return;
  }

  try {
    const link = await getUserByPhone(msg.from);
    if (!link) {
      await sendWhatsAppMessage(msg.from, `Your number isn't linked to an Autonance account yet. Open the app and connect WhatsApp from Settings.`);
      return;
    }

    await insertTransaction(link.workspace_id, link.user_id, parsed, msg.text);
    await sendWhatsAppMessage(msg.from, formatConfirmation(parsed.amount, parsed.currency, parsed.type, parsed.category, parsed.date, parsed.payee));
  } catch (err) {
    console.error('[handleTransaction] DB error:', err);
    await sendWhatsAppMessage(msg.from, `Saved to memory, but had trouble storing it. Please try again.`);
  }
}

async function handleSummaryRequest(msg: WhatsAppMessage): Promise<void> {
  try {
    const link = await getUserByPhone(msg.from);
    if (!link) {
      await sendWhatsAppMessage(msg.from, `Your number isn't linked to an Autonance account yet. Open the app and connect WhatsApp from Settings.`);
      return;
    }

    const now = new Date();
    const summary = await getMonthlySummary(link.workspace_id, now.getFullYear(), now.getMonth() + 1);
    await sendWhatsAppMessage(msg.from, formatSummary(summary.totalIncome, summary.totalExpense, summary.byCategory));
  } catch (err) {
    console.error('[handleSummaryRequest] error:', err);
    await sendWhatsAppMessage(msg.from, `Couldn't fetch your summary right now. Try again in a moment.`);
  }
}

function helpText(): string {
  return `👋 *Autonance* — track money by chatting!\n\n*Log an expense:*\n• Spent 500 on lunch\n• Paid 2000 for electricity\n• Bought groceries 350 at DMart\n\n*Log income:*\n• Received 50000 salary\n• Got paid 5000 from client\n\n*Get a summary:*\n• Summary\n• How much did I spend this month?\n\nTransactions sync to your Autonance app instantly.`;
}
