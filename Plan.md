# Plan.md — Building Autonance, Step by Step (Beginner-Friendly Guide)

> **Who this is for:** you, the founder, with **no coding background**. This guide explains every
> step in plain English — which accounts to create, which APIs to connect, and how to use Claude
> Code (the AI assistant) to write the actual code for you. You drive; Claude builds.
>
> **What we're building (v1):** a personal expense/income tracker. You (and later your users) send
> a WhatsApp message like *"Spent 500 on lunch"*, an AI reads it, saves it, and replies. A phone
> app shows your spending with charts and budgets.
>
> **The bigger vision (where this is headed):** Autonance is *one core ledger engine* with
> role-based modes layered on top — **Personal** (now) → **Pro** for freelancers (separate
> personal/business wallets, tax exports) → **Teams** for businesses (members, approvals, cost
> centers). We build the personal app first but design the database to be business-ready from day
> one, so we never have to rebuild the foundation. See the roadmap at the end of this guide.
>
> **Golden mindset:** you don't need to write code by hand. Your job is to (1) create accounts,
> (2) copy keys into the right place, and (3) give Claude clear instructions. This guide gives you
> the exact instructions to copy-paste.

---

## The big picture (how the pieces fit)

```
  You on WhatsApp  ──►  Meta WhatsApp Cloud API  ──►  Your Backend (on Render)
                                                          │
                                       ┌──────────────────┼───────────────────┐
                                       ▼                  ▼                   ▼
                                 Claude AI (parses)   Supabase (database)   replies back
                                                          ▲
                                                          │
                                   Your Mobile App (Expo)  reads the same data
```

- **WhatsApp Cloud API** = the pipe that carries messages between WhatsApp and your app.
- **Backend** = the brain that receives messages, asks Claude to understand them, and saves them.
- **Claude AI** = reads "Spent 500 on lunch" and returns clean data (amount, category, date…).
- **Supabase** = the database where every transaction is stored; also handles app login.
- **Mobile app** = the phone app that shows charts, budgets, and lets you add entries by hand.

---

## APIs / services you will connect (cheat sheet)

| Service | What it does for you | Cost | You'll need (the "key") |
|---|---|---|---|
| **Meta WhatsApp Cloud API** | Send/receive WhatsApp messages | Free test number; pay per message live | Access token, Phone Number ID, Verify token |
| **Anthropic (Claude) API** | AI that understands the messages | Pay per use (very cheap with Haiku) | API key |
| **Supabase** | Database + login + file storage | Free tier to start | Project URL, anon key, service key |
| **Render** | Hosts your backend on the internet (HTTPS) | Free/low tier to start | (account only) |
| **Expo** | Builds & previews the phone app | Free | (account only) |
| **GitHub** | Stores your code safely | Free | (account only) |

Keep all keys in a private notes file. **Never share them or put them in screenshots/chats.**

---

## Phase 0 — Create your accounts & install tools

