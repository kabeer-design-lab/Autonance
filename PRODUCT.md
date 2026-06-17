# PRODUCT.md — Autonance (Master Context)

> **This is the single source of truth for the Autonance product idea, end to end.**
> Any agent or collaborator should read this file first for full context before working.
> Operational detail lives in companion files (see [§16](#16-where-the-detail-lives)):
> `agent.md` (build rules), `design.md` (design system), `Plan.md` (step-by-step build guide).
>
> _Last updated: 2026-06-17_

---

## 1. One-liner

**Autonance is a WhatsApp-first personal-finance assistant.** You log money by chatting in plain
language — *"Spent 500 on lunch"* — an AI structures it, and a companion mobile app shows your
spending with clean analytics and budgets.

**Elevator pitch:** Most people abandon expense apps because opening an app to log every coffee is
too much friction. Autonance removes that friction entirely: you just message a WhatsApp number like
you'd text a friend. Behind the scenes it becomes a finance-grade ledger you can review, analyze,
and budget against in a calm mobile app. It starts personal, and grows into a freelancer and
small-business expense platform on the same foundation.

---

## 2. The problem & why this works

- **Problem:** Traditional expense apps fail on *capture friction*. People don't log consistently,
  so the data — and the app — become useless.
- **Insight:** WhatsApp is already open all day. Two-way WhatsApp Business messaging supports
  chatbot workflows, so expense capture can happen *inside the app people already live in*.
- **Why now:** Cheap, accurate LLMs can turn messy natural language ("got paid 32k from client")
  into clean structured transactions reliably — the missing piece that makes conversational
  logging actually work.
- **The moat:** frictionless capture + trustworthy AI categorization + genuinely useful analytics.

---

## 3. Vision & strategy

**One core ledger engine, role-based modes.** We build a *single* shared finance backend, then
layer experiences on top of it — never separate apps. The ledger is designed to be
**business-ready from day one**, even though the first release is personal-only, so we never have
to re-architect the foundation.

```
                     ┌─────────────────────────────┐
   Personal  ──►     │   ONE CORE LEDGER ENGINE     │     ──►  Pro (freelancers)
   (v1 now)          │  transactions · workspaces   │          ──► Teams (business)
                     │  wallets · categories · AI   │
                     └─────────────────────────────┘
```

**Strategic sequencing:** validate with a simple **personal** experience first, keep the backend
**business-ready**, then expand into freelancer tax workflows and finally team/approval features.
This avoids shipping an over-scoped prototype.

---

## 4. Target users

| Mode | Who | What they need |
|---|---|---|
| **Personal** (v1) | Everyday users | Track expenses, income, savings, budgets. Weekly/monthly summaries on WhatsApp. Category analytics, trends, spend alerts. Add by chat, voice, receipt, or app form. |
| **Pro** (later) | Freelancers, solo owners | Separate personal & business wallets. Invoices received, business spends, reimbursements, taxes. Tax/GST-friendly exports. Tags like project, client, payment method. |
| **Teams** (later) | Small businesses | Multi-user capture over WhatsApp. Manager approvals & policy rules. Department/employee/vendor/cost-center analytics. Audit trail, receipt storage, finance exports. |

---

## 5. Core value & how it works

Frictionless capture is the heart. Users should **not** need to open the app to log — the app is
where they **review, edit, analyze, and configure**.

```
  You on WhatsApp ──► Meta WhatsApp Cloud API ──► Backend ──► AI parses ──► Ledger DB
                                                     │                          ▲
                                                     └── confirmation reply     │
                                                                                │
                                   Mobile App (dashboards, budgets) reads ──────┘
```

1. User sends *"Paid 560 for petrol"*.
2. AI parser extracts amount, type, category, merchant, date, payment mode — **plus a confidence
   score**.
3. Bot replies with a confirmation: *"Saved as Transport expense ₹560 today. Edit?"*
4. The transaction syncs instantly to the mobile app, where analytics and budgets update.

---

## 6. Features

Keep the first release focused on **fast capture, clean ledgering, understandable analytics.**

| Area | MVP (must-have) | Later phases |
|---|---|---|
| **Transaction capture** | Text entry on WhatsApp, app form, income/expense logging, edit & delete | Voice-to-text, OCR receipt scan, recurring transactions, smart suggestions |
| **Ledger structure** | Categories, wallets/accounts, timestamp, notes, payment mode, attachments | Split bills, shared expenses, tags, location, merchant normalization |
| **Analytics** | Monthly totals, income vs expense, category distribution, cashflow trend | Budget forecasting, anomaly detection, savings goals, AI insights |
| **Business controls** | _(schema-ready, not exposed in v1)_ | Members, roles, approvals, cost centers, policies, reimbursement lifecycle, audit dashboard |
| **WhatsApp assistant** | Save transaction, list recent logs, answer summary questions | Budget alerts, approval actions, NL corrections, multilingual, reminders |

---

## 7. User journeys

**WhatsApp flow**
- User messages your verified WhatsApp brand: *"Spent 350 on groceries"*.
- NLP parser extracts amount, type, category, merchant, date, payment mode.
- Bot confirms: *"Saved under Food, ₹350 today. Edit?"*
- User can ask *"how much did I spend this week?"* or *"show April income vs expense"*.

**Mobile app flow**
- Sign in with phone number; synced transactions appear instantly.
- Home shows balance, recent transactions, budgets, unusual-spend alerts.
- Analytics shows category mix, daily trend, cashflow.
- Users can add, edit, split, attach receipts, and export records.

---

## 8. WhatsApp conversation design

**Golden rule: the user never has to learn commands.** They write naturally; the bot understands.

| User sends | Bot pattern |
|---|---|
| "Spent 350 on groceries" | **Confirmation:** "Saved ₹350 under Food, today. Edit?" |
| "Paid office rent 20,000 from HDFC" | **Confirmation w/ detail:** "Saved ₹20,000 · Bills · HDFC." |
| "Paid 500 for travel" *(ambiguous)* | **Clarification:** "Was ₹500 for travel or fuel?" |
| "Show this week spending" | **Summary:** "You spent ₹12,430 this week, 18% higher than last week." |
| "Change last expense to 530" | **Correction:** "Updated your last expense to ₹530." |
| "help" | Help text of what they can say |

Proactive (later): weekly summaries, budget alerts, gentle reminders — subject to WhatsApp's
**24-hour window** rule (outside it, only pre-approved templates).

---

## 9. AI & automation

AI should **remove friction, not create confusion.** Keep it assistive, with clear confirmations
before saving anything ambiguous.

**Good use cases:** understand natural messages ("got paid 32k from client"), suggest categories &
merchants from history, turn receipt images into draft transactions, summarize "where did my money
go this month?" in plain language.

**Guardrails (non-negotiable):**
- Never silently guess the amount when confidence is low.
- Always show a confirmation/clarification for low-confidence parsing.
- Store the parser **confidence score** and the **raw user message** for traceability and tuning.
- Let users correct category, date, and amount easily from chat or app.
- **The LLM only parses** message → JSON. All other logic (routing, validation, math, DB, summaries)
  lives in normal code. This keeps cost low (~30× cheaper) and behavior predictable.

---

## 10. App screens (mobile)

Compact information architecture — *a finance app should feel calm, not crowded.*

1. **Onboarding** — phone verify, choose Personal/Business mode, base currency, categories, connect WhatsApp.
2. **Home dashboard** — net balance, month spend, month income, budget status, recent activity, quick-add.
3. **Transactions** — search, filter, edit, split, attach receipt, export.
4. **Analytics** — category donut, spend-trend line, income-expense bar, merchant insights.
5. **Budgets** — monthly limits, category caps, alert thresholds, savings goals.
6. **Settings & workspace** — currency, categories, reminders, language, permissions, support (later: members/roles/approvals).

---

## 11. Tech architecture & stack

**Confirmed stack (one language — TypeScript — everywhere):**

| Layer | Choice |
|---|---|
| Mobile app | **React Native + Expo** (TypeScript) |
| Backend API | **Node.js + TypeScript + Express** |
| Database + Auth + Storage | **Supabase** (managed Postgres) |
| AI parsing | **Anthropic Claude Haiku** |
| WhatsApp | **Meta WhatsApp Business Cloud API** (direct, no BSP) |
| Backend hosting | **Render** (provides the public HTTPS webhook URL) |

**Deferred infra (add per phase):** Redis (jobs, reminders, scheduled digests), object storage for
receipts (Supabase Storage / S3), Metabase/Superset for internal analytics.

**Integration layer:** WhatsApp webhook receives messages/media/events → NLP service parses intent
(create expense/income, query summary, edit) → transaction service validates & writes normalized
ledger records → notification service sends confirmations, reminders, digests. Use event-based
processing so WhatsApp and the app write to the same ledger without sync issues.

---

## 12. Data model

Designed for finance-grade accuracy and **business-readiness from day one** (even though v1's UX is
personal). Every transaction belongs to a **workspace**, so multi-member teams reuse the same tables
later with no migration.

**Core entities:** User · Workspace (default personal per user) · Wallet/account · Transaction ·
Category · Attachment/receipt · Budget.

**Transaction fields:** type (`income`/`expense`/`transfer`), amount + currency, `occurred_at` (when
it happened) **and** `created_at` (when logged), merchant/payee, category + subcategory, payment
mode, `source` (`whatsapp`/`app`/`import`/`ocr`), `raw_message`, `parser_confidence`, attachment URL.

**Deferred (defined when Teams ships):** Member/role, Approver, Department, Cost center, Expense
policy, Approval event log.

> Full SQL lives in `Plan.md` (Phase 2). Schema rules live in `agent.md` (§9).

---

## 13. Design language

Calm, warm "quiet fintech": warm off-white backgrounds + deep teal primary. **Clash Display** for
headings, **Satoshi** for body, tabular numerals for amounts. Income = green; expense = neutral with
a minus (red optional). Full token set (light + dark themes, spacing, radius, shadows, per-category
colors, screen inventory) lives in `design.md`. Refine with Mobbin references per screen.

---

## 14. Roadmap

Build in layers — conversational finance gets messy fast if the ledger and parser aren't stable.

| Phase | Focus | Rough time | Ships |
|---|---|---|---|
| **1 — MVP foundation** | Prove core value | 8–10 wks | Phone login, WhatsApp webhook, text parsing, ledger, app dashboard, category analytics, edit/delete |
| **2 — Retention & automation** | Feel smart | 6–8 wks | Budgets + alerts, reminders, recurring entries, weekly summaries, voice notes, receipt OCR, richer analytics |
| **3 — Business mode** | B2B revenue | 8–12 wks | Multi-user workspaces, roles, approvals, employee dashboards, dept/cost-center budgets, audit logs, exports |
| **4 — Advanced intelligence** | Differentiation | ongoing | Forecasting, anomaly detection, accounting integrations, multilingual, personalized insights |

---

## 15. Monetization

| Plan | Target | Includes |
|---|---|---|
| **Free** | Personal users | WhatsApp logging, app dashboard, ~3 months analytics, limited exports |
| **Plus** | Power users & freelancers | Unlimited history, OCR receipts, recurring entries, savings goals, tax-friendly export |
| **Business** | Small teams | Multi-user workspaces, approvals, roles, cost centers, business analytics, policies |
| **Enterprise** | Larger orgs | Custom integrations, audit controls, advanced permissions, SLA, dedicated onboarding |

---

## 16. Risks & key decisions

**Biggest risks**
- Bad parsing breaks user trust quickly → invest in guardrails & confirmations.
- Too many user types in v1 slows delivery → start personal-only.
- Weak analytics makes the app feel replaceable → make insights genuinely useful.
- WhatsApp costs & template limits must be managed carefully (24-hour window, per-message billing).
- Finance data needs strong privacy, permissions, and auditability.

**Decisions to lock early**
- ✅ MVP targets **personal users first** (business-ready backend). _Decided._
- ✅ Parser is **AI-based** (Claude Haiku), backend handles all other logic. _Decided._
- ⬜ Pull **freelancer** features (business wallet, tax export) into v1, or keep strictly personal?
- ⬜ Primary **export formats** for the initial market (CSV / PDF / GST-friendly)?
- ⬜ **Language support** for India-first adoption (English only at launch?).
- ⬜ Income/expense **color rule** — expense neutral vs red (see `design.md`).

---

## 17. Current status

- **Stage:** planning / pre-build. Repo scaffolding not started.
- **Confirmed:** React Native + Expo, direct Meta Cloud API, Supabase, Claude Haiku, personal-first MVP.
- **Next action:** complete Phase 0 accounts in `Plan.md`; fill remaining Mobbin/design choices in
  `design.md`; then *"Start Phase 1 — scaffold the backend per agent.md."*

---

## 18. Where the detail lives

| File | Purpose |
|---|---|
| **PRODUCT.md** (this file) | End-to-end product context — the master reference |
| **agent.md** | Build rules & conventions for the AI coding agent (stack, data model, env vars, guardrails) |
| **design.md** | Visual design system — colors, typography, components, screens, Mobbin slots |
| **Plan.md** | Non-technical, step-by-step build & launch guide (accounts → DB → backend → WhatsApp → app → launch) |

> **For agents:** read **PRODUCT.md** for the *why* and *what*, then `agent.md` for *how to build*,
> `design.md` for *how it looks*, and `Plan.md` for *the step-by-step sequence*.
