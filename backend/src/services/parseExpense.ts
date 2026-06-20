import OpenAI from 'openai';
import { ParsedTransaction, Category, VALID_CATEGORIES } from '../types';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Model chain: primary → fallback. If primary is rate-limited, fallback kicks in.
const TEXT_MODELS   = [
  'google/gemini-2.0-flash-exp:free',          // primary: reliable, fast
  'deepseek/deepseek-chat-v3-0324:free',        // fallback 1
  'meta-llama/llama-3.3-70b-instruct:free',     // fallback 2
];
const VISION_MODELS = [
  'google/gemini-2.0-flash-exp:free',           // primary: supports vision + text
  'qwen/qwen2.5-vl-72b-instruct:free',          // fallback 1
  'meta-llama/llama-3.2-11b-vision-instruct:free', // fallback 2
];

const today = () => new Date().toISOString().split('T')[0];

const SCHEMA = `Return ONLY a JSON object — no prose, no markdown.

JSON keys (all required):
- amount: number (the monetary amount)
- currency: string (3-letter ISO code, default "INR" if not specified)
- type: "expense" | "income" | "transfer"
- category: one of [Food, Transport, Shopping, Bills, Entertainment, Health, Business, Education, Other]
- date: "YYYY-MM-DD" (use today's date if not specified: ${today()})
- description: string (brief description)
- payee: string (merchant or person, empty string if unknown)
- paymentMode: string | null (e.g. "UPI", "cash", "HDFC", null if not mentioned)
- confidence: number between 0 and 1 (your confidence in the parse)

If the amount is unclear or missing, set confidence below 0.6.`;

const TEXT_PROMPT = `You are a financial assistant. Parse the user's message and ${SCHEMA}`;

const VISION_PROMPT = `You are a financial assistant. The image is a receipt, payment screenshot (e.g. PhonePe/GPay/Paytm), or invoice. Extract the transaction.
- Use the GRAND TOTAL / final paid amount as "amount".
- Use the merchant or recipient name as "payee".
- Read the date from the image if present.
- A payment app screenshot is usually an "expense" unless it clearly says received/credited.
${SCHEMA}`;

// ── Rule-based fallback parser ───────────────────────────────────────────────
// Used when ALL AI models fail. Handles common patterns deterministically.

const CATEGORY_RULES: [RegExp, Category][] = [
  [/\b(food|lunch|dinner|breakfast|meal|restaurant|cafe|zomato|swiggy|snack|pizza|biryani|burger|hotel|dhaba)\b/i, 'Food'],
  [/\b(grocery|groceries|vegetable|fruit|supermarket|dmart|bigbasket|blinkit|zepto|kirana|market)\b/i, 'Food'],
  [/\b(coffee|tea|chai|latte|cappuccino|starbucks)\b/i, 'Food'],
  [/\b(uber|ola|auto|cab|taxi|bus|metro|train|petrol|diesel|fuel|toll|parking|ride)\b/i, 'Transport'],
  [/\b(flight|hotel|airbnb|trip|travel|vacation|tour|makemytrip|goibibo)\b/i, 'Transport'],
  [/\b(amazon|flipkart|shopping|mall|shop|store|purchase|buy|bought|meesho|myntra|ajio)\b/i, 'Shopping'],
  [/\b(shirt|tshirt|dress|jeans|clothes|shoes|clothing|wear|apparel)\b/i, 'Shopping'],
  [/\b(laptop|phone|mobile|charger|headphone|gadget|electronics|earphone|tablet)\b/i, 'Shopping'],
  [/\b(rent|electricity|water|gas|wifi|internet|broadband|bill|recharge|dth|emi|insurance)\b/i, 'Bills'],
  [/\b(netflix|spotify|prime|hotstar|subscription|youtube|jio)\b/i, 'Bills'],
  [/\b(movie|cinema|game|gaming|concert|event|ticket|pvr|bookmyshow|sport)\b/i, 'Entertainment'],
  [/\b(gym|fitness|yoga|workout|cult|trainer|sports)\b/i, 'Health'],
  [/\b(doctor|pharmacy|medicine|medical|hospital|clinic|dentist|checkup|apollo|health)\b/i, 'Health'],
  [/\b(salary|freelance|client|invoice|project|business|work|payment\s+from)\b/i, 'Business'],
  [/\b(course|book|class|tuition|udemy|college|school|fee|education|coaching)\b/i, 'Education'],
];

function guessCategory(text: string): Category {
  for (const [re, cat] of CATEGORY_RULES) {
    if (re.test(text)) return cat;
  }
  return 'Other';
}

function parseExpenseRuleBased(message: string): ParsedTransaction | null {
  const amountMatch = message.match(/[₹$£€]?\s*(\d[\d,]*(?:\.\d{1,2})?)/);
  if (!amountMatch) return null;
  const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  if (!amount || amount <= 0) return null;

  const isIncome = /\b(received?|got|income|salary|earned?|credited?|got paid)\b/i.test(message);
  const type: 'expense' | 'income' = isIncome ? 'income' : 'expense';

  const descMatch = message.match(/\b(?:on|for|at|from)\s+(.+)/i);
  const description = descMatch
    ? descMatch[1].trim()
    : message.replace(/[₹$£€]?\s*\d[\d,]*(?:\.\d+)?/, '').replace(/\b(spent|paid|bought|received?|got|expense|income)\b/ig, '').replace(/\s+/g, ' ').trim();

  const category = guessCategory(description || message);

  return {
    amount,
    currency: 'INR',
    type,
    category,
    date: new Date().toISOString().slice(0, 10),
    description: description || (type === 'expense' ? 'Expense' : 'Income'),
    payee: '',
    paymentMode: null,
    confidence: 0.8,
  };
}

