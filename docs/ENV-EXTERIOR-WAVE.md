---
type: system-spec
project: Genesis
status: SPECCED — 2026-07-14 (ledger-ordered wave #2; Adam's delegation: full wiring + DRAFT looks,
  capture cards for his return red-pen — no mock gate pre-build; looks re-tune cheaply after)
governed_by: GRAPHICS-CONVERGENCE-CHARTER.md
composes: dev/play-lens/ledger.md (P1 #7/8/9), ENV-WAVES.md (weather doctrine), PLACE-GEN, WALK-CARD-DEALING.md
audience: Sonnet executors (one section = one unit = one branch)
---

# ENV/EXTERIOR WAVE — daytime, wilderness, town (the ledger's biggest MISSING mass)

The PLAY-LENS ledger measured it: all 6 travel legs render as an empty tile plane; daylit ≡ moonlit
≡ overcast pixel-identical; no compositional town tray exists. Adam: "we don't even have daytime!
or a town scene." Three units. **FIRE ONLY AFTER the QF wave lands** (QF-B owns the tray surface
until then). ENV-1 ∥ ENV-2 acceptable (theater-boot light rig vs theater-data tray build — disjoint);
ENV-3 after ENV-2 (same file).

Standard executor rules per PHASE-3-WAVE-1-SPECS.md header. Every unit ends with CAPTURE CARDS
(same-scene profile/biome matrices) — Adam red-pens looks at return; wiring is the deliverable,
draft look values are named consts he can re-tune in one place.

---

## ENV-1 — Light profiles differentiate everywhere  ·  branch `feat/env1-light-profiles`

### The measured defect
`LIGHT_PROFILES` (theater-boot.js:5365) + `applyLightProfile` (:5453) exist and interiors consume
them — but on node/travel trays, daylit/moonlit/overcast render pixel-identical (ledger #8,
pl-004..009). Diagnose first: does the tabletop path never call applyLightProfile, or do the
profiles map to indistinguishable rigs outside interiors?

