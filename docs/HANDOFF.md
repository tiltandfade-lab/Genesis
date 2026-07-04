---
type: session-handoff
project: Genesis
updated: 2026-07-04
---

# Genesis — Session Hand-off

*Read this first in a new session. It orients you; the linked docs are the source of truth.*

## ⭐ Latest (2026-07-04 late — live-QA arc: roster complete, eyes gone, texture ruled out) [Opus]

**Everything landed + pushed; final sweep 92/92 harnesses + manifest OK; working tree clean.** This
arc executed Adam's live QA-review rulings on top of the delegation batch. The **race×class matrix
is complete** — all 72 combos, eyeless, D-bow rangers, 72-cell sheet re-rendered. The **eye standard
was REVERSED** — humanoid eye dots stripped corpus-wide (feature-eyes/sockets/visor-slits kept). The
**bestiary tail wave** fixed Adam's nine QA complaints (rat-swarm→6 mice, real lizard/mephit/stalker/
blight, flaming skeleton, horse + skeletal warhorse, table proportion, ranger D-bow). **Flame glow**
now additive (reads as light), **scale 1.2**, **bolder gold rim**. The **bestiary coverage manifest**
(docs/BESTIARY-COVERAGE.md) maps all 381 uncovered creatures → ~16 real new bodies + variants +
aliases (35 aliases landed); the build waves await Adam's §2 new-body gate. **CHASE-SOFT-RECALL** and
**DRESSING-ATMOSPHERE** built; **CHASE-BITE** drafted for Adam's pick. The **ChatGPT painted-texture
experiment was RULED A CLEAR FAIL** — generated grain stays the tier; never touched the live renderer.

**Adam's open ledger (waiting on him):** grit pick (held at 1/3; zoom4x crops in
dev/model-qa/grit-compare/) · CHASE-BITE design pick (docs/CHASE-BITE.md) · the bestiary NEW-BODY
gate (docs/BESTIARY-COVERAGE.md §2 — which of ~16 bodies build) · NEAREST_SUB alias taste ·
wilderness dressing-mega craft pass (PROVISIONAL) · the flagged model nits (half-orc-fighter facing,
beggar crutch, snake CoG, harpy edge-on wing).

**Do next (pick up here):** (1) Adam's ledger above; (2) bestiary build waves once the new-body gate
lands (docs/BESTIARY-COVERAGE.md §4 — wave 1 = stocky-quadruped + bird + amphibian, highest leverage);
(3) env waves W+U (docs/ENV-WAVES.md, 17 deferred); (4) CHASE-BITE build once picked; (5) **a live
playtest on the new stage** — P1′ figures + dressed rooms + initiative UI + the chase loop have never
been FELT together in real play (the soak the DIRECTION doctrine calls for).


## Latest (2026-07-04 evening — the full-day delegation: P1′ LIVE + the walks dressed) [Fable]

**22 merges on master, final sweep 92/92 harnesses green + manifest OK + monkey clean.** Adam
delegated the day in one message; everything ran as spec-first background executors with per-unit
orchestrator re-gates. The headline: **P1′ is live** — the bespoke whole-object roster (now ~120
pieces after today's 6 model waves) renders in the real engine with material channels, cuboid
auto-fallback, and lighting props anchoring the rolled room light. A crawl room now arrives fully
table-rolled: feature + interactable + set dressing/condition + atmosphere lane + light profile
with a physical bright-flamed source. Chase is contract-correct end to end (resolvable flag,
soft-recall codex mints). Initiative reads on the stage (banner/spent/HP bars). Composer draft-loss
fixed. Adam's mid-day rulings landed: scale 1.2, bolder gold rim, bright flames; grit is HELD at
1/3 pending his zoom ruling.

**Adam's open ledger (decisions waiting on him):** grit pick (zoom4x crops in
dev/model-qa/grit-compare/, Chrome tab was opened on the decision artifact) · CHASE-BITE design
pick (docs/CHASE-BITE.md — flat −2 rider RECOMMENDED vs adv/dis alternative) · NEAREST_SUB alias
taste pass (src/ui/theater-figures.js) · escaped-quarry provenance word (authored vs rolled,
CHASE-SOFT-RECALL decision 4) · wilderness dressing mega craft pass (PROVISIONAL) · urban air/odor
d20s repeat sooner (craft lane) · half-orc fighter faces away at sheet angle · dressing megas'
furnishings/container blocks (gen/loot layer, unwired by design) · big-unit multi-zone footprint
(design talk) · weapon-swap re-mint bundle (he holds the polish list).

