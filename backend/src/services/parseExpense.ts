import OpenAI from 'openai';
import { ParsedTransaction, Category, VALID_CATEGORIES } from '../types';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const MODEL = 'google/gemini-flash-1.5';

const SYSTEM_PROMPT = `You are a financial assistant. Parse the user's message and return ONLY a JSON object — no prose, no markdown.

JSON keys (all required):
- amount: number (the monetary amount)
- currency: string (3-letter ISO code, default "INR" if not specified)
- type: "expense" | "income" | "transfer"
- category: one of [Food, Transport, Shopping, Bills, Entertainment, Health, Business, Education, Other]
- date: "YYYY-MM-DD" (use today's date if not specified: ${new Date().toISOString().split('T')[0]})
- description: string (brief description)
- payee: string (merchant or person, empty string if unknown)
- paymentMode: string | null (e.g. "UPI", "cash", "HDFC", null if not mentioned)
- confidence: number between 0 and 1 (your confidence in the parse)

If the amount is unclear or missing, set confidence below 0.6.`;

export async function parseExpense(message: string): Promise<ParsedTransaction> {
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 256,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: message },
    ],
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? '';

  // Strip markdown code fences if the model wraps in ```json ... ```
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

export const LOW_CONFIDENCE_THRESHOLD = 0.65;