### Decision
Every tray kind consumes the ACTIVE profile, and the core profiles are visually distinct AT A
GLANCE on the same scene: **daylit** = bright warm key + sky-blue ambient + soft shadows + a light
sky-tone background wash (NOT black void); **overcast** = flat grey-cool diffuse, low contrast,
muted background; **moonlit** = dim cool blue key + deep shadows + near-dark background;
**dark/torchlit** = current interior behavior (unchanged — it's the WORKING look). Draft values =
named consts grouped per profile (one re-tune surface). The void/background color becomes
profile-driven (the "black void" reads as night ONLY when it should). AgX stays the tone stage;
profiles feed it. Do NOT touch makeGradePass.

### Verification
⊗ RED FIRST: render the same fixture tray under daylit vs moonlit and assert the framebuffers
DIFFER materially (mean-luma delta > a named threshold) — fails today. Per-profile luma ordering
asserts (daylit > overcast > moonlit ≥ dark). Interiors byte-stable under their existing profiles
(protection set). Re-run: theater-shot 107, dungeon-interior 287, e0-1 32, agx harness, manifest.
CARD: one fixture scene × 4 profiles, same camera — READ + describe.

---

## ENV-1c — The solar/lunar arc (Adam's ruling 2026-07-14)  ·  branch `feat/env1c-celestial-arc`  ·  AFTER ENV-1b (same rig region)

### Adam's ruling (verbatim intent; do not re-litigate)
"The sun and moon are diegetic sources and their position in the time of day should affect overall
lighting when outdoors." Outdoor light is not a static profile — it is WHERE THE SUN/MOON IS.

### Decision
Map game time → celestial position → the exterior light rig (composes with ENV-1's profile looks +
ENV-1b's cast shadows; requires both landed):
- **Source of time:** `w.clock.min` (continuous minutes; `timeOfDay()` bands in src/world/dm.js:423
  are the labels, the arc uses the CONTINUOUS value). The tray build already receives world state —
  thread the clock through the same seam the tray sources use (pure; no new store).
- **The arc:** sun elevation/azimuth = a simple continuous function of min-of-day (named consts for
  sunrise/sunset minutes; a low-parameter arc, NOT an astronomy library — deterministic and cheap).
  The exterior KEY light's direction follows it → with ENV-1b's shadow maps, dawn/dusk = LONG raking
  shadows, noon = short tight ones, automatically.
- **Color/intensity curves along the arc** (named-const keyframes, lerped): dawn = low warm-pink,
  morning = warm gold, noon = high near-white, dusk = low orange-red, night = the MOON takes the key
  (cool blue-silver, dimmer, its own slower arc + shadow casting), deep night = near-down moon.
  Void/sky tint follows the same keyframes (dawn/dusk skies read).
- **Profile composition:** the rolled light profile MODULATES the arc, never replaces it — daylit =
  the clear-sky arc as-is; overcast = sun position retained but diffused (shadows soften/fade,
  colors flatten grey); moonlit at night = the moon arc as-is; `dark` and all INTERIOR profiles are
  untouched (interiors keep their practicals-only world — the arc is outdoors-only).
- One re-tune surface: extend `TABLETOP_EXTERIOR_LOOK` (or a sibling `CELESTIAL_ARC` table) — Adam
  red-pens keyframes, not code.

### Verification
⊗ RED FIRST: the same daylit tray at min=dawn vs min=noon differs (key direction + color — assert
light direction vector + a sampled sky/ground color delta; fails today, time is ignored). Shadow
direction flips across the day (with 1b landed: sample the shadow side of a figure at morning vs
evening). Noon luma > dawn luma; night(moonlit) ≪ noon; determinism (same clock ⇒ same rig);
interiors byte-stable; overcast damps shadow contrast vs daylit at the same minute. Re-run: env1
(28), env1b's harness, qfb-tray (37), theater-shot (107), dungeon-interior (287), manifest.
CARD: one dressed tray × 5 times of day (dawn/morning/noon/dusk/deep-night), same camera — the
"the sun moves" exhibit for Adam. READ + describe.

### Out of scope
Interior time effects (windows/skylights — a future ruling); weather beyond the existing profiles
(ENV-WAVES doctrine); an astronomy-accurate ephemeris; seasons.

---

## ENV-2 — Travel legs project their rolled biome  ·  branch `feat/env2-travel-terrain`

### The measured defect + the roll-is-truth fact
All 6 travel-leg frames are an empty plane with no PC token (ledger #7). But `wild-walk.js` ALREADY
ROLLS a biome per leg (`wilderness-biome-type` table, :21-24, biome can shift leg to leg) — the
tray discards a rolled fact. Law 1 applies: consume the roll.

### Decision
The travel tray becomes a biome-dressed exterior: (a) a deterministic seeded scatter of existing
realm-appropriate flora/rock/tree dressing (assets/dressing has ~80 candidates; reuse the
placeDistribute/mulberry32 seeding conventions — seed off walkId+legIndex; density modest, the 2e
empty-is-resting-state law still governs); (b) ground reads as terrain, not bare tile — at minimum
a biome-keyed ground tint/texture variant from existing REALM_TEXTURES/materials (no new art);
(c) **the PC token renders on the travel tray** (it's absent today — find why the travel board
mounts no PC and fix); (d) biome → a named mapping table BIOME_DRESSING (biome key → dressing slug
pool + ground variant + optional profile bias, e.g. swamp biases overcast) — draft mappings for
the biomes the table actually rolls; unknown biome degrades to the generic pool, logged.
ENV-1's profiles light it (travel legs carry lightProfile already — the manifest showed
daylit/moonlit/overcast rolling).

### Verification
⊗ RED FIRST: a fixture travel leg with a rolled biome yields >N dressed objects + a PC mount on
the tray board (fails today — empty). Determinism (same walkId+leg ⇒ byte-identical scatter);
different biome ⇒ different pool; raw walk record byte-untouched (walk-native law); no scatter on
the path/center lane (keep a clear walking lane — CLEAR-law analog, named const). Re-run:
walk-scene 32, dungeon-interior 287, theater-shot 107, place-distribution 27, manifest.
CARD: 3 different biomes × daylit/moonlit, same camera — READ + describe.

---

## ENV-3 — The town tray (first compositional settlement)  ·  branch `feat/env3-town-tray`  (after ENV-2)

### The measured defect
The settlement tray shows zero town (ledger #9; the rig confirmed no compositional settlement tray
exists — single-site place trays only, PLACE-GEN scope).

### Decision (draft look; Adam red-pens at return)
A `theaterSettlementBoardBuild` sibling to `theaterNodeBoardBuild` (theater-data.js:977) for
settlement-kind nodes: a composed street scene — (a) a street axis (ground variant strip);
(b) 4–8 building masses as FACED-BOX construction (the §H class — parametric boxes wearing
existing realm arch/facade textures; NO new art; count from the node's size/population field when
one exists, else a named default); (c) door/window face variety from existing texture pools,
seeded per building; (d) NPC sprinkle: 2–4 realm-keyed NPC sprites from the corpus on the street
(seeded, off the walking lane); (e) market/well/cart props from existing dressing at the street
center (the place-gen prop census is the pool); (f) ENV-1 profiles light it (a daylit town is THE
Adam card). Deterministic off the node id. Single-site place trays (the diner) are UNTOUCHED —
this is the settlement-node kind only. Engine data in theater-data (pure); mounting via the
existing board channels; if a new module is cleaner, register it properly.

### Verification
⊗ RED FIRST: a settlement-kind node tray yields ≥N building masses + a street + NPC mounts (fails
today — bare). Determinism; buildings never overlap the street lane or each other (footprint
asserts); PC + buildings both in the camera fit (compose with QF-B3's headroom fix). Re-run:
theater-shot, dungeon-interior, dm-events, the tabletop/tray harnesses, manifest. CARD: one town,
daylit + moonlit + overcast, same camera — the "does Genesis have a town now?" exhibit. READ +
describe honestly.

## After the wave
PLAY-LENS re-run (standing law) — expect ledger items #7/8/9 to move to FIXED and the travel/town
frames to enter the taste queue; deltas + new cards go in the return packet for Adam.
