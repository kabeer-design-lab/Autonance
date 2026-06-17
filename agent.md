# AGENT.md — Build Instructions for Autonance

> This file is the standing brief for any AI coding agent (Claude Code, Codex, etc.) working in
> this repository. **Read this file fully before writing or changing any code.** It defines what
> we are building, the tech stack, the rules, and the modules to implement.
>
> 📖 **First, read [`PRODUCT.md`](PRODUCT.md)** — the end-to-end product context (the *why* and
> *what*). This file covers *how to build*; `design.md` covers *how it looks*; `Plan.md` is the
> step-by-step sequence.

---

## 1. Project summary

**Autonance** is a WhatsApp-first expense & income tracker — a conversational personal-finance
assistant with a companion mobile app.

A user logs money by chatting with a WhatsApp bot in plain language — e.g.
*"Spent 500 on lunch yesterday"* or *"Received ₹10,000 salary"*. The backend uses an LLM to parse
that message into structured data, saves it to a database, and replies with a confirmation. The
same data is viewable in a mobile app (dashboards, category breakdowns, budgets), and the user can
also add transactions manually in the app.

**Architecture principle — one core ledger engine, role-based modes.** Build **one** shared ledger
backend, not separate apps. On top of it we layer experiences: **Personal** (v1), then **Pro**
(freelancers — separate personal/business wallets, tax exports), then **Teams** (businesses —
members, approvals, cost centers). The data model must be **business-ready from day one** even
though v1's UX is personal-only — so we never have to re-architect the ledger later.

**Version 1 scope (build this):** single user, personal tracking via WhatsApp + app, dashboards,
budgets, multi-currency capture, receipt attachment (store the image; OCR comes later).
**Deferred (do NOT build yet, but keep the schema ready):** multi-user workspaces, approvals,
cost centers, receipt OCR, voice-note parsing, recurring transactions, tax exports, bank import,
accounting integrations, anomaly detection.

---

## 2. Confirmed tech stack

| Layer | Choice | Notes |
|---|---|---|
| Mobile app | **React Native + Expo** (TypeScript) | iOS + Android from one codebase |
| Backend | **Node.js + TypeScript + Express** | Same language as the app |
| Database + Auth + File storage | **Supabase** (managed Postgres) | Auth + Postgres + Storage in one |
| LLM (parsing) | **Anthropic Claude Haiku** | `claude-haiku-4-5-20251001`, cheap + fast |
| WhatsApp | **Meta WhatsApp Business Cloud API** (direct, no BSP) | Graph API `v21.0` |
| Backend hosting | **Render** | Gives the public HTTPS URL Meta's webhook needs |
| Mobile dependency note | Use Expo SDK (latest stable). Prefer Expo-managed workflow. |

**One-language rule:** everything is TypeScript. Do not introduce Python, Go, or other backend
languages.

