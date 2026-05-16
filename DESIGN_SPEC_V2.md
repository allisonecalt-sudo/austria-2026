# Austria 2026 — Design Spec V2 (Digestibility Pass)

Written 2026-05-16 in response to Allison's verbatim feedback after the v3.1 ship:

> "make a ux ui agent who is goign to be genius lelv on how to presrnt this itneray ideas plans in digestable way."

The previous spec (`DESIGN_SPEC.md`, v3) reigned in density and added hero photos. It got us to "calm." But the day cards still expand a paragraph + Plan B toggle + anchor block + meta chips inline — that's still a wall of text per day. Ten nav items still compete. Costs is four tables. This spec takes it to "Avital gets it in 30 seconds on her phone."

---

## The 30-second test

Avital opens the site on her phone in bed. She scrolls once. What does she see?

**Goal:** by the end of scroll #1, she should know:

1. Where (Salzburg / lakes / Germany day-trip)
2. When (Jul 24-31)
3. The vibe (nature, sunsets, apartments)
4. The 7 day headlines (one line each, with a tiny visual cue)
5. That there's depth waiting if she taps

If she has to read paragraphs to grasp the trip, the design has failed.

---

## Research adopted (2026 sources)

| Pattern                                             | Source                                                                                       | Used for                                                                      |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Editorial heros — type-first, asymmetric, cinematic | Perfect Afternoon "Hero Section Design 2026"; Lexington Themes "Stunning hero sections 2026" | Landing hero crop + serif-led headline                                        |
| Scrollytelling for complex info                     | Maglr "10 best scrollytelling examples 2026"                                                 | Day-strip horizontal scroller, fade-in days                                   |
| Progressive disclosure — defer secondary            | NN/g "Progressive Disclosure" + "Defer Secondary Content for Mobile"                         | Day cards collapsed by default (paragraph + plan B + anchors live behind tap) |
| Glanceable timeline strips                          | Wanderlog, Google Travel, Hopper trip pages                                                  | Landing-page day-strip with thumbnails                                        |
| Information scent — disclose freq-used, hide rare   | NN/g                                                                                         | Plan A visible inside expanded card; Plan B still nested                      |
| Mobile thumb zones, ≥44px targets                   | iOS HIG / Material 3 / 2026 NN/g                                                             | All tap targets sized + spaced; bottom-of-screen FAB stays                    |
| Editorial photos that sell feeling                  | Hero Section 2026 articles                                                                   | Hallstatt boathouse hero on landing instead of stock                          |
| Lightweight visual data (no tables for budget)      | Stripe docs, Linear marketing                                                                | Stacked horizontal bar for costs                                              |
| Consolidated IA — flatten nav, group secondaries    | NN/g IA articles                                                                             | 10 nav items → 5                                                              |

---

## Information architecture — nav consolidation

**Before (10 items):** Itinerary · Stay · Car · Shabbat · Jewish sights · Packing · Costs · Map · Notes

**After (5 items):**

| Nav label     | Page             | What lives here                                                                                                                                                                                                                                                                     |
| ------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trip**      | `itinerary.html` | The 7-day spine. Map sits inline at top as a quick orientation strip (not its own page anymore).                                                                                                                                                                                    |
| **Stay**      | `stay.html`      | Apartments per base. Already good — slight visual tightening.                                                                                                                                                                                                                       |
| **Logistics** | `shabbat.html`   | Master Shabbat page with three tabs/sections collapsed: Shabbat / Car / Packing / Jewish sights. Jewish sights becomes an accordion under Logistics rather than its own nav item. Car stays its own page (rental-car agent owns it) but link lives in Logistics drop. Packing same. |
| **Costs**     | `costs.html`     | Single visual stacked bar + total. Tables collapsed below.                                                                                                                                                                                                                          |
| **Notes**     | `notes.html`     | Avital's feedback feed. Unchanged.                                                                                                                                                                                                                                                  |

**Rationale:** Avital doesn't pick the rental car or read packing on first open. Those are pre-trip prep, not trip understanding. Consolidating them under "Logistics" lets the four user-decision-driving pages (Trip / Stay / Costs / Notes) breathe.

