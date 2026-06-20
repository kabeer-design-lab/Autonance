export type TransactionType = 'expense' | 'income' | 'transfer';

export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Health'
  | 'Business'
  | 'Education'
  | 'Other';

export const VALID_CATEGORIES: Category[] = [
  'Food', 'Transport', 'Shopping', 'Bills',
  'Entertainment', 'Health', 'Business', 'Education', 'Other',
];

export interface ParsedTransaction {
  amount: number;
  currency: string;
  type: TransactionType;
  category: Category;
  date: string;           // YYYY-MM-DD
  description: string;
  payee: string;
  paymentMode: string | null;
  confidence: number;     // 0–1
}

export interface WhatsAppMessage {
  from: string;           // sender's phone number
  text: string;           // body text, or image caption (may be empty)
  messageId: string;
  kind: 'text' | 'image' | 'interactive';
  mediaId?: string;       // present when kind === 'image'
  buttonId?: string;      // present when kind === 'interactive'
}