/** Validate, coerce, and clamp a raw model response into a ParsedTransaction. */
function coerce(raw: string): ParsedTransaction {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let parsed: ParsedTransaction;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI returned unparseable response: ${raw}`);
  }

  if (!VALID_CATEGORIES.includes(parsed.category as Category)) {
    parsed.category = 'Other';
  }
  parsed.confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0));
  return parsed;
}

export async function parseExpense(message: string): Promise<ParsedTransaction> {
  // Try each AI model in order
  for (const model of TEXT_MODELS) {
    try {
      console.log(`[parseExpense] trying model: ${model}`);
      const response = await client.chat.completions.create({
        model,
        max_tokens: 256,
        messages: [
          { role: 'system', content: TEXT_PROMPT },
          { role: 'user', content: message },
        ],
      });
      const raw = response.choices[0]?.message?.content?.trim() ?? '';
      return coerce(raw);
    } catch (err) {
      console.error(`[parseExpense] ${model} failed:`, err);
    }
  }

  // All AI models failed — fall back to rule-based parsing (never throws)
  console.warn('[parseExpense] all AI models failed, using rule-based fallback');
  const fallback = parseExpenseRuleBased(message);
  if (fallback) return fallback;

  throw new Error('Could not parse transaction — no amount found in message');
}

/** Parse a receipt / payment screenshot / invoice image into a transaction. */
export async function parseReceiptImage(base64: string, mimeType: string): Promise<ParsedTransaction> {
  const dataUri = `data:${mimeType};base64,${base64}`;
  let lastErr: unknown;

  for (const model of VISION_MODELS) {
    try {
      console.log(`[parseReceiptImage] trying model: ${model}`);
      const response = await client.chat.completions.create({
        model,
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: VISION_PROMPT },
              { type: 'image_url', image_url: { url: dataUri } },
            ],
          },
        ],
      });
      const raw = response.choices[0]?.message?.content?.trim() ?? '';
      return coerce(raw);
    } catch (err) {
      console.error(`[parseReceiptImage] ${model} failed:`, err);
      lastErr = err;
    }
  }

  throw lastErr ?? new Error('All vision models failed');
}

export const LOW_CONFIDENCE_THRESHOLD = 0.65;

export type MessageIntent =
  | 'TRANSACTION'
  | 'TODAY_REPORT'
  | 'WEEK_REPORT'
  | 'MONTH_REPORT'
  | 'BALANCE'
  | 'TOP_SPENDING'
  | 'TOP_INCOME'
  | 'HELP'
  | 'UNKNOWN';

const VALID_INTENTS: MessageIntent[] = [
  'TRANSACTION', 'TODAY_REPORT', 'WEEK_REPORT', 'MONTH_REPORT',
  'BALANCE', 'TOP_SPENDING', 'TOP_INCOME', 'HELP', 'UNKNOWN',
];

/**
 * Classify the user's message into a structured intent.
 * Returns in ~200ms using a tiny max_tokens budget.
 */
export async function classifyIntent(message: string): Promise<MessageIntent> {
  const prompt = `You are classifying a WhatsApp message sent to a personal finance bot.
Return ONLY one intent name from this list — no explanation, no punctuation:

TRANSACTION   — user is logging money (spending, income, transfer). Must contain a specific amount.
TODAY_REPORT  — user wants today's spending or income snapshot
WEEK_REPORT   — user wants this week's or last 7 days summary
MONTH_REPORT  — user wants this month's summary or how much they spent/earned overall
BALANCE       — user wants their net balance, total savings, or overall financial position
TOP_SPENDING  — user asks where they spent most, which expense category is highest, spending breakdown
TOP_INCOME    — user asks where their income came from, income sources, who paid them most
HELP          — greeting, asking what the bot can do, or unclear intent
UNKNOWN       — none of the above

Message: "${message.replace(/"/g, "'")}"

Intent:`;

  try {
    const response = await client.chat.completions.create({
      model: TEXT_MODELS[0],
      max_tokens: 8,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = (response.choices[0]?.message?.content ?? '').trim().toUpperCase();
    return VALID_INTENTS.find(i => raw.includes(i)) ?? 'UNKNOWN';
  } catch {
    return 'UNKNOWN';
  }
}

/** Generate a short AI insight sentence from monthly stats. */
export async function generateInsight(
  totalIncome: number,
  totalExpense: number,
  byCategory: Record<string, number>,
): Promise<string> {
  const net     = totalIncome - totalExpense;
  const topCats = Object.entries(byCategory)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 3)
    .map(([cat, amt]) => `${cat} ₹${amt.toLocaleString('en-IN')}`)
    .join(', ');

  const prompt = `You are a friendly personal finance assistant. In exactly ONE short sentence (max 15 words), give a helpful and encouraging insight based on these numbers: Income ₹${totalIncome.toLocaleString('en-IN')}, Expenses ₹${totalExpense.toLocaleString('en-IN')}, Net ₹${net.toLocaleString('en-IN')}, Top categories: ${topCats || 'none'}. Be specific, positive, and actionable.`;

  for (const model of TEXT_MODELS) {
    try {
      const response = await client.chat.completions.create({
        model,
        max_tokens: 60,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') ?? '';
    } catch { /* try next */ }
  }
  return '';
}
