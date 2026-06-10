# Austria 2026 — Allison + Avital, July 24–31

A high-end **digital brochure** for the Austria trip (Fri Jul 24 – Fri Jul 31, 2026) —
one guided page: cover → trip at a glance (route map) → day by day → where we sleep →
open decisions + practical. Plus a floating notes channel for Avital backed by Supabase.

> **2026-06-10 scratch rebuild.** The site was rebuilt from scratch as a single-page
> brochure per `projects/travel-system/trip-site-rebuild-2026-06-10.md`. The previous
> multi-page site (itinerary/stay/logistics/costs/activities/notes/map) lives on branch
> `archive/pre-rebuild-2026-06-10` — pullable, nothing deleted.

## Why this exists

Built so Allison can send Avital one link instead of a wall of text — and so she can scan
the whole trip top-to-bottom, clicking in only when she wants depth. Avital can leave notes
via the 💬 button; the notes land in `austria_notes` (Supabase, budget-2026 project) and
Claude reads them in future sessions to iterate.

## Architecture

- **`src/trip.ts`** — the single source of truth. Every fact (dates, bases, days, costs,
  the open decision) renders from here. Zero hardcoded facts in HTML.
- **`src/main.ts`** — the renderer (builds all five blocks from `trip.ts`).
- **`src/map.ts`** — one lightweight Leaflet/OSM map, base pins only.
- **`src/notes.ts`** — the floating notes widget (reuses `src/supabase.ts`).
- **`src/brochure.css`** — the whole visual system (light-mode editorial brochure).

Privacy: the public site never carries confirmation numbers / PINs / payment details.
Those live only in the private bookings file. `scripts/privacy-check.mjs` fails the build
if they leak; `scripts/link-check.mjs` verifies every photo URL resolves.

## Stack

- Vite + TypeScript (strict, no `any`)
- ESLint + Prettier
- Separate HTML / CSS / TS files (no monolith)
- Supabase REST for note insert
- GitHub Pages deploy via GitHub Actions (lint + privacy + link checks before build)

## Live URL

https://allisonecalt-sudo.github.io/austria-2026/

## Local dev

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run lint
```

## Supabase

Table: `austria_notes` in project `hpiyvnfhoqnnnotrmwaz` (budget-2026, EU).

- `id`, `created_at`, `option` ('A'|'B'|'general'), `day_id`, `activity_id`, `note_text`, `author`, `status` ('pending'|'seen'|'applied')
- RLS: anon SELECT + INSERT allowed (no auth — Avital just opens the URL)

## Query notes from Claude

```bash
SK=$(cat ~/.supabase-budget-key)
curl "https://hpiyvnfhoqnnnotrmwaz.supabase.co/rest/v1/austria_notes?select=*&order=created_at.desc" \
  -H "apikey: $SK" -H "Authorization: Bearer $SK"
```
