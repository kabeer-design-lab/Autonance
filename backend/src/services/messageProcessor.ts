import { parseExpense, parseReceiptImage, generateInsight, LOW_CONFIDENCE_THRESHOLD } from './parseExpense';
import {
  insertTransaction, getMonthlySummary, getTodaySummary,
  getWeeklySummary, getAllTimeSummary, getIncomeSources, getUserByPhone,
} from './db';
import {
  sendWhatsAppMessage, sendInteractiveButtons, sendListMessage,
  formatConfirmation, formatTodaySummary, formatWeeklySummary,
  formatMonthlySummary, formatBalance, downloadMedia,
} from './whatsapp';
import { WhatsAppMessage, ParsedTransaction } from '../types';

// ── Guardrail 1: Duplicate message dedup ─────────────────────────────────────
const SEEN_IDS = new Map<string, number>();
const DEDUP_TTL_MS = 2 * 60 * 1000;

function isDuplicate(messageId: string): boolean {
  const now = Date.now();
  for (const [id, ts] of SEEN_IDS) {
    if (now - ts > DEDUP_TTL_MS) SEEN_IDS.delete(id);
  }
  if (SEEN_IDS.has(messageId)) return true;
  SEEN_IDS.set(messageId, now);
  return false;
}

// ── Guardrail 2: Amount sanity ────────────────────────────────────────────────
const MAX_SANE_AMOUNT = 10_000_000;

function amountSanityCheck(amount: number): 'ok' | 'zero' | 'too_large' {
  if (amount <= 0)              return 'zero';
  if (amount > MAX_SANE_AMOUNT) return 'too_large';
  return 'ok';
}

// ── Button IDs ────────────────────────────────────────────────────────────────
const BTN_TODAY   = 'today';
const BTN_MONTH   = 'month';
const BTN_MORE    = 'more';
const BTN_WEEK    = 'week';
const BTN_BALANCE = 'balance';

const RE_HAS_AMOUNT    = /\d+|₹|\$|£|€/;
const RE_MONEY_KEYWORD = /\b(spent|paid|received|salary|bought|purchased|income|expense|transfer)\b/i;

// ── Deterministic intent detection ───────────────────────────────────────────
function detectIntent(text: string): string {
  const t = text.toLowerCase().trim();

  if (/^(hi|hello|hey|help|menu|start|commands)[\s?!.]*$/.test(t)) return 'HELP';

  // Income analysis — must come before TOP_SPENDING to avoid misrouting
  if (
    /\b(income|earn(ed)?|receiv(ed)?|got paid|salary|credit(ed)?)\b/.test(t) &&
    /\b(where|which|most|source|from|top|highest|breakdown|more)\b/.test(t)
  ) return 'TOP_INCOME';

  // Spending analysis
  if (
    /\b(where|which|most|top|highest|biggest|max(imum)?|more)\b/.test(t) &&
    /\b(spent|spend(ing)?|expens(e|es)|money|paid|cost|bought)\b/.test(t)
  ) return 'TOP_SPENDING';

  // Time-period reports (only when no amount present)
  if (!RE_HAS_AMOUNT.test(text)) {
    if (/\btoday\b/.test(t))                                                    return 'TODAY';
    if (/\b(this week|last week|7 days|weekly|week)\b/.test(t))                 return 'WEEK';
    if (/\b(balance|net worth|left|remaining|saved|overall|position)\b/.test(t)) return 'BALANCE';
    if (/\b(this month|monthly|month|summary|report|how much|spending|expenses?)\b/.test(t)) return 'MONTH';
  }

  // Transaction — has a number + money action word
  if (RE_HAS_AMOUNT.test(text) && RE_MONEY_KEYWORD.test(text)) return 'TRANSACTION';

  return 'UNKNOWN';
}

