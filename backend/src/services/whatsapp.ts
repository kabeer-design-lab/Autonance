import axios from 'axios';

const BASE_URL = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}`;

/**
 * Download a WhatsApp media file (image/document) by its media ID.
 * Two steps: resolve the temporary URL, then fetch the bytes (both need auth).
 * Returns base64 + MIME type, ready to send to a vision model.
 */
export async function downloadMedia(mediaId: string): Promise<{ base64: string; mimeType: string }> {
  const meta = await axios.get(`${BASE_URL}/${mediaId}`, {
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
  });
  const url: string = meta.data.url;
  const mimeType: string = meta.data.mime_type || 'image/jpeg';

  const file = await axios.get(url, {
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
    responseType: 'arraybuffer',
  });
  const base64 = Buffer.from(file.data).toString('base64');
  return { base64, mimeType };
}

export interface ButtonOption { id: string; title: string; }
export interface ListRow    { id: string; title: string; description?: string; }
export interface ListSection { title: string; rows: ListRow[]; }

async function postToMeta(to: string, payload: object): Promise<void> {
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.warn('[WhatsApp] Token or Phone Number ID not set — skipping send.');
    return;
  }
  try {
    const resp = await axios.post(
      `${BASE_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      { messaging_product: 'whatsapp', to, ...payload },
      { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' } },
    );
    console.log(`[WhatsApp] sent to ${to}: ${resp.status}`);
  } catch (err: any) {
    const data = err.response?.data;
    console.error(`[WhatsApp] SEND FAILED to=${to} status=${err.response?.status}`, JSON.stringify(data));
    throw err;
  }
}

export async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  return postToMeta(to, { type: 'text', text: { body: text } });
}

export async function sendInteractiveButtons(
  to: string, body: string, buttons: ButtonOption[],
): Promise<void> {
  return postToMeta(to, {
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: body },
      action: {
        buttons: buttons.map(b => ({ type: 'reply', reply: { id: b.id, title: b.title } })),
      },
    },
  });
}

export async function sendListMessage(
  to: string, body: string, buttonLabel: string, sections: ListSection[],
): Promise<void> {
  return postToMeta(to, {
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: body },
      action: { button: buttonLabel, sections },
    },
  });
}

const INR = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const netSign = (n: number) => (n >= 0 ? '+' : '-');
const catLines = (byCategory: Record<string, number>, limit = 5) =>
  Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([cat, amt]) => `  • ${cat}: ${INR(amt)}`)
    .join('\n') || '  No expenses yet.';

export function formatConfirmation(amount: number, currency: string, type: string, category: string, date: string, payee?: string): string {
  const sign = type === 'income' ? '📈' : type === 'transfer' ? '🔄' : '📉';
  const payeeStr = payee ? ` · ${payee}` : '';
  return `${sign} *Saved!*\n${type === 'income' ? '+' : '-'}${currency} ${amount.toLocaleString('en-IN')} · ${category}${payeeStr} · ${date}\n\nTap *Summary* to see your balance.`;
}

export function formatTodaySummary(
  totalIncome: number, totalExpense: number, byCategory: Record<string, number>,
): string {
  const net = totalIncome - totalExpense;
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const top = Object.entries(byCategory).sort(([,a],[,b]) => b-a)[0];
  const topLine = top ? `\n🔝 Top: ${top[0]} ${INR(top[1])}` : '';
  return `📊 *Today — ${dateStr}*\n\n💸 Spent: ${INR(totalExpense)}\n💰 Received: ${INR(totalIncome)}\n🏦 Net: ${netSign(net)}${INR(Math.abs(net))}${topLine}`;
}

export function formatWeeklySummary(
  totalIncome: number, totalExpense: number, byCategory: Record<string, number>,
): string {
  const net = totalIncome - totalExpense;
  return `📆 *Last 7 Days*\n\n💸 Spent: ${INR(totalExpense)}\n💰 Received: ${INR(totalIncome)}\n🏦 Net: ${netSign(net)}${INR(Math.abs(net))}\n\n*By category:*\n${catLines(byCategory)}`;
}

export function formatMonthlySummary(
  totalIncome: number, totalExpense: number, byCategory: Record<string, number>, insight?: string,
): string {
  const net = totalIncome - totalExpense;
  const month = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const insightLine = insight ? `\n\n💡 ${insight}` : '';
  return `📅 *${month}*\n\n💸 Spent: ${INR(totalExpense)}\n💰 Received: ${INR(totalIncome)}\n🏦 Net: ${netSign(net)}${INR(Math.abs(net))}\n\n*Top spending:*\n${catLines(byCategory)}${insightLine}`;
}

export function formatBalance(totalIncome: number, totalExpense: number): string {
  const net = totalIncome - totalExpense;
  const emoji = net >= 0 ? '🟢' : '🔴';
  return `💰 *Your Balance*\n\n${emoji} Net: ${netSign(net)}${INR(Math.abs(net))}\n📈 Total received: ${INR(totalIncome)}\n📉 Total spent: ${INR(totalExpense)}`;
}
