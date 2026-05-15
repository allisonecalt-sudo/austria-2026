# Austria 2026 — Allison & Avital, July 24-31

A live pitch website for the Salzburg-based road trip. Two contrasting itineraries (Option A: one base, day trips / Option B: 2 moving anchors), Shabbat plan, cost breakdown, and a note-feedback channel for Avital backed by Supabase.

## Why this exists
Built so Allison can send Avital one link instead of a wall of text. Avital can leave notes anywhere on the site; the notes land in `austria_notes` (Supabase, budget-2026 project) and Claude reads them in future sessions to iterate.

## Stack
- Vite + TypeScript (strict, no `any`)
- ESLint + Prettier
- Separate HTML / CSS / TS files (no monolith)
- Supabase REST for note insert + admin list
- GitHub Pages deploy via GitHub Actions

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
