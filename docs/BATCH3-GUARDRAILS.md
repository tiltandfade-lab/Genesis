---
type: build-guardrails
status: BINDING addendum to the 14 batch-3 units (2026-07-02, the rubric pass). BATCH-GUARDRAILS G0/G9 apply verbatim (don't-touch + stop-and-flag); BATCH2-GUARDRAILS H2's authoring law applies to all table work (approved samples verbatim; PROVISIONAL callouts; band shares 66/20/9/4/1 ±1 on d100s).
created: 2026-07-02
---

# Batch-3 Guardrails

## J0. THE SPICE RULER IS LAW (added 2026-07-02 evening — Adam's corpus verdict)

Every authoring unit reads `docs/SPICE-RULER.md` FIRST. A row enters a band only if it clears
that band's entry bar; when in doubt, file DOWN. Faction/civic activity is Grounded until it
costs someone visibly; atmosphere caps at Textured; Strange needs a CHECKABLE impossibility;
Volatile needs MOTION; Mythic needs PERMANENCE. **New unit — `spice-reband`:** the eleven
wave-1/2a d100 tables get existing rows RELABELED to their honest band (text verbatim,
labels only — diff-audited) + ~15–20 NEW hot-tail rows per table authored to the ruler
(PROVISIONAL; the reviewer grades every new row against the ruler's calibration rows and
files a BLOCKER for any inflated band).

## J1. Gates (literal counts; full sweep 0-failed + prior counts preserved, always)

gap-wiring ≥10/0 (`verify-gap-wiring.mjs`) · skin-grants-motifs ≥12/0 · breach-core ≥10/0 ·
breach-tables: compile clean, 6×d20 full coverage, samples verbatim · outlandish-realms: tag
pass diff = ONE column only + realm vocabulary doc for Adam · realm-kits: ~25×7 items compile +
frame-map audit table in the commit message · safety-guard: the denylist gate FAILS a seeded
test fixture (shown red) · touched-npcs ≥5/0 · urban-fabric ≥10/0 · job-walks ≥8/0 ·
wiring-sweep-A ≥12/0 (`verify-wiring-a.mjs` — every wired table FIRES from its seam + the
seed-locus distribution ≈ env-uniform ±10%) · wiring-sweep-B ≥10/0 + registry regen committed ·
dm-eval: 10 fixtures + scoring runs, baseline recorded (thresholds provisional) ·
forever-guards ≥10/0 (`verify-storage.mjs` + `verify-migrations.mjs` vintage #1). Every
spec-named mutation check shown RED then restored, noted in gateSummary.

## J2. Closures (the latent decisions the fast specs left)

- **gap-wiring:** the chase gap-clock lives in `GS.chase` (transient, like GS.combat);
  `chase_start` payload `{targetFid|npcId, terrain}`; downtime intents are EXACTLY
  `work · carouse · research · train · lie-low · seek-work` (seek-work routes to JOB-WALKS).
  Distant-Word fact pick = salience-weighted over `clock|outcome|drift` ledger entries from
  non-current nodes, most recent 30 days weighted double.
- **skin-grants-motifs:** kit tints COMPOSE by APPENDING a sentence fragment after the rolled
  sensory line (an em-dash join), never interleaving. `hoard` upgrade = +1 rarity step on the
  chosen slot, capped at the tier ceiling. `captive` places at depth ≥ ⌈segCount/2⌉.
- **breach-core:** the 2d10 shift rule implemented EXACTLY: `r>11 → r+frayMod`,
  `r<11 → r−frayMod`, `r==11 → unchanged`, clamp [2,20]. Persistence d6 rolls AT exit, once,
  stored on the walk record. Marooned debt counter lives on `w.realm.debt` and only the
  original roll sets it (mutation check J1). `physics` executors are pure functions in
  `src/engine/breach.js`, applied at `combatStart`/check-time reads — never patched globals.
- **breach-tables:** The Interior = row 20 (the Mythic ambush slot) in EACH table; its target
  NPC picked at ROLL time (salience over known NPCs), stored by id on the walk.
- **outlandish-realms:** the FOUNDING SLATE is DECLARED (Adam, 2026-07-03) and the scan MERGES
  into it (scan-derived categories map onto these; genuinely unmappable = flag, don't invent):
  **frontier · chrome · noir · ash · suburb · cosmic · theater · high-seas · lost-world ·
  gloom · bright-kingdom** + `realm-neutral` (stays in the d300). Freeze exactly these ids in
  `data/realms.js`. The THEATER carries an **era-lens** sub-table (trench/hedgerow/legion/
  musket/longship/jungle/siege — wars RHYME, never named: shapes without flags, and real
  atrocity is never loot). PHYSICS VOCAB gains **`dreamRules`** (sleep is the door; rest
  attempts inside the realm route through the hunt — composes with rest-risk + huntRules).
- **realm-tables scale: FOUNDING STANDARD IS d50 per realm** (11 × 50 ≈ 550 rows; tables grow
  to d100 in later craft passes). Bright Kingdom's native item class = power-up CONSUMABLES
  (eat-this-become-that; charge/consumable machinery).
- **breach-tables — SCENARIO ROWS (Adam's drift):** scenarios live in breach rows, not realm
  count. The six d20s must include, among their rows: a Fenced Valley (lost-world; techWorks +
  huntRules — the failed park), a Sleep-Stalker's Block (suburb; dreamRules + huntRules — the
  rest IS the dungeon), an Undercity brotherhood (noir/chrome; masked mutant clans below, a
  syndicate above), a Bright Kingdom threshold (lowGrav; warp-door topology flavor) — plus the
  12 approved samples verbatim as always.
- **realm-kits → REALM TABLES (Adam's restructure, 2026-07-03):** per-realm **d100 TABLES** in a
  new `Engine/03. _Tables/05. Realms/` folder (`Realm Items - <Realm>.md`, one per realm in the
  frozen data/realms.js vocabulary), columns `Band | Item | Frame | Ranks | Note`. Every item
  names its FRAME (an existing id from `data/items.js` — frameless = spec bug: flag, don't
  invent mechanics); rank ladders inline (2–4 rungs w/ level prereqs; reality-breaking rungs
  floor at L9); tech = charge items, rust-exempt; realm consumables included as rows. Spice
  ruler applies (a realm's Mythic rows are its reality-breakers). **Division of labor:** breach
  draws roll the REALM table; anachronism-INTRUSIONS roll the legacy d300 (the cross-realm
  grab-bag — its new permanent role). Realm-tagged d300 rows are COPIED verbatim as seed rows
  into their realm table (originals untouched). J6 anchors are voice LAW per realm.
- **urban-fabric:** district records are `kind:"district"` codex records linked `part-of` the
  node; `rollBuilding` proprietors mint via the ambient-pool path (soft, at the node).
  Tavern 2.0 extraction: tables move VERBATIM (diff-audited), the procedure file gains a
  header pointing at its extracted children + `status: archived-source`.
- **job-walks:** `TIER_PAY = [3, 8, 20, 50]` gp base by tier (provisional constants);
  posting TTL = 4 + 1d4 days; unclaimed resolution rolls 1d6: 1–3 someone-else-took-it (ledger
  line), 4–6 it-got-worse (the relevant clock +1).
- **wiring sweeps:** a wired table that turns out malformed on contact (the region-encounter
  class) gets FIXED (header repair) not skipped — but ONLY structural repair, zero row rewrites.
- **dm-eval:** fixtures live in `dev/dm-eval/fixtures/*.json` (turn + digest + expected-behavior
  rubric); the scorer is a CHECKLIST evaluator (string/shape assertions where possible, a
  model-graded rubric ONLY for voice items, clearly separated so the deterministic part never
  flakes).
- **forever-storage:** use the same jsdom conventions; if fake-indexeddb isn't available as a
  dependency, SHIM the minimal IDB surface in the harness (no new npm deps — G0 holds).

## J3. THE MOTIF-KIT VOICE ANCHORS (Fable-authored — these are LAW; extend, never contradict)

Each kit: build 6–10 tints in this register; the anchors below ship verbatim among them.
- **flood** — entrance: *"The doorway weeps; the steps go down into black water."* tints: *"a current tugs through the arrow slits" · "the waterline on the walls is older than the furniture."*
- **ice** — entrance: *"The threshold glitters; your breath arrives before you do."* tints: *"the torch sconces wear candle-wax beards of ice" · "something under the floor-ice is darker than shadow."*
- **fire** — entrance: *"Heat leans on the door from the other side."* tints: *"the mortar glows faint orange in its seams" · "iron fittings tick as they cool — or warm."*
- **overgrowth** — entrance: *"The door lost to the hinge-side ivy years ago; you enter through the wall's slow green wound."* tints: *"roots have opened the floor along old grief-lines" · "the light comes down green through three seasons of canopy."*
- **fungal** — entrance: *"The air is thick, sweet, and interested."* tints: *"shelf-brackets of fungus stair the walls" · "spore-motes hang where the draft should move them."*
- **bone** — entrance: *"The lintel is a jawbone. It was not carved to look like one."* tints: *"the gravel underfoot is not gravel" · "the columns wear vertebrae the way trees wear rings."*
- **ash** — entrance: *"Gray drifts against the door like patient snow."* tints: *"footprints ahead of yours, filled in soft" · "everything touched leaves a clean shape behind."*
- **vermin** — entrance: *"The scratching stops when the door opens. All of it. At once."* tints: *"the walls have a pulse if you watch the holes" · "something has been eating the structural parts."*
- **void** — entrance: *"The dark past the door does not do what torchlight asks."* tints: *"sounds arrive without echoes, like the room ate them" · "the far wall is a rumor."*
- **mirror** — entrance: *"Your reflection enters first, in a surface that shouldn't hold one."* tints: *"the symmetry here is slightly too good" · "in polished things, the room is furnished differently."*
- **clockwork** — entrance: *"Somewhere below, something enormous keeps excellent time."* tints: *"the sconces relight one corridor ahead" · "a seam in the wall exhales, warm and oiled, on the count of eight."*
- **consecrated** — entrance: *"The threshold has been kissed smooth by ten thousand foreheads."* tints: *"the candle stubs are all the same holy inch" · "your footsteps hush themselves out of respect you don't feel yet."*
- **timelost** — entrance: *"The dust hangs mid-fall, deciding."* tints: *"the torch brackets hold torches at three different centuries of burn" · "your footprints age behind you."*
- **none** — no kit fields; the rolled base speaks for itself.

## J3b. REALM-TABLE VOICE ANCHORS (Fable-authored — per-realm register LAW; adapt realm names to
the frozen scan vocabulary, keep the registers)

- **Frontier/Western** — *"Peacemaker, Blued"* (frame: hand crossbow) R1(L1) no reload · R2(L5)
  fan the hammer: two attacks, 1/short rest · R3(L9) the noon-draw: advantage on initiative,
  and everyone present knows it somehow. · *"Trail-Iron Shoes"* (wondrous) R1 your mount never
  tires on a road · R2(L4) +10 ft mount speed · R3(L8) the mount follows any NAMED road unguided.
- **Tech/Sci-fi** — *"Lance Pistol"* (frame: hand crossbow; CHARGE item, cells) R1 fires light ·
  R2(L4) overcharge: one d10 shot, costs 3 · R3(L7) the safety recognizes your palm alone. ·
  *"Falling-Star Visor"* (frame: goggles) R1 darkvision 60 · R2(L4) see invisibility 1/day ·
  R3(L7) threat-outlines: can't be surprised while worn.
- **Noir/Modern-crime** — *"The Grey Fedora"* R1 advantage to pass unremarked in crowds ·
  R2(L4) 1/session you were simply never there · R3(L8) witnesses honestly misremember your
  face. · *"Deadbolt Special"* (frame: light crossbow; cartridges) — loud is the point: the
  shot IS the message.
- **Post-apocalyptic** — *"The Saw"* (frame: greataxe; fuel; LOUD — advantage to be heard,
  disadvantage to hide, morale checks hear it too) · *"Clicking Amulet"* R1 clicks near
  reality-breaking items · R2(L5) clicks toward BREACHES — a thinny-detector, and it is always
  slightly clicking.
- **Toybox/Anachronism** — *the Jordans* (CANONICAL, per ADAM-REVIEW-1) · *"Lunch Pail of
  Holding"* (frame: bag-of-holding-lite) R1 one cubic foot, food stays warm · R2(L4) eight
  cubic feet · R3(L7) produces one hot meal a day; nobody agrees on the cuisine.
- **Cosmic/Weird** — *"The Left Gauntlet of the Choir"* (frame: gauntlet) R1 you can hear water
  breathing · R2(L6) speak the drowned language; things ANSWER · R3(L10) once, command a thing
  that swims — it never forgives you.
(Realm-NEUTRAL rows stay in the d300; no neutral realm table.)

## J4. Batch-3 frontier prose (the orchestrator's landing list, on merge)

The retcon-negotiation protocol (DM-CHARTER register) · the content-safety charter addendum ·
the recall preference order (recall → pool → mint → freehand-in-a-bind) · the membrane/ambush/
stageRules narration registers (BREACH §3.5) · the gen `opts.type` runbook line · the claim-deed
moment · morale-binding + proposals-advisory register (batch-2 leftovers land together here if
batch 2's merge preceded).

## J5. Sequencing note

Unit order per BATCH3-PLAN; forever-guards LAST (vintage #1 freezes the post-batch-3 format).
The workflow script is authored at fire time from batch-2's template + this doc; same pipeline,
same honesty contract, same explicit-path commits.