**Do next (pick up here):** (1) Adam's ledger rulings above; (2) env waves W+U per
docs/ENV-WAVES.md (the deferred 17 pieces); (3) CHASE-BITE build once picked; (4) micro-props when
scheduled; (5) a live playtest WITH the new stage — initiative UI + dressed rooms + P1′ figures
have never been felt in real play together; (6) the sprint's standing items (DM-SEAT program for
the latency law — today's aggregate: 0/22 turns ≤15s, median 52.3s).


## Latest (2026-07-04 — battle-stage UI polish: the arena loop) [Fable]

**LANDED on `feat/battle-ui-arena`** — Adam's overnight mandate ("loop until the battle UI layout
is solid") run as a 4-round orchestrated loop, every round pixel-gated through the new
**`dev/battle-gate/`** headless capture harness against his recovered notes (`ACCEPTANCE.md`).
What changed: stage composer compact (send button 29%→16%, placeholder unclipped), the stage feed
a real reading column (~40 chars/line), plaque unclipped + centered, band chips legible, and the
arena rework — `dark` profile gets its missing point light, `STAGE_AMBIENT_FLOOR=0.65`, zoom
defaults 3-steps / min-0.45 → **board 50→82% of canvas pixels, nonVoid luminance 23→36, manual ⊕
headroom restored**. Full detail + the taste knobs (floor / point intensity / zoom consts — one
line each) in CHANGELOG 2026-07-04. Gates re-run by the orchestrator on the tip: manifest OK,
battle-stage 41, lifecycle 52, theater-lighting 21, gauntlet-1 clean (the 9 known), full
`dev/verify-*.mjs` sweep 0 failing. Residuals deferred: auto-fit centers board-not-action
(`placeCamera`), the small-board 0.41-unclamped quirk, the `preserveDrawingBuffer` readback gotcha
(all in CHANGELOG Deferred). NOTE: the stalled `fix/theater-g9-tune-1` agent worktree's diff was
verified SUPERSEDED (its placeCamera rework already lives in master) — safe to drop when the
batch session confirms.

## Latest (2026-07-04) — MODEL WAVES: 82-piece placeholder roster, QA'd + sheeted [Fable]

### ❓ Open questions for Adam (2026-07-04, from the overnight model program)

1. **P1′ engine wiring — greenlight?** The big one. Whole-object builders → BufferGeometry +
   palette-key material channels → `figureMaterialFor` → the shipped PSX pass; cuboid figures
   demote to fallback; lighting props anchor `theaterRollLightProfile`'s point lights. Spec:
   `dev/model-qa/REFERENCE-DIRECTION.md` §P1′. This is when the 82 pieces appear in actual play.
2. **Polish backlog timing** — 9 minor taste items logged in `dev/model-qa/sheets/INDEX.md`
   (ooze reads blue, rat disc overhang, harpy wing thinness, etc.). Batch-fix as its own small
   wave now, or fold into the wiring unit?
3. **PC weapon-swap presentation** — individual models bake the held weapon in. Proposed:
   the PC's figure re-mints on equip (authored variants of the held item on the same landmark
   table), never runtime attachment. Confirm before ITEMS integration meets the figures.
4. **Blender's lane** — beauty renders proven (the dragon shot). AO bakes / bevels only pay off
   via the T2 GLTFLoader seam, which stays inert by ruling. Revisit when?
5. **Down-state check** — corpses persist on the board; schedule the tipped-figure read check
   across the roster (cheap harness pass) before or after wiring?
6. **Working-tree strays (not this unit, left uncommitted):** `dev/playtest-player-rot1-attempt2.jsonl`
   (1-line modification) + `dev/.playtest-stop` — playtest-session residue. Keep, commit under a
   playtest unit, or discard?
7. **Budget note** — the overnight program spent roughly 15-20M tokens across authoring + QA
   (Opus-heavy). Worth a `/usage` glance before greenlighting the next Opus-heavy unit; QA
   reviewers are already downshifted to Haiku per your ruling.