// ── Fallback reply — always sent when a handler crashes ──────────────────────
async function sendFallback(to: string, context: string): Promise<void> {
  console.error(`[fallback] sending fallback reply after error in: ${context}`);
  try {
    await sendInteractiveButtons(
      to,
      'Something went wrong on my end. Please try again.',
      [{ id: BTN_TODAY, title: '📊 Today' }, { id: BTN_MONTH, title: '📅 This Month' }, { id: BTN_MORE, title: '⚡ More' }],
    );
  } catch {
    // If even the fallback fails, at least we logged it
  }
}

// ── Main entry ────────────────────────────────────────────────────────────────
export async function processMessage(msg: WhatsAppMessage): Promise<void> {
  if (isDuplicate(msg.messageId)) {
    console.log(`[dedup] ignoring duplicate messageId=${msg.messageId}`);
    return;
  }

  try {
    if (msg.kind === 'image') { await handleImage(msg); return; }

    if (msg.kind === 'interactive' && msg.buttonId) {
      await handleButton(msg, msg.buttonId);
      return;
    }

    const text = msg.text.trim();
    if (!text) { await handleWelcome(msg); return; }

    const intent = detectIntent(text);
    console.log(`[intent] "${text}" → ${intent}`);

    switch (intent) {
      case 'HELP':         await handleWelcome(msg);        break;
      case 'TOP_INCOME':   await handleTopIncome(msg);      break;
      case 'TOP_SPENDING': await handleTopSpending(msg);    break;
      case 'TODAY':        await handleTodayReport(msg);    break;
      case 'WEEK':         await handleWeeklyReport(msg);   break;
      case 'BALANCE':      await handleBalance(msg);        break;
      case 'MONTH':        await handleMonthlyReport(msg);  break;
      case 'TRANSACTION':  await handleTransaction(msg);    break;
      default:
        await sendInteractiveButtons(
          msg.from,
          "I didn't quite get that. What would you like to do?",
          [{ id: BTN_TODAY, title: '📊 Today' }, { id: BTN_MONTH, title: '📅 This Month' }, { id: BTN_MORE, title: '⚡ More' }],
        );
    }
  } catch (err) {
    console.error(`[processMessage] unhandled error for msg="${msg.text}":`, err);
    await sendFallback(msg.from, msg.text ?? 'unknown');
  }
}

// ── Button dispatcher ─────────────────────────────────────────────────────────
async function handleButton(msg: WhatsAppMessage, id: string): Promise<void> {
  if (id === BTN_TODAY)   { await handleTodayReport(msg);   return; }
  if (id === BTN_MONTH)   { await handleMonthlyReport(msg); return; }
  if (id === BTN_WEEK)    { await handleWeeklyReport(msg);  return; }
  if (id === BTN_BALANCE) { await handleBalance(msg);       return; }
  if (id === BTN_MORE)    { await handleMoreMenu(msg);      return; }
  await handleWelcome(msg);
}

// ── Welcome / main menu ───────────────────────────────────────────────────────
async function handleWelcome(msg: WhatsAppMessage): Promise<void> {
  await sendInteractiveButtons(
    msg.from,
    '👋 Hey! I\'m Autonance — your money tracker.\n\nLog expenses by typing:\n  "Spent 500 on lunch"\n  "Received 50000 salary"\n\nOr snap a photo of any receipt 📸\n\nWhat would you like to see?',
    [{ id: BTN_TODAY, title: '📊 Today' }, { id: BTN_MONTH, title: '📅 This Month' }, { id: BTN_MORE, title: '⚡ More' }],
  );
}

// ── More options ──────────────────────────────────────────────────────────────
async function handleMoreMenu(msg: WhatsAppMessage): Promise<void> {
  await sendListMessage(
    msg.from,
    '⚡ *More options* — tap one to explore:',
    'View options',
    [
      {
        title: 'Reports',
        rows: [
          { id: BTN_WEEK,    title: '📆 This Week',   description: 'Last 7 days breakdown' },
          { id: BTN_BALANCE, title: '💰 Net Balance', description: 'All-time income vs expenses' },
          { id: BTN_TODAY,   title: '📊 Today',       description: "Today's spending snapshot" },
        ],
      },
    ],
  );
}

