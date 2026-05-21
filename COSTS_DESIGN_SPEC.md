# COSTS PAGE DESIGN SPEC — v4 ("Splitwise-grade") · 2026-05-17

**Context:** Three prior fix passes (22f4966, b4537b0, 21a3938) added TLDR, big-number hero, per-base, splitwise view, comparison, and math fix. Allison still says it's hard to understand.

**Allison's directive:** "the cost page is still hard to understand have a genius ux ui agent go and make it better"

## Diagnosis of why v3 still fails the Avital-grasp test

1. **The hero number is informative but not _decisive_.** It says ₪13,209 but Avital doesn't know in 1 second whether that's good, bad, normal, or scary. The status pill ("on plan · ₪209 over") is too small relative to the number.

2. **Six tables. Avital is "not such a reader."** The page is a stack of tables. Even with TLDR + hero, the visual texture is "spreadsheet." Splitwise-style finance UI uses CARDS + BIG NUMBERS + COLOR, not tables.

3. **No "who owes whom" answer.** The whole point of Splitwise is the single resolving line: "Avital owes Allison ₪X" or "you're square." We compute the split row-by-row but never say the punchline.

4. **The 5-second test isn't possible from the current layout.** Total, per-person, and over/under-budget are spread across 4 different visual regions (TLDR paragraph, hero number, hero meta, callout box). Avital's eye has to bounce.

5. **No visual progress against target.** A linear progress bar from ₪0 → ₪13,000 with a marker at ₪13,209 would be instantly graspable. We currently make the user mentally compute "is ₪209 a lot?"

6. **Comparison table buried below the fold.** Lean vs current vs splurge should be ABOVE the per-base detail, with bigger differentiation — Avital decides whether to even consider lean/splurge, then drills.

7. **Per-base table doesn't show what's _included_.** Schafbergspitze ₪1,263 looks like just lodging; it's actually lodging + cog + breakfast bundle. The line item lies by omission.

## Design references applied