Overnight program (Adam-directed, pre-authorized close): every board piece a Tier-2 campaign
needs now has a bespoke whole-object model under `dev/model-qa/creatures/` — 12 classes, 6 races,
6 NPCs, 32 monsters CR 0–10 (flagship: the young green dragon, 4 iterations), 6 kin variants,
15 walk-table-grounded set pieces incl. lighting props. Pipeline: Opus authoring executors with
closed render loops → batched (≤3-wide, machine-resource law) Haiku review + Opus repair
workflows → director gate per sheet. All 82 passed QA. Proof sheets + INDEX.md (with the polish
backlog) in `dev/model-qa/sheets/`; view live via `ps1-sheet.html?set=…` (engine-PS1 surface,
grain + specular default-on). Verification: check-manifest OK (no module changes — all work in
the dev/ probe sandbox); 9 QA workflow runs, 11 real defects caught + repaired.

**Do next (pick up here):** P1′ engine wiring per `dev/model-qa/REFERENCE-DIRECTION.md` §P1′ —
whole-object builders → BufferGeometry + palette-key material channels → `figureMaterialFor` →
the shipped PSX pass (cuboid figures demote to fallback); then the `creatureId → builder`
registry seam; lighting props anchor `theaterRollLightProfile`'s point lights. Adam's morning
call: review the sheets (INDEX.md), then greenlight the wiring unit.

## Latest (2026-07-03 (later 9) — whole-object model probe → the Blender pivot) [Fable]

**LANDED 2026-07-03 on `feat/whole-object-model-probe`** (dev-QA only; no game module/manifest
touched → check-manifest N/A; verification = both render pages identical post-refactor + OBJ export
clean). This is "the graphics session" the later-8 close deliberately left working-tree files for.

**The finding:** Adam flagged the pilot lineup's floating weapons / 90°-wrong / detached parts and
asked whether authoring creatures as WHOLE OBJECTS would fix it. It does — by construction. A
whole-object probe (each creature = one landmark table in one model frame; no anchor resolver, no
stat→look derivation) proved it on both extremes: a hooded swordsman (grip authored first, fist
fitted to the blade axis) and a giant spider (8 legs, every hip on the carapace — the worst case
for the old anchors). The two bugs hit were local typos (a foot's −z sign; the face on the wrong
ring columns), one-line fixes with zero blast radius — the opposite of a shared-anchor-rule regression.

