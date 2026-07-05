# Battlemap Playtest — findings (2026-07-04)

**Question asked:** do the new whole-object 3D models, dropped onto battle maps built from *real
rolled walk levels*, produce **legitimate battle maps** — hazards, interactable objects, and their
**size descriptions** all present and rendering clean?

**Short answer:** the models render great; the **maps around them do not yet carry the room's rolled
content**. Nothing crashes (112/112 rolled rooms build a board with zero throws), but as a player
hits it today a rolled room's **hazards, objects, and sizes never reach the map** — the engine
derives no scene geometry from the walk; that translation is left entirely to the DM's prose, with
no mechanization. When the same rolled content is wired in by hand (mode B), the render layer *does*
show it — which both proves the models/renderer are sound and exposes a batch of legibility bugs.

This was done headlessly; renders are attached as proof.

---

## How it was tested (all dev-only, no `src/` touched, reproducible)

| File | Role |
|---|---|
| `dev/model-qa/battlemap-audit.mjs` | Rolls real dungeon/urban/wilderness walks (8 seeds/env, seeded `Math.random`), builds each segment's board **two ways**, quantifies reach. Emits `battlemap-fixtures.js` + `battlemap-audit-report.json`. |
| `dev/model-qa/battlemap-render.html` | Render host — reuses `theater-preview.html`'s exact path (`theaterBoardFrom → theaterUnitsFrom → window.Theater`), driven by the generated fixtures. |
| `dev/model-qa/battlemap-capture.mjs` | Headless Chrome (puppeteer + swiftshader WebGL), screenshots each fixture → `battlemap-shots/`, stitches `contact-sheet.html`. |

**Re-run:** `node dev/model-qa/battlemap-audit.mjs && node dev/model-qa/battlemap-capture.mjs`
**Proof:** open `dev/model-qa/battlemap-shots/contact-sheet.html` (A vs B, side by side, per room).

- **Mode A — as-shipped:** `scene = {}` — what `combatStart` gets when the DM supplies nothing.
  (`dm.js:1037` takes `scene` straight from the DM's `combat_start` payload; the engine never derives
  hazard/object zones from the segment.)
- **Mode B — fully-fed:** the *same* rolled room, with its rolled hazards/objects/sizes/elevation
  mechanically translated into `scene` — a throwaway prototype of the missing wiring, living in the
  audit harness, **not** in `src/`.

---

## The data audit — how much rolled content reaches the map

Corpus: **112 segments** (8 seeds × 3 envs). Clean-run rate: **112/112, zero throws.**

| Env | rolled a HAZARD → reaches map | rolled an OBJECT → renders a prop | rolled a SIZE → parsed |
|---|---|---|---|
| **Dungeon** (32) | 3 rolled → **A: 0%** · B: 100% | **32/32** rolled → **A: 0%** · B: 97% | 17 rolled → **A: 0%** · B: 100% |
| **Urban** (40) | 2 rolled → **A: 0%** · B: 100% | 32 rolled → **A: 0%** · B: **47%** | 1 rolled → **A: 0%** · B: 100% |
| **Wilderness** (40) | 4 rolled → **A: 0%** · B: 100% | 40/40 rolled → **A: 0%** · B: **48%** | 22 rolled → **A: 0%** · B: 100% |

Every column's mode-A number is **0%.** The rolled room is rich (every dungeon and wilderness
segment rolls a feature/object; sizes are common); **none of it is on the board today.**

---

## Findings (ranked)

### 1 — HEADLINE: the walk → battle-map bridge is unwired (anti-drift gap)
The walk rollers already roll real geometry — `dims`, `feature{name,flavor,dims}`, `interactable`,
hazard text, elevation words — but **nothing converts that into `scene` geometry.** `theaterBoardFrom`
faithfully renders whatever `scene` it's handed; it's just handed an empty one. So the room's own
rolled truth only exists as prose the DM may or may not narrate — exactly the *"can the script own
this?"* case. **Proof:** `02-dungeon-sized-object-A.png` — a room rolled as *"Drainage Grate — iron
lattice, water below"* renders as **bare checker floor + standees; 0 props, 0 hazard tiles.**