- **Splitwise** — green = owed-to-you, red = you-owe, single "settle up" punchline. Color carries the meaning so you don't have to read.
  ([Splitwise UX case study](https://uxdesign.cc/splitwise-a-ux-case-study-dc2581971226))
- **Personal-finance dashboards** — big number top, color-coded category breakdown, "spent vs budget" bar, recent-activity list.
  ([Designing intuitive finance dashboards](https://www.sctinfo.com/blog/designing-intuitive-dashboards-for-finance-apps/),
  [Budget app design — Onething](https://www.onething.design/post/budget-app-design))
- **Apple Wallet receipts** — line items as cards with logo, amount-bold, label-soft. Touchable not scannable.
- **Booking.com check-out** — categorical breakdown with "subject to" disclosures; everything that's an estimate vs. confirmed is visually distinct.
- **YNAB category cards** — colored vertical bars per category showing assigned / spent / remaining.
- **TripIt trip cost summary** — per-day-or-per-base rollups with running total in the header.

## v4 LAYOUT (top to bottom)

### Block 1 — VERDICT BAR (NEW, above hero)

A horizontal pill the width of the hero with three slots:
`✓ ON PLAN  |  ₪13,209 of ₪13,000 target  |  ₪209 over (acceptable)`
Status word in green serif, target in body type, delta in pill. ONE LINE. This is the answer to "should I be worried."

### Block 2 — HERO TOTAL (rewritten)

- Eyebrow: `ALL-IN · 7 NIGHTS · 2 PEOPLE`
- Massive serif: `₪13,209`
- Sub: `≈ €3,330 · ≈ $3,570`
- Beneath: a horizontal progress bar — gradient gold→green fill from ₪0 to ₪13,000 with a small red tick at ₪13,209. Annotated `Target ₪13K` and `Actual ₪13.2K`.

### Block 3 — TWO-PERSON CARDS (NEW, dominant feature)

Two side-by-side cards (stack on mobile):

```
┌──────────────────────┐ ┌──────────────────────┐
│   ALLISON            │ │   AVITAL             │
│                      │ │                      │
│   ₪6,422             │ │   ₪6,787             │
│                      │ │                      │
│ Shared half  ₪4,936  │ │ Shared half  ₪4,936  │
│ Own flight   ₪1,486  │ │ Own flight  ~₪1,851  │
│ Own baggage    ₪0    │ │ Own baggage    ₪0    │
│                      │ │                      │
│  ✓ Flight BOOKED     │ │  ⏳ Flight TBD       │
└──────────────────────┘ └──────────────────────┘
```

Background tint differs (Allison = green-mist, Avital = gold-soft) so they read distinct at a glance.

### Block 4 — SETTLE-UP STRIP (NEW, Splitwise punchline)

ONE LINE in a green pill spanning the page:
`💸 Settle-up at trip end: square — each pays their own flight, everything else 50/50.`

If at any point the math shifts (e.g., one of them fronts a meal), this is where the "Avital owes Allison ₪X" line lives. Today it's clean → "square."

### Block 5 — CATEGORICAL BAR (kept, polished)

Existing stacked bar + legend. Better labels: `% of trip` next to each pill.

### Block 6 — COMPARISON STRIP (moved up, redesigned)

Three cards horizontally (not a table):

```
┌─────────┐  ┌─────────┐  ┌─────────┐
│ LEAN    │  │ CURRENT │  │ SPLURGE │
│ ₪9,658  │  │ ₪11,171 │  │ ₪12,658 │
│ -₪3,342 │  │ -₪1,829 │  │  -₪342  │
│ skip    │  │ ★ pick  │  │ Aiola+  │
│ summit  │  │         │  │ Heritage│
└─────────┘  └─────────┘  └─────────┘
```

The middle one (current pick) gets the gold accent border + ★ pick badge.
Each card is tappable → expands "what changes."

### Block 7 — WHERE THE MONEY GOES (per-base, redesigned as cards not table)

4 base cards in a 2×2 grid (1-col on mobile). Each card:

- Base icon emoji + name (Salzburg / Mountain / Summit / Airport)
- Big amount ₪
- "X nights · Y €/nt"
- Tiny "What's included" line (Schafbergspitze: lodging + cog + breakfast)
- Verified date badge
- Booking link

### Block 8 — LINE-BY-LINE (kept, behind <details>)

The 6 existing detail sections (lodging, car, flights, activities, food, baggage) stay collapsed. Re-titled "DEEP-DIVE: every line, every source" so the user knows they don't need to open it.

### Block 9 — FOOTER NOTES (kept, condensed)

The existing "How the numbers track" callout collapses into a 4-bullet footer.

## Hard rules applied

- **Color = signal:** green = on-plan / under-target / Allison column. Gold = warning / over-target / Avital column. Red used ONLY for genuine "over by a lot." Right now everything's on-plan so red doesn't appear.
- **Cards beat tables** for Avital — table is for the deep-dive only.
- **Big number, small label** — Cormorant 5rem+ for the totals, Inter 0.7rem for the labels.
- **Per-person dominance** — once Avital knows the trip total, the question is "what's MY number." That's why two-person cards come BEFORE category breakdown.
- **Verified badges per major section.** "Verified 2026-05-17" pills on each card so trust is reinforced (Avital-trust rule).
- **Source link clickable per line** in the deep-dive (per-listing Booking URLs, schafberg.net, El Al PNR ref, DiscoverCars page, operator ticket pages). Already present, kept.
- **TLDR ≤50 words** at top of every block, per the TLDR-everywhere rule.
- **Mobile-first:** cards stack 1-up below 720px. Progress bar collapses to inline. Big number scales clamp(3rem, 12vw, 5.5rem).

## 5-second-grasp test (acceptance criterion)

Avital opens costs.html. Within 5 seconds, without scrolling, she can answer:

1. **What does the trip cost?** → ₪13,209 (hero)
2. **Are we over budget?** → No, ₪209 over a soft cap, status says "on plan" (verdict bar)
3. **What do I pay?** → ₪6,787 (right-hand card)
4. **Do I owe Allison anything?** → No, we're square (settle-up strip)

If all four are answerable in 5 seconds with no reading more than ~12 words per element → ship.

## Files touched

- `costs.html` — restructure top half (verdict bar, hero rebuild, two-person cards, settle-up strip), redesign comparison + per-base as card grids, collapse line-by-line under one header
- `src/styles.css` — additive: `.verdict-bar`, `.cost-progress`, `.person-card`, `.settle-strip`, `.tier-card`, `.base-card`
- `src/page-costs.ts` — no functional changes needed (no new data bindings)
- `COSTS_DESIGN_SPEC.md` — this file

## What I'm NOT doing

- Not touching trip-data.ts (other agents)
- Not changing other pages
- Not adding charting library (lightweight CSS bar suffices; chart.js would be overkill)
- Not adding interactive sliders / scenario tool (out of scope, Allison can ask for that if she wants it)
- Not removing existing deep-dive detail sections (would lose source links / fail-loud per-line audit trail)