**On disk (all in `dev/model-qa/`):** `probe-lib.js` (shared primitive library),
`creatures/{humanoid,spider}.js` (the landmark tables — one source for pages + exporter),
`whole-body-probe.html` / `spider-probe.html` (render), `export-obj.mjs` →
`exports/{humanoid,spider}.obj` (Blender-ready). Plus `ui-sketches/model-refs/` (Adam's PS1/VS refs).
**Supersedes the G5 anchor-grammar execution** ([[MODEL-GRAMMAR]] §2–§4; DIRECTION §4 amended).

**Do next (pick up here):** model-authoring moves to the **`genesis-blender-mcp`** pipeline (sibling
repo, proven 2026-07-03, outputs GLB → the game; its own next step is "real G1→G5 creature bodies").
Author the bodies there in the whole-object language the probes settled (VS proportions, base discs,
joints fitted by hand); the two OBJs seed it as proportion reference (import → Alt+J) or model fresh.
Texture is the follow-on pass. **NOTE: the live 5176 server + the parked realm-table skim (later-8
checklist below) are still open.**

## Latest (2026-07-03 (later 8) — REVIEW PASS 2: the realm-items re-author, the doer/pointer doctrine, and the corpus audit) [Fable]

**LANDED 2026-07-03 on `feat/doer-pointer-doctrine`** (clean close: `--emit` recompile → 366
tables, REAL bugs 0 · check-manifest OK · verify-dm-events 36/36). The graphics session's
working-tree files (`ui-sketches/model-refs/`, playtest logs) were deliberately left out of the
commit and remain in the tree for that session's own close. **First action for a new session:
Adam's skim checklist below.**

**The arc:** Adam reviewed the PROVISIONAL realm-item tables mid-session → flagged "fake quest
food" (omniscient lore + unbacked hooks in loot rows) → a 3-agent sweep measured it (~38% of
550 rows; template tics; 5 cross-realm clones; only 4 of ~30 hook-claims mechanically backed)
→ **ADAM-REVIEW-2.md** locked the doctrine → Fable re-authored ALL 11 realm tables to it →
a corpus-wide audit found the next candidates → a 4-agent background wave fixed the three
Adam named. **`docs/ADAM-REVIEW-2.md` is the binding artifact:** §1 the HOOK DIRECTION LAW
(quest points at item by default; item→quest is rare + must ship its wiring) · §2 Note-register
rules (A/B only; Gemini's Outlandish d300 = the bar) · §3 the PLOT-ITEM SPLIT ("an item that
DOES something is loot; an item that POINTS somewhere is a plot item") · §3b eight coherence
laws (wired-physics-only, cross-breach R1s, no undefined referents, Volatile = live-danger
ITEMS, pressure-over-plot, agency-over-destiny) · §3c the FRAME DOCTRINE (BG3 visible-equipment
slots framed true; everything else is pocket inventory; future equip-layer guard queued) ·
§7 the ranked rework program.

**What changed on disk (all PROVISIONAL pending Adam's skim):**
- **All 11 `Engine/03. _Tables/05. Realms/Realm Items - *.md` re-authored** (doers-only, unique
  rows, Mythics = d4 world-verbs, all 13 canonical anchor ladders verbatim, clones killed,
  frames re-mapped to true `data/items.js` chassis — 50 distinct frames, catalog-validated).
- **`docs/REALM-PLOT-ITEMS-PARKED.md` (NEW)** — ~130 extracted pointer concepts, 12 sections;
  feedstock for the plot-item unit. NOTE: the Plot Item architecture ALREADY EXISTS
  (`codex-roll.js:154` rolls `plot-item`, cells [Band, Object, Why It Matters, Opens/Proves],
  origin-tags + RESURFACE); the realm unit = 11 tables to that schema + a one-line
  realm-aware table-select. Much smaller than it sounds.
- **Background wave (4 units, all re-gated by Fable):** Dungeon Loot – Valuables re-sorted
  (11 pointers out/11 doers in) · 27-row surgical batch (Distant Word deflations, Shrine
  omens now read the nearest ACTIVE faction clock one step early, Festival payloads supplied,
  TvF r18/20 carrier-mints, 4 micro-sharpens) · NPC Life Event got a trailing Effect column
  (ADAM-REVIEW-1 drift vocab, 100 rows) + 11 referent rebinds · the frame audit (~80 remaps).

**ADAM'S SKIM CHECKLIST (the open gate — row-level):** the 11 realm tables · Shrine & Omen
r96 (HIS ★ anchor, undefined referent — only his hand) · Valuables backfills
(r24/69/70/73/75/76/79/80/84/86/97) + r83 borderline + header blurb · Festival invented
payloads (r12/33/89/93/95) · Life Event rebinds (r70/73/74/76/77/78/79/84/86/97/99) ·
Distant Word deflations (r82–86/91/92/95/98). Flags come off only when verdicts log in
ADAM-REVIEW-2 (§3 protocol).

**Design rulings PENDING (Adam, when fresh):** 1. **BREACH-SPAWN** — Adam wants a guaranteed
breach rolled at world genesis, reached by a long walk; Fable's proposed shape: a genesis-time
ledger fact (realm d11 + far bearing), soft-until-contact, surfaced free via Distant Word
binding/omens/Clicking Amulet, distance = the spice gate. Open: how many, how far, DM-knows-realm
-from-spawn? 2. **WANT-HOOK generator** (spec-first talk; the legacy Quest d20s — Macguffin/
Destination/Complication/Urgency — become its axes per the audit). 3. **Urban Rumor Intel**:
rebuild-through-Distant-Word vs retire, and the fate of its ~45 cosmology rows. 4. **Dungeon
Revelation rows 1–74** re-author (calibration = its own rows 75–100; samples-first optional).
5. NPC Hook (de-localize; needs no direction — say go). Also queued: the equip-layer guard
(§3c) and the difficulty retune assuming realm-armed parties (Adam: items "will need the game
to be more difficult, totally ok").

**Standing process (memory-locked):** background parallel agents ALWAYS (Adam: "preserve the
ability to keep talking"); fable-model subagents are licensed for voice-critical prose with a
style bible; Fable re-gates everything personally. Audit standard-setters for future passes:
Plot Item, NPC Job Board, Place-Secret, Distant Word's Distortion architecture, Place Drift /
Downtime Ledger's Effect columns. Cleared as intentional: Walk Skin/Breach openness, Chase.

## Latest (2026-07-03 (later 7) — SESSION CLOSE: the G5 art loop, table doctrine, and a clean handoff) [Fable]

*This session (the Fable holiday-weekend day) is CLOSED — deliberately, because it ran enormous.
Everything below is pushed; a NEW session picks up from this entry alone.*

**What today built, end to end:** combat went from unreachable → live in the browser → a full
battle theater (FFT board · PSX grit · 59-part model grammar with 510 derived recipes · natural
creature identities on miniature base discs · held weapons · corpses + obliteration · rolled
per-room lighting · motion verbs + magnitude-scaled reality tears · the Disco-Elysium battle
stage with the band-arena overlay). Plus: the DM seat specced+half-built (GLM ~$1/hr), the IDB
hydration data-loss hole fixed, TIYL ported to full-bleed, table-edit safety fenced, the
top-band uniqueness doctrine built into the engine, and two project skills for Opus
(genesis-orchestrate · genesis-playtest-rig). CHANGELOG entries (later 1)→(later 7) hold the
detail; the report index below is the fast path.

**REPORT INDEX (read these before re-deriving anything):**
- dev/top-band-uniqueness-report.md — 60 tables classified vs the 1%-mythic concern
- dev/realm-mythic-proposals.md — the approved drafts (9/11 APPLIED; see open item 1)
- dev/model-coverage-report.md — walk nouns vs the polygon plan (17 new parts: BUILT in G4)
- dev/table-order-report.md + dev/table-lint-baseline.md — table hygiene state
- dev/playtest-{scribe,player}-rot1-attempt2.jsonl — 27 answered DM turns, contract-clean
  (margin ladder, verbatim dialogue, no coaching, burn <30k/turn); a real slow-drip arc built
  from digest atoms on Copper's Marsh; **combat_start OPENED in real DM hands** (a Stealth-fail
  margin consequence, 3 foes, stilt-hut zone — the lifecycle chain worked live; rounds didn't
  run before the stop). Awaiting the Critic pass. **DM's standing flag: prepPending was
  unserviced every turn** (loop DMs lack the Workflow prep fan-out — the SD-006 case;
  un-reskinned walks held as designed, but depth runs thinner: another argument for the seat)
- docs/MODEL-GRAMMAR.md (G1-G4 BUILT; G5 rounds 1-2 done live with Adam) · docs/BATTLE-THEATER.md ·
  docs/DM-SEAT.md · docs/TABLE-EDIT-SAFETY.md · DM-CHARTER §8.6 · DREAM-HORIZON §H3 (the weave, parked)

**Do next (pick up here):**
0. **READ `docs/DIRECTION.md` FIRST** (2026-07-03 — Adam handed Fable the director's seat): the
   playability gate, the renderer decency-gate-then-freeze, soak-before-build, the batched Adam
   ledger. Where DIRECTION and the list below disagree, DIRECTION wins.
1. **Adam's open calls:** Frontier + Noir realm rows (per-variant Frames vs one-Frame-per-row
   schema — pick: split Frame per variant into the Item text, or hold one Frame) · In-Building
   Complications (linter frontmatter opt-out vs re-sort) · the d500 NPC-trait expansion +
   NPC pools/slots (recurrence-as-thread design note approved in principle) · battle-stage UI
   approval (wants ORGANIC combat shots — see 2).
2. **A playtest WITH combat** (genesis-playtest-rig; or resume the rotation — reasonable persona
   transcripts exist, next personas queued): steer toward a fight for the organic battle-stage
   shots + G9 round 3 (known nits: none critical after r2). Then the Critic pass over attempt2.
3. **G5 Row B — the beasts** (wolf/spider/swarm/ooze/ghost/dragon lineup, fixture staging recipe
   in this session's transcript) + the §7b blind-recognition QA loop (specced, never yet run).
4. **DM-SEAT continues:** SEAT-PROMPT.md frontier distillation → seat-replay.py + dm-eval voice
   gate (needs Adam's z.ai key) → the live GLM hour. Cost telemetry already wired.
5. Carried: SD-003 · ridden-wyvern · SD-009/010/011 · G2-1976 · the persona rotation proper ·
   foe-hazard damage path (doesn't exist — dead-state gap) · Place-Gen template-slot proposals
   (drafting promised, not yet done).

## Previous (2026-07-03 (later 6) — LUNCH WAVE: MODEL-GRAMMAR G1→G4 complete · layers-not-boxes · table hygiene) [Fable orchestrating]

**The model grammar is BUILT G1→G4** (59 parts + anchors · 510/510 derived recipes · the mogwai
shape-hint resolver w/ codex canon-lock · the loadout mirror — the PC's mini holds what the sheet
equips · walk features as real props). Battle-stage REV-2 landed Adam's "layers not boxes" ruling
(band arena overlays the map; dense right rail; 73vh canvas). Place Drift's roll-order invariant
restored (0 other offenders); build/lint-tables.py + TABLE-EDIT-SAFETY.md fence future hand edits
(rows are range-consumed everywhere — adds/removes safe by construction). Full detail: CHANGELOG
(later 6). All pushed; full sweep 0-failed.

**Do next (pick up here):**
0. **READ `docs/DIRECTION.md` FIRST** (2026-07-03 — Adam handed Fable the director's seat): the
   playability gate, the renderer decency-gate-then-freeze, soak-before-build, the batched Adam
   ledger. Where DIRECTION and the list below disagree, DIRECTION wins.
1. **G5 — the Adam+Fable hand-override art session** (data/model-recipe-overrides.js) + the §7b
   blind-recognition QA pass (stage solo renders → fresh judges → iterate misses).
2. **A live playtest WITH combat in battle-stage mode** (genesis-playtest-rig) — everything the
   last two days built gets FELT. G9 round 3 rides it (known nits: within-zone crowding when 5
   foes share a band; the melee chip clips the PC name).
3. Adam's calls: rev-2 verdict · In-Building Complications (linter opt-out vs re-sort) · the
   634 duplicate-row warnings during his table review.
4. DM-SEAT continues (SEAT-PROMPT.md frontier distillation next; Adam's z.ai key when ready).
5. Carried: SD-003 · ridden-wyvern · SD-009/010/011 · G2-1976 · persona rotation.

## Previous (2026-07-03 (later 5) — THE BATTLE THEATER DAY: the full visual battle system is LIVE) [Fable orchestrating]

**In one arc: the gritty FFT/Vagrant-Story battle theater went from spec to live-in-the-app** —
board (45° dimetric, PSX grit, CC0 textures), 9 posed figure archetypes with class silhouettes +
weapon shapes, 18 motion verbs + damage-typed FX + the magnitude-scaled reality tear + `stage_fx`,
and the Disco-Elysium BATTLE-STAGE layout (theater center ~64vh, chat right rail, restore on
combat_end). Two real bugs found by the LIVE gate, not harnesses: the importmap bare-path (three
never resolved in the app) and innerHTML canvas orphaning (Theater.reattach). Full detail:
CHANGELOG (later 5). All pushed; full sweep 0-failed.

**Do next (pick up here):**
1. **MODEL-GRAMMAR G1→G5** (docs/MODEL-GRAMMAR.md §8) via genesis-orchestrate — parts library →
   recipe generator (+ the mogwai shape-hint resolver + the blind recognition gate) → loadout
   mirror ∥ prop recipes → the Adam+Fable override session. This is Adam's "another pass across
   the models" — figures reach "a good place" here.
2. **A live playtest WITH combat in battle-stage mode** (genesis-playtest-rig) — the whole day's
   work gets FELT; feeds G9 round 3 and the parked tuning decisions.
3. DM-SEAT execution continues when Adam returns to it (units built: proxy + app module; next:
   SEAT-PROMPT.md frontier distillation + replay + dm-eval gate; Adam's z.ai key when ready).
4. Adam's provisional-table review continues (38 flagged files; links in the 07-03 session).
5. Carried: SD-003 · ridden-wyvern · SD-009/010/011 · G2-1976 · persona rotation (budget pre-flight).

## Older sessions

The full session-by-session history lives in `docs/CHANGELOG.md`. Standing rule (DIRECTION §7):
HANDOFF holds at most 3 entries — newest replaces oldest; history migrates to CHANGELOG.

Pre-CHANGELOG standing notes preserved here (no CHANGELOG counterpart — durable operational
knowledge, not a dated session entry):
- `genesis.html` runs on INLINE data, not the compiled registry — wiring it onto `tables.json` is
  the still-open Track B hook.
- bash `rm` was blocked in an earlier Cowork mount (used `mcp__cowork__allow_cowork_file_delete`);
  may not apply to the current Claude Code environment.
- The `genesis` skill (installed) handles orientation + hands Vale/playtest triggers to
  `arcana-playtest`; Adam's Claude-app project instructions may still need a pointer update if they
  ever named Shifting Vale instead of Genesis.
- Loot tables are remapped (`LOOT-REMAP.md`) — don't treat the old "Tier" table or whimsical
  "Legendary" as live; SRD additions in the rarity tables are pointer-format rows (curated rows
  first, verbatim).
