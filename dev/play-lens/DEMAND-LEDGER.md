# THE DEMAND LEDGER — PL-4 matrix (2026-07-15)

VQ2-RESPEC.md §3 unit **L3**. Four `play-lens.mjs` runs (fantasy/standard, gloom/dungeon-heavy,
chrome/town-beats, fantasy/travel-heavy) with L2's census instrument live, aggregated below. This
answers Adam's question: what does the DM need, what can we prove renders today, and how do we
start filling the requests that come back null.

## 1. Run table

| run-id | realm (forced → actual) | route | shots | legs ok | census entries | facade:null | dressing:placeholder | dressing:resolved | figure:whole-object | figure:sprite-legacy | figure:sprite-faceted |
|---|---|---|---|---|---|---|---|---|---|---|---|
| pl4-fantasy | fantasy → fantasy (world "Mire-End") | standard | 23 | 16/16 | 125 | 4 | 40 | 34 | 35 | 9 | 3 |
| pl4-gloom | gloom → gloom (world "The Drowned Port") | dungeon-heavy | 30 | 16/16 | 144 | 4 | 47 | 41 | 40 | 8 | 4 |
| pl4-chrome | chrome → chrome (world "The Ash-Plaza") | town-beats | 21 | 17/17 | 123 | 4 | 39 | 33 | 35 | 7 | 5 |
| pl4-travel | fantasy → fantasy (world "The Salt-Flat Garrison") | travel-heavy | 22 | 16/16 | 119 | 4 | 35 | 28 | 40 | 8 | 4 |
| **TOTAL** | — | — | **96** | **65/65** | **511** | **16** | **161** | **136** | **150** | **32** | **16** |

All four runs completed unattended, zero harness-aborts, `--force-realm` legal on every run
(`forceRealm.ok:true` in every `findings.json`), `capped:false` in every `manifest.json` (well
under `PLAY_LENS_MAX_SHOTS=120`). `dungeonSegCount`/`travelMin` route presets behaved as coded
(`dev/play-lens.mjs:132-136`): dungeon-heavy → 12 rooms (S1-S12), travel-heavy → 4 legs (vs
standard's 2, town-beats' 1), town-beats → the extra shop-cycle-2 leg (hence 17/17 not 16/16).
consoleErrorCount 8-9 per run, entirely `benign404Count` (the rig's own known-benign 404 probes,
zero `unexpected404` in any run).

## 2. THE NULL LEDGER (ranked)

Aggregated from all four `census.json` files. `dressing` gaps computed as **true gaps** —
`dressingTextureFor` (`src/ui/theater-boot.js:8487`) always fires `placeholder-card` synchronously
on a slug's first request, then `resolved` if-and-only-if `assets/dressing/<slug>.png` loads; a
slug whose `placeholder-card` count exceeds its `resolved` count across a run never got real art
that run. 161 total placeholder-card fires vs 136 resolved = 25 true-gap occurrences across 21
distinct slugs (matches the per-name diff sum exactly — pasted below).

