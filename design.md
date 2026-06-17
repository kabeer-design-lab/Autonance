# DESIGN.md — Autonance Design System

> **This is the single source of truth for all UI.** The agent reads this before building any screen
> or component. All values are extracted from Mobbin references (Fuse, GoPay, Revolut, Vivid,
> Quicken) and adapted for Autonance's brand.
>
> Design principle: **calm, minimal, trustworthy.** Lots of whitespace. Amounts are the hero.

---

## 1. Brand

- **App name:** Autonance
- **Tagline:** Track money by chatting on WhatsApp.
- **Personality:** Clean fintech. Not flashy. Confident and calm.
- **Primary accent:** Deep teal — warm but professional.

---

## 2. Color tokens

### Light theme (primary)

| Token | Hex | Usage |
|---|---|---|
| `background` | `#F7F7F5` | Screen background (warm white) |
| `surface` | `#FFFFFF` | Cards, sheets, list rows |
| `surface2` | `#F2F2F0` | Inner surfaces, input backgrounds |
| `surfaceOffset` | `#E8E8E5` | Chips, dividers, skeleton |
| `border` | `#E0DED8` | Input borders, dividers |
| `primary` | `#01696F` | Brand, primary buttons, links |
| `primaryLight` | `#E6F3F3` | Primary tint backgrounds |
| `primaryDark` | `#0C4E54` | Pressed state |
| `income` | `#2D7A3A` | Income amounts, positive values |
| `incomeLight` | `#E8F5EA` | Income badge background |
| `expense` | `#C0392B` | Expense amounts, negative values |
| `expenseLight` | `#FDECEA` | Expense badge background |
| `warning` | `#D4811A` | Budget near limit |
| `warningLight` | `#FEF3E2` | Warning badge background |
| `textPrimary` | `#1A1A1A` | Headings, amounts, key content |
| `textSecondary` | `#5C5C5C` | Labels, descriptions |
| `textMuted` | `#9A9A9A` | Hints, timestamps, captions |
| `textInverse` | `#FFFFFF` | Text on dark/primary backgrounds |

### Dark theme

| Token | Hex |
|---|---|
| `background` | `#111110` |
| `surface` | `#1C1C1A` |
| `surface2` | `#242422` |
| `surfaceOffset` | `#2C2C2A` |
| `border` | `#383836` |
| `primary` | `#4FA8B0` |
| `primaryLight` | `#1A3335` |
| `primaryDark` | `#6EC0C8` |
| `income` | `#5CB870` |
| `incomeLight` | `#1A3320` |
| `expense` | `#E05C4B` |
| `expenseLight` | `#3D1A18` |
| `textPrimary` | `#F0EFEC` |
| `textSecondary` | `#A8A8A5` |
| `textMuted` | `#6A6A68` |

### Category colors (for chips & chart slices)

| Category | Color | Light bg |
|---|---|---|
| Food | `#E8622A` | `#FEF0EA` |
| Transport | `#2D7DC8` | `#EAF3FC` |
| Shopping | `#9B59B6` | `#F5EEF8` |
| Bills | `#01696F` | `#E6F3F3` |
| Entertainment | `#E91E8C` | `#FCE8F3` |
| Health | `#27AE60` | `#E8F8EF` |
| Business | `#2C3E6B` | `#E8EAF0` |
| Education | `#F39C12` | `#FEF6E6` |
| Other | `#7F8C8D` | `#F0F2F2` |

---

## 3. Typography

**Fonts** (load via Expo Google Fonts):
- **Display / Headings:** `DM Sans` — weight 700 (bold balance, screen titles)
- **Body / UI:** `DM Sans` — weight 400, 500 (default text, buttons, labels)
- **Numbers / Amounts:** `DM Mono` — tabular numerals for amounts in lists