// ── Today's report ────────────────────────────────────────────────────────────
async function handleTodayReport(msg: WhatsAppMessage): Promise<void> {
  const link = await getUserByPhone(msg.from);
  if (!link) { await notLinked(msg.from); return; }

  const s = await getTodaySummary(link.workspace_id);
  const body = formatTodaySummary(s.totalIncome, s.totalExpense, s.byCategory);
  await sendInteractiveButtons(
    msg.from, body,
    [{ id: BTN_MONTH, title: '📅 This Month' }, { id: BTN_BALANCE, title: '💰 Balance' }, { id: BTN_MORE, title: '⚡ More' }],
  );
}

// ── Weekly report ─────────────────────────────────────────────────────────────
async function handleWeeklyReport(msg: WhatsAppMessage): Promise<void> {
  const link = await getUserByPhone(msg.from);
  if (!link) { await notLinked(msg.from); return; }

  const s = await getWeeklySummary(link.workspace_id);
  const body = formatWeeklySummary(s.totalIncome, s.totalExpense, s.byCategory);
  await sendInteractiveButtons(
    msg.from, body,
    [{ id: BTN_TODAY, title: '📊 Today' }, { id: BTN_MONTH, title: '📅 This Month' }, { id: BTN_BALANCE, title: '💰 Balance' }],
  );
}

// ── Monthly report ────────────────────────────────────────────────────────────
async function handleMonthlyReport(msg: WhatsAppMessage): Promise<void> {
  const link = await getUserByPhone(msg.from);
  if (!link) { await notLinked(msg.from); return; }

  const now = new Date();
  const s   = await getMonthlySummary(link.workspace_id, now.getFullYear(), now.getMonth() + 1);

  let insight: string | undefined;
  try { insight = await generateInsight(s.totalIncome, s.totalExpense, s.byCategory); } catch { /* optional */ }

  const body = formatMonthlySummary(s.totalIncome, s.totalExpense, s.byCategory, insight);
  await sendInteractiveButtons(
    msg.from, body,
    [{ id: BTN_TODAY, title: '📊 Today' }, { id: BTN_WEEK, title: '📆 This Week' }, { id: BTN_BALANCE, title: '💰 Balance' }],
  );
}

// ── Balance ───────────────────────────────────────────────────────────────────
async function handleBalance(msg: WhatsAppMessage): Promise<void> {
  const link = await getUserByPhone(msg.from);
  if (!link) { await notLinked(msg.from); return; }

  const s    = await getAllTimeSummary(link.workspace_id);
  const body = formatBalance(s.totalIncome, s.totalExpense);
  await sendInteractiveButtons(
    msg.from, body,
    [{ id: BTN_TODAY, title: '📊 Today' }, { id: BTN_MONTH, title: '📅 This Month' }, { id: BTN_MORE, title: '⚡ More' }],
  );
}