Do these once. (Order doesn't matter much, but this is a good sequence.)

1. **GitHub** — sign up at github.com. This is where your code lives.
2. **Node.js** — install the LTS version from nodejs.org. This lets your computer run the code.
3. **A code editor** — install **VS Code** (code.visualstudio.com), and **Claude Code** inside it.
4. **Anthropic account** — console.anthropic.com → create an **API key**. Add a small amount of
   credit. Save the key.
5. **Supabase** — supabase.com → create a free account → create a new **project**. Save the
   **Project URL**, **anon key**, and **service role key** (Project Settings → API).
6. **Render** — render.com → sign up (you can log in with GitHub). We'll use this in Phase 4.
7. **Expo** — expo.dev → sign up. Install the **Expo Go** app on your phone (App Store / Play
   Store) for live previews.
8. **Meta / Facebook** — you'll need a personal Facebook account, then a **Meta Business** account
   and a **WhatsApp Business Account**. Full walkthrough is in **Phase 4** (it's the most involved
   one, so we do it after the app basics work).

> ✅ **End of Phase 0:** you have all accounts and the editor with Claude Code installed.

---

## Phase 1 — Set up the foundation

You'll mostly let Claude Code do this. Open this project folder (`Autonance`) in VS Code, open
Claude Code, and give it this instruction:

> **Prompt to Claude Code:**
> "Read `agent.md`. Scaffold the `backend/` package: a Node.js + TypeScript + Express project with
> a basic `src/index.ts` that starts an Express server on a `PORT` env var and has a `GET /health`
> route returning `{ ok: true }`. Add `package.json` scripts (`dev`, `build`, `start`), a
> `.env.example` with the variables listed in agent.md §5, a `.gitignore` that ignores `.env` and
> `node_modules`, and a `backend/README.md` with run steps. Don't add WhatsApp or AI yet."

Then test it: in the VS Code terminal, `cd backend`, run `npm install`, then `npm run dev`, and
open `http://localhost:3000/health` (or whatever port it prints) in your browser. You should see
`{ ok: true }`.

> ✅ **End of Phase 1:** a backend that runs locally and answers a health check.

---

## Phase 2 — The database (Supabase)

We need tables to store users, workspaces, wallets, transactions, categories, and budgets.

> **Important design choice:** even though v1 is personal-only, we build the database to be
> **business-ready** so we never have to rebuild it later. That means every transaction belongs to a
> **workspace** (your default personal one for now; business teams reuse the same structure later),
> and we store extra fields like `source`, `confidence`, and the original message. You won't *see*
> this complexity in the app yet — it's just future-proofing under the hood.

In the Supabase dashboard → **SQL Editor** → paste and run this (Claude can also generate/adjust it):

```sql
-- Workspaces: every user gets a default personal one; business teams reuse this later
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id),
  name text not null default 'Personal',
  type text check (type in ('personal','business')) default 'personal',
  base_currency char(3) not null default 'INR',
  created_at timestamptz default now()
);

-- Wallets/accounts: e.g. Cash, HDFC. v1 auto-creates one default wallet
create table wallets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id),
  name text not null default 'Cash',
  created_at timestamptz default now()
);

-- Transactions: the core ledger table
create table transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id),
  user_id uuid references auth.users(id),       -- who logged it
  wallet_id uuid references wallets(id),
  amount numeric(12,2) not null,
  currency char(3) not null default 'INR',
  type text check (type in ('expense','income','transfer')) not null,
  category text not null,
  subcategory text,
  description text,
  payee text,                                   -- merchant/vendor
  payment_mode text,                            -- e.g. UPI, cash, HDFC
  occurred_at date not null default current_date,   -- when it happened
  source text default 'app',                    -- 'app' | 'whatsapp' | 'import' | 'ocr'
  raw_message text,                             -- the original WhatsApp text (for traceability)
  parser_confidence numeric(3,2),               -- 0.00–1.00 from the AI
  attachment_url text,                          -- receipt image (later)
  created_at timestamptz default now()          -- when it was logged
);
create index on transactions (workspace_id, occurred_at);
create index on transactions (workspace_id, category);

-- Budgets: monthly limit per category
create table budgets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id),
  category text not null,
  monthly_limit numeric(12,2) not null,
  currency char(3) not null default 'INR',
  created_at timestamptz default now()
);

-- Link a WhatsApp phone number to an app user
create table whatsapp_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  workspace_id uuid references workspaces(id),
  phone text unique not null,          -- the user's WhatsApp number
  created_at timestamptz default now()
);
```

> **Why uuid + `auth.users`?** Supabase gives you a ready-made login system; each logged-in user
> gets an `id` in `auth.users`. We tie data to a **workspace** (owned by that user) so the same
> tables work later for business teams with multiple members — no migration needed.

> **Prompt to Claude Code (optional):** "Create `backend/src/services/db.ts` using
> `@supabase/supabase-js` initialized from `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`. Add typed
> helpers: `insertTransaction`, `getTransactions(filters)`, `getMonthlySummary`,
> `getCategoryBreakdown`, and budget CRUD. Follow agent.md."

> ✅ **End of Phase 2:** tables exist; backend can read/write them.

---

## Phase 3 — The backend brain (WhatsApp logic + Claude parsing)

Now give Claude Code the core build instruction. Paste this:

> **Prompt to Claude Code:**
> "Read `agent.md`. In `backend/`, implement:
> 1. `src/routes/webhook.ts` — `GET /webhook` that verifies Meta's challenge (compare
>    `hub.verify_token` to `WHATSAPP_VERIFY_TOKEN`, echo `hub.challenge`), and `POST /webhook` that
>    extracts the sender and message text and passes them to the message processor. Always reply 200.
> 2. `src/services/messageProcessor.ts` — classify the message into report / transaction / general
>    using the heuristics in agent.md §7, and route accordingly.
> 3. `src/services/parseExpense.ts` — call Claude Haiku via `@anthropic-ai/sdk` using the JSON
>    contract in agent.md §8 (include `type` income/expense/transfer, `payment_mode`, `confidence`).
>    Validate the category, resolve relative dates in `DEFAULT_TIMEZONE`. Apply the AI guardrails:
>    if `confidence` is low or the amount is unclear, reply with a clarification question instead of
>    saving; always store `raw_message` and `parser_confidence` on the row.
> 4. `src/services/whatsapp.ts` — `sendWhatsAppMessage(to, text)` calling the Graph API.
> 5. `src/services/summary.ts` — totals + category breakdown for a date range.
> Wire these into `src/index.ts`. Add Jest tests for `parseExpense`. Update `.env.example` and the
> README. Don't hardcode any secrets."

