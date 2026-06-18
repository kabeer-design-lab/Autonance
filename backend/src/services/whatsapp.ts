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

export async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.warn('[WhatsApp] Token or Phone Number ID not set — skipping send.');
    return;
  }

  await axios.post(
    `${BASE_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
    },
  );
}

export function formatConfirmation(amount: number, currency: string, type: string, category: string, date: string, payee?: string): string {
  const sign = type === 'income' ? '+' : '-';
  const payeeStr = payee ? ` · ${payee}` : '';
  return `✅ Saved ${sign}${currency} ${amount.toLocaleString('en-IN')} · ${category}${payeeStr} · ${date}\n\nReply *edit* to change or *delete* to remove.`;
}

export function formatSummary(totalIncome: number, totalExpense: number, byCategory: Record<string, number>, currency = 'INR'): string {
  const net = totalIncome - totalExpense;
  const sign = net >= 0 ? '+' : '';
  const catLines = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([cat, amt]) => `  • ${cat}: ${currency} ${amt.toLocaleString('en-IN')}`)
    .join('\n');

  return `📊 *This month*\nIncome: ${currency} ${totalIncome.toLocaleString('en-IN')}\nExpenses: ${currency} ${totalExpense.toLocaleString('en-IN')}\nNet: ${sign}${currency} ${Math.abs(net).toLocaleString('en-IN')}\n\n*Top spending:*\n${catLines || '  No expenses yet.'}`;
}