// ── Top spending breakdown ────────────────────────────────────────────────────
async function handleTopSpending(msg: WhatsAppMessage): Promise<void> {
  const link = await getUserByPhone(msg.from);
  if (!link) { await notLinked(msg.from); return; }

  const lower = msg.text.toLowerCase();
  let summary: Awaited<ReturnType<typeof getMonthlySummary>>;
  let periodLabel: string;

  if (/week|7 days/.test(lower)) {
    summary = await getWeeklySummary(link.workspace_id);
    periodLabel = 'last 7 days';
  } else if (/today/.test(lower)) {
    summary = await getTodaySummary(link.workspace_id);
    periodLabel = 'today';
  } else if (/all.?time|ever|overall|always/.test(lower)) {
    summary = await getAllTimeSummary(link.workspace_id);
    periodLabel = 'all time';
  } else {
    const now = new Date();
    summary = await getMonthlySummary(link.workspace_id, now.getFullYear(), now.getMonth() + 1);
    periodLabel = new Date().toLocaleDateString('en-IN', { month: 'long' });
  }

  const { byCategory, totalExpense } = summary;
  const ranked = Object.entries(byCategory).sort(([, a], [, b]) => b - a);

  if (ranked.length === 0) {
    await sendInteractiveButtons(
      msg.from,
      `No expenses recorded for ${periodLabel} yet.\n\nStart logging: "Spent 500 on lunch"`,
      [{ id: BTN_TODAY, title: '📊 Today' }, { id: BTN_MONTH, title: '📅 This Month' }, { id: BTN_MORE, title: '⚡ More' }],
    );
    return;
  }

  const [topCat, topAmt] = ranked[0];
  const topPct = totalExpense > 0 ? Math.round((topAmt / totalExpense) * 100) : 0;

  // Keep lines short — WhatsApp interactive body max is 1024 chars
  const lines = ranked
    .slice(0, 5)
    .map(([cat, amt], i) => {
      const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
      return `${i + 1}. *${cat}* - Rs.${amt.toLocaleString('en-IN')} (${pct}%)`;
    })
    .join('\n');

  const body = `Top spending - ${periodLabel}\n\n${lines}\n\n${topCat} is your biggest expense at ${topPct}% of total spending.`;

  console.log(`[handleTopSpending] body length=${body.length}, categories=${ranked.length}`);

  await sendInteractiveButtons(
    msg.from, body,
    [{ id: BTN_MONTH, title: '📅 This Month' }, { id: BTN_WEEK, title: '📆 This Week' }, { id: BTN_BALANCE, title: '💰 Balance' }],
  );
}

// ── Top income sources ────────────────────────────────────────────────────────
async function handleTopIncome(msg: WhatsAppMessage): Promise<void> {
  const link = await getUserByPhone(msg.from);
  if (!link) { await notLinked(msg.from); return; }

  const lower = msg.text.toLowerCase();
  let from: string, to: string, periodLabel: string;

  if (/week|7 days/.test(lower)) {
    const now = new Date(); const start = new Date(now); start.setDate(now.getDate() - 6);
    from = start.toISOString().slice(0, 10); to = now.toISOString().slice(0, 10);
    periodLabel = 'last 7 days';
  } else if (/today/.test(lower)) {
    from = to = new Date().toISOString().slice(0, 10);
    periodLabel = 'today';
  } else {
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    from = `${now.getFullYear()}-${m}-01`; to = `${now.getFullYear()}-${m}-31`;
    periodLabel = now.toLocaleDateString('en-IN', { month: 'long' });
  }

  const { total, byCategory, byPayee } = await getIncomeSources(link.workspace_id, from, to);

  if (total === 0) {
    await sendInteractiveButtons(
      msg.from,
      `No income recorded for ${periodLabel} yet.\n\nLog income: "Received 50000 salary"`,
      [{ id: BTN_TODAY, title: '📊 Today' }, { id: BTN_MONTH, title: '📅 This Month' }, { id: BTN_MORE, title: '⚡ More' }],
    );
    return;
  }

  const rankedPayees = Object.entries(byPayee).sort(([, a], [, b]) => b - a).slice(0, 3);
  const rankedCats   = Object.entries(byCategory).sort(([, a], [, b]) => b - a).slice(0, 3);

  const payeeLines = rankedPayees.length > 0
    ? rankedPayees.map(([p, amt], i) => {
        const pct = Math.round((amt / total) * 100);
        return `${i + 1}. *${p}* - Rs.${amt.toLocaleString('en-IN')} (${pct}%)`;
      }).join('\n')
    : null;

  const catLines = rankedCats.map(([c, amt], i) => {
    const pct = Math.round((amt / total) * 100);
    return `${i + 1}. *${c}* - Rs.${amt.toLocaleString('en-IN')} (${pct}%)`;
  }).join('\n');

  const sourcesSection = payeeLines
    ? `By source:\n${payeeLines}\n\nBy type:\n${catLines}`
    : `By type:\n${catLines}`;

  const body = `Income sources - ${periodLabel}\n\nTotal: Rs.${total.toLocaleString('en-IN')}\n\n${sourcesSection}`;

  await sendInteractiveButtons(
    msg.from, body,
    [{ id: BTN_TODAY, title: '📊 Today' }, { id: BTN_MONTH, title: '📅 This Month' }, { id: BTN_BALANCE, title: '💰 Balance' }],
  );
}