### 2 — Hazard tiles only *read* for `water`/`pit`; every other kind is invisible
Mode B put **9 hazard tiles** on the dungeon-hazard board (`01-dungeon-hazard-B.png`) — but you
can't see them. Only `water`/`pit` variants **sink** below the floor; `fire`/`gas`/`acid`/`trap`/
generic get a faint scorch tint that vanishes on a dark dungeon palette. A hazard the player can't
see isn't a hazard. **The data path works; the visual signal doesn't.**

### 3 — Size descriptions never touch the render (null-safe placeholder)
`verify-battlemap` item 14a is honest that footprint/size → zone-occupancy is a deliberate
placeholder. Confirmed live: a `5'×5' unstable mound` and a chamber-filling feature resolve to the
**same** prop at the **same** scale. Sizes are rolled (17/32 dungeon, 22/40 wilderness) and dropped.

### 4 — Props resolve but render tiny & low-contrast — easy to miss
Even fully-fed, a resolved prop (the mushroom colony in `07-dungeon-open-cavern-B.png`, the grate in
`03`) is small and low-contrast against the floor, and on small boards it's **occluded by the
oversized figures.** Prop scale/contrast needs a pass to read as cover.

### 5 — Camera crops standees; small grids overcrowd
Figures are scaled ~1.5×1.2 and the camera fits the **board**, not the figures — so standees poke
above frame and get **cropped at the top/edges** on every board (`01`, `03`, `07`). Worse on tiny
grids: `04-dungeon-cramped-A.png` (a `5'×20'` corridor → **grid 1×1**) stacks all three combatants
into one zone in a heap of overlap.

### 6 — The dims parser collapses long-thin corridors to one band
`5'×20'` and `5'×40'` straights parse to a **1-band** grid (20 ft < the 25-ft/band step), so a
20–40 ft corridor becomes a single depth zone with everyone stacked. Corridors should read as
*long*. Needs a floor of ≥2 bands for any length past ~15 ft, or a smaller ft/band step.

### 7 — Object→prop keyword rules are dungeon-biased
Fully-fed, dungeon nouns resolve to a prop **97%** of the time but urban/wilderness only **~47%** —
half the rolled urban/wild interactables (tents, stalls, wagons, wells, mill-wheels…) hit no
`THEATER_PROP_KEYWORD_RULES` entry and fall back to a generic box. The keyword set needs urban/wild
nouns added.

### 8 — Dungeon elevation never rolled (worth a check)
0/32 dungeon segments surfaced an elevation word, despite BATTLEMAP.md expecting dais/balcony/perch.
Either the feature tables rarely roll it or it lives in a sub-field the board build doesn't read.
Low priority, but the FFT-elevation soul depends on it.

### ✅ The models themselves pass
Across all 14 renders the whole-object figures read well: PS1 grit intact, weapons legible in
silhouette (the green fighter's sword), the quadruped clearly reads as a beast, class silhouettes
distinct, per-env lighting (fungal-glow, dark) landing. **The problem is the map, not the models.**

---

## Recommended next steps (not built — this was QA)

1. **Mechanize a `sceneFromSegment(segment)` deriver in the engine** (the anti-drift fix): rolled
   hazards → `hazardZones`, feature/interactable/dressing nouns → `cover` (carrying the text so G4
   fires), size text → cover level + occupancy, elevation words → `elevZones`. The prototype in
   `battlemap-audit.mjs` (`fullyFedScene`) is a working starting point. This is the one that turns
   every 0% above into a real number.
2. **Make non-sinking hazards legible** — a marker/emissive/hatch for fire/gas/acid/trap so a hazard
   tile reads on any palette, not just water/pit.
3. **Wire size → prop scale + zone occupancy** (retire the 14a placeholder).
4. **Camera + scale pass** — fit to figure height (stop cropping standees); floor small-grid
   crowding (spread within-zone, or a min board size); prop scale/contrast up.
5. **dims parser:** min 2 bands for corridors > ~15 ft.
6. **Extend `THEATER_PROP_KEYWORD_RULES`** with urban/wilderness nouns (tent, stall, wagon, well,
   mill, wheel, cairn, log, boulder…).

Items 1–3 are the ones that make a rolled room an actual battle map. 4–6 are legibility polish once
content is flowing.
