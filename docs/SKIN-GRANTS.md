---
type: system-spec
status: specced 2026-07-02 morning (from Adam's skin-table review) — batch-3 unit; amends WALK-REFRESH §3
created: 2026-07-02
related:
  - "[[WALK-REFRESH]]"
  - "[[CONSEQUENCE-LADDER]]"
  - "[[ON-DEMAND-GEN]]"
  - "[[TABLE-GAPS-070126]]"
---

# Skin Grants & Motifs — the skin's promises become the walk's contents, and its theme pervades

**THE PRINCIPLE (Adam, 2026-07-02 — the recontextualization thesis, made mechanical):** the skin
is a MULTIPLIER, not a coat of paint. Base rolls ⊗ skin motif = the same finite tables producing
combinatorially unique walks — the identical rolled dungeon under "flooded" and under "bone-choked"
is two different experiences. Grounded skins stay atmospheric (plain dungeons roll plenty
interesting); the tail is where "the lava dungeon / the ice dungeon" lives.

## §0. The gap (Adam, 2026-07-02, reviewing Walk Skin — Dungeon)

Some skin rows IMPLY mechanical content — "a faction's payroll is held here, guarded" promises a
hoard; "a previous expedition's survivor is held here" promises an NPC. As built, the skin is a
LENS only: nothing makes the walk underneath honor the promise, so the DM would have to freehand
it into existence — the exact invention the skin system was built to capture. **Rule: a skin's
promise is a debt the assembler pays, through rolled machinery, never freehand.**

## §1. The contract

- **Skin tables gain a DM-only `Grants` column** (compiler carries it — the Legs/Pool precedent;
  narration text untouched; pure-lens rows leave it empty). Multiple grants comma-separated.
- **Closed vocabulary (v1, exactly these eight):**
  `hoard` (upgrade one segment's loot slot: budget bump + a valuables attach; placed on/adjacent
  to an Enemy segment so it's guarded by construction) · `captive` (a full `rollNPC` mint — soft,
  real atoms, `status`: held; placed mid/deep; the capture machinery's holding-segment concept
  reused; disposition/recruitment = the DM's verbs) · `faction-mark` (bind the skin's implied
  power to a REAL faction via salience pick + a clock tie) · `threat-bias:<tag>` (an archetype
  bias fed to `resolveArchetypePool` — flooded → amphibious) · `hazard-suffuse` (+1 hazard row on
  1d2 extra segments) · `density:+|-` (encounter density up/down one step — abandoned skins
  empty out) · `relic` (a `rollItem` plot-object seeded into a Discovery segment) · `clock` (the
  skin's implied pressure opens a real fireable front-clock on the walk). Unknown grant token →
  log + no-op (forward-compatible).
- **Ordering rule: the skin rolls FIRST.** `rollWalkSkin` moves to the head of walk assembly;
  `applySkinGrants(walk, skin)` runs after base assembly, mutating deterministically (seeded by
  walk id — same walk, same grants, same placements).
- **Provenance:** grants stamp `{skinRef, grant}` on what they place; `walkProvenanceReport`
  gains a promise-vs-found line (did the player ever find the payroll?). DM-held until
  discovered in play.

## §1b. Motifs — the theme pervades every layer (Adam, 2026-07-02)

- **Skin rows gain a second DM-only column, `Motif`**, keying to one of **14 motif KITS**
  (families — rows share kits; the row's text stays the unique flavor; the kit does the
  pervasion): `flood · ice · fire · overgrowth · fungal · bone · ash · vermin · void · mirror ·
  clockwork · consecrated · timelost · none`. Kits live in one data module
  (`data/skin-motifs.js`), each: `{ entrance:"…", tints:[6–10 short sensory fragments],
  threatBias:[tags], reskinVerb:"…", hazardTint:{...}, palette:[4 colors] }`.
- **Pervasion points (all deterministic, seeded by walk id + segment):**
  1. **Entrance beat** — segment 1's presentation LEADS with the kit's entrance line; the theme
     is announced at the threshold.
  2. **Per-segment tint** — every segment gets one kit tint fragment COMPOSED WITH (never
     replacing) its rolled sensory/lighting/footing — the base roll stays intact
     (recontextualization requires it); the water reads differently in every room.
  3. **Enemies** — `threatBias` feeds `resolveArchetypePool`; `reskinVerb` rides the encounter
     object for the DM ("the same skeletons, frozen mid-reach").
  4. **Hazard/footing tint** — ice slicks, lava ticks heat, floodwater swims (composes with the
     existing hazard/footing rows, never overrides a rolled hazard).
  5. **The diorama** — the kit's `palette` feeds Blockwright's tileset (the ice dungeon LOOKS
     ice on the battlemap).
- **Band placement (the re-author pass on all three skin tables — approved samples stay
  VERBATIM):** Grounded = atmospheric lenses, mostly `none` motif (as-authored is right) ·
  **Textured = natural transformations** (flooded, overgrown, collapsed, winter-frozen) ·
  **Strange+ = the exotic** (lava-vein, fungal bloom, bone-choked, void-dark, mirrored,
  clockwork-waking, drowned-in-time). The curve meters frequency: the ice dungeon is an event,
  not a Tuesday.
- Interiors + travel walks inherit motifs through the same seam (a travel walk through the
  flooded lowlands tints its legs; ON-DEMAND-GEN interiors accept a `motif` opt later — noted,
  not v1).

## §2. Build (batch-3 unit)

1. `applySkinGrants` + the eight executors (each ≤15 lines — they call existing machinery:
   `dwalkLootSlot`/valuables, `rollNPC`, `rollItem`, faction pick, archetype bias, clock open).
2. Skin-roll-first reordering in all three walk rollers + travel walks.
3. **`data/skin-motifs.js`** — the 14 kits (VOICE-CRITICAL: kit tints/entrances are Fable-or-
   Adam-anchored; Sonnet extends from 2–3 anchor fragments per kit written into the unit brief).
4. Motif threading (§1b pervasion points 1–4) + the Blockwright palette hookup (point 5 rides
   the blockwright unit if it lands after; else a follow-up wire).
5. **Table pass:** the three Walk Skin tables get `Grants` + `Motif` columns AND the
   transformative re-author (natural transformations into Textured, exotic into Strange+;
   approved samples verbatim; PROVISIONAL callouts stay). Recompile.
6. `dev/verify-skin-grants.mjs` (≥12/0): a `hoard` row yields an upgraded guarded loot slot
   (mutation check: break the Enemy-adjacency, harness fails) · `captive` mints a real-atom NPC
   in a mid/deep segment · pure-lens rows mutate NOTHING · unknown token no-ops · determinism
   (same walk id → same placements + same tints twice) · `threat-bias` shifts the archetype
   pool · **every segment of a motif'd walk carries exactly one tint fragment composed with (not
   replacing) its rolled sensory** (mutation check: let the tint REPLACE the roll, harness
   fails — recontextualization requires the base roll intact) · the entrance beat leads
   segment 1 · `none`-motif rows tint nothing · provenance stamps present · regression: walk
   suites unchanged.

## §3. Acceptance

Every promise a skin makes is findable in the walk it colored — the payroll exists, guarded; the
survivor exists, with wants and fears the player can push. The DM narrates discovery, never
invents existence.
