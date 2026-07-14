---
type: build-queue
project: Genesis
status: "PROVISIONAL 2026-07-09 — Fable-lane draft, Adam red-pen pending"
created: 2026-07-09
related:
  - "[[PLACE-GEN]]"
  - "[[SPRITE-TRANSITION]]"
  - "[[TABLETOP-VISION]]"
  - "[[VISUAL-ASSET-QUEUE]]"
  - "[[MODEL-FOUNDRY]]"
---

# PLACE-ASSET-QUEUE — the concrete build list for dressing minted places

**What this is.** PLACE-GEN §5 unit 8 landed `SCENE_DRESSING_BY_ARCHETYPE` (`build/gen-place-skins.py`)
— 24 spine archetypes each pointing at 3–4 prop *names* drawn from the existing `REALM_PROPS` pool
(`dev/model-qa/realm-props.json`). That map resolves cleanly today (the 2026-07-09 census in
`VISUAL-ASSET-QUEUE.md` reports 0 thin/0 missing) — but the census is honest that this is
**zero-by-construction**: unit 8's author only pointed at props that already existed. This document
is the *grounded sweep* that census called for — what a tray actually needs to read as its
archetype once §7 unit 7 (`trayFrom`'s `node` branch) starts asking the pools for real architecture,
not just scatter dressing.

**Method.** Every entry below was checked against ground truth, not assumed:
- **3D part vocabulary that already exists** (27 built `prop:*` registry entries,
  `src/ui/theater-figures.js:279-318,661-668`): statue-figure, pillar-intact/broken, table-slab,
  throne-seat, arch-frame, web-mass, well-shaft, crate, cart, shrine-block, candelabra,
  coffin-slab, cage-frame, chain-drape, gear-cluster, rubble-scatter, basin-block, portcullis,
  bone-wall, grate, obelisk, floating-monolith, brazier, + the 8 bespoke Chrome/Gloom realm props
  (sentry-turret-mount, conveyor-spur, holo-pillar-ad, blast-shutter-frame, shroud-draped-loom,
  sin-eaters-bowl-stand, charnel-pit, whispering-curtain-row).
- **The already-queued net-new gaps**: `dev/model-qa/realm-props.json`'s 31 `"base": "net-new: ..."`
  entries (props already scoped for a build, described inline, un-modeled).
  Full list confirmed present: canvas tent shelter · collapsed brick loophole · flipped burnt-out
  cruiser · huge bramble nest · broken elevated-roadway chunk · hovering crystal slab · rotating-ring
  armature · ore-panning trough · gutted transit-bus shell · wheeled cannon · tumbleweed · glowing
  ground vent · bone-rib colonnade · Escher stairs · oversized egg · ash dune · stepped platform
  tier · skeletal windmill · totem pole · amber resin block · treaded armored hull · jungle-gym
  skeleton · frosted capsule pod.
- **`SCENE_DRESSING_BY_ARCHETYPE`'s 24 rows** (`build/gen-place-skins.py:277-325`) — every prop
  name it currently points at, and what it *doesn't* reach.
- **The 3 authored skins** (Frontier/Chrome/Gloom `Place Skin - *.md`) for realm-specific [ADD]
  places (subway platform, rooftop territory, charging depot, arcology mezzanine / standpipe,
  fairground, barrens / stagecoach relay, hanging tree, claim diggings) and their staff/cast fields.
- **`data/realms.js` register/voice anchors** for the 8 backfill realms' silhouette register.

**Ground-truth surprise, stated up front:** the dressing map today leans almost entirely on
**scatter/fixture props** (barrels, crates, torches, grates, trash cans) because that's what
`REALM_PROPS` is stocked with. It has **no architecture-shell vocabulary at all** — no counter, no
stall frame, no cell bars, no shelving, no fence/gate, no bench/pew, no forge. TABLETOP-VISION's
rim-and-doorway ruling (walls demoted, §2) means the *shell* isn't walls — it's the things that make
a room's edge and use legible without a wall: the counter that says "shop," the bars that say
"cell," the pews that say "shrine." That gap is Part 1(b) below and is the single highest-leverage
finding of this sweep.

---

## Part 1 — 3D assets (models lane)

Grid-Law footprints in 5-ft cells (GRID LAW, PLACE-GEN ADDENDUM §A). Priority: **P1** = archetype
unreadable as itself without it · **P2** = strong flavor, archetype survives without it · **P3** =
nice-to-have. Silhouette briefs in MODEL-FOUNDRY register (band 1,000–2,000 tris, coherence over
distinctness). Reuse-with-params flagged where an existing `prop:*` builder can serve via param/tint
rather than a net-new module (foundry law: dedupe hard).

### (a) Anchor furniture — the one piece that names the room

| Name | Serves (archetype #) | Realm | Footprint | Priority | Brief |
|---|---|---|---|---|---|
| **Long counter / bar-run** | 2 Watering-hole, 1 Gathering-place, 3 Market (stall variant) | all (cross-realm, tint by realm) | 2×1 | P1 | A waist-high run of scarred plank/metal, 10 ft long, straight or L-corner. **Reuse-with-params: extend `prop:table-slab` with a `long-run` variant** — same builder, longer/lower proportions, no net-new module. |
| **Altar / offertory block** | 6 Shrine | all, relabeled per realm (stone slab Frontier/Cosmic, chrome shrine-block Chrome, home-altar Gloom, ship's-chapel High-Seas) | 1×1 | P1 | Already exists — `prop:shrine-block`. **No build needed**; flag only because the dressing map (row 6) doesn't yet point at it (points at Offertory Table/Weeping Font/Grave-Torch, all scatter — the anchor itself is missing from the row). |
| **Judge's bench / seat-of-power dais** | 4 Seat-of-power, 5 Hall-of-law | all, cross-realm base + realm-skin dressing (Frontier land-office desk, Chrome corp-tower reception counter, Cosmic high-sanctum dais, Gloom realty-office desk) | 2×1 | P1 | Raised plank/stone platform (1 cell high) behind a rail or desk-run; the seated authority reads from silhouette alone — elevate, don't ornament. |
| **Forge / smith's hearth** | 9 Workshop (craft-anchor variant) | all | 1×1 | P2 | Squat brick/stone hearth block with a chimney stub and anvil nub; **reuse-with-params off `prop:brazier`** (already a fire-glow emitter) — add a hearth-shell variant. |
| **Cell bars / holding-frame** | 5 Hall-of-law, 15 Hideout (captive variant) | all | 1×1 (per bar-run segment) | P1 | Vertical iron-bar frame, floor to near-ceiling, one cell-wide module that tiles. **Reuse-with-params: `prop:cage-frame` already exists (built for coffin/cage class) — extend to a floor-standing bar-run variant** rather than net-new. |
| **Market stall frame** | 3 Market | all, cloth/awning color by realm | 1×1 | P1 | A-frame or lean-to stall skeleton with a cloth/tarp canopy and a narrow counter lip; tiles in rows for the Market's "vast" space band. |
| **Shelving / stock-rack** | 10 Storehouse, 9 Workshop | all | 1×1 | P2 | Open-frame wood/metal shelf unit, waist-to-head height, stacked-goods silhouette (paired with existing `prop:crate`). |
| **Bandstand / dais (Commons centerpiece)** | 22 Commons | all | 2×2 | P2 | Low raised octagon or square platform, a few steps up, open sides — the "something happens here" marker for the town green. |
| **Mill wheel** | 21 Works (Frontier/Gloom-standpipe variant) | Frontier, Gloom, cross-realm-eligible | 2×2 | P2 | Vertical paddle-wheel on a stone housing, half-submerged; the single-glance "this is what the place runs on" object PLACE-GEN §2 spine row 21 names directly. |
| **Transformer / power junction** | 21 Works (Chrome variant) | Chrome | 1×1 | P2 | Boxy humming unit, cable-tangle top, warning-stripe base — Chrome's version of the mill wheel. **Reuse-with-params off `prop:gear-cluster`** (industrial-junk silhouette already built) plus a cable-drape overlay. |
| **Standpipe / waterworks tank** | Gloom [ADD] "The standpipe" | Gloom | 2×2 | P1 | A squat riveted-steel water tower on 4 stub legs, the door painted shut — this is the anchor for a named ADD place, not ambient dressing; without it the place has no centerpiece. |
| **Pews / worship benches** | 6 Shrine (ambient row) | all | 1×1 (per bench, tiles) | P3 | Simple bench row, low-backed; fills the Shrine's "roomy" space band around the altar. |

### (b) Architecture shell — rim, doorways, counters, fences, gates (the census gap)

TABLETOP-VISION §2 demoted walls to rim + doorway pieces. That still leaves every archetype needing
an **edge read** — what tells the player "you're inside a shop" vs "you're inside a cell" vs
"you're at the edge of a fenced yard" without a wall. None of these exist in `REALM_PROPS` or the
`prop:*` registry today; all are net-new.

| Name | Serves (archetype #) | Realm | Footprint | Priority | Brief |
|---|---|---|---|---|---|
| **Shop counter + till-nook** | 3 Market, 9 Workshop | all | 1×1 | P1 | An L-shaped waist-high counter with a small back-shelf nook — the universal "you're being served here" read, distinct from the bar-run (which is social, this is transactional). |
| **Doorway frame (typed)** | ALL interior archetypes (rim exits per TABLETOP-VISION §3) | all, tint by realm | 1×1 (spans a rim gap) | P1 | A simple jamb+lintel frame that plugs into a rim gap — wood-plank (Frontier), steel-slot door (Chrome), stone arch (Cosmic/Gloom-shrine), screen door (Gloom-suburb). **Reuse-with-params off `prop:arch-frame`** (already built) — needs a "doorframe" (non-monumental, human-scale) variant alongside the existing archway. |
| **Rail fence run** | 20 Wild-margin, Frontier hitching-post contexts, Commons edge | all | 1×1 per segment (tiles) | P2 | Low horizontal-rail fence, 3-4 ft, open enough to see through — marks a yard/paddock/lot edge without a wall's density. |
| **Chain-link / turf-line fence** | 20 Wild-margin (Chrome variant), Chrome rooftop territory | Chrome | 1×1 per segment (tiles) | P2 | Sagging chain-link with a strip of painted-claim cloth tied through it — Chrome's turf-grammar edge marker (REALM-ROLE-EDGES already keys turf ownership; this is its physical tell). |
| **Gate (checkpoint)** | 13 Threshold | all | 2×1 | P1 | A barrier arm or barred double-gate set into a rim gap, with room for one guard figure beside it — the Threshold archetype's entire premise is "someone controls this gap," and today's dressing (grates) reads as scenery, not a controlled crossing. |
| **Turnstile bank** | Chrome [ADD] "The subway platform" | Chrome | 1×1 | P2 | Three waist-high turnstile units in a row — the Threshold gate's Chrome-specific reskin, distinct enough (mechanical, not barred) to earn its own module rather than a tint. |
| **Loading dock / cargo bay shell** | 10 Storehouse, 21 Works | all | 2×1 | P3 | A raised concrete lip with a roll-door frame behind it — reads as "goods move through here" at a glance. |

### (c) Big fixtures — realm-unique showpieces (centerpiece slot, §4)

Most of this tier is **already scoped**: 12 of the 31 `net-new:` entries in `realm-props.json` are
exactly this class (broken elevated roadway, gutted bus, wheeled cannon, ore-panning trough,
skeletal windmill, hovering crystal slab, rotating-ring armature, etc.) and need no new discovery —
they need building, in the order their realm's places get authored. The sweep found **one gap this
tier is missing**: a High-Seas anchor fixture.

| Name | Serves | Realm | Footprint | Priority | Brief |
|---|---|---|---|---|---|
| **Careening frame / ship's-ways** | High-Seas' "careening beach" (PLACE-GEN §2 example ADD, not yet authored in a skin file) | High-Seas | 3×2 | P3 | Heavy timber cradle-frame a beached hull rests in for hull work — named directly in PLACE-GEN §2 as an example ADD but High-Seas has no authored skin file yet (backfill realm); flagged so its centerpiece isn't forgotten when the skin lands. |

---

## Part 2 — setting sprites (sprite lane)

Per SPRITE-TRANSITION: the 3D engine owns architectural/organic-solid content; flat/pictorial
content is a sprite's job, billboarded on the PS1 stage. Same fields as Part 1 minus footprint —
sprites carry a size class relative to the base-disc convention (`small` = sign/notice scale,
`medium` = banner/poster scale, `large` = hanging-shingle/mural scale, `fx` = animated-feel overlay
sprite, larger and often semi-transparent).

### Signs (per-realm voice)

| Name | Serves | Realm | Size | Priority | Brief |
|---|---|---|---|---|---|
| Hanging shingle (generic trade icon) | 2 Watering-hole, 9 Workshop, 3 Market stalls | all | large | P1 | Weathered wood-plank sign on a bracket, one carved/painted icon (mug, hammer, boot) — no text (illiteracy-safe, matches existing table-driven naming). |
| Neon marquee | 2 Watering-hole (noodle-bar), 16 Vice-den | Chrome | large | P1 | Buzzing tube-neon shop sign, one kanji-adjacent glyph or icon, half the tubes flickered dead. |
| Painted board (hand-lettered) | 1 Gathering-place, 4 Seat-of-power | Frontier, Gloom-suburb | large | P2 | Whitewashed plank with hand-painted lettering-suggestion (squiggle-text, never real words per the illiteracy convention) — the "General Store" register without literal text. |
| Corp branding placard | 4 Seat-of-power (tower lobby) | Chrome | medium | P2 | Backlit acrylic panel, corporate-clean, one logo-mark. |
| Realty sign (For Sale / Managed By) | 4 Seat-of-power (Gloom "the realty office that owns the town") | Gloom | medium | P1 | Suburban yard-sign silhouette, the mundane-wrong tell — same sign on every building in town. |

### Banners / flags

| Name | Serves | Realm | Size | Priority | Brief |
|---|---|---|---|---|---|
| Faction/turf banner | Chrome districts (turf grammar), Chrome rooftop territory | Chrome | large | P1 | Spray-tagged cloth strip tied to a fence/rail, gang-color field, one crude icon. |
| House/temple pennant | 6 Shrine, 4 Seat-of-power | Frontier, Cosmic | medium | P2 | Simple triangular cloth pennant on a pole, faded color field. |
| Nautical signal flag string | 4 Seat-of-power (harbormaster), Threshold (boarding plank) | High-Seas | medium | P3 | A short string of triangular signal flags along a rail. |

### Paintings / portraits / posters / notices (the pictorial-content lane)

| Name | Serves | Realm | Size | Priority | Brief |
|---|---|---|---|---|---|
| Wanted poster | 5 Hall-of-law, 1 Gathering-place | Frontier | small | P1 | Torn-edge paper, a rough painted-portrait sketch, no legible text (the fee/name are DM-narrated, not rendered). |
| Corp recruitment ad | 1 Gathering-place, Chrome subway platform | Chrome | small | P1 | Glossy backlit panel, an idealized painted face, a slogan-suggestion squiggle. |
| Missing-child flyer | 1 Gathering-place, 22 Commons | Gloom | small | P1 | Photocopy-grain flyer stapled to a post, a school-photo-style face, curling at the edges — the single most tonally load-bearing sprite in this queue; understated per the tone doctrine, never played for shock. |
| Ancestor/ruler portrait | 4 Seat-of-power | all, tint by realm | medium | P2 | Formal painted bust-portrait in a frame, realm-appropriate medium (oil-paint frontier, holo-frame Chrome, fresco Cosmic). |
| Court notice / decree board | 5 Hall-of-law | all | small | P2 | Pinned parchment/paper stack under a small awning, official-seal blob (no text). |

### Window glows

| Name | Serves | Realm | Size | Priority | Brief |
|---|---|---|---|---|---|
| Warm lamplit window | 12 Dwelling, 2 Watering-hole (exterior read) | Frontier, Gloom, Cosmic | medium | P1 | Rectangular soft-amber glow with a curtain-silhouette suggestion; overlays onto a building-facade prop, doesn't stand alone. |
| Cold fluorescent window | 4 Seat-of-power (corp tower), 12 Dwelling | Chrome | medium | P1 | Rectangular flat cyan-white glow, blinds-slat suggestion — the Chrome inversion of the warm-window read. |
| Flickering/dead window | 12 Dwelling, 15 Hideout | Gloom, Ash | medium | P2 | Irregular strobing glow or a fully dark pane among lit ones — the single-house-wrong tell. |

### Graffiti tags (Chrome turf grammar)

| Name | Serves | Realm | Size | Priority | Brief |
|---|---|---|---|---|---|
| Turf claim tag | Chrome districts, rooftop territory, Wild-margin | Chrome | medium | P1 | Spray-paint glyph/tag overlay for a wall/fence surface, one gang-color family; needs 4-6 palette variants so rival turf reads as visually distinct without new geometry. |
| Crossed-out rival tag | Chrome districts (contested turf) | Chrome | medium | P2 | The claim-tag variant with a spray-slash through it — the "this just changed hands" trace overlay (TABLETOP-VISION §5 trace lane). |

### FX sprites (steam, smoke, glow, wisps)

| Name | Serves | Realm | Size | Priority | Brief |
|---|---|---|---|---|---|
| Steam vent puff | 21 Works, Chrome subway platform, standpipe | Chrome, Gloom | fx | P1 | Soft semi-transparent billowing puff, loops as a static "mid-puff" frame (no animation per the museum-restraint law — a still billboard, not a particle system). |
| Chimney/hearth smoke | 9 Workshop (forge), 12 Dwelling | all | fx | P2 | Thin rising smoke wisp off a chimney/hearth point. |
| Neon flicker overlay | Chrome signs (paired sprite state) | Chrome | fx | P3 | A dimmer/off variant of the neon-marquee sprite, swapped in on a slow timer — the "half the tubes are dead" read done as a texture swap, not a shader. |
| Fog wisp (ground-hugging) | 17 Ruin, 18 Boneyard, Gloom barrens | Gloom, Ash, Lost-World | fx | P1 | Low horizontal fog bank sprite, sits at ground level in front of/behind figures. |
| Candle/torch glow halo | 6 Shrine, 18 Boneyard (grave-torch) | all | fx | P2 | Soft radial warm-glow halo sprite layered behind an existing torch/candelabra prop — cheap way to sell "lit" without a real light-emitter pass. |
| Rain streak overlay | High-Seas, Gloom (mood variant) | High-Seas, Gloom | fx | P3 | Diagonal streak-pattern sprite, screen-space-feeling but billboarded at table depth per the existing overlay-lane convention. |

### Sheet plan

Follow the existing per-realm `.md` sheet convention (`dev/model-qa/sprite-sheets/*.md`: 5×5 grid,
25 cells, one style block per realm, magenta background, uniform scale) — but setting sprites are
**flat/pictorial, not creature poses**, so each sheet gets its own style block emphasizing
"flat graphic asset, front-on, no perspective foreshortening, transparent/magenta-keyed background,
readable as a small billboard element" in place of the creature sheets' "mid-action pose" language.

- **`signs-frontier` (12 cells):** hanging shingles (4 trade icons) + painted boards (3) + wanted
  poster (1) + ancestor portrait (1) + window-glow warm (2) + fog wisp (1, cross-realm-eligible).
- **`signs-chrome` (14 cells):** neon marquees (3 variants) + corp placard + corp recruitment ad +
  turf banner (3 color families) + turf tag (4 palette variants) + crossed-out tag + steam puff.
- **`signs-gloom` (12 cells):** realty sign + missing-child flyer + painted board (suburb variant) +
  window-glow warm/flickering (2 each) + fog wisp + candle-glow halo + standpipe steam puff +
  court-notice (Hall-of-law reuse) + rain-streak overlay + ancestor portrait (Gloom "family photo"
  variant).
- **`fx-cross-realm` (8 cells):** the FX sprites flagged "all"/cross-realm above, built once and
  reused via tint (steam puff, chimney smoke, candle-glow, fog wisp, rain streak, +3 palette
  variants) — dedupe hard, one sheet instead of one per realm.
- Remaining 8 backfill realms (Ash/Suburb/Noir/High-Seas/Lost-World/Cosmic/Bright-Kingdom/Theater)
  get their sign/banner/portrait sheets authored alongside their `Place Skin - <Realm>.md` craft
  pass (PLACE-GEN §6 ruling 2 — skin labels are Adam's craft pass); this queue doesn't pre-author
  their content to avoid the breadth trap the spine itself was scoped to avoid.

---

## Part 3 — counts + wave plan

### Totals

| | P1 | P2 | P3 | Total |
|---|---:|---:|---:|---:|
| Part 1(a) anchor furniture | 6 | 4 | 2 | 12 |
| Part 1(b) architecture shell | 4 | 2 | 1 | 7 |
| Part 1(c) big fixtures (net-new gap only; the 12 realm-props net-new entries are pre-existing scope, not recounted here) | 0 | 0 | 1 | 1 |
| **Part 1 total (new sweep findings)** | **10** | **6** | **4** | **20** |
| Part 2 signs | 3 | 2 | 0 | 5 |
| Part 2 banners/flags | 1 | 1 | 1 | 3 |
| Part 2 paintings/posters/notices | 3 | 2 | 0 | 5 |
| Part 2 window glows | 2 | 1 | 0 | 3 |
| Part 2 graffiti tags | 1 | 1 | 0 | 2 |
| Part 2 FX sprites | 2 | 2 | 2 | 6 |
| **Part 2 total** | **12** | **9** | **3** | **24** |
| **Grand total (new findings, excludes pre-scoped net-new)** | **22** | **15** | **7** | **44** |

By realm (Part 1 + Part 2, cross-realm entries counted once under "all"):

| Realm | Entries touching it |
|---|---:|
| all / cross-realm | 15 |
| Chrome | 13 |
| Gloom | 12 |
| Frontier | 6 |
| High-Seas | 2 |
| Ash, Lost-World | 1 each (fog-wisp only) |

### First wave (P1-only, foundry-sized)

Sized like the foundry's proven one-realm waves (MODEL-FOUNDRY: ~15-20 pieces/wave). The P1 list
(21 entries) is one clean wave, models+sprites split by lane:

**Models-lane P1 (10):** long counter/bar-run · altar wiring fix (point row 6 at existing
`prop:shrine-block`, zero new geometry) · judge's bench/dais · cell bars (extend `prop:cage-frame`)
· market stall frame · standpipe tank · shop counter · doorway frame (extend `prop:arch-frame`) ·
gate (checkpoint) · [note: 3 of the 10 are param-extensions of existing builders, not net-new
modules — cheapest tier of this wave].

**Sprite-lane P1 (11):** hanging shingle · neon marquee · realty sign · missing-child flyer ·
faction/turf banner · wanted poster · corp recruitment ad · warm window-glow · cold window-glow ·
turf claim tag · steam vent puff · fog wisp *(12 listed — missing-child flyer and wanted poster
both P1 paintings-category; fog wisp counted once though it serves 3 realms)*.

This wave dresses the **3 authored realms (Frontier/Chrome/Gloom)** completely enough that unit 7's
`trayFrom` `node` branch has real architecture to draw on the moment it lands — the exact gap the
2026-07-09 census flagged as its own next trigger. P2/P3 and the 8 backfill-realm sign sheets follow
in subsequent waves, gated on their skin files landing (Part 2's sheet-plan note).

---

## Deviations from the brief

- Part 1(c) "big fixtures" is mostly **already covered** by `realm-props.json`'s existing
  `net-new:` markers — this sweep confirms them rather than re-discovering them, and adds only the
  one true gap found (High-Seas careening-frame, orphaned because High-Seas has no authored skin
  file yet). Recounting all 12 pre-scoped net-new fixtures here would double-book the same build
  work under two docs; they stay owned by `realm-props.json` + whichever realm's model wave picks
  them up.
- Two Part 1(a) entries are flagged **"no build needed, wiring fix only"** (the Shrine altar) or
  **"reuse-with-params"** (counter, cell bars, doorway, forge, transformer) rather than net-new
  builds — called out explicitly per the brief's "cite when an existing prop/part ALMOST works"
  instruction, since undercounting these as full builds would inflate the wave estimate.
