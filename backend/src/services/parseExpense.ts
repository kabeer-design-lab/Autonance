import OpenAI from 'openai';
import { ParsedTransaction, Category, VALID_CATEGORIES } from '../types';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const TEXT_MODEL = 'openai/gpt-oss-120b:free';
const VISION_MODEL = 'nvidia/nemotron-nano-12b-v2-vl:free';

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
  const response = await client.chat.completions.create({
    model: TEXT_MODEL,
    max_tokens: 256,
    messages: [
      { role: 'system', content: TEXT_PROMPT },
      { role: 'user', content: message },
    ],
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? '';
  return coerce(raw);
}

/** Parse a receipt / payment screenshot / invoice image into a transaction. */
export async function parseReceiptImage(base64: string, mimeType: string): Promise<ParsedTransaction> {
  const dataUri = `data:${mimeType};base64,${base64}`;
  const response = await client.chat.completions.create({
    model: VISION_MODEL,
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
}

export const LOW_CONFIDENCE_THRESHOLD = 0.65;
