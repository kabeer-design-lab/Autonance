# DESIGN.md — Autonance Design System

> This is the **visual source of truth** for the Autonance mobile app. The base palette,
> typography, and scales below are pulled from the approved product-plan document and are a strong,
> coherent starting point — a calm, warm, "quiet fintech" look. You can refine any value or layer
> in **Mobbin** references (slots marked `TODO`) before building each screen.
>
> Design principle (from the plan): **a finance app should feel calm, not crowded.** Keep
> information architecture compact; let whitespace breathe.

---

## 1. Brand

- **App name:** Autonance
- **One-line description:** Track money by chatting on WhatsApp.
- **Tone / personality:** calm, warm, trustworthy, modern fintech. Not flashy.
- **Logo:** `TODO: drop logo file path or link`
- **App icon:** `TODO`

---

## 2. Color tokens

These are the **approved base palette** (warm off-white + deep teal). Override only if your Mobbin
direction differs.

### Light theme
| Token | Purpose | Value |
|---|---|---|
| `background` | Screen background | `#f7f6f2` |
| `surface` | Cards, sheets | `#f9f8f5` |
| `surface2` | Raised/inner surfaces | `#fbfbf9` |
| `surfaceOffset` | Chips, subtle fills | `#edeae5` |
| `border` | Dividers, input borders | `#d4d1ca` |
| `textPrimary` | Headings, key numbers | `#28251d` |
| `textMuted` | Labels, secondary text | `#6e6c66` |
| `textFaint` | Hints, disabled | `#98958f` |
| `primary` | Brand, primary buttons | `#01696f` |
| `primaryHover` | Pressed/active primary | `#0c4e54` |
| `success` / income | Income, positive | `#437a22` |
| `warning` | Budget near-limit, caution | `#964219` |
| `blue` | Info accent | `#006494` |
| `purple` | Accent (charts/tags) | `#7a39bb` |
| `error` / expense-alert | Errors, alerts | `#a12c7b` |

### Dark theme
| Token | Value |
|---|---|
| `background` | `#171614` |
| `surface` | `#1c1b19` |
| `surface2` | `#201f1d` |
| `surfaceOffset` | `#22211f` |
| `border` | `#393836` |
| `textPrimary` | `#e3e1dc` |
| `textMuted` | `#afaca6` |
| `textFaint` | `#7c7973` |
| `primary` | `#4f98a3` |
| `primaryHover` | `#6eb3bd` |
| `success` / income | `#86bb61` |
| `warning` | `#d68a5d` |
| `blue` | `#76b1df` |
| `purple` | `#b88ce8` |
| `error` | `#da7fbb` |

> **Income vs expense convention:** income uses `success` (green), expense amounts use
> `textPrimary` (neutral) with a minus sign, and over-budget/alert states use `warning`/`error`.
> Keep this consistent everywhere. `TODO: confirm if you want expense shown in red instead.`

**Category colors** (for chips & chart slices) — start from the accent set above, refine to taste:

| Category | Suggested color |
|---|---|
| Food | `#964219` (warning/terracotta) |
| Transport | `#006494` (blue) |
| Shopping | `#7a39bb` (purple) |
| Bills | `#01696f` (primary teal) |
| Entertainment | `#a12c7b` (pink) |
| Health | `#437a22` (green) |
| Business | `#0c4e54` (deep teal) |
| Education | `#6e6c66` (muted) |
| Other | `#98958f` (faint) |

---

## 3. Typography

Base fonts from the plan (load via Fontshare or bundle in Expo):

- **Display / headings:** **Clash Display** (400, 500, 600) — screen titles, big balance.
- **Body / UI:** **Satoshi** (300, 400, 500, 700) — default text, labels, buttons.
- **Numbers / amounts:** use **tabular numerals** (`font-variant-numeric: tabular-nums`) so amounts
  align in lists.

| Style | Size (fluid) | Weight | Font | Used for |
|---|---|---|---|---|
| Display | ~1.5–2.25rem | 600 | Clash Display | Dashboard balance, hero |
| H1 | ~1.5–2.25rem | 500 | Clash Display | Screen titles |
| H2 | ~1.125–1.5rem | 500 | Clash Display | Section headers |
| Body | ~1–1.125rem | 400 | Satoshi | Default text |
| Body-strong | ~1–1.125rem | 500/700 | Satoshi | Emphasis |
| Caption | ~0.75–0.875rem | 400 | Satoshi | Labels, timestamps |
| Amount-lg / Amount-sm | match Display / Body | 500 | Satoshi (tabular) | Transaction amounts |

