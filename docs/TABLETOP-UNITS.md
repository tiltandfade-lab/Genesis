---
type: build-spec
project: Genesis
status: SPEC-LOCKED 2026-07-07 (Fable final window) — the Sonnet-executable unit queue for
  TABLETOP-VISION.md's pre-alpha cut (V1+V2+shell) + its harness pack. BUILD IS SOAK-GATED
  (DIRECTION §4): this doc pre-stages the work so the post-soak session fires it without
  frontier re-derivation. Execute via genesis-orchestrate (worktrees, per-unit re-gates,
  --no-ff); never trust a subagent's self-reported green.
consumer: post-Fable orchestrator + Sonnet executors (Opus review on U1/U6/U7)
created: 2026-07-07
related:
  - "[[TABLETOP-VISION]]"   # the vision + the 11 binding §9 gates; §0 laws govern every unit
  - "[[IN-SESSION-UI]]"     # §10 reserved "the center is a swappable stage later" — this is that
  - "[[ON-DEMAND-GEN]]"     # ambient pool §6; effectDie §4
  - "[[DIRECTION]]"         # §4 build gate
---

# TABLETOP-UNITS — the locked build queue for V1+V2+shell (pre-alpha)

**The discovery that shapes everything:** the combat stage-mode swap (render.js:299 →
`mainHtml` branch render.js:342-350) ALREADY produces the TABLETOP end-state layout — theater
in the center column, feed compacted into the right column, sidebar left. The pre-alpha build
is therefore mostly *un-gating and generalizing what exists*, not new construction.

**Global constraints (bind every unit):**
- TABLETOP-VISION §0 laws + all 11 §9 gates. The renderer READS state, never writes (§9.9).
- New mutable UI state → `GS` only (`GS.stageCollapsed`, etc.). Persistent facts → events.
- No new files unless stated; where a new file appears, register it in `manifest.json` and run
  `python3 build/check-manifest.py` (fails on orphans). Classic scripts stay classic; theater
  ES-module family stays module-tagged (genesis.html:1392-1412, boot LAST).
- `tables.json`/`tables.js`/`data/*` generated — never hand-edit. No model call anywhere in
  the assembly path (SPEED; the V1–V5 inference cost is declared ZERO).
- TEXT-FIRST: the classic (feed-hero) layout remains fully reachable — it IS the collapsed/
  no-WebGL mode. Every unit keeps `verify-*` green + `check-manifest` OK before its merge.

**Order:** U1 → U2 (interlocked, Adam ruled they arrive together — land as one integration
tree of two branches) → U3 → U4 → U5 ∥ U6 → U7 rides per-unit + closes. Effort tiers marked.

---

## U1 · `trayFrom` + the Standing Table (effort: HIGH, Opus review)

**Intent.** Promote the theater from combat-only popup to the permanent center stage: an
empty table under realm light when nothing is staged; the here-segment's tray when walking;
combat continues to work exactly as today.

**Locked contract.** In `src/engine/theater-data.js` (owns `theaterBoardFrom`, classic logic
layer, loadOrder 81):
```
trayFrom(source, scene, opts) -> board   // same return shape as theaterBoardFrom:
  { tiles, props, env, light, floorMaterial, surfaceName, surfaceTint,
    realms, realmId, renderProfile, grid }          // theater-data.js:948-969, UNCHANGED
// source: {kind:"segment", segment}        — active walk here-segment (all three envs)
//         {kind:"interior", record}        — a minted interior codex record
//         {kind:"idle", env, realms}       — the empty table: mat-less surface + realm light
// scene: combat scene or null (null = no lanes/cover pass)
```
`theaterBoardFrom(segment, scene, opts)` becomes a one-line wrapper over
`trayFrom({kind:"segment",segment}, scene, opts)` — byte-identical output for combat callers
(gate below). The idle board = tiles/props empty, `light` from the realm's profile via
`realmRenderProfile` (theater-data.js:713-732), void + surface tint from `theaterPaletteFor`.

**Seams to edit.**
1. `src/world/render.js:299` — `stageMode` becomes
   `!!(GS.theaterMounted && !GS.stageCollapsed)` (combat no longer required; WebGL still is).
2. `render.js:340` (probe), `render.js:393-413` (`theaterStageSync`) — mount when in-session
   and not collapsed, not only when `GS.combat.active`. Keep the try/catch degrade
   (render.js:407): mount failure → classic layout, permanently fine (TEXT-FIRST).