// ── Transaction (text) ────────────────────────────────────────────────────────
async function handleTransaction(msg: WhatsAppMessage): Promise<void> {
  let parsed: ParsedTransaction;
  try {
    parsed = await parseExpense(msg.text);
  } catch (err) {
    console.error('[parseExpense] error:', err);
    await sendWhatsAppMessage(msg.from, `Sorry, I couldn't read that. Try: "Spent 500 on lunch" or "Received 10000 salary".`);
    return;
  }
  await saveParsedTransaction(msg, parsed, msg.text);
}

// ── Image (receipt) ───────────────────────────────────────────────────────────
async function handleImage(msg: WhatsAppMessage): Promise<void> {
  if (!msg.mediaId) return;
  await sendWhatsAppMessage(msg.from, `Reading your receipt...`);

  let parsed: ParsedTransaction;
  try {
    const { base64, mimeType } = await downloadMedia(msg.mediaId);
    console.log(`[handleImage] downloaded ${msg.mediaId} (${mimeType}, ${Math.round(base64.length / 1024)}KB)`);
    parsed = await parseReceiptImage(base64, mimeType);
  } catch (err) {
    console.error('[handleImage] error:', err);
    await sendWhatsAppMessage(msg.from, `Sorry, I couldn't read that image. Make sure the amount is clearly visible, or just type the amount instead.`);
    return;
  }
  await saveParsedTransaction(msg, parsed, msg.text || '[receipt image]');
}

// ── Shared save + confirm ─────────────────────────────────────────────────────
async function saveParsedTransaction(
  msg: WhatsAppMessage, parsed: ParsedTransaction, rawForRecord: string,
): Promise<void> {
  const amountStatus = amountSanityCheck(parsed.amount);
  if (amountStatus !== 'ok') {
    const reason = amountStatus === 'zero'
      ? `I couldn't find a valid amount in that message.`
      : `That amount (Rs.${parsed.amount.toLocaleString('en-IN')}) looks unusually large.`;
    await sendWhatsAppMessage(msg.from, `${reason}\n\nTry: "Spent 500 on lunch" or "Received 50000 salary".`);
    return;
  }

  if (parsed.confidence < LOW_CONFIDENCE_THRESHOLD) {
    await sendInteractiveButtons(
      msg.from,
      `I'm not 100% sure I read that right.\n\nI understood: *${parsed.type}* of *${parsed.currency} ${parsed.amount}* under *${parsed.category}*.\n\nIs that correct?`,
      [{ id: `confirm_yes`, title: '✅ Yes, save it' }, { id: `confirm_no`, title: '✏️ I\'ll retype' }],
    );
    return;
  }

  try {
    const link = await getUserByPhone(msg.from);
    if (!link) { await notLinked(msg.from); return; }

    await insertTransaction(link.workspace_id, link.user_id, parsed, rawForRecord);
    const confirmText = formatConfirmation(parsed.amount, parsed.currency, parsed.type, parsed.category, parsed.date, parsed.payee);
    await sendInteractiveButtons(
      msg.from, confirmText,
      [{ id: BTN_TODAY, title: '📊 Today' }, { id: BTN_MONTH, title: '📅 This Month' }, { id: BTN_MORE, title: '⚡ More' }],
    );
  } catch (err) {
    console.error('[save] DB error:', err);
    await sendWhatsAppMessage(msg.from, `Saved to memory, but had trouble storing it. Please try again.`);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
async function notLinked(to: string) {
  await sendWhatsAppMessage(to, `Your number isn't linked to an Autonance account yet. Open the app and connect WhatsApp from Settings.`);
}