> `TODO: confirm fonts, or swap to your Mobbin pick (e.g. Inter / SF Pro).`

---

## 4. Spacing, radius & elevation

- **Spacing scale (rem):** `0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4`
  (i.e. 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px)
- **Corner radius:** sm `0.375rem` (6px) · md `0.5rem` (8px) · lg `0.75rem` (12px) · xl `1rem` (16px)
- **Shadows:** `sm: 0 1px 2px rgba(40,37,29,.06)` · `md: 0 10px 30px rgba(40,37,29,.08)`
  (dark theme: heavier, e.g. `0 10px 30px rgba(0,0,0,.3)`)
- **Screen padding:** 16px horizontal; cards use 24px (`space-6`) internal padding.

---

## 5. Component patterns

| Component | Notes / states | Mobbin reference |
|---|---|---|
| Primary button | teal fill, `primaryHover` on press; loading + disabled states | `TODO` |
| Secondary / ghost button | bordered, transparent fill | `TODO` |
| Text input | `border` default, `primary` on focus, `error` on invalid + label | `TODO` |
| Amount input | large numeric keypad style, tabular nums | `TODO` |
| Category chip | pill, `surfaceOffset` bg, category color dot | `TODO` |
| Transaction row | category icon + title + date, amount right (income green / expense neutral) | `TODO` |
| Summary card | balance / income / expense, `highlight` gradient option | `TODO` |
| Bottom navigation | tabs: Home, Transactions, Add, Analytics, Settings | `TODO` |
| Budget progress bar | % used; `warning` near limit, `error` over | `TODO` |
| Confirmation card (chat-style) | mirrors the WhatsApp confirm: "Saved ₹560 · Transport · today · Edit?" | `TODO` |
| Empty state | calm "no transactions yet" | `TODO` |
| Toast / confirmation | "Saved ₹500 to Food" | `TODO` |

---

## 6. Screen inventory (v1)

| # | Screen | What's on it | Mobbin reference |
|---|---|---|---|
| 1 | Onboarding | Phone verify, choose Personal/Business mode, base currency, categories, connect WhatsApp | `TODO` |
| 2 | Login / Sign up | Phone-number login (OTP via Supabase auth) | `TODO` |
| 3 | Home dashboard | Net balance, month spend, month income, budget status, recent activity, quick-add | `TODO` |
| 4 | Transactions | Search, filter, edit, split, attach receipt, export | `TODO` |
| 5 | Add / Edit transaction | Amount, type (income/expense/transfer), category, wallet, date, note, payee | `TODO` |
| 6 | Transaction detail | View one, edit/delete, see source (WhatsApp/app) + receipt | `TODO` |
| 7 | Analytics | Category donut, spend-trend line, income-vs-expense bar, merchant insights | `TODO` |
| 8 | Budgets | Monthly limits, category caps, alert thresholds, savings goals | `TODO` |
| 9 | Connect WhatsApp | Explainer + `wa.me` deep-link button | `TODO` |
| 10 | Settings & workspace | Base currency, timezone, categories, profile, privacy, logout (later: members/roles) | `TODO` |

---

## 7. Charts

- **Category breakdown:** donut/pie, slices use category colors from §2.  `TODO: Mobbin example`
- **Spend trend:** line over time.  `TODO: Mobbin example`
- **Income vs expense:** grouped/stacked bar.  `TODO: Mobbin example`
- **Library:** chosen during build (e.g. `victory-native` or `react-native-gifted-charts`).
- **Style:** rounded bars, minimal gridlines, tabular-num labels, lots of whitespace.

---

## 8. Mobbin reference dump (scratch area)

Paste inspiration links/screenshots here while browsing; we'll slot them into the tables above.

- `TODO`
- `TODO`

---

### Next step
The base palette + type are ready to build against. Add Mobbin references per screen where you want
a specific layout, confirm the income/expense color rule, then tell the agent
*"build screen X from design.md"*.