**Constraint honored:** Other agent owns `rental-car.html` — we link to it from Logistics but do NOT touch its content. `shabbat.html` body content owned by Chabad agent — we ONLY update its nav. Same with rental car.

**Implementation:** Logistics is a hub page at `shabbat.html` rewritten — wait, that's content-owned. Better path: make Logistics a small index page or have the top nav show a "Logistics ▾" dropdown that lists Shabbat / Car / Packing / Jewish sights as sub-links. On mobile, a dropdown is messy — better: tap Logistics → goes to a tiny hub page (`logistics.html` — new file we DO own) that links out to the four sub-pages with one-line teasers. Keeps the chabad/rental agents' content untouched but gives us flatter top-level nav.

Decision: **new `logistics.html` hub page**, nav has 5 items, the four sub-pages keep their own URLs and nav labels in their own headers.

---

## Landing page redesign — story-first, scan-friendly

The current landing has a hero, then 5 sections (Why this plan / pullquote / At-a-glance / Tara-bridge / Stay teaser / Skip list / Budget). That's 7 stops. Too many.

New landing structure:

1. **Hero** — Königssee photo (kept), dates pill, headline ("Salzburg for Shabbat. Lakes for the rest. Sunsets every night."), 1-line lede. CTA: "See the 7 days ↓" — scrolls.

2. **Day strip** — horizontal carousel (snap-scroll) of 7 cards. Each card: thumbnail (the day hero, 4:3), Day N + date label, headline (1 line, truncates), tiny icon for vibe (mountain / lake / village / sunset emoji is fine). Tap → opens `itinerary.html#day-id`. On desktop this becomes a 4-up grid that wraps. **This IS the trip — Avital should walk away knowing this strip.**

3. **The peak moment** — keep gold callout but smaller. One photo (Königssee at sunset), short headline, one paragraph.

4. **What we picked, in numbers** — three big number callouts: "7 nights · 2 apartments · €2,410 projected". Below that, three small lines: lodging cost / activities cost / "rest". Tap → costs page.

5. **Where we sleep** — three pinned picks side-by-side on desktop / stacked on mobile, just photo + name + price + city. Tap → stay page.

6. **Skip list + Montenegro quote** — one combined section. Skip list gets a "less is more" framing, Montenegro quote sits below.

7. **CTA strip footer** — "Open the trip" / "See where we sleep" / "Costs" — three big buttons.

This collapses 7 sections into 6 with much heavier visual rhythm and far more photo per scroll.

---

## Day cards — the big change

Current state: every day expands a 3-line summary, then a paragraph, then anchors, then meta chips, then a Plan B toggle. **5 elements visible per day**, repeated 8 times. That's the "still too dense" feeling.

New state — **day card collapsed by default**:

```
┌──────────────────────────────────────────────┐
│  ▌HERO PHOTO (16:9 mobile, 21:9 desktop)     │  full bleed
│  ▌overlay: DAY 5 · TUE JUL 28                │
│  ▌overlay: "Königssee + sunset on the boat"  │
│  ▌overlay: ☀ 20:50  ·  ⭐ peak (if peak)     │
│  ▌                                            │
│  ▌                       [tap to expand ▾]   │  bottom-right
└──────────────────────────────────────────────┘
```

Tap → card height grows, body slides down:

```
┌──────────────────────────────────────────────┐
│  HERO PHOTO (now smaller / 21:9)             │
│  overlay: DAY 5 · TUE JUL 28                 │
│  overlay: "Königssee + sunset on the boat"   │
├──────────────────────────────────────────────┤
│  Default                                     │
│  [paragraph]                                 │
│                                              │
│  Easier day (if we don't have the energy)    │
│  [one-line plan B]                           │
│                                              │
│  ─── The few times that matter ───           │
│  08:00  Leave Hallstatt                      │
│  10:00  First boat from Schönau              │
│  19:30  Last boat back                       │
│  ☀ 20:50  Sunset (on the boat)               │
│                                              │
│  🚗 75 min from Obertraun · 🛏 Obertraun     │
└──────────────────────────────────────────────┘
                              [collapse ▴]
```

**Critical changes:**