| rank | seam×outcome | exact requested name(s) | realm/setting demand | freq | visibility | THE FILL |
|---|---|---|---|---|---|---|
| 1 | `facade:null-facade` | `frontier` (the settlement-mint realm key) | every settlement tray, all 4 realms forced (fantasy/gloom/chrome all degrade the mint to `frontier` per `rollPlace`'s own fallback) | **16/16 = 100%** of facade requests this matrix ever made | HIGH — building walls are the dominant visual mass of every town-tray/recordless-settlement frame (pl-002, pl-020, pl-021, pl-023 all show it) | **F5 covers this** (VQ2-RESPEC.md §4, line 189-196: "Consumes L3's null-facade counts + Adam's facade/NPC-card packets when they land"). Root cause: `REALM_TEXTURES` (`src/ui/theater-interior.js:285`) only defines `wall` for `{fantasy,gloom,chrome}`; the settlement-mint skin id is `frontier`, which has no entry — so `facadeTextureFile` (`src/engine/theater-data.js:1399`) is **always** null regardless of which realm was forced. Table/registry gap, not (only) an art gap: either author a `frontier` wall texture or re-key settlement mint to reuse the forced realm's `REALM_TEXTURES` entry. |
| 2 | `dressing:placeholder-card` (never resolved) | 21 distinct NPC role-portrait slugs: `spr-frontier-cattle-baron`(×2), `spr-fantasy-goliath-bridge-toll-keeper-…`(×2), `spr-fantasy-gnomish-clockmaker-…`(×2), `spr-fantasy-elven-fletcher-…`(×2), `spr-gloom-stout-diner-cook-…`, `spr-gloom-heavyset-town-mechanic-…`, `spr-gloom-grave-cool-hand-…`, `spr-frontier-reluctant-officeholder`, `spr-frontier-physician`, `spr-frontier-pale-sleepless-night-shift-railroad-watchman-…`, `spr-frontier-landed-gentry`, `spr-frontier-innkeeper`, `spr-frontier-homesteader`, `spr-frontier-herbalist`, `spr-frontier-elderly-retired-marshal-…`, `spr-frontier-elderly-blind-fortune-teller-…`, `spr-frontier-dark-skinned-heavily-scarred-trail-guide-…`, `spr-frontier-caravan-guard`, `spr-chrome-static-vultures-…`, `spr-chrome-mutant-stray-dog-pack-leader-…`, `spr-chrome-chrome-locusts-…` | settlement/edge-role NPC dressing cards, all 3 forced realms | 25 unresolved occurrences (every single occurrence of every one of these 21 slugs, this matrix) | MEDIUM-HIGH — these are named social-hook NPCs (the "realm edge-roles" corpus per project memory), meant to read as characters, not scenery | **NEW: needs an art packet.** Not yet a numbered Wave F unit — CHANGELOG.md (2026-07-14) and HANDOFF.md already name it as deferred ("Adam's red-pen packet: facade art … + NPC card art (ImageGen/kit lane)"); F5's line explicitly anticipates "Adam's facade/NPC-card packets when they land" so it has a landing slot, just not art yet. Every OTHER dressing slug requested this matrix (93 distinct non-`spr-` flora/clutter/painting names) resolved cleanly — the corpus gap is specifically the NPC-portrait card class, not dressing generally. |
| 3 | shop panel doesn't render at all | `GS.gamePanel='shop'` | fantasy/gloom/chrome/travel — every `open_shop` leg, all 4 runs | 4/4 runs, every shop-open shot (pl-021 fantasy, pl-028 gloom, pl-017+pl-019 chrome ×2 town-beats cycles, pl-020 travel) | HIGH — the shop UI never visually differs from the standing settlement tray at all | **table/wiring gap, not art.** Rig's own `shopRenderVerdict`: `rendered:false, reason:"no-.shop-header-in-dom"` — `render.js`'s `showStage` branch swaps `.panel-col` for the DM feed unconditionally, so the theater stage being mounted means `GS.gamePanel='shop'` has zero visual effect. Confirmed visually: pl-021 (labeled shop-open) is pixel-identical in composition to pl-020 (recordless-settlement) modulo the day-part label. Not previously on the PL-2 ledger — a genuine new finding from this rig's shop-verify leg (PL-1b). Candidate fix rides with **F2** (staging-beat registry, `shop_open`/`shop_closed` beats) since F2 already owns shop staging. |
| 4 | staging beats render as the idle pedestal | shop_open/shop_closed/long_rest/dungeon_complete/recordless-settlement | all 4 runs | every non-combat post-dungeon beat (pl-020..023 fantasy, similarly other runs) | MEDIUM-HIGH — every day-part transition (dusk rest, shop visits) is visually identical, the day-part label is the only tell | **F5 covers this** (staging-beat registry, VQ2-RESPEC.md §4 line 160-168, ledger #11 Sol P-D) — unbuilt as of this run; STANDING from PL-2/PL-3, confirmed unchanged here. Visual evidence: pl-021 (shop-open, "DAY 1 · MORNING") and pl-023 (rest, "DAY 1 · DUSK") are the same blocky settlement cluster, only the sidebar day-part text differs. |
| 5 | combat stages in a black void | (not a census seam — pre-existing PL-2 ledger item #10) | all 4 runs, every combat_round shot | 12/12 combat-round frames (3 rounds × 4 runs) | HIGH — every fight this matrix captured | **F1 covers this** (combat-in-room, VQ2-RESPEC.md §4 line 149-159, ledger #10 Sol P-F) — unbuilt as of this run. See §4 combat re-grade below; STILL-BROKEN, unchanged from PL-2. |
| 6 | Giant Rat standee never independently visible in any combat frame | `spr-fantasy-giant-rat` (resolves `sprite-faceted` every time — the texture IS correct) | fantasy ×3 combat rounds (pl4-fantasy), and the equivalent gloom/chrome/travel rounds all show only 3 of 4 combatant tokens (Wolf, PC, Skeleton) | 12/12 combat-round frames across all 4 runs never show a 4th, rat-shaped token | MEDIUM — a real foe is invisible, not miscast (see §4) | **table/wiring gap, not art** — likely full occlusion: all 4 combatants collapse into the same `MELEE` lane/world position (per the initiative bar's single "MELEE" zone label), so the rat token is probably stacked exactly behind/under the PC+Skeleton cluster. F1's "map bands/lanes onto the active room's real cells (dressing-blocked cells excluded)" should resolve this as a side effect; flag explicitly if it doesn't. |
| — | `figure:cuboid` / `material:mottle-fallback` | (none fired) | — | 0/511 | — | **Not a gap this matrix** — every figure this route matrix requested (PC barbarian, wolf, giant rat, skeleton) resolved via whole-object/sprite-legacy/sprite-faceted; every material resolved a known family. Caveat: this route matrix only exercises 4 bestiary entries and the standard settlement/dungeon materials — it does not prove the cuboid/mottle seams are dead, only that they didn't fire for *this* cast. A wider-bestiary run would be needed to census those seams honestly. |

## 3. RESOLVED-AND-PROVEN

What demonstrably renders from real corpora right now, aggregated across the 511 census entries:

- **`figure:sprite-legacy` — 32 occurrences**: `spr-fantasy-wolf` (19), `spr-fantasy-skeleton` (13).
  Both foes render every combat round via the pre-flip legacy sprite path — S5's flip has **not**
  yet admitted wolf/skeleton to the faceted corpus (only giant-rat is admitted in this cast); both
  read cleanly on the board (verified pl-014/015/016 fantasy, pl-021/022/023 gloom, pl-010/011/012
  chrome — wolf and skeleton visible and legible in every one).
- **`figure:sprite-faceted` — 16 occurrences**: `spr-fantasy-giant-rat` only. The S5 flip is live
  and resolving for this slug in every run (`runtimeAdmitted:"candidate"` path taken every time),
  though the standee itself is never independently visible on-screen (null-ledger row #6).
- **`figure:whole-object` — 150 occurrences**: `class:barbarian` (89 — the PC, every board redraw),
  `blank:figure` (32 — the unpainted-meeple floor for units with no exact/alias whole-object entry;
  real geometry, not a placeholder card, but generic), `skeleton`/`giant-rat`/`wolf` recipe-tier
  hits (11/8/5 — transient pre-sprite-settle renders), `f1`/`f2` (5 — combat-unit-id fallback
  frames). The PC's barbarian model renders consistently and correctly in every combat frame
  across all 4 runs — confirmed visually (pl-014/015/016, pl-021/022/023, pl-010/011/012).
- **`dressing:resolved` — 136 occurrences, 93 distinct slugs**: every flora/clutter/painting
  dressing card requested this matrix that ISN'T an NPC role-portrait resolved to real art —
  `fantasy-flora-*` (birchgrove/hedgerow/fern/fern-alt/oak/oak-alt/lilypad/cattailreed/…),
  `fantasy-clutter-*` (emptybarrel/woodpile/lanternhook/candlestub/rusted-plow/…), `ash-flora-
  dunegrass`, `fantasy-painting-2/4`. Zero unresolved non-NPC dressing this matrix.
- **Interior material language**: brick walls, torch/candle practicals, warm amber pooled light,
  stone floor — confirmed via direct read of pl4-gloom's dungeon-room-1 (pl-009) and pl4-fantasy's
  combat-end (pl-018): both show a coherent, atmospheric interior with real geometry (walls, an
  altar/table mass, a lit candle prop, a fern), matching the ledger's own "WORKING" protection set
  ("dungeon material language (brick/torch/tile) · crates/altar/shelf props").
- **Travel legs are no longer an empty plane** (PL-2/PL-3's #7): pl4-travel's leg-2 frame (pl-004)
  shows scattered biome flora (small grass/scrub tufts) over a tinted ground plane under a dark
  navy sky — a real improvement over the PL-1 baseline's flat empty tile, though the sky reads as a
  flat solid color rather than a graded/lit sky and the PC standee is barely legible at this scale
  (headless under-render caveat, see below).

## 4. Combat re-grade

With the bot now fighting for real (L1's attack/move events, not a scripted no-op) and S4 (join
fix) + S5 (flip) both live, I read `pl-014/015/016` (fantasy, 3 rounds) directly plus
`pl-021/022/023` (gloom) and `pl-010/011/012` (chrome) to cross-check across realms — 9 combat-round
frames total, all zoomed/cropped for close inspection.

- **P0 #1 — "Giant Rat renders as a robed humanoid with a floating hat" → NOT-REPRO (re-classified,
  not clean).** No robed-humanoid-with-hat artifact appears in any of the 9 combat-round frames
  read. The census confirms `spr-fantasy-giant-rat` resolves via the correct `sprite-faceted`
  texture every time it's requested (S5 flip live for this slug). **However**, the giant rat is
  never independently visible as a standee in ANY of the 12 combat-round frames across all 4 runs
  — only 3 of the 4 combatant tokens (Wolf, PC, Skeleton) are ever distinguishable on the board,
  confirmed at 3× zoom on pl-014 (fantasy R1) and pl-021 (gloom R1). The original miscast defect is
  fixed; a related but distinct visibility gap (likely combatant-position stacking — all 4 units
  share one "MELEE" lane) persists. Logged as null-ledger row #6, not re-opened as the old P0 #1.
- **P0 #2 — "PC token absent from the combat board in rounds 2-3" → FIXED, confirmed in real play.**
  The PC's barbarian standee is present, in the same position, in every one of the 9 frames read:
  fantasy R1/R2/R3 (pl-014/015/016), gloom R1/R2/R3 (pl-021/022/023), chrome R1/R2/R3
  (pl-010/011/012). No vanishing observed in any round, any realm. This closes P0 #2 with direct
  multi-realm, multi-round capture evidence — stronger than PL-3's single-run read.
- **Combat-void staging (ledger #10) → STILL-BROKEN, unchanged.** All 12 combat-round frames show
  the same isolated brown/green grid floating on solid black — no room walls, no ambient geometry,
  total spatial discontinuity from the preceding dungeon-room exploration frames (compare pl-013
  "room S7" to pl-014 "combat round 1" in the fantasy run — full room geometry vanishes the instant
  combat starts). This is squarely F1's scope (unbuilt) — expected, not a regression.
- **Faceted standees in combat — partial.** Only `spr-fantasy-giant-rat` is on the faceted path
  this cast; wolf and skeleton are still legacy-sprite. Both legacy sprites read well (clean
  silhouette, readable pose, decent color) at the combat-board's small standee scale.
- **Headless under-render caveat applies**, per PL-3's own standing note ("Headless captures
  under-render figure meshes — the shadow is the witness") — this rig runs Chrome headless, so any
  finding here about a mesh being faint/small (e.g. the travel-leg PC marker in §3) should be
  read with that caveat; a headed capture might show these standees larger/brighter.

## 5. Setting coverage notes

- **Town/settlement**: `pl-002` (fantasy, bound node tray "The Gravity-Well") shows a small
  intimate diorama — a seated PC figure at a table, two tall gray obelisk/tent-like masses, a
  barrel, a lit lantern-post — readable as a vignette but not a town street. The **record-less**
  settlement variant (`pl-020`/`pl-021`/`pl-023`, all 4 runs) is worse: flat, untextured gray/brown
  cuboid masses with a floating text-label tooltip, the direct visual signature of the null-facade
  finding (row #1) — buildings with zero door/window/roof art. Neither variant resembles the VQ2
  target frames' town-street composition (facades + route + citizens); F5 is scoped exactly to
  close this gap.
- **Travel**: `pl-004` (pl4-travel, leg 2) shows real progress since PL-1/PL-2 — scattered flora
  over a tinted ground plane, not an empty plane — but the sky is a flat solid navy with no
  gradient/sun/moon, and the PC standee is barely legible at this camera distance (headless
  caveat). Better than the PL-2 baseline, short of the ENV/EXTERIOR target.
- **Dungeon**: `pl-009` (pl4-gloom, room 1) is a genuine strong point — brick walls, warm torch
  pools, a candlestick and wall-lantern prop, atmospheric shadow falloff. This matches the ledger's
  own WORKING protection set and reads close to the VQ2 target frames' interior mood. No regression
  observed across any of the 4 runs' dungeon-room captures. Combat interrupts this good work
  (see §4) the instant a fight starts.
- **Combat**: readable individual standees (PC, wolf, skeleton all legible, well-posed) but staged
  on a floating grid with zero environment — the single largest continuity break in the whole
  matrix, citing `pl-014` (fantasy) vs the immediately preceding `pl-013` (same run, full room).
- **Shop/rest**: both non-functional as distinct staging this matrix — shop never visually differs
  from the standing tray at all (row #3, a wiring gap, not just missing art) and rest only changes
  the sidebar day-part text (row #4). Citing `pl-021`/`pl-023` (fantasy) as pixel-near-identical
  frames aside from the "MORNING"/"DUSK" label.

## Verification

- `python3 build/check-manifest.py` → **RESULT: OK** (no modules touched by this unit; run anyway
  per the task's verification instruction).
- Aggregation reconciles exactly: `161 placeholder + 136 resolved + 150 whole-object + 32
  sprite-legacy + 16 sprite-faceted + 16 null-facade = 511`, matching the sum of all 4 runs'
  `totals.entriesCaptured` (125+144+123+119=511) pasted in §1.
- The true-gap arithmetic in §2 row 2 reconciles: `161 - 136 = 25`, matching the sum of the 21
  slugs' individual (placeholder − resolved) deltas (2+2+2+2 + 17×1 = 25).
- Every NULL-LEDGER row cites either a census count (rows 1/2/6) or a direct capture read (rows
  3/4/5, plus corroborating captures for 1/2/6) — see inline citations above.