After it builds, fill in your real keys in `backend/.env` (copy from `.env.example`):
`ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and invent a `WHATSAPP_VERIFY_TOKEN`
(any random string, e.g. `autonance-verify-9f3k`). WhatsApp token + phone ID come in Phase 4.

> ✅ **End of Phase 3:** the brain is built. It can't talk to WhatsApp yet (Phase 4 connects it),
> but you can test the AI parsing locally with a Jest test or a temporary test route.

### WhatsApp conversation design (keep it dead simple)

The golden rule of the chat UX: **the user should never have to learn commands.** They write
naturally; the bot understands. Design the bot's replies around these patterns:

| User sends | Bot reply pattern |
|---|---|
| "Spent 350 on groceries" | **Confirmation:** "Saved ₹350 under Food, today. Edit?" |
| "Paid office rent 20,000 from HDFC" | **Confirmation w/ details:** "Saved ₹20,000 · Bills · HDFC." |
| "Paid 500 for travel" *(ambiguous)* | **Clarification:** "Was ₹500 for travel or fuel?" |
| "Show this week spending" | **Summary:** "You spent ₹12,430 this week, 18% higher than last week." |
| "Change last expense to 530" | **Correction:** "Updated your last expense to ₹530." |
| "help" | **Help text** listing what they can say |

Proactive messages (Phase 2+): weekly summaries, budget alerts ("You've used 80% of your Food
budget"), and gentle reminders. Remember the **24-hour window** rule from Phase 4 — proactive
messages outside that window must use pre-approved templates.

---

## Phase 4 — Connect WhatsApp (Meta Cloud API) — the careful part

This has the most clicking. Follow in order. Take your time.

### 4A. Set up Meta accounts
1. Go to **developers.facebook.com** → log in with Facebook → **My Apps** → **Create App**.
2. Choose the **Business** app type. Name it "Autonance".
3. In the app dashboard, **Add product → WhatsApp → Set up**. This creates a test setup and gives
   you a **free test phone number** and a **temporary access token** (valid ~24 hours).
4. On the WhatsApp → **API Setup** page, note your **Phone Number ID** and **temporary token**.
   Add your own personal WhatsApp number as a **recipient** so you can test.

### 4B. Get your backend onto the internet (Render)
Meta needs to reach your webhook over **HTTPS**. Your laptop's `localhost` isn't reachable, so we
deploy the backend to Render.
1. Push your code to GitHub (Claude Code: *"commit and push the backend to a new GitHub repo"*).
2. On Render → **New → Web Service** → connect the GitHub repo → root directory `backend`.
3. Build command `npm install && npm run build`, start command `npm start`.
4. Add all the **Environment Variables** from your `.env` (Anthropic, Supabase, the verify token).
5. Deploy. Render gives you a URL like `https://autonance.onrender.com`. Your webhook is
   `https://autonance.onrender.com/webhook`.

