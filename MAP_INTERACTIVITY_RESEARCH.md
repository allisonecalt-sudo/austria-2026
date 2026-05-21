# Map interactivity — research + design spec

**Created** 2026-05-17 by map-interactivity-genius agent.
**Scope** map.html (full bird's-eye) + index.html moment-3 mini-map.
**Source code** `src/page-map.ts`, `src/page-landing.ts`, `src/styles.css`.

This doc captures what I learned from researching how the best
interactive trip maps work in 2026, distills the patterns worth
copying, lists the ones we deliberately skip, and ends with the exact
spec we executed in this pass.

---

## 1. Reference sites studied + what they do well

| Site                       | What's notable                                                                 | What we steal                                                               |
| -------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| **Wanderlog**              | Auto-numbered pins per day, connecting polylines, drive-time on each segment   | Day-route polyline. Drive-time chips on hover/tap.                          |
| **Roadtrippers**           | Per-leg drive time + distance overlay, route auto-fit                          | Drive-time line on multi-select.                                            |
| **Airbnb (map view)**      | Price-pill pins, split list+map, hover-link between list row and map pin       | Sidebar drawer list. Two-way hover: tap list row → highlight on map.        |
| **Booking.com (map view)** | Filter chips above map, mobile slide-up filter drawer, cluster-on-zoom-out     | Filter chips above the legend. Mobile bottom-sheet for popup detail.        |
| **Komoot / AllTrails**     | Cluster bubbles with count, terrain-coloured polylines, photo-rich popup cards | Photo thumb (lazy) + 1-line description + CTA in popup.                     |
| **Atlas Obscura**          | Photo-led popup, "view all" cross-link, minimal layer set                      | Single hero photo, no carousel.                                             |
| **NPS / Yellowstone**      | Government-grade clarity: numbered pins, legend grouped by symbol type         | Group legend rows by **role** (lodging / nature / context) not just colour. |
| **Felt**                   | "Reveal on demand" — tooltip is for context, popup is for commit               | Hover = tooltip with name only. Click = full popup.                         |
| **Mapbox showcase**        | Sticky map on long pages, scrollytelling, segmented colour scales              | Sticky map on desktop scroll (mountain anchor section).                     |
| **Google My Maps**         | Layers control = checkbox tree, landscape photos only, ≤10 layers              | Checkbox-style layer panel. Cap colour count.                               |
| **Visit Switzerland**      | Region filter buttons, animated route draw, sunrise/sunset overlay             | Animated polyline draw on day-route toggle.                                 |

## 2. Patterns we evaluated — adopt / skip / defer

### Adopt this pass

- **Sidebar-drawer list of pins on desktop** — Airbnb pattern. List of every visible (post-filter) pin. Hover row → highlight pin. Click row → fly + open popup. Use `markerClusterGroup.zoomToShowLayer(marker, callback)` so it works through clusters (Leaflet doc-recommended).
- **Filter chips above the map** — region / type filters. Replaces the cramped Leaflet default `L.control.layers` checkbox box. Bigger touch targets (mobile-first), one tap to isolate.
- **Collapsible legend** — top-right toggle to expand/collapse. Reclaims mobile real estate. Default: collapsed on mobile, open on desktop.
- **Click-pin popup richer** — photo placeholder slot (graceful when no photo) + 1-line + drive-time-from-base + 2 CTAs (View details / Open external). Reuse existing popup CSS, add `pop-photo`.
- **Day-route polyline toggle** — single button "Show 7-day route". On = draws Sun→Mon→Tue→Wed→Thu colour-segmented polyline using `setTimeout` animation (native, no plugin). Off by default to avoid noise.
- **"Find" jump buttons** — already have Find Chabad. Add Find Schafbergspitze (summit-sleep) and Find airport. Group into a single mini-toolbar so the top-left doesn't sprawl.
- **Mobile bottom-sheet popup** — already mostly works via Leaflet popup. Add `tap-tolerance` + a "✕ Close" inside the popup for fat-finger safety.
- **Cluster-friendly fly-to** — when sidebar row is clicked, call `zoomToShowLayer` then `openPopup` in callback (avoids "popup vanished into cluster" bug).
- **Two-pin distance line** — click 2 pins in the sidebar → draw straight-line + drive-time estimate. Skipping real routing (OSRM = too heavy for a static site). Crow-flies + "≈ X min" using haversine × known motorway average works for our scale.
- **Hover tooltip name only** — non-touch devices show pin name on hover before commit-to-click. Touch devices fall back to direct popup (Leaflet handles this automatically).

### Skip — wrong fit for our scale (75 pins, 7-day trip, static site)

- **Real turn-by-turn routing** (Leaflet Routing Machine / OSRM hosted) — heavyweight, needs external API or tile bundle, our 4-base routing is already documented on `driving-austria.html`. Crow-flies is enough for the map's purpose.
- **3D terrain / Mapbox GL** — paid tier, no API key in repo by design. OSM raster tiles match the rest of the site's typography.
- **Scrollytelling** — would split map.html into a long-scroll story. Out of scope; map.html's job is the bird's-eye reference, not narrative. Story already lives on index.html + itinerary.html.
- **Search-from-map** — only 13 nature dests + 22 lodgings, the sidebar list IS the search. Adding geocoder is overkill.

### Defer to next pass (Avital / Erin feedback dependent)

- **Photo thumbnails in popups** — needs photo URLs added to trip-data.ts per-pin. Slot is wired up; assets land later.
- **Sticky map on scroll** for the long lower sections — would require layout rework on map.html. Punt.
- **Saved shortlist** — "Add to shortlist ✓" button mentioned in directive but needs Supabase wiring + auth. Out of scope for this pass; flagged for follow-up.

## 3. Specific UX problems with the CURRENT map (baselined 2026-05-17 01:10)

Observed on https://allisonecalt-sudo.github.io/austria-2026/map.html, desktop 1280 + mobile 412:

1. **Layer toggle box is cramped on mobile** — sits over the map, eats ~30% of the visible map area, checkboxes are tiny.
2. **No way to see "what's on the map" without zooming in** — there are 75 pins but no list view. To find a specific lodging name you have to scan visually.
3. **Legend is permanently expanded** — bottom-right block obscures Bavarian corner of map on small screens.
4. **No drive-time context** in any popup — the data exists (`fromSalzburgMin`, `fromHallstattMin` for nature, drive matrix in table) but isn't surfaced on the pin where it's most useful.
5. **No day-route visualisation** — user can't see "what's the shape of the week" without leaving for index.html mini-map.
6. **Find Chabad button is solo** — visually unbalanced top-left, sets the expectation for "Find X" buttons we don't deliver.
7. **Mobile popups are wide** — they fit but the bottom 1/3 of the popup is below the fold of a 412-wide screen.

## 4. Design spec — what we shipped this pass

### map.html

**Filter chip strip (new) — above the map, replaces default `L.control.layers`.**
Three chip groups:

- _Layers:_ `[Nature]` `[Lodging]` `[Airport + Jewish]` — toggle whole layer on/off.
- _Regions:_ `[Salzkammergut]` `[Berchtesgaden]` `[Hohe Tauern]` — filters nature pins within the Nature layer.
- _Toggles:_ `[Show 7-day route]` `[Show drive lines]` — extras.

Each chip is a `<button role="switch" aria-pressed="…">`, 36px min-height (touch), keyboard-focusable. Active = filled with role colour. Inactive = outlined.

**Sidebar drawer (new, desktop ≥900px) — `aside.map-sidebar`.**

- Right-rail panel, 280px wide. Sits _beside_ the map (flex layout), not over it.
- Search input at top — filters list by name substring (client-only).
- List of every pin visible after current filter chip state. Grouped by category (Nature / Lodging / Other).
- Each row: colour dot + name + secondary line (region or base label).
- Hover row → corresponding pin gets `.is-highlighted` glow class.
- Click row → `cluster.zoomToShowLayer(marker, () => marker.openPopup())` so it survives cluster collapse.

On mobile (<900px) the sidebar collapses to a "List view" button that opens it as a full-height drawer overlaying the map.

**Legend** — collapsible. Default open on desktop, collapsed on mobile. Toggle button shows ▾ / ▸. Same content as before; only the wrapper changes.

**Popups** — added:

- `pop-photo` slot (renders only when a `photoUrl` field is present on the pin object — none yet wired, this is the hook).
- `pop-drive` row: "≈ XX min from Salzburg · ≈ YY min from Hallstatt" using existing nature data.
- Mobile `[✕]` close affordance in the popup top-right corner.

**Day-route polyline (new) — toggle "Show 7-day route".**

- Off by default.
- When on: draws a multi-coloured polyline through 7 anchor points (airport → Salzburg → Obertraun → Krippenstein → Königssee → Schafbergspitze → Hallstatt → airport). Each segment a different hue with `setTimeout` reveal animation (~140ms per segment).
- Tooltip on each segment shows day label + drive time.

**Distance overlay (new) — multi-select from sidebar.**

- Click two rows with Shift held → straight line drawn between, label = "≈ XX km · ≈ YY min (motorway avg)".
- Clear when either row is unselected.

**Find buttons** — kept as a `leaflet-bar` row, but added Find Schafbergspitze + Find Airport. Grouped vertically so the top-left has one tidy mini-toolbar instead of one rogue button.

### index.html moment-3 mini-map

- Pins now `interactive: true` so tap → tooltip persists (was `false`).
- Pin hit area enlarged to 30×30 invisible touch target (visible dot stays 18px / 22px summit).
- Route polyline gets a subtle scroll-into-view draw animation via IntersectionObserver + CSS `stroke-dashoffset` transition. Already a dashed line — we make the dash _appear_ over ~1.4s the first time the section enters viewport. Subsequent scrolls = no re-animation.
- "Sleep here" gold halo subtly pulses on the Schafbergspitze pin (matches main-map convention).
- Tooltip text bumped from 0.85→0.9rem.

## 5. Things deliberately left alone

- The 4-base lodging cluster cards below the map (`.map-cluster-grid`). Solid as-is.
- The drive matrix table.
- Tile provider (OSM) — works fine, no API key, matches site fonts.
- `stay.html` map (different agent owns it).
- Markercluster radii (40 / 35) — already tuned for the dataset.

## 6. Sources (web research)

- Eleken — _Map UI Design: Best Practices, Tools & Real-World Examples_ — visual hierarchy + popup-vs-sidebar tradeoffs.
- Felt blog — _How to make interactive maps_ — reveal-on-demand tooltip pattern.
- Leaflet docs — `Layer Groups and Layers Control`; `markercluster` plugin reference.
- GitHub: Turbo87/leaflet-sidebar — responsive sidebar pattern (didn't import the lib, copied the structural idea).
- GitHub: Igor-Vladyka/leaflet.motion — animated polyline approach (didn't import; native `setTimeout` is fine for 7 segments).
- Wanderlog blog — multi-stop trip planner UX (drive times per segment).
- Airbnb Tech Blog — _Improving search ranking for Maps_ (mini-pin vs price-pin hierarchy).
- Mobbin Airbnb Android flow — filter drawer pattern.
- Google MyMaps tips — landscape-only photos rule.

## 7. Out-of-scope follow-ups (flag for next pass)

- Wire photo URLs per pin so the `pop-photo` slot actually renders thumbs.
- Add Supabase-backed shortlist (`favourite_pins` table) so Allison + Avital can pin favourites cross-device.
- Add an "Avital mode" colour-blind-friendly palette toggle if she ever flags it.
- Sticky-map-on-scroll mode for the long tables section below the map.
- Real OSRM driving route for the Show-route toggle (currently crow-flies + estimate).