**Deferred infrastructure (add only when the relevant phase arrives — don't set up now):**
- **Redis** — background jobs, reminders, and scheduled WhatsApp digests (Phase 2 onward).
- **Object storage** — Supabase Storage (S3-compatible) for receipt/attachment images.
- **Analytics tooling** — Metabase/Superset for internal dashboards (later).

---

## 3. Repository layout

This is a monorepo. Create folders only as each phase begins (don't scaffold everything at once).

```
Autonance/
├── agent.md            # this file
├── design.md           # visual design system (filled in by the founder)
├── Plan.md             # step-by-step build & launch guide
├── backend/            # Node + TypeScript + Express API + WhatsApp webhook
│   ├── src/
│   │   ├── index.ts            # Express app entry
│   │   ├── routes/
│   │   │   ├── webhook.ts       # GET + POST /webhook (WhatsApp)
│   │   │   └── api.ts           # REST endpoints for the mobile app
│   │   ├── services/
│   │   │   ├── messageProcessor.ts   # classify message → route
│   │   │   ├── parseExpense.ts        # LLM call → JSON
│   │   │   ├── whatsapp.ts            # sendWhatsAppMessage()
│   │   │   ├── summary.ts             # report/analytics queries
│   │   │   └── db.ts                  # Supabase client + queries
│   │   └── types.ts
│   ├── .env.example
│   ├── package.json
│   └── README.md
└── mobile/             # Expo React Native app
    ├── app/            # screens
    ├── components/
    ├── lib/            # api client, supabase client
    └── README.md
```

---

## 4. Coding conventions

- **TypeScript strict mode** on. No `any` unless unavoidable and commented.
- **Small, modular files.** One responsibility per file. Match the layout above.
- **Always handle errors.** Wrap external calls (WhatsApp API, Anthropic API, DB) in try/catch and
  log a clear message. The webhook must always return `200 OK` to Meta quickly, even on internal
  errors (otherwise Meta retries and may disable the webhook).
- **No secrets in code.** Never hardcode tokens, keys, or phone numbers. Read everything from
  environment variables (see §5). Provide a `.env.example` with empty placeholders.
- **No business logic in the LLM prompt** (see §7 golden rule).
- **Comments:** match the density of surrounding code; explain *why*, not *what*.
- **READMEs:** every package (`backend/`, `mobile/`) has a README with setup + run steps.

---

## 5. Environment variables (the agent must expect these — never hardcode)

Backend (`backend/.env`):

```
# WhatsApp / Meta Cloud API
WHATSAPP_TOKEN=              # access token (temporary for testing, system-user token for prod)
WHATSAPP_VERIFY_TOKEN=       # any secret string you invent; must match what you set in Meta
WHATSAPP_PHONE_NUMBER_ID=    # from the Meta WhatsApp dashboard
WHATSAPP_API_VERSION=v21.0

# Anthropic (LLM parsing)
ANTHROPIC_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_KEY=        # service role key — backend only, NEVER ship to the mobile app

# App auth
JWT_SECRET=

# Misc
DEFAULT_BASE_CURRENCY=INR
DEFAULT_TIMEZONE=Asia/Kolkata
```

Mobile (`mobile/.env` — only *public* keys here):

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=    # the anon/public key, NOT the service key
EXPO_PUBLIC_API_BASE_URL=         # the deployed backend URL
```

---

## 6. Build & run commands

> Fill these in once each package is scaffolded. Keep them accurate as the source of truth.

Backend:
```
cd backend
npm install
npm run dev        # local dev (e.g. ts-node-dev / tsx)
npm run build      # compile TypeScript
npm start          # run compiled output
npm test           # tests (Jest)
```

Mobile:
```
cd mobile
npm install
npx expo start     # opens Expo dev server; scan QR with Expo Go app
```

---

## 7. Key modules to implement (and the golden rule)

### Golden rule — the LLM only parses
The LLM's **only** job is to turn one natural-language message into one JSON object. All other
logic — classification routing, category validation, currency conversion, DB writes, summaries —
lives in plain TypeScript. This keeps token cost low and behaviour predictable.

### Modules
1. **`routes/webhook.ts`**
   - `GET /webhook` — verify Meta's challenge: if `hub.mode === 'subscribe'` and
     `hub.verify_token === WHATSAPP_VERIFY_TOKEN`, respond with `hub.challenge`. Else `403`.
   - `POST /webhook` — parse `body.entry[].changes[].value.messages[]`, extract sender (`from`)
     and `text.body`, hand to `messageProcessor`. **Return `200` immediately.**

2. **`services/messageProcessor.ts`** — classify the message with simple heuristics:
   - **Report/analytics** → words like `summary`, `report`, `show`, `today`, month names → call `summary`.
   - **Transaction** → contains an amount / currency symbol + verbs (`spent`, `paid`, `received`,
     `income`) → call `parseExpense`, then save, then confirm.
   - **General/help** → reply with help text listing supported commands.

3. **`services/parseExpense.ts`** — call Claude Haiku with the parsing prompt (see §8). Return a
   typed object. Validate the returned `category` against the allowed list; coerce to `Other` if
   unknown. Resolve relative dates (`yesterday`) in `DEFAULT_TIMEZONE`.

4. **`services/db.ts`** — Supabase client + typed query helpers: `insertTransaction`,
   `getTransactions`, `getMonthlySummary`, `getCategoryBreakdown`, budget CRUD.

5. **`services/whatsapp.ts`** — `sendWhatsAppMessage(to, text)`:
   `POST https://graph.facebook.com/{WHATSAPP_API_VERSION}/{WHATSAPP_PHONE_NUMBER_ID}/messages`
   with bearer `WHATSAPP_TOKEN` and a `text` body. Handle the 24-hour-window rule (outside it, only
   approved templates are allowed).

6. **`services/summary.ts`** — SQL/Supabase aggregations for totals, income vs expense, and
   category breakdown over a date range.

7. **`routes/api.ts`** — JWT-protected REST endpoints for the mobile app: list transactions
   (with filters), create/update/delete transaction, summaries, budgets, user settings.

---

## 8. The LLM parsing contract

System prompt instructs Claude to respond with **JSON only**, keys:
`amount` (float), `currency` (3-letter code), `type` (`expense`|`income`|`transfer`),
`category` (one of: Food, Transport, Shopping, Bills, Entertainment, Health, Business, Education,
Other), `date` (YYYY-MM-DD; if absent use today in the user's timezone), `description` (string),
`payee` (merchant/vendor string), `paymentMode` (string|null, e.g. "HDFC", "cash", "UPI"),
`confidence` (0–1, the model's certainty).

Example — input *"Spent ₹500 on lunch in Hyderabad yesterday"* →
```json
{
  "amount": 500.0, "currency": "INR", "type": "expense", "category": "Food",
  "date": "2026-06-16", "description": "Lunch in Hyderabad", "payee": "Restaurant",
  "paymentMode": null, "confidence": 0.95
}
```

Use the Anthropic SDK (`@anthropic-ai/sdk`). Prefer **tool/function calling** or a strict JSON
instruction so output is reliably parseable. No prose, no markdown fences in the model output.

### AI guardrails (required)
- **Never silently guess the amount.** If `amount` can't be determined confidently, ask the user.
- **Confirm low-confidence parses.** If `confidence` is below a threshold (e.g. 0.7) or the category
  is ambiguous, reply with a clarification question (*"Was ₹500 for travel or fuel?"*) instead of
  saving blindly.
- **Always store the raw message** (`raw_message`) and the `confidence` score on the transaction
  row, for traceability and prompt tuning.
- **Let users correct easily** from chat (*"change last expense to 530"*) or the app.

## 9. Data model (build business-ready, expose personal-only in v1)

The ledger schema must support future Pro/Teams modes without migration pain. Core entities:

- **User** — auth identity (Supabase `auth.users`).
- **Workspace** — every user gets a default personal workspace; later, business workspaces hold
  multiple members. All transactions belong to a `workspace_id` (not just `user_id`).
- **Wallet/account** — e.g. "Cash", "HDFC". v1 can auto-create one default wallet; schema supports many.
- **Transaction** — type `income|expense|transfer`; `amount`, `currency`; `occurred_at` (when it
  happened) **and** `created_at` (when logged); `merchant/payee`; `category` + optional
  `subcategory`; `payment_mode`; `source` (`whatsapp|app|import|ocr`); `raw_message`;
  `parser_confidence`; optional `attachment_id`.
- **Category** — the fixed v1 list plus user-defined ones.
- **Attachment/receipt** — image URL in object storage + extracted fields (later).
- **Deferred (define when Teams ships):** Member/role, Approver, Department, Cost center,
  Expense policy, Approval event log.

> v1 builds Users, Workspaces (default only), Wallets (default only), Transactions, Categories,
> Budgets, and Attachments. The business entities are documented but not implemented yet.

---

## 10. Definition of done (per task)
- Code compiles (`npm run build`) with no TypeScript errors.
- External calls have error handling; the webhook always returns `200` fast.
- No secrets committed; `.env.example` updated if a new variable is introduced.
- Relevant README updated with any new run steps.
- For backend logic, at least basic Jest tests for `parseExpense` and DB helpers.

## 11. What NOT to do
- ❌ Don't put business logic, math, or data lookups inside the LLM prompt.
- ❌ Don't ship the Supabase **service key** to the mobile app.
- ❌ Don't build deferred features (teams, OCR, voice, bank import) during v1 — but don't hardcode
  assumptions that block them either (use `workspace_id`, keep `source`/`confidence` fields).
- ❌ Don't save a transaction on a **low-confidence** parse without confirming with the user.
- ❌ Don't block the webhook response on slow work — acknowledge first, process async if needed.
- ❌ Don't introduce a second backend language or a heavy framework not listed in §2.