| Style | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `display` | 40px | 700 | 44px | Dashboard balance hero |
| `h1` | 28px | 700 | 34px | Screen titles |
| `h2` | 22px | 600 | 28px | Section headers |
| `h3` | 18px | 600 | 24px | Card titles |
| `body` | 16px | 400 | 24px | Default text |
| `bodyMedium` | 16px | 500 | 24px | Emphasis, row titles |
| `label` | 14px | 500 | 20px | Labels, button text |
| `caption` | 12px | 400 | 16px | Timestamps, hints |
| `amountLg` | 36px | 700 | 40px | Add transaction input |
| `amountMd` | 20px | 600 | 24px | Summary cards |
| `amountSm` | 16px | 500 | 20px | Transaction rows |

---

## 4. Spacing & layout

- **Base unit:** 4px
- **Scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- **Screen padding:** 20px horizontal
- **Card padding:** 16px
- **Section gap:** 24px
- **Row height:** 64px (transaction rows)

### Corner radius
| Name | Value | Used for |
|---|---|---|
| `xs` | 6px | Chips, badges |
| `sm` | 10px | Buttons, inputs |
| `md` | 14px | Cards |
| `lg` | 20px | Bottom sheets, modals |
| `full` | 999px | Pills, FAB |

### Shadows
```
card:   0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)
modal:  0 8px 32px rgba(0,0,0,0.12)
fab:    0 4px 16px rgba(1,105,111,0.30)
```

---

## 5. Components

### Button — Primary
- Background: `primary` | Text: `textInverse` | Radius: `sm`
- Height: 52px | Full width | Font: `label` 500
- States: default → pressed (`primaryDark` bg) → disabled (40% opacity)
- **Reference:** GoPay "Add expense" green button

### Button — Secondary
- Background: `surfaceOffset` | Text: `textPrimary` | Border: `border`
- Same height as primary

### Button — Pill (action)
- Small pill: height 36px, horizontal padding 16px
- Background: `#1A1A1A` | Text: `#FFFFFF` | Radius: `full`
- Used for: quick actions on dashboard (+ Add, ↗ Send)
- **Reference:** Fuse "Receive / Swap / Send" black pills

### FAB (Floating Action Button)
- Size: 56px circle | Background: `primary` | Icon: white `+`
- Position: bottom right, 24px from edge, 24px above tab bar
- Shadow: `fab`
- **Reference:** Fuse large black `+` FAB

### Input — Text
- Height: 52px | Background: `surface2` | Border: `border` (1px)
- Focus border: `primary` (2px) | Radius: `sm`
- Label above (12px, `textMuted`)

### Input — Amount (numpad style)
- Large centered amount display: `amountLg`, `textPrimary`
- Placeholder `₹0` in `textMuted`
- Native numpad keyboard
- **Reference:** GoPay amount input at top of add screen

### Category Chip
- Height: 40px | Radius: `xs` | Horizontal padding: 12px
- Unselected: bg `surfaceOffset`, text `textSecondary`
- Selected: bg category light color, text category color, border category color
- Icon: 20px emoji or SF Symbol left of label
- **Reference:** GoPay category row (Food & drink, Shopping, Transport, More)

### Transaction Row
- Height: 64px | Background: `surface`
- Left: 40px circle icon (category color bg, white icon)
- Middle: title (`bodyMedium`, `textPrimary`) + subtitle (`caption`, `textMuted`)
- Right: amount (`amountSm`) — income = `income` color, expense = `expense` color
- Divider: 1px `border` (left-inset by 60px)
- **Reference:** Fuse Activity screen rows

### Date Section Header
- Height: 32px | Text: `caption` 500, `textMuted` | Background: `background`
- e.g. "Today", "Yesterday", "17 Jun 2026"

### Summary Card (balance overview)
- Background: `primary` | Radius: `md` | Padding: 20px
- Balance label: `caption`, white 70% opacity
- Balance amount: `display`, white
- Income / Expense row below with small labels
- **Reference:** Fuse wallet card pattern

### Budget Progress Bar
- Track: `surfaceOffset` | Fill: `primary` | Height: 6px | Radius: `full`
- Warning state (>80%): fill `warning`
- Over state (>100%): fill `expense`