3. `render.js:279-292` — on combat_end DO NOT `Theater.retire()`; push the relaxed tray
   (`trayFrom(hereSource, null, …)`) instead. `retire()` moves to: leaving the in-session
   view, or the user collapsing the stage.
4. Per-render push (render.js:427-432): outside combat, `setBoard(trayFrom(hereSource…))`
   + `setUnits([])` until U4; `hereSource` = active-walk here segment if walking, else idle.
   `setBoard`'s dirty-key skip (theater-boot.js:3384) makes this cheap per render.
5. Boot preload (§9.8): `loadWholeObjectBuilders()` already fires at module scope
   (genesis.html:1404-1405) — ADD an exported readiness flag the harness can assert.

**Acceptance.** (a) Combat parity: for a fixture segment+scene, `theaterBoardFrom` output
deep-equals pre-change output (byte gate — run before ANY other edit, commit the fixture).
(b) Walking outside combat shows the segment tray (props from feature/dressing, light
profile); idle (no walk) shows the empty table under realm light. (c) Kill WebGL (mock
`supportsWebGL` false) → classic layout, zero throws, full playthrough (jsdom). (d) Gates
§9.1 (snapshot purity — same inputs, same board hash), §9.4 (atmo mutation: atmo text stuffed
with prop keywords spawns zero props — extend the existing exclusion test), §9.9 (no GS/U
writes from theater-data/theater-boot during a 50-render loop). **Mutation checks:** break a
registry module import → cuboid fallback renders, no throw (existing per-entry try/catch,
theater-figures.js:728-754); delete `segment.light` → profile falls back seeded, never
undefined.

## U2 · The 3-column shell + ARIA contract (effort: MED)

**Intent.** Make the stage-mode arrangement the standing layout with correct landmarks:
LEFT `.status-side` (exists, untouched), CENTER the stage, RIGHT the feed + composer.
Collapsible center. All-keyboard reachable. This is IN-SESSION-UI §10's reserved seam.

**Seams to edit.** `render.js:342-355` (`mainHtml`): the stage-col/feed-col branch becomes
the default when `stageMode`; classic feed-hero remains the `!stageMode` branch (collapsed +
no-WebGL + mobile). Rail (`gameRail`, render.js:584-586) gains a stage toggle button
(`GS.stageCollapsed`, GS-only). CSS: reuse the `battle-stage` block (genesis.html:541-705) as
the standing classes; keep the 760px stack (genesis.html:1128-1131) forcing collapsed.

**ARIA (locked — fills the audited gaps):**
- `.dm-feed` → `role="log"` + `aria-live="polite"`; composer `<textarea id="dmAction">` gains
  `aria-label="Your action"`. The right column is `<section aria-label="The DM">`.
- `.status-side` → `aria-label="Character and party"`. Landmark order in DOM: RIGHT column
  content first is NOT required — order is set by tab/reading sequence; ensure the feed
  section precedes the stage in the accessibility tree (aria-hidden stage is skipped anyway).
- The stage wrap (`.chat-col.stage-col`, `#theaterStage`, `.stage-overlay`) → `aria-hidden=
  "true"` EXCEPT `.cmb-prose.stage-prose` (render.js:529, `role="status" aria-live="polite"`
  — the battle prose twin) which MUST move OUTSIDE the hidden wrap (render it as the feed
  column's live sibling). Gate §9.11.
- Dice overlay: already `document.body`-mounted (dice.js:75) — outside any hidden subtree ✓;
  keep it so; it re-aligns over `.chat-col` (dice.js:71-72) which is now the stage — retarget
  its alignment rect to the FEED column (authoritative numbers live in the feed).

**Acceptance.** (a) jsdom: with stage collapsed (`display:none` equivalent), a scripted
10-turn session completes identically (§9.7) and the accessibility tree contains log +
labeled asides + zero stage nodes. (b) §9.11: fire a roll with the stage hidden — the roll
trace appears in the `role="log"` feed (live region outside the hidden subtree). (c) 760px
viewport → stacked classic, stage auto-collapsed. **Mutation check:** wrap `.stage-prose`
inside the hidden subtree → the §9.11 harness FAILS (proves the check bites).

## U3 · Blank-piece fallback + ambient presence (co-location) (effort: MED)

**Intent.** The fallback chain bottoms at the blank piece; soft ambient NPCs stage as blank
meeples when the player enters their scene, and THE DIGEST RISES TO MATCH (Adam's co-location
rule) — one aggregate presence line, names withheld until contact.

**Locked contracts.**
1. `theater-figures.js`: registry gains `"blank:figure"` (unpainted meeple: disc + featureless
   body, one neutral channel) and `"blank:prop"` (plain block). `resolveWholeObject` chain
   (theater-figures.js:710-716) extends: exact → `NEAREST_SUB` → archetype generic →
   `blank:*` — it now NEVER returns null for a figure/prop request (cuboid fallback stays as
   the load-failure path only).
2. Digest — in `src/world/dm.js`, `activeWalkDigest` gains a sibling of `cast` (dm.js:133),
   and node scenes get the same via `dmDigest` next to `activeWalk:` (dm.js:437):
   `ambientPresence: { count:int, texture:string|null } | null`
   computed from records where `r.dm.ambient && r.status.soft && r.status.at===hereNodeId`
   (the exact `untouchedAmbient` set codex.js:415 excludes from the full here-set — this line
   SUMMARIZES what that exclusion hides; the exclusion itself is UNTOUCHED). `texture` = the
   place-tier stock phrase, no names. Null when count 0.
3. Staging rule (U4 consumes it): blank meeples stage IFF `ambientPresence.count > 0` for the
   current tray's node — the digest signal and the stage read the same derivation (one
   function, exported from codex.js, called by both — normalization at one boundary).