1. **Headline + 1 visual cue is the entire collapsed state.** No 3-line summary, no Plan B toggle visible. Just photo, title, sunset time, peak badge.
2. **Language for Plan A/B:** "Default" / "Easier day (if we don't have the energy)". Not "Plan A" / "Plan B" + jargon.
3. **Expand/collapse is the card itself**, not a sub-detail. One tap target per day.
4. **First card expanded by default** so Avital sees the pattern. The other 7 collapsed.
5. **"Expand all"** button at the top of the day list for desktop power-readers.

---

## Plan A/B copy change

Current: `<details>` with summary "Plan B — if the day asks for less"

New language framing:

- **"Default"** = what we're planning to do
- **"Easier day"** = the gentler swap if morning energy is low

In data terms (trip-data.ts) we keep `planB` as the field name — just the rendered label changes.

---

## Costs page — visualized

Current: lead paragraph, four tables (Lodging / Activities / Misc / Grand total). Mobile = lots of horizontal-scroll.

New:

1. **One big number** — total in EUR + NIS, with a tiny ceiling-comparison sparkline / pill.
2. **Stacked horizontal bar** — Lodging / Activities / Food+misc, color-coded segments, percentages. CSS-only.
3. **Three small expandable sections** — tap "Lodging" → see the lodging table; tap "Activities" → see activities table. Default closed.
4. **Lean variant note** kept as a callout.

---

## Stay page — keep but tighten

Already pretty good. Small fixes:

- Lodging tag (small caps "SALZBURG") gets larger, with a count: "BASE 1 OF 3 · 2 nights"
- Picks fill width on mobile (currently good)
- Add "View photos on Booking →" sub-CTA so the platform is explicit

---

## Visual system tweaks

- **Mobile day cards stay full-width** with 0 horizontal padding for the photo, 1.2rem padding for body. Currently good — keep.
- **Day card border radius** bumps to 20px for softer feel.
- **Inter-day gap** 5rem mobile, 6rem desktop (was 4/5).
- **Headline weight** stays Cormorant 600. Tighten letter-spacing more on collapsed cards (-0.02em) for impact.
- **Body line-height** 1.7 inside cards (was 1.65 — extra breathing).
- **Photo aspect ratio on collapsed cards** stays 16:9 mobile / 21:9 desktop. Same as v3.
- **Sunset badge floats top-right** of the photo — current. Now larger (1rem padding, 1rem text).
- **Sunset block inside expanded cards** stays as is (gold-warm fill).
- **Collapse/expand indicator** — bottom-right of the photo, large arrow icon with circle background. Tap target 44px+.

---

## Mobile-first checklist

- All tap targets ≥44px
- Font min 16px for body, no smaller
- Line-length max 65ch in prose
- No horizontal scroll except intentional day-strip carousel
- Day strip carousel: `scroll-snap-type: x mandatory`, cards 76vw wide on phone, 32rem on desktop
- Sticky day-nav stays — `top: 56px` (under main nav)
- Photos lazy-load with shimmer

---

## What we ARE NOT doing in this pass

- Don't re-add hour-by-hour scheduling (Allison rejected — stays out)
- Don't re-add intensity tiers (🌿🥾⛰️ — stays out)
- Don't lock the Tara-Bridge moment behind a toggle (it's the emotional anchor — keeps prominence)
- Don't redesign the rental-car page (other agent active)
- Don't redesign shabbat.html body (other agent active — only nav update)
- Don't introduce framework JS (Vite + vanilla TS stays)
- Don't add real-time during-trip features — this is a pre-trip pitch site

---

## Build order

1. `styles.css` — collapsed card mode, day-strip carousel, costs bar, nav 5-up
2. `src/day-render.ts` — collapsed-by-default shape with expand/collapse interaction
3. `src/day-nav.ts` — minor tweak to reflect new card heights
4. `src/page-landing.ts` + `index.html` — restructure into day strip + 3 number callouts + pick row
5. `costs.html` + `src/page-costs.ts` — stacked bar + collapsible sections
6. **NEW** `logistics.html` + `src/page-logistics.ts` — hub for Shabbat / Car / Packing / Jewish sights
7. **Nav update** across all 8 owned HTML pages (rental-car.html owned by other agent — touch ONLY if labels are wrong, else leave; shabbat.html same)
8. Build clean, lint clean, deploy
9. Smoke test mobile + desktop
