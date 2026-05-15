# Austria 2026 — Visual Redesign Spec

Written 2026-05-15 in response to Allison's verbatim feedback:
> "the website is misisng pictures and too insane... it needs to be reigned in... do real big research on how to present this in digestable way and then fix it."

Goal: a calm, scrollable travel-mag feel where she taps for more detail. Not a flight-itinerary printout. Real photos. Reigned-in density. Sunsets sacred.

---

## Research sources

- **Smashing Magazine — Designing Navigation for Mobile** ([link](https://www.smashingmagazine.com/2022/11/navigation-design-mobile-ux/)): sticky nav stays small on mobile; scrollspy is the way to indicate "where am I in this long doc."
- **NN/g — Accordions: 5 Scenarios to Avoid Them** ([link](https://www.nngroup.com/videos/avoid-accordions/)): don't accordion content people need to scan/compare. DO accordion content that is alternate-path (Plan B!) or secondary-detail (hour-by-hour when summary will do).
- **LogRocket — Designing effective accordion UIs** ([link](https://blog.logrocket.com/ux-design/accordion-ui-design/)): one-section-open patterns reduce overwhelm but increase taps. Multi-expand wins when users compare.
- **Mobile UX Best Practices 2026 (Brand Vision)** ([link](https://www.brandvm.com/post/mobile-ux-best-practices)): users arrive with sharper instincts for friction. One focal element per scroll-screen.
- **Airbnb Design / Cereal typography** ([link](https://medium.com/airbnb-design/working-type-81294544608b)): trust photography over typographic muscle. Modest weights, generous whitespace. 64px vertical section padding on major bands.
- **Bram.us — Smooth Scrolling Sticky ScrollSpy** ([link](https://www.bram.us/2020/01/10/smooth-scrolling-sticky-scrollspy-navigation/)): pure-CSS-and-IntersectionObserver implementation for sticky scrollspy. No framework required.
- **DesignMonks — 15 Travel Website Design Examples 2026** ([link](https://www.designmonks.co/blog/travel-website-design-examples)): hero sections are critical; large immersive visuals; day-by-day itinerary blocks scan better than long narrative.
- **Wanderlog daily itinerary pattern** ([link](https://wanderlog.com/itinerary)): days as discrete cards, time labels left-aligned, named places linked, map+timeline pair.
- **High Alpine Creative — 12 travel blogs with beautiful design** ([link](https://www.highalpinecreative.com/blog/best-travel-blogs)): the strong examples (Salt & Wind, etc.) use serif display + lots of breathing room + one photo as the day's anchor, not a gallery.

What the consensus says:
1. Hero photo per day is non-negotiable.
2. Reading flow > tab-shopping. Sticky day-nav helps orient, not replace scroll.
3. Progressive disclosure works for ALTERNATES (Plan B), not for the spine (Plan A should be visible).
4. Mobile: one focal element per scroll-screen. Generous whitespace. Photo full-bleed.
5. Sunsets / hero moments deserve type+color treatment (golden tint, larger photo).

---

## 1. Information architecture per day

```
┌─────────────────────────────────────────┐
│  HERO PHOTO (16:9 mobile, 21:9 desktop) │  full-bleed, lazy-loaded
│  · sunset-time badge floating top-right │
├─────────────────────────────────────────┤
│  DAY LABEL — small caps, green          │  "DAY 1 · FRIDAY JULY 24"
│  TITLE — serif, 1.8rem mobile / 2.4 desk│  "Land Salzburg — settle in for Shabbat"
│  3-LINE SUMMARY — body                  │  morning / afternoon / sunset distilled
├─────────────────────────────────────────┤
│  Quick-meta strip (sunset · drive · sleep · walk) — chips
├─────────────────────────────────────────┤
│  PLAN A — ALWAYS EXPANDED               │  the primary plan
│  · headline + energy tag                │
│  · hour-by-hour blocks                  │
├─────────────────────────────────────────┤
│  [+ Show Plan B (lighter alternate) ▾]  │  collapsed by default
│   when open: same shape, indented       │
├─────────────────────────────────────────┤
│  ☀ SUNSET BLOCK — distinctive           │  gold tint, larger type, named spot
│  Time · Place name (linked to Maps)     │
├─────────────────────────────────────────┤
│  Tara-Bridge moment callout (if any)    │  optional, only ~2 days have it
└─────────────────────────────────────────┘

(generous 4rem gap to next day)
```

**Why this shape:** the day's hero photo anchors the screen. Title + 3-line summary is enough to decide "this day looks great" without reading anything else. Plan A is the spine — visible by default per the agency rule (don't make her tap to see the plan). Plan B is the alternate — collapsed because it's a swap option, not a parallel read. The sunset block sits at the bottom because that's chronologically last but also because it's the emotional payoff — give it the gold treatment so it earns its placement.

---

## 2. Plan A / Plan B treatment

- **Plan A always expanded.** That IS the plan. Two-tap to see your day = friction.
- **Plan B collapsed by default**, expand on tap (`<details>` element, accessible).
- Plan B label includes "lighter / if tired" or similar shorthand so she knows it's not parallel optimization, it's a fallback.
- On desktop ≥ 1024px, Plan B opens as a separate column to the right of Plan A. On mobile, it stays stacked below.

Rejected: side-by-side tabs (Plan A | Plan B). She corrected v1 explicitly — "Plan A is primary." Tabs imply equality.

---

## 3. Hour-by-hour blocks: keep visible (don't accordion)

Per NN/g — don't accordion content people scan. The hour-by-hour IS the value proposition of "concrete not vibe." She wants the schedule visible.

HOWEVER — reduce visual weight:
- Time column tabular-nums, muted color (ink-soft, smaller size)
- Description in body color, normal weight
- Dotted-line separators between blocks (not solid)
- Block padding tight (0.4rem) so the column doesn't dominate

If a day has > 10 blocks, add a soft fade-out + "show remaining 3 blocks ▾" — but only on overflow, not by default. (Empirically only Day 5 Königssee hits 13 blocks; the others run 7-11.)

---

## 4. Sticky day-nav (the orientation aid)

Sticky horizontal scroller below the main nav:

```
[Day 1] [Day 2] [Day 3] [Day 4] [Day 5] [Day 6] [Day 7] [Day 8]
       └ active day highlighted via IntersectionObserver
```

- Each pill = `Day N` + tiny day-of-week. Tap = smooth-scroll to that day's hero.
- IntersectionObserver watches the day hero photos; whichever is most in view gets `[aria-current="true"]` and the active style (filled green pill).
- On scroll up to top, day-nav pills shrink to half-opacity and the global nav is dominant.
- Mobile: horizontal-scrollable, snap-to-pill, no overflow scrollbar visible.

Implementation: pure JS, no framework. ~40 lines. Documented pattern (bram.us reference).

---

## 5. Color palette (refined)

Keep current alpine variables. Tighten contrast.

| Token | Value | Use |
|---|---|---|
| `--cream` | `#faf6ee` | page background |
| `--paper` | `#ffffff` | card surface |
| `--ink` | `#1a2429` | body copy |
| `--ink-soft` | `#5a6970` | muted, drive labels, time-col |
| `--line` | `#e6dfcd` | dividers, soft borders |
| `--green-deep` | `#2e5d4f` | accent, Plan A badge, CTAs |
| `--green-mist` | `#e6efe9` | gentle backgrounds |
| `--blue-lake` | `#3a6f8f` | links, Plan B accent |
| `--blue-mist` | `#dfe9f0` | gentle backgrounds |
| `--gold-warm` | `#f4d9a4` | sunset block background |
| `--gold-sun` | `#d4a04a` | sunset accents, peak badge |
| `--gold-deep` | `#9c6f1f` | sunset text on gold-warm |

Sunset block specifically uses `--gold-warm` as fill with `--gold-deep` text and a subtle 1px `--gold-sun` border. Larger sun emoji ☀ in the header.

---

## 6. Typography

- **Headlines:** Cormorant Garamond 600 weight (currently used). Tighten letter-spacing to `-0.015em` for displays.
- **Body:** Inter 400, line-height 1.65 (currently 1.55 — bump for breathing room).
- **Day titles:** clamp(1.7rem, 4.5vw, 2.3rem) — bigger than v2.
- **Time labels in blocks:** Inter 600 tabular-nums, 0.82rem, muted.
- **Sunset block headline:** Cormorant 600, 1.5rem mobile, 1.8rem desktop. Italic for "sunset" word? — no, keep upright to read as data.
- **Max content width:** 720px for prose, 980px for cards/grids (matches Wanderlog/Salt & Wind sweet spot).

---

## 7. Spacing & density

- **Between day cards:** 4rem on mobile, 5rem on desktop (currently 1.4rem — way too tight, this is the #1 "insane" symptom).
- **Day card internal padding:** 1.4rem mobile / 1.8rem desktop on body sections, 0 on hero photo (full-bleed inside card).
- **Section vertical:** 4rem top/bottom on mobile, 6rem desktop (Airbnb-band-style).
- **Line-height global:** 1.65 (was 1.55).
- **Paragraph spacing:** 1em margin-bottom (was 0.8em).

---

## 8. Photo standards

- **Per-day hero:** 16:9 mobile, 21:9 desktop. Full-bleed within day card. `loading="lazy"`, `decoding="async"`. Object-fit cover. Min-height 240px mobile, 360px desktop.
- **Lodging:** keep existing 16:10 cards.
- **Place photos within blocks:** none — the day hero is enough. Per Allison: "pic of palces to visit and attractions not too many."

Photo sourcing rules (fail-loud per the rule):
- Wikimedia Commons primary. License: CC-BY-SA or PD. Direct CDN URLs from `upload.wikimedia.org`.
- Unsplash secondary — but verify the photo actually depicts the named place. Use only photos with the place name in the photo's title/description.
- If can't verify → use a CSS gradient placeholder instead of a wrong photo. Better blank than lying.

Photo audit needed per day:
| Day | Marquee place | Source | Verified? |
|---|---|---|---|
| 1 Fri | Salzburg Altstadt / Salzach | Wikimedia "Salzach in Salzburg" | yes |
| 2 Sat | Hohensalzburg fortress | Wikimedia "Festung Hohensalzburg" | yes |
| 3 Sun | Vorderer Gosausee | Wikimedia "Vorderer Gosausee" | yes |
| 4 Mon | Hallstatt village | Wikimedia "Hallstatt" | yes |
| 5 Tue | Königssee + St. Bartholomä | Wikimedia "St Bartholomä" | yes |
| 6 Wed | Schafberg / Wolfgangsee | Wikimedia "Wolfgangsee" | yes |
| 7 Thu | Werfen / Hohenwerfen castle | Wikimedia "Burg Hohenwerfen" | yes |
| 8 Fri | airplane / departure | sky/dawn Unsplash | low-stakes |

---

## 9. Mobile breakpoints

- `< 640px` — single column, hero 16:9, sticky day-nav scrollable.
- `640–1023px` — single column, hero 18:9, slight padding bump.
- `≥ 1024px` — content max-width 980px, hero 21:9, Plan B opens as right-side column when expanded.

---

## 10. Sunset block — sacred treatment

```
┌────────────────────────────────────────────┐  background: --gold-warm
│  ☀  SUNSET 20:50                           │  small caps, --gold-deep
│  On the last electric boat from St.        │  serif 1.5rem, --ink
│  Bartholomä — Watzmann goes gold           │
│                                            │
│  📍 Königssee (linked to Google Maps)      │  --gold-deep, underlined
└────────────────────────────────────────────┘
```

- Always renders. Distinctive even on text-heavy days.
- Per-day. Inherits `day.sunsetTime` and `day.sunsetSpot`.
- Tara-Bridge-moment days get an additional gold "PEAK MOMENT" pill above the sunset block headline.

---

## 11. Landing page — Montenegro vibe in framing

Restore the "Tara Bridge of this trip" voice without adding vibe-menus or tiers. Allison's Montenegro writing carries the tone — a few echoes:

- Open with the dates + the spine sentence ("Salzburg for Shabbat. Hallstatt for the lakes. Sunsets every night.") — already there.
- Add a single block-quote from Montenegro: *"sometimes I dangled my feet over the side of the bridge, other times I sat on the ground or stood, watching in awe."* — small, italic, attributed to "Montenegro, July 2024."
- "Why this plan" stays. Tighten to two paragraphs not three.
- "The 7 days at a glance" becomes a horizontal-scrolling card row with hero thumbnails + day label + 1-line summary — taps go to that day on itinerary page.
- "The Tara Bridge moment" callout stays gold but smaller — it's the seed, not the main course.
- "Real apartments" card stays — link out to stay page.
- "Skipping" callout stays — it's reassurance.
- "Budget" CTA stays.

The vibe goal: reading the landing page feels like Allison standing on the Tara Bridge writing for Avital. Not a brochure. Not an itinerary printout.

---

## 12. Linkification rules (per Allison's "link it" feedback)

Every reference becomes clickable:
- **Phone numbers** → `tel:+43...`
- **WhatsApp** → `https://wa.me/[digits]`
- **Addresses** → `https://www.google.com/maps/search/?api=1&query=[encoded]`
- **Drive segments** → directions: `https://www.google.com/maps/dir/?api=1&origin=...&destination=...`
- **Attractions** → official ticket site if known, else Maps place
- **Property names** → already linked to Booking

Implementation: lightweight helper in `src/links.ts` exports `mapsLink(query)`, `directionsLink(from, to)`, `telLink(num)`, `waLink(num)`. Day-render uses these on sunset-spot, drive summary, attraction names.

---

## 13. What we ARE NOT doing

- Tabs for Plan A / Plan B (rejected — Plan A is primary).
- Accordion for the hour-by-hour (rejected — that's the data, not a detail).
- Carousels of place photos (Allison: "not too many").
- Full-bleed parallax hero on every day (too heavy on mobile data).
- Animation beyond standard image-fade-on-load.
- Vibe-menus / intensity tiers (dead, dead, dead).

---

## 14. Implementation order

1. New CSS — replace styles.css density rules + add day-nav + sunset block + collapsed Plan B.
2. New `src/links.ts` helper.
3. New `src/day-nav.ts` — sticky day-nav + IntersectionObserver scrollspy.
4. Update `src/day-render.ts` — new shape (hero photo at top, 3-line summary, Plan A expanded / Plan B `<details>`, sunset block).
5. Add Wikimedia photo URLs to `IMG` constant in trip-data.ts.
6. Update `index.html` with Montenegro quote + horizontal-scroll day glance.
7. Update `itinerary.html` to include day-nav slot.
8. Audit `stay.html`, `costs.html`, `map.html`, `packing.html`, `notes.html` against the new spacing rules.
9. Build + visual smoke test.
10. Deploy.

Done = the page reads like a travel magazine, not a spreadsheet.