**Acceptance.** §9.6 both directions (jsdom): (a) 3 soft ambients at the node → digest carries
`{count:3}` AND (post-U4) 3 blank meeples; (b) `codex_contact` on one → count drops to 2, the
contacted record rides the full here-set (codex.js:417 rule 1 — existing behavior), painted
piece key resolves; (c) zero ambients → `ambientPresence:null`, zero meeples. §9.3: every
staged piece ref is digest-visible this turn. **Mutation checks:** delete the blank-meeple
registry entry → resolve falls to cuboid, no throw; make the digest line count MORE records
than the stage function (drift between the two consumers) → the shared-derivation harness
fails (they must call the same function — assert by spying call identity, not just values).

## U4 · Cast tableau + arrangement grammar (effort: MED)

**Intent.** Figures outside combat: PC (+companions) + contacted here-NPCs (painted) + soft
ambients (blank, per U3) placed by arrangement archetype on the standing tray.

**Locked contracts.** In `theater-data.js`:
```
castFrom(w, source) -> units[]        // same unit shape theaterUnitsFrom emits
                                      // (theater-data.js:1485,1519-1523): {id,kind,archetype,
                                      // x,z,silhouette,className,pcRecipe,…}
arrangeTableau(units, arrangement) -> units[]   // stamps x,z; PURE
// arrangement ∈ "facing-pair" | "ring" | "march" | "shopfront" | "vignette"
```
Sources: PC via existing pc ref; companions via `prepEligibleCompanionCreatures` (prep.js:
107-114); contacted here-NPCs via `codexHereNowIds` rule 1; soft ambients via U3's shared
derivation → `blank:figure`. Arrangement selection is MECHANICAL (no DM call): shop open →
`shopfront`; >1 contacted NPC in conversation-scope → `ring`; exactly 1 → `facing-pair`;
walking → `march`; else `vignette`. Attitude (codex attitude field) maps to distance+facing
inside `facing-pair`/`ring`: hostile = far + square-on, friendly = near + angled — one
numeric table in theater-data, no per-NPC logic. Combat untouched (`theaterUnitsFrom` stays
the combat path; `combat_start` switches unit source, U6 owns the transition).

**Acceptance.** jsdom: contact an ambient at a market node with a shop open → painted piece
in `shopfront` slot 1, remaining blanks in back slots, PC front-center; attitude shift event
→ re-render moves the piece band (distance) without any other unit moving (dirty-key check).
§9.1 purity: same w-snapshot → identical unit list. **Mutation check:** remove
`arrangeTableau`'s attitude table entry for "hostile" → harness fails on default-distance
(proves attitude actually feeds placement, not decoration).

## U5 · Overlay lanes — ambient (rolled) + trace (earned) (effort: MED)

**Intent.** Flat overlay pieces: ambient from fields that already roll
(`dressing.condition`, wilderness `footing`, `signOfPassage`), traces earned from events
(corpses beyond combat teardown; removals).

**Locked contracts.**
1. Ambient: `overlaysFrom(source) -> [{part:"overlay-*", params}]` in theater-data —
   keyword-rule table over `dressing.condition` / `footing` / `signOfPassage.name` ONLY
   (never `atmo`, never free DM prose). New `prop:overlay-*` registry entries: flat discs/
   decals ≤4 shapes v1 (crack-web, standing-water, moss-patch, drag-marks). Unmatched
   condition text → NO overlay (blankness legal — no generic fallback for overlays).
