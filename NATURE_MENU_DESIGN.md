# Nature Destinations Menu — Design Spec

**Author:** nature-menu agent
**Date:** 2026-05-16
**Status:** v1 design
**Trigger quote (Allison, 2026-05-16 21:22):**

> "ok now lets have an agent in charge of where we go eachday the gaol isnt to make an itnerary the goals is to give ootpitons like lake bled can be in ther lik top 15 places natrue to go, but here is where im not sure because we also whant sunsets, we also needsdistnace wand whats close to what- so have an agent first thing abotu how to present all this data"

This page is **NOT an itinerary**. It is a **MENU of ~15 nature destinations** Allison + Avital can pick from, with everything they need to choose: drive time, sunset quality, what each one pairs with, and whether it's already locked in.

---

## 1. Research findings (how the best sites do this)

| Source                                                                                                                                                                            | What works                                                                                                                                                     | What we'll steal                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Atlas Obscura — "Where to Wander"** ([20 Places to Travel in 2025](https://wheretowander2025.atlasobscura.com/), [All Destinations](https://www.atlasobscura.com/destinations)) | Card-grid of curated places, each with photo + 1-line distinguishing feature + interactive map view. Cards are the same shape — easy scan, no hierarchy noise. | Uniform card shape, one hero photo per card, short distinguishing line.                                                                             |
| **Wanderlog destination lists** ([Wanderlog](https://wanderlog.com/), [Almbachklamm Wanderlog entry](https://wanderlog.com/place/details/211481/almbachklamm))                    | Shows distance/drive-time chips, "places nearby" panel, "what to pair this with" suggestions.                                                                  | Drive-time chips. "Pairs with" linklets to neighbour entries.                                                                                       |
| **Atlas Obscura "All places on one map"** ([map article](https://www.atlasobscura.com/articles/all-places-in-the-atlas-on-one-map))                                               | Map secondary, list primary — map confirms geographic clustering but doesn't drive interaction.                                                                | We will NOT lead with a map. List-first. Map already exists at `map.html` for spatial.                                                              |
| **Roam Austria sunset guide** ([Best sunsets Salzburg](https://roamaustria.com/best-sunsets-salzburg/))                                                                           | Numbered rank list with photo + "why this one" paragraph. Sunset rated implicitly by position in list.                                                         | We rate sunset 1-3 stars (graded, not binary — Allison-Avital are picking between candidates so resolution matters).                                |
| **NPS national-park-style listings**                                                                                                                                              | Group by area/region rather than alphabetical or drive-time. Helps "what's near what."                                                                         | Group by REGION (Salzkammergut / Berchtesgaden-Bavaria / Slovenia / Hohe Tauern). Within each region, "pairs with" chips do the local-cluster work. |
| **Roadtrippers / sunset photo blogs** ([Sunset Obsession Bavaria itinerary](https://sunsetobsession.com/one-day-in-southern-bavaria/))                                            | Photographer blogs ALWAYS specify which direction the spot faces + best time of day.                                                                           | Each entry tagged: ⛅ sunrise / 🕛 anytime / 🌅 sunset / ⏰ best at golden hour.                                                                    |

**What I'm rejecting:**

- **Distance bands as primary axis** (1hr / 2hr / overnight). Rejected because Hallstatt is the 4-night nature anchor — distance from Hallstatt matters as much as distance from Salzburg, and "what's near what" matters more than absolute hours. A drive-time chip on each card carries the data; region grouping carries the spatial intuition.
- **Big embedded map at the top.** Rejected because (a) `map.html` already exists for spatial overview, (b) maps with 15 pins on mobile are a clutter wall, (c) Allison's preference is list-first / curated browsing, not exploratory map-clicking.
- **Toggleable sort/filter.** Rejected for v1 — over-engineering. The 15 are curated to ~15. Region groupings already give the slicing she'd want. If Avital pushes back we add filters in v2.
- **6-10+ per region.** Rejected per `user_trip_planning_preferences.md` — 2-3 curated wins. We ship 15 TOTAL across all regions, ~3-4 per region.

---

## 2. Design decisions (with reasoning)

### Primary axis: REGION groupings, 4 regions

Why region: it answers Allison's "what's close to what" without forcing the reader to look at a map. Within a region, every destination is within ~45 min of every other — pairings emerge naturally.

The 4 regions:

1. **Salzkammergut lakes** (the Hallstatt anchor's home turf — Gosausee, Hallstatt area, Schafberg, Wolfgangsee, etc.)
2. **Berchtesgaden / Bavaria** (just over the German border — Königssee, Hintersee Ramsau, Almbachklamm)
3. **Hohe Tauern** (the high alps — Krimml Waterfalls, Liechtensteinklamm, Werfen)
4. **Slovenia** (Bled / Bohinj / Vintgar — out-of-scope-but-elevated per Allison "Lake Bled only if insane"; surfaced honestly with overnight caveat)

### Secondary axis: card-grid within each region

Each region is a section with its own eyebrow + h2. Cards stack mobile, 2-up at >720px. Same card shape every time — uniformity = scan-ability.

### Sunset metric: graded 🌅 1-3 stars (NOT binary)

- 🌅🌅🌅 — west-facing horizon, easy access at sunset, photogenic in late-July. Tara-Bridge tier.
- 🌅🌅 — sunset works here but not the marquee reason to go.
- 🌅 — sunrise spot or not really a sunset destination; visit by day.

Resolution matters because they're picking between candidates. Binary collapses the choice.

### "Pairs with" — inline chips at bottom of each card

Each destination card lists 1-3 other destinations within 30 min drive. Each is a clickable anchor to the card lower on the page. This is the "what's near what" answer without a map.

### "Already in itinerary" — visual badge

Destinations that appear in `trip-data.ts` (Königssee, Hallstatt, Gosausee, Wolfgangsee, Werfen) get a green LOCKED badge over their photo. Differentiated from alternates (no badge). Lets Allison + Avital see at a glance what's already planned vs alternate menu.

### Walking ceiling: 🚶 walk / 🥾 easy hike — anything strenuous OUT

Hard filter per `reference_travel_website_spec.md` — Avital turned back at a rope climb in Durmitor. Anything >300m vertical or scrambling: cut from the list. Krimml and Liechtensteinklamm both qualify as easy hikes (paved/staired path with elevation but no scrambling).

### Distance: TWO numbers per card

- "From Salzburg: 75 min" (links to Google Maps from Salzburg)
- "From Hallstatt: 35 min" (links to Google Maps from Obertraun)

Both because they're staying in both places. Single-number gets misleading.

### Mobile-first: cards stack, photo first, badges over photo

Uniform card height not enforced — cards grow with content. On mobile every card is full-width with hero photo on top. On desktop they're 2-up to make the grid scannable.

### Map element: NO embedded map

`map.html` already exists. Link to it from the page header. Embedding a map with 15 pins on a 360px-wide screen is noise.

---

## 3. The card shape

```
+---------------------------------------+
| [photo]                  [LOCKED tag] |   ← green tag only if in itinerary
|                          [type icon]  |   ← lake / waterfall / peak / etc.
+---------------------------------------+
| REGION · TYPE                         |   ← eyebrow row
| Lake Name (Local)                     |   ← h3
|                                       |
| 🌅🌅🌅  ·  🥾 easy hike  ·  🌅 sunset best | ← rating row
|                                       |
| One-line distinguishing feature.      |
|                                       |
| 🚗 Salzburg 75min · Hallstatt 35min   |   ← distance chips (linkified)
|                                       |
| Pairs with: Königssee · Almbachklamm  |   ← linkable to other cards
|                                       |
| [Wikipedia →]  [Official site →]      |   ← outbound links
+---------------------------------------+
```

---

## 4. Page sections (top to bottom)

1. **Nav** (same as every page)
2. **Header**
   - Eyebrow: "MENU · pick what to do, not a forced schedule"
   - H1: "Where to go — 15 nature destinations within reach"
   - Lead paragraph (Allison's framing in plain English): "This is a menu, not an itinerary. Five of these are already locked into the schedule (Stay page). The other ten are alternates — swap any in, any out. Filtered to walks + easy hikes. Sunset rating is graded — three suns means it's the marquee reason to drive there."
   - Legend strip: 🌅🌅🌅 explained; 🚶 / 🥾 explained; LOCKED tag explained.
   - Anchor link to `map.html` for the spatial view.
3. **Region 1: Salzkammergut** — ~4 cards
4. **Region 2: Berchtesgaden / Bavaria** — ~3 cards
5. **Region 3: Hohe Tauern / Pongau** — ~4 cards
6. **Region 4: Slovenia (overnight / not in scope yet)** — ~2-3 cards
7. **Footer with sources + verification caveat**
8. **Notes button** (existing widget)

---

## 5. Tech approach

- **Static HTML** — content is fixed, no client-side filtering needed
- New file: `nature-destinations.html` (top-level)
- New TS bootstrap: `src/page-nature-destinations.ts` (just calls `initNotesWidget()`)
- New export in `src/trip-data.ts`: `NATURE_DESTINATIONS` array — TypeScript-typed, drives the page so the data is queryable from other pages later (e.g. costs.html, itinerary.html could surface "alternates" links)
- Register in `vite.config.ts`
- Reuse existing CSS classes — `.callout`, `.eyebrow`, `.lead-block`, `.alt-card`, `.chip`. NO new styles file.
- We will template-string the HTML in the TS bootstrap, rendering from the TS data — same pattern as `page-stay.ts` / `page-itinerary.ts`. That way data + view stay in lockstep.

---

## 6. The 15 destinations (Phase 2 output, summarized)

(Full data lives in `NATURE_DESTINATIONS` array in `src/trip-data.ts`.)

### Salzkammergut (4)

1. **Vorderer Gosausee** — mirror lake of Dachstein. LOCKED (Sun Jul 26).
2. **Hallstätter See / Hallstatt Markt** — the postcard. LOCKED (Mon Jul 27 sunset).
3. **Schafbergspitze (Wolfgangsee)** — cog railway to 1,783m, 13-lake panorama. LOCKED (Wed Jul 29).
4. **Dachstein 5fingers (Krippenstein)** — viewing platform 400m straight out over Hallstatt valley. LOCKED (Mon Jul 27 day).
5. **Wolfgangsee village (St. Wolfgang)** — lakeside promenade. Pair-piece for Schafberg.
6. **Attersee (Nußdorf esplanade)** — biggest Austrian lake, west shore good at sunset. Alternate.

Cutting from this region: Mondsee (similar to Wolfgangsee, Wolfgangsee wins on Schafberg pairing), Traunsee (north of the cluster, weaker sunset orientation), Hintersee Faistenau (small, less photogenic than Ramsau version).

### Berchtesgaden / Bavaria (3)

7. **Königssee + Obersee** — silent electric boats, the trip's peak. LOCKED (Tue Jul 28).
8. **Hintersee (Ramsau)** — tiny islands with trees reflecting; photographer-famous. Alternate sunset spot.
9. **Almbachklamm gorge** — 3km easy gorge walk, 25 min from Salzburg. Alternate.

Cutting: Eagle's Nest (already on skip list per trip data; historically heavy).

### Hohe Tauern / Pongau (4)

10. **Eisriesenwelt ice cave (Werfen)** — world's largest ice cave. LOCKED (Thu Jul 30).
11. **Liechtensteinklamm gorge** — Austria's deepest canyon walk. Alternate, near Werfen.
12. **Krimml Waterfalls** — Europe's tallest, easy trail. Alternate (120km west).
13. **Grossglockner High Alpine Road** — the famous panoramic drive. Alternate (toll €46.50).

Cutting: Kaprun glacier (too far for day trip from Hallstatt, and the experience is mostly cable cars to artificial cold).

### Slovenia (2)

14. **Lake Bled** — out-of-scope per current trip skip list, but resurfaced per Allison's "if insane." 3.5 hrs each way from Salzburg = overnight required. Surfaced HONESTLY with the overnight caveat.
15. **Vintgar Gorge** — 5 min from Bled. Bundle with #14 if they do a Slovenia overnight.

Cutting Bohinj: too similar to Bled for a 15-item budget; if they go to Slovenia at all, Bled+Vintgar is the highlight set.

---

## 7. Fail-loud disclosures (on the page)

- **Sunset ratings** are based on map orientation + west-facing horizon + photographer-blog consensus, NOT direct site verification. Mark as "directional research" on the page.
- **Drive times** are Google Maps consensus, NOT verified with peak-July-traffic. v4 fact-check agent will re-verify.
- **Lake Bled overnight option** — not researched for actual lodging; surfaced as a "would need a separate plan" placeholder.
- **Hours / seasonal closures** — most attractions are summer-open, but specific July 24-31 2026 hours not verified for every entry. We link to the official site for each so they can re-check.

---

## 8. Out of scope for this build

- Map-pin visualization (use existing `map.html`)
- Filter toggle (no filters in v1; curation is the filter)
- Cost data per destination (already on costs.html where relevant)
- Photo galleries (one hero per destination per the activity-photo-light-touch rule)
- Hour-by-hour scheduling (this is a MENU, not a plan)

---

**Sources:**

- [Atlas Obscura — Where to Wander 2025](https://wheretowander2025.atlasobscura.com/)
- [Atlas Obscura — All Destinations](https://www.atlasobscura.com/destinations)
- [Atlas Obscura — All places on one map](https://www.atlasobscura.com/articles/all-places-in-the-atlas-on-one-map)
- [Wanderlog](https://wanderlog.com/)
- [Roam Austria — Best Sunsets in Salzburg](https://roamaustria.com/best-sunsets-salzburg/)
- [Sunset Obsession — Southern Bavaria photography itinerary](https://sunsetobsession.com/one-day-in-southern-bavaria/)
- [Salzkammergut official viewpoints](https://www.salzkammergut.at/en/worth-visiting/viewpoints.html)
- [Salzburgerland — Gorges & waterfalls](https://www.salzburgerland.com/en/salzburgerlands-spectacular-gorges-and-waterfalls/)
- [Moon Honey Travel — Liechtensteinklamm](https://www.moonhoneytravel.com/liechtenstein-gorge-salzburg/)
- [PhotoHound — Hintersee Ramsau spot](https://www.photohound.co/spot/hintersee-1001901)
