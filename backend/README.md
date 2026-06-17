# Autonance Backend

Node.js + TypeScript + Express API — handles WhatsApp webhook, AI parsing, and the ledger.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in your keys
npm run dev
```

Open `http://localhost:3000/health` — should return `{ "ok": true }`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start with hot reload (for development) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output (for production) |
| `npm test` | Run tests |

## Environment variables

See `.env.example`. Never commit `.env`.

## Key files

| File | Purpose |
|---|---|
| `src/index.ts` | Express app entry |
| `src/routes/webhook.ts` | WhatsApp webhook (GET verify + POST messages) |
| `src/services/messageProcessor.ts` | Classify & route incoming messages |
| `src/services/parseExpense.ts` | Claude AI parsing → structured JSON |
| `src/services/whatsapp.ts` | Send messages via Meta Cloud API |
| `src/services/db.ts` | Supabase queries |