2. Trace: on `combat_end`, corpse records already computed for the combat (existing
   corpse-persistence doctrine) are written to the segment's reskin overlay via the EXISTING
   `walk_update` overlay write path (prep.js:493-509):
   `overlay.traces = [{kind:"corpse", ref:statId, zone}]` (+ `removed:[pieceRef]` for
   obliteration). `trayFrom` reads `overlay.traces` and stages toppled figures (existing
   corpse pose) — corpse is the DEFAULT disposition (Adam ruling; absence only if in
   `removed`). No new event types; no new store.

**Acceptance.** Fight in a room, win, walk away, walk BACK: the tray re-derives with the
corpses toppled where they fell (§3 reconciliation — and the encounter does NOT re-stage
alive, gate check). Obliterate one foe → it's in `removed`, not staged. Ambient: a dungeon
room whose dressing.condition matches "cracked" stages the crack-web overlay; its atmo
mentioning "pooled water" stages NOTHING (§9.4 sibling check). **Mutation check:** point
`overlaysFrom` at `dressing.text` instead of `.condition` → the atmo-adjacent
false-positive fixture fails.

## U6 · Combat reconfigure/relax + tray persistence proof (effort: HIGH, Opus review)

**Intent.** One table, many arrangements: `combat_start` reconfigures the STANDING tray into
lanes (no remount, no retire); `combat_end` relaxes back to the tableau + traces (U5). Plus
the §3 dedup law.

**Seams.** `render.js:277-292` (already loosened in U1): combat start = switch unit source
`castFrom`→`theaterUnitsFrom` + pass `cm.scene` into `trayFrom` (lanes/cover pass on);
combat end = reverse + U5 trace write. `setBoard`/`setUnits` dirty-keys make both cheap.
**Dedup law (§9.10):** the cover keyword scan (theater-data.js:830-876) pools the SAME
feature/dressing text that staged the standing props — `trayFrom` must emit each noun ONCE:
when `scene` is present, a prop whose source text also matched a cover zone gets the cover
tag on the EXISTING prop recipe instead of a second recipe (implement in the board-build
merge at theater-data.js:~830-902, where both passes already run in one function).

**Acceptance.** Live-fixture flow (jsdom): walk → tableau → `combat_start` → lanes with the
same prop count for feature-derived nouns (§9.10 mutation fixture: a feature text matching
both rule sets → piece count 1) → `combat_end` → tableau restored + corpse traces staged +
the theater instance NEVER remounted (assert `Theater.mount` called once across the whole
flow — spy). Revisit persistence (§9.1): serialize w, reload (jsdom fresh boot), re-derive →
identical tray hash including traces.

## U7 · The harness pack (effort: HIGH, Opus review — closes the queue)

**Intent.** `dev/verify-tabletop.mjs` (jsdom, real genesis.html, document-order modules —
the established harness pattern): one runner asserting ALL 11 TABLETOP-VISION §9 gates,
each as a named check with its mutation-test twin where the spec names one (§9.4 atmo,
§9.6 shared-derivation, §9.10 dedup, §9.11 live-region placement, U2/U4/U5 mutation checks
above). Register in the CI harness list alongside the existing 100+; must run green on the
integration tree of U1–U6 (never per-branch only). Also: extend `check-manifest.py`'s
green run + `verify-in-session-ui.mjs` (the U2 shell edits must not break its assertions —
if they legitimately must change, update THAT spec's assertions in the same change, per the
validators-preserve-the-job law).

**Acceptance.** The pack fails on each seeded mutation (run the mutation matrix once,
documented in the harness header) and passes on the clean tree. §9.8 perf: warm
`trayFrom`+`setBoard` loop ≤250ms/frame budget asserted with builders preloaded (assert the
U1 readiness flag first).

---

**Not in this queue (post-pre-alpha, by design):** V3 asset packs (mats/props per archetype —
Blender lane + Adam taste), V4 hand verbs beyond what theater-verbs already ships, V5
parchment map, V6 seat integration, node-tray dressing beyond cast (needs the place-record
mapping — spec it when soak shows nodes matter), the ES-module migration (rides V1's landing
per SCALING.md — the orchestrator should schedule it WITH U1/U2's integration tree or
immediately after, before U3+).