### Bottom Tab Bar
- Height: 80px (includes safe area) | Background: `surface`
- Top border: `border` 1px
- 5 tabs: Home, Transactions, Add (FAB), Analytics, Settings
- Active: `primary` icon + label | Inactive: `textMuted`
- **Reference:** Fuse bottom bar (home, clock, settings with FAB)

### Chart — Donut
- Outer radius: fills available width | Inner radius: 65% (thick ring)
- Slices: category colors
- Center label: total amount (`h2`) + "Spent" (`caption`)
- Legend below: category row with color dot + name + amount
- **Reference:** Revolut / Quicken analytics donut

### Chart — Line (trend)
- Thin 2px line, `primary` color
- No grid lines (clean)
- Time period selector: pill tabs (1W, 1M, 3M, 1Y)
- **Reference:** Fuse dashboard mini chart

### Confirmation Toast (WhatsApp bot style)
- Bottom sheet, height ~120px | Radius: `lg` top corners
- Teal left border (4px) | Icon ✅ | Title + subtitle
- e.g. "Saved ₹500 · Food · Today"
- Auto-dismiss after 3s

---

## 6. Screen inventory & references

| # | Screen | Key elements | Mobbin reference |
|---|---|---|---|
| 1 | Onboarding | Full-screen slides, teal CTA | — |
| 2 | Login / OTP | Phone input, OTP boxes | — |
| 3 | **Home dashboard** | Balance card, income/expense summary, line chart, recent 5 txns, FAB | [Fuse home](https://mobbin.com/screens/22ac6f9c-de15-4aec-bbd3-3c5f1e51dd14) |
| 4 | **Transactions** | Search bar, date-grouped list, filter chips | [Fuse activity](https://mobbin.com/screens/88e63b59-01fe-46b5-a167-f6a195dd646c) |
| 5 | **Add transaction** | Amount numpad, type toggle (expense/income), category chips, note, FAB confirm | [GoPay add](https://mobbin.com/screens/115a5791-ab25-44ff-8cc1-78289f83acf5) |
| 6 | Transaction detail | Full details, edit/delete options | — |
| 7 | **Analytics** | Donut chart, time filter, category breakdown list | [Revolut analytics](https://mobbin.com/screens/56d80261-ebab-49c4-aa2c-de9e23c41abb) |
| 8 | **Budgets** | Category list, progress bars, monthly limit labels | — |
| 9 | Connect WhatsApp | Explainer, wa.me button | — |
| 10 | Settings | Currency, categories, profile, logout | — |

---

## 7. Icons

Use **`@expo/vector-icons`** (Ionicons set):
- Home: `home-outline` / `home`
- Transactions: `list-outline` / `list`
- Analytics: `pie-chart-outline` / `pie-chart`
- Settings: `settings-outline` / `settings`
- Add: `add`
- Income: `arrow-down-circle-outline` (green)
- Expense: `arrow-up-circle-outline` (red)
- Food: `restaurant-outline`
- Transport: `car-outline`
- Shopping: `bag-outline`
- Bills: `receipt-outline`
- Entertainment: `film-outline`
- Health: `medkit-outline`
- Business: `briefcase-outline`
- Education: `school-outline`

---

## 8. Motion & interaction

- **Transitions:** `Animated` with 200ms ease-out for most
- **List items:** `FlatList` with `keyExtractor`
- **Bottom sheets:** `@gorhom/bottom-sheet`
- **Haptics:** light impact on FAB tap, success notification on save
- **Loading:** skeleton placeholders (shimmer) not spinners

---

## 9. Component file map (to build)

```
mobile/
└── src/
    ├── theme/
    │   ├── colors.ts       — all color tokens
    │   ├── typography.ts   — all text styles
    │   ├── spacing.ts      — spacing scale + radius
    │   └── index.ts        — exports everything
    └── components/
        ├── Button.tsx
        ├── FAB.tsx
        ├── Input.tsx
        ├── AmountInput.tsx
        ├── CategoryChip.tsx
        ├── TransactionRow.tsx
        ├── SummaryCard.tsx
        ├── BudgetBar.tsx
        ├── DonutChart.tsx
        ├── LineChart.tsx
        ├── BottomTabBar.tsx
        └── Toast.tsx
```