> **Tip for faster testing:** instead of redeploying each time, you can run the backend locally and
> use a tunneling tool (e.g. `ngrok`) to get a temporary public HTTPS URL. Render is the permanent
> home; ngrok is handy during development. Ask Claude Code to explain whichever you prefer.

### 4C. Register the webhook with Meta
1. In the app dashboard → **WhatsApp → Configuration → Webhook → Edit**.
2. **Callback URL:** your `https://…/webhook`. **Verify token:** the exact same
   `WHATSAPP_VERIFY_TOKEN` string you set in Render.
3. Click **Verify and save** — Meta calls your `GET /webhook`; if the tokens match it succeeds.
4. **Subscribe** to the `messages` field (and `message_template_status_update` for later).

### 4D. Send your first message
1. Put the **temporary token** and **Phone Number ID** into Render's env vars (`WHATSAPP_TOKEN`,
   `WHATSAPP_PHONE_NUMBER_ID`) and redeploy.
2. From your phone, WhatsApp-message the **test number** something like *"Spent 200 on coffee"*.
3. You should get a confirmation reply, and the row should appear in Supabase. 🎉

### 4E. Going live (when you're ready for real users)
- **Business verification:** verify your Meta Business (legal business details) to lift limits.
- **Add a real phone number:** a number **not** currently used in the normal WhatsApp app. (To
  move an existing number you must disable its 2FA and remove it from the app first.)
- **Display name approval:** submit your business display name for approval.
- **Permanent token:** create a **System User** in Meta Business Settings and generate a
  **permanent access token** (the temporary one expires in 24h). Put it in Render as
  `WHATSAPP_TOKEN`.
- **Know the rules:**
  - **24-hour window:** after a user messages you, you can send free-form replies for 24 hours.
    Outside that window you may only send **pre-approved message templates**.
  - **Pricing:** Meta bills **per delivered template message** (rates differ for
    service/marketing/authentication). Service replies inside the 24h window are free/cheaper.
  - **Limits:** unverified ≈ 250 users/day; verified up to 100k/day; throughput starts ~80 msg/sec.

> ✅ **End of Phase 4:** sending a WhatsApp message creates a real transaction in your database.

---

## Phase 5 — The mobile app (Expo)

> **Prompt to Claude Code:**
> "Read `agent.md` and `design.md`. Scaffold the `mobile/` Expo app (TypeScript). Implement:
> a Supabase client (`lib/supabase.ts`) using the public anon key; Login/Signup with Supabase auth;
> a Dashboard showing balance, income vs expense, and recent transactions; a Transactions list with
> filters; an Add/Edit transaction form that calls the backend; an Analytics screen with a category
> donut and a monthly trend chart; a Budgets screen; a Settings screen with base currency/timezone;
> and a 'Connect WhatsApp' screen with a `wa.me` deep-link button. Use the colors, typography, and
> screen references in `design.md`. Use bottom-tab navigation."

Test it: `cd mobile`, `npm install`, `npx expo start`, scan the QR code with **Expo Go** on your
phone. Log in, add a transaction, and confirm it shows in the list and charts.

For the **Connect WhatsApp** button, the link format is:
`https://wa.me/<your-business-number>?text=Hi%20Autonance` — tapping it opens a chat with your bot.

> ✅ **End of Phase 5:** a working phone app that shares data with the WhatsApp bot.

---

## Phase 6 — Test everything end-to-end

Run through this checklist:
1. WhatsApp *"Spent 500 on lunch yesterday"* → reply confirms → row appears in app with yesterday's
   date, category Food, type expense.
2. WhatsApp *"Received 10000 salary"* → income, correct amount.
3. WhatsApp *"summary this month"* → returns totals + category breakdown.
4. WhatsApp *"help"* → returns the help text.
5. In the app: add a manual transaction → it appears; edit it; delete it.
6. Set a budget; spend near it; confirm the warning state shows.
7. Try a tricky message (different currency, *"₹1,250 for groceries at DMart"*) and confirm the AI
   parses it correctly. Note any mis-parses to refine the prompt.

> **Prompt to Claude Code if parsing is off:** "Here are 5 example messages and what the JSON
> *should* be: [paste]. Adjust the prompt in `parseExpense.ts` so these parse correctly, and add
> them as test cases."

---

