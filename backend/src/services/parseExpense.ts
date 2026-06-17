import Anthropic from '@anthropic-ai/sdk';
import { ParsedTransaction, Category, VALID_CATEGORIES } from '../types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [
      { role: 'user', content: message },
    ],
    system: SYSTEM_PROMPT,
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : '';

  let parsed: ParsedTransaction;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`AI returned unparseable response: ${raw}`);
  }

  // Validate and coerce category
  if (!VALID_CATEGORIES.includes(parsed.category as Category)) {
    parsed.category = 'Other';
  }

  // Clamp confidence
  parsed.confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0));

  return parsed;
}

export const LOW_CONFIDENCE_THRESHOLD = 0.65;