## Phase 7 — Launch & iterate

1. **Deploy** the latest backend to Render; build the app for stores later (Expo EAS Build) or keep
   sharing via Expo Go for a private beta.
2. **Private beta:** invite a handful of friends. Watch the logs for mis-parses and errors.
3. **Monitor:** add basic logging; check Render logs and Supabase data regularly.
4. **Then grow in layers** following the product roadmap below — don't build it all at once. A
   conversational finance product gets messy fast if the ledger and parser aren't rock-solid first.

### Product roadmap (the staged plan)

| Phase | Focus | Rough time | What ships |
|---|---|---|---|
| **1 — MVP foundation** | Prove the core value | 8–10 weeks | Phone login, WhatsApp webhook, text parsing, ledger, app dashboard, category analytics, edit/delete. *(This is what Phases 1–6 of this guide build.)* |
| **2 — Retention & automation** | Make it feel smart | 6–8 weeks | Budgets + alerts, reminders, recurring entries, weekly WhatsApp summaries, **voice notes**, **receipt OCR**, richer analytics |
| **3 — Business mode** | B2B revenue path | 8–12 weeks | Multi-user workspaces, roles, approvals, employee dashboards, department/cost-center budgets, audit logs, report exports |
| **4 — Advanced intelligence** | Differentiation | ongoing | Forecasting, anomaly detection, accounting integrations, multilingual assistant, personalized insights |

### Monetization (where revenue comes from later)

| Plan | Target user | Includes |
|---|---|---|
| **Free** | Personal users | WhatsApp logging, app dashboard, ~3 months analytics, limited exports |
| **Plus** | Power users & freelancers | Unlimited history, OCR receipts, recurring entries, savings goals, tax-friendly export |
| **Business** | Small teams | Multi-user workspaces, approvals, roles, cost centers, business analytics, policies |
| **Enterprise** | Larger orgs | Custom integrations, audit controls, advanced permissions, SLA, dedicated onboarding |

---

## How to drive Claude Code well (your operating manual)

- **Always start a build session with:** *"Read `agent.md` (and `design.md` for UI) first."*
- **Give one clear goal per prompt.** Smaller asks = better results. Use the copy-paste prompts in
  each phase above.
- **Review the diffs** Claude shows before approving — you don't need to read code deeply, but
  approve in small steps so it's easy to undo.
- **When something breaks,** paste the exact error message to Claude and say *"fix this."*
- **The golden rule (tell Claude to respect it):** the AI/LLM should **only parse messages into
  JSON** — all other logic lives in normal code. This keeps costs ~30× lower and behaviour stable.
- **Keep `agent.md` and `design.md` updated** — they're Claude's memory between sessions.

---

## Cost expectations (rough, to avoid surprises)

| Item | Starting cost |
|---|---|
| Supabase | **Free** tier is plenty for the beta |
| Render | Free/low tier (~$0–7/mo) for one small backend |
| Anthropic Claude Haiku | Fractions of a cent per parsed message — a few dollars covers thousands |
| WhatsApp test number | **Free** while testing |
| WhatsApp live messages | Per-message; service replies in the 24h window are cheapest/free |
| Expo | **Free** (store fees later: Apple $99/yr, Google $25 one-time) |

You can build and test the entire v1 for roughly the price of a coffee in API usage. Real costs
arrive only when you have live WhatsApp traffic at scale.

---

## Security & compliance checklist (keep this honest)

- [ ] All keys live in **environment variables**, never in code or screenshots.
- [ ] The Supabase **service key** stays on the backend only; the app uses the **anon** key.
- [ ] Backend is **HTTPS** (Render gives this automatically).
- [ ] Add a **privacy policy** and terms before public launch (you'll need them for app stores).
- [ ] Support **data deletion on request** (a user can ask you to delete their data).
- [ ] WhatsApp only messages users who **opted in** (they message you first).

---

### Where to go next, right now
1. Finish **Phase 0** (create the accounts).
2. Fill the `TODO`s in **`design.md`** with your Mobbin references, colors, and fonts.
3. Tell me / Claude Code: *"Start Phase 1 — scaffold the backend per agent.md."*

You've got this. Each phase is small, and Claude writes the code — you just steer.
