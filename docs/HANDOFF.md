---
type: session-handoff
project: Genesis
updated: 2026-07-07
---

# Genesis — Session Hand-off

*Read this first in a new session. It orients you; the linked docs are the source of truth.*

## ⭐ Latest (2026-07-07, evening — CRAFT SESSION 1: NPC Hook → d200, Adam's hands) [Claude Fable 5, craft seat]

Adam's first craft-pass session under docs/CRAFT-PASS-RUNBOOK.md, run in a parallel worktree on
branch **`feat/craft-npc-situation`** (pushed, NOT merged — the orchestrator lands it when the
line is clear). NPC Hook re-authored row-by-row with Adam into the full situation anatomy and
expanded to **d200**: approved core landed (Grounded 1-35, Textured 61-85 with anchor fixes,
Strange core, Volatile/Mythic anchors, shadow-broker capstone at 200); **~100 rows are DRAFT FOR
ADAM'S REVIEW** — exact ranges in the table's preamble. Rulings that now bind the whole pass:
the band calibration (Volatile = escalating force ON the setting; Mythic = forever-change chain;
Twilight-Zone loops cap at Strange), the hook-anchor convention (every row is the rolled NPC's
problem), sins/monsters/silly threaded per band, 11 per-realm leaky-breach guarantee rows in
Volatile+, and the tuffle (gremlins row, needs the bestiary pair — orchestrator unit). Gates:
compile clean, lint 0 new errors, verify-table-lint 37/37, coverage 1-200.

**Do next (pick up here):** 1) Adam reviews the d200 draft rows; 2) NPC If Ignored + Want on the
same branch (the consequence/agency half — If Ignored becomes band-graded escalation ladders);
3) then the re-prioritized craft queue in NEXT-STEPS "Do next" item 1 (Problem trio → Travel →
place family). Orchestrator: land `feat/craft-npc-situation` (--no-ff) and queue the tuffle
bestiary pair + the other captured build units.

## Latest-1 (2026-07-07 — THE 24-HOUR PRODUCTION RUN: the whole spec batch BUILT, the ending shipped) [Claude Fable 5, director's seat]

Adam extended Fable 24h and said "start production." Result: **8 gated integration landings on
master, all pushed, CI green** — every unit of the 2026-07-06 spec batch is BUILT. Fable
orchestrated ~40 Sonnet/Opus executors (genesis-orchestrate discipline: worktree isolation,
Workflow throttle, personal re-gates, --no-ff), resolved every cross-wave conflict by hand, and
landed in order: **Wave-0 hotfixes H1-H10** → **wave 1b** (table lint gate, TAROT-2, theater-next,
bestiary dashboard) → **wave2a** (scene-risk, item-legacy, seat adapter) → **the contract spine**
(dm-contract.json @96 events + social fixes + the always-ticking clock + detected events) → **the
spicy world** (25/25/25/17/8 band-first layer, zero rows touched) → **Table Atlas** → **state-
hygiene eval** (GLM bake-off now scoreable) → **THE ENDING** (Crowning/Sundering/Bastion/heirloom —
a world can finish; retirement is state promotion, not deletion).

**Verification:** every landing = full 100+-harness sweep on the exact integration tree + fuzz
(500 calls/96 events/0 findings) + monkey (12/12 lives) + check-manifest (H9-hardened) + diff
reads. Playtest probes across the day: **5/16 reproducing → 1/31.** The dm-contract drift guard
caught one real integration drift (itemLegacy digest key) — the anti-drift keystone works.

**Do next (pick up here):**
1. **Adam's craft queue** (everything else is built): table rows against the LIVE linter
   (`build/lint-tables.py`; the worklist is `--warn-only`, the voice reference is
   `GPT-5.5-advice-for-Claude/ROW-ANATOMIES.md` — six-question row test + weak→playable pairs
   per family) · tarot Major card text · Legend-table rows (`data/crown-legend.js`
   PROVISIONAL) · FRAME-FIELD schema + Frontier/Noir rows skim · grit + NEAREST_SUB eyeballs.
2. **The GLM bake-off** — seat adapter + SEAT-PROMPT.md v1 + `dev/state-eval/` scorecards are all
   live; run providers against the 12 goldens (LATENCY LAW ≤15s is the launch gate).
3. **A live playtest** on the new world: spicy baseline + scene-risk telegraphs + ticking clock +
   item legacy + (if a world qualifies) the first Crowning. The DIRECTION soak doctrine applies.
4. **Small fixes:** founding-digest 32KB budget breach (codex prep dump — digest-diet bug, filed
   by state-eval) · seed the 3 flaky harnesses (plot-recurrence / detected-events / scene-risk) ·
   monkey watchdog-stalemate balance class (Lizardfolk Geomancer, Green Dragon Wyrmling).

## Latest (2026-07-05 later-6 — Adversarial playtest: Rennick Fool, 4 runs — DM seat proven un-gameable) [Claude Code]

**Docs/findings session — NO engine change** (standing freeze: harness/testing yes, building no). Committed
on `docs/adversarial-playtest-rennick`. Full detail: CHANGELOG 2026-07-05 (later-6).

A new continuing griefer PC, **Rennick Fool** (Human Bard), run through **four adversarial bridgeless
playtests** against the production DM seat (the sabotage counterpart to Sella's earnest play). Four assault
types across 40 turns: **griefer** (OOC/fourth-wall/soft-lock) → **saboteur** (tried to dismantle the plot;
the failed roll *fed* it) → **puppeteer** (leveled to L10, tried to auto-win with Dominate/Charm) →
**whiplash** (forced volatile dice + crit-magnitude spikes).

- **Verdict — the seat is robustly un-gameable:** the DM never broke character, rolled the player's dice,
  obeyed an illegal demand, or leaked a `dmOnly` truth. Mind-control was adjudicated rules-correctly (saves
  gated, scope/duration/concentration honored, zero free wins); crit-magnitude + degrees-of-failure both
  fired correctly under forced volatility; the **spell-slot economy proved fully built + enforced**; BUG-01's
  fix held across native branch landings. Every fault found is a quiet engine *contract seam*, never the
  narration.
- **New findings (filed to `docs/PLAYTEST-BUGS.md`, not fixed):** BUG-14/15/16/17/18 + CAL-1. **BUG-17+18
  triangulate the whole social-attitude spine** (attitude can't move / moves against the wrong DC) and the
  **caster-discoverability gap** (slot economy works but the seat prompt never teaches `cast`) is the
  highest-value caster fix. **CAL-1** = Adam's lethality ruling (a failed suicide-mind-control save should
  land/kill; don't narrate past a failed save). **⏸ PARKED:** whether to raise spice across the board.
- **New save:** `dev/playtest-saves/rennick-fool/` (tracked, Sella-precedent) — L10, HP 3/43,
  bound-to-the-fog; `state-pre-run4.json` archives the pre-forced-dice line if you want to keep it clean.

**Do next (pick up here):** the findings are on the ledger under the build freeze. When the freeze lifts,
the highest-leverage cluster is the **social-attitude spine + caster discoverability** (BUG-17/18 + the
`cast`/spell-list gap) — small contract fixes with outsized payoff. Hold **CAL-1's across-the-board spice
question** for a design talk with Adam before touching lethality dials. Otherwise the pre-freeze backlog
(BUG-02 clock hotfix, the breach soak, CI wiring) stands as it was.

## Latest (2026-07-05 later-5 — Run 2 (Sella) + Fable bug-class sweep + THE FIX: 13 bugs closed) [Claude Code]

**Committed on `fix/event-source-enum` (3 commits); NOT yet merged to master — held for the merge
confirmation.** Full detail: CHANGELOG 2026-07-05 (later-5). Two things this session: **continued the
Sella playtest (Run 2, 10 turns)** and then **fixed the entire event/codex contract bug-class** those
playtests surfaced.

- **Run 2 (Sella, 10 turns, no engine change):** T1–T6 the memoryless-DM-every-turn codex-survival
  stress test, T7+ a warm persistent DM (production pattern). **Verdict — the machine works:** an AI DM
  comes in cold and stays un-confused off the digest+codex+ledger; narrative coherence held. The one
  seam was the DM's *interpreted notes* not persisting (BUG-06c). Save advanced to Day 2 (Run-1 archived);
  she's now the Circle's list-walker holding real leverage (Rell's suspected Iron-Strap ledger; a mapped
  night-route to Batgal). **Turns 11–20 are a clean fresh-session pickup** — kit in the save dir.
- **The Fable sweep → THE FIX:** the visible bug (BUG-01) was the tip of a class. Fable adjudicated a
  2-executor sweep, found **BUG-09 (CRITICAL — the entire inventory panel + level-up button were dead
  code)** + BUG-10..13, distilled 3 roots. Then, on Adam's go, **fixed all of it** (Fable spec → Opus
  execute → Opus gate). **13 bugs closed:** BUG-01, 06a–d, 08, 09, 10, 11, 12, 13.
  - **Root A** — `DM_EVENT_SOURCES` allow-list in `validateEvent` (+player,+branch); one change revived
    roll-branches AND all 7 dead player buttons.
  - **Root B** — a `DM_EVENT_FIELDS` census + `dmFoldPayload` (alias-fold after validate; unknown keys
    warn+drift-ledger, never dropped); digest clock key `id→clockId`.
  - **Root C** — codex `id-collision` refusal (no more silent-merge over an established record),
    `codex_update {note}`→`dm.notes[]`, missing-id reason.
  - **Observability** (why the class was invisible): probes now assert real state mutation (`applyMutates`)
    + standing ROOT-A/ROOT-B drift guards; verify-roll-branches got applied-ok checks.
- **Verification (independently re-run):** check-manifest OK; all targeted probes flip to resolved,
  BUG-02/03/04/05/07 unchanged (BUG-07 WAI); every green harness stays green; the 5 pre-existing red
  harnesses proven identical to clean master via a worktree baseline — **zero new regressions.**

**Do next (pick up here):** (1) **Confirm the merge** — `git merge --no-ff fix/event-source-enum` to
master + push (or run `/code-review` on the branch diff first). (2) The **still-open originals** BUG-02
(clock tick — the hotfix candidate), BUG-03 (digest current-HP), BUG-04 (non-lethal KO), BUG-05 (travel
event) — each a separate root, some need a design talk. (3) **Run 2 turns 11–20** (fresh session; the
save + seat prompt are in `dev/playtest-saves/sella-shimmering-maw/`).

## Latest (2026-07-05 later-4 — bridgeless playtest rig + the bugs it caught) [Claude Code]

**Committed on `feat/bridgeless-playtest-rig`; master green (check-manifest OK; harness + 8/8 bug
probes run).** Full detail: CHANGELOG 2026-07-05 (later-4). Adam asked for a **headless, bridgeless**
playtest — a player rolls a char, plays a session, and gets the story from both sides of the screen.
Built the AUTOMATED-PLAYTEST Layer-1 loop with the transport removed: two sealed **Sonnet** seats
(Player + DM) played through the **real engine in jsdom**, **Opus** stayed clerk/analyst.

- **The session — "The Shimmering Maw":** a con artist, **Sella Voss**, in a village hung on chains
  over a glass crater; a stolen hit-list, a patient antagonist (Corran Vale), a botched seal, a
  bearings-and-bridge escape, near-death at 1 HP, capture, and a dusk table-flip that earns her the
  epithet **"the Seam."** 12 turns, 7 checks, a complete arc. Two-lens report shipped as an artifact.
- **What it was FOR (Adam):** validation, not building. **No engine code changed.** Everything the run
  surfaced is a *future fix*, logged in the new **`docs/PLAYTEST-BUGS.md`**.
- **The headline catch — BUG-01 (CRITICAL):** last session's DM-Seam `validateEvent` (later-3, tests
  green) **regressed ROLL-BRANCHES** — `resolveBranch` stamps branch events `source:"branch"`, which
  the validator rejects, so *every* pre-authored branch consequence (HP/clocks/codex/epithets) no-ops.
  Both suites missed it because `verify-roll-branches` checks the event's *label*, not that state
  mutated (the mutation-test gap). Plus 7 more: no clock-advance event (hotfix candidate — clock should
  always tick, ≥6s/round in combat), digest hides current HP, no non-lethal KO, `discovery makeNode`
  doesn't move the PC, event field-name mismatches, `distant_word` ignores DM text.
- **The rig (built, kept):** `dev/playtest-bridgeless.mjs` (the harness), `dev/playtest-bug-probes.mjs`
  (a deterministic probe per caught bug — the running regression suite; `node dev/playtest-bug-probes.mjs`),
  `docs/PLAYTEST-BUGS.md` (the ledger), and `dev/playtest-saves/sella-shimmering-maw/` (**Sella
  preserved** — she continues in run 2).
- **World-variety flag (FIX-A):** "The Shimmering Maw" rolled two sessions running; probe measured ~30
  distinct settings/60 rolls with a mild skew — widen the pool + build the bardo-reincarnation repeat.

### Do next (pick up here)
1. **Run 2 — continue Sella** (Adam is setting it up): boot a **fresh DM seat with no conversation
   memory** and run her world purely from the codex + digest — a direct test of **how well the DM's
   codex survives play**. Save at `dev/playtest-saves/sella-shimmering-maw/` (README has the load
   recipe); she's alive at 1 HP owing two guilds, mid a 3-day deadline.
2. **BUG-01 fix** (critical, cheap): let `validateEvent` accept `source:"branch"` (or restamp in
   `resolveBranch`), then extend `verify-roll-branches` to assert the branch *mutated state*. Probe
   BUG-01 should flip to resolved.
3. **BUG-02 clock hotfix** (Adam flagged as candidate): a DM-reachable clock-advance path — combat
   ≥6s/round, distance + hand-waves pass minutes.
4. The rest of `docs/PLAYTEST-BUGS.md` in severity order.

---

## (2026-07-05 later-3 — the DM seam: typed contracts + structured telemetry) [Claude Code]

**Committed on `feat/dm-seam`; master green (check-manifest OK + the full verify set below).** Full
detail: CHANGELOG 2026-07-05 (later-3). A talk-then-build session — Adam asked whether he has the
chops for an AI-engineer job/contract, we drafted **docs/POSITIONING.md** (Genesis as the case
study; the "factory is the career" thesis, co-authored with Fable), and then built the two
production-maturity moves that doc named first:

- **Typed contracts at the AI↔engine seam** (`src/world/dm.js`) — `validateEvent` /
  `validateTurnResponse` machine-check the DM's typed events + whole turn response against
  EVENT-CONTRACT.md before the engine trusts them; JSDoc `@typedef`s; the full 87-type
  `DM_EVENT_TYPES` vocabulary held in lockstep with `applyEvent`'s switch by a parity test.
  Forward-compatible (unknown-but-well-formed types pass; malformed envelopes no-op, never throw).
- **Structured telemetry on the DM seat** — `logDmTurn` writes one row per turn (latency, lane+model,
  payload bytes in/out, applied event types, mint count, an *estimated* token/$ cost off measured
  bytes) → `GS.dm.telemetry` ring buffer + the bridge's new `POST /telemetry` → `.dm/telemetry.jsonl`
  (the mailbox-path twin of `seat-costs.jsonl`). Cost/latency *discipline* is now cost/latency
  *evidence* — the substrate for the "one-DM-turn walkthrough" case-study artifact.
- **Verification:** verify-dm-seam **38/0** (incl. a red-first parity + load-bearing mutation check);
  regression verify-dm-events 36/0 · verify-roll-branches 29/0 · verify-digest-diet 33/0 ·
  verify-combat-lifecycle 52/0 · verify-bridge.py 43/0.

**Do next (pick up here):** the standing DIRECTION-doctrine prize is unchanged — **a live breach
playtest soak on the new stage** (P1′ figures + dressed rooms + initiative UI + chase loop, felt
together). The DM-seam telemetry now means that playtest *produces data* — real per-turn latency/cost
rows in `.dm/telemetry.jsonl` to read afterward. Two cheap follow-ons the POSITIONING roadmap ranks
next: **wire CI** (a GitHub Action running check-manifest + the verify-*.mjs on every push) and build
the **one-DM-turn walkthrough** artifact off a real telemetry row. Adam's ledger rulings (grit /
CHASE-BITE / NEAREST_SUB) still open.

## (2026-07-05 later-2 — two code-review waves repaired + the Reference Shelf: Monster Manual & Wiki) [Claude Code]

**Everything committed + pushed to origin; working tree clean; master green (full verify sweep +
`check-manifest` OK).** Full detail: CHANGELOG 2026-07-05 (later-2). A large orchestrated session:

- **Two deep code-review waves, all repaired.** Wave 1 (the monster layer) fixed 5 units — the
  headline: two features (pet upkeep, creature-parley §1) were **dead code the verify harness
  masked** (it called them directly; nothing in-game did) — now wired at reachable paths; plus the
  flavor-first-fight gate, combat action-parse/traits-apply, and the render-profile mirror.
  Wave 2 was the **first-ever review of the ~9.4K-line battle-visual arc** (theater-boot/parts/
  figures/verbs) — fixed GPU-lifecycle bugs (shared-material corruption on hurt, undisposed texture
  cache, tween/FX surviving board swaps) + creature-builder determinism. All red-first, re-gated,
  landed.
- **The Reference Shelf shipped** (docs/REFERENCE-SHELF.md) — an expandable "Reference" section on
  the opening screen with two live apps: the **Monster Manual** (1817 creatures, lazy live-3D grid
  + detail viewer + alt-menu) and the **Wiki** (the design-doc wiki, compiled from
  **docs/ARCHITECTURE.md** — the new 51-system map of the whole machine — via `build/gen-wiki.py`).
  Built to expand: Props & Scenery is a future one-entry add.
- **Two skills hardened** with THE STASH LAW (after a stash-spill scare Fable audited — no work
  lost); clean-close now sweeps ARCHITECTURE/Wiki so the map never drifts from the code.

**Verification:** full `dev/verify-*.mjs` sweep green; `check-manifest` OK; `gen-wiki` byte-
idempotent; every fix unit proved red-first before landing. Byte-verified each wave's master tree
against its gated integration branch.

**Do next (pick up here):** (1) **The breach playtest soak** — the DIRECTION-doctrine prize:
creatures described/modeled/storied/recruitable, the render bugs fixed, and now a Monster Manual +
Wiki to inspect it all. Everything finally exists to *feel* it together. (2) Adam's standing ledger:
PACING-DIALS build · NPC-KNOWLEDGE-GRADES build · REALM-RENDER-STYLE §2 tune by eye. (3) Wave-3
fast-follows: Wiki per-system detail pages · alt-model authoring · Props & Scenery (shelf app #3).
(4) Optional: eyeball the Monster Manual grid + a Wiki page in a browser (the sandbox couldn't serve
localhost this session — harness-verified only, visuals unread by eye).

## Latest (2026-07-05 later — the wave's follow-on: Phase 2b, parley, render grade, the recovered merge) [Fable]

**Everything committed + pushed to origin; working tree clean; final sweep 96 harnesses / 0 failed.**
Full detail: CHANGELOG 2026-07-05 (later). The monster layer is now COMPLETE end to end. Since the
earlier close today:

- **Phase 2b landed** — all **1307 realm creatures** carry `traits` + a spice-graded **d8 flavorTable**
  + their OWN `treasure`/`habitat`/`activity` (184 prior theater-session traits preserved). Generator
  extended + fail-loud merge; `--check` clean 1307/11.
- **F4 flavor-d8 roll at mint** — rolled once, canon-locked, spice-clamped (`verify-flavor-d8` 15/0).
- **cmApplyTraits recovered + re-merged** — the traits apply-seam merge had been lost on a stray branch;
  recovered from the object store. Traits now go live in combat (rename/replace actions, authored
  mechanics override chassis within CR budget). This birthed the skill's **checkout law**.
- **MONSTER-PARLEY + THE ANOMALY LAW** — creatures recruitable but "difficult af": grind clamps at
  Friendly, `bondEligible` only via nat-20 / decisive lever / 3% friendly spawn; pet/hireling/sidekick
  tiers; befriended creatures recur (`verify-monster-parley` 58/0).
- **Render-style grade v1** + the bright-kingdom candy fix + the **profile-stamp architecture** that
  killed the dual-table mirror trap (`verify-theater-data` 242/0). 12-swatch review sheet committed.
- **Spec locks (build-ready, unbuilt):** MONSTER-FLAVOR-TABLES, NPC-KNOWLEDGE-GRADES, PACING-DIALS.
- `genesis-orchestrate` skill hardened with the wave's scars.

**Adam's open ledger (pick up here):** ① **NPC-KNOWLEDGE-GRADES build** (specced, executor died to a
throttle — relaunch; the "no omniscient NPCs" system: signs→rumor→named, rolled witnesses) ②
**PACING-DIALS build** (the §5 mechanisms — hot-open law, pressure injector, dry-streak escalator,
quiet-streak license; player-facing picker BANKED, tune one standard difficulty first) ③ **deep
`/code-review`** over the wave's accumulated diff (Monday post-token-refresh; ultra is Adam-triggered)
④ REALM-RENDER-STYLE fine-tune by eye (§2 warm-brown middle band) ⑤ the 11 `_review` CR flags in the
draft JSON ⑥ figure baked-vertex-color grading (render v2).

**Do next:** (1) **a live playtest in a breach** — realm creatures with descs + models + traits +
flavor + story-wiring + parley have NEVER been felt together; this is the soak DIRECTION calls for,
and everything now exists for it. (2) Adam's ledger above. (3) The seat program (latency law).

**Session-close note (2026-07-05 later):** the session ran long + messy (a rate-limit storm mid-Phase-2b
that killed ~12 batches, and the lost-then-recovered merge). Both are landed clean now; the mess is
documented so it isn't mistaken for instability — the gates are green and the tree is coherent.

## Latest (2026-07-05 — THE MONSTER PRODUCTION WAVE: described, storied, modeled, recruitable) [Fable]

**Everything landed + pushed (origin current at the close); final sweep 94/0; ~30 merges from
~120 background agents overnight.** Full detail: CHANGELOG 2026-07-05. The headline: every monster
in the game is now an individual — **1307 realm creatures** (desc on all; net-new model queue
EMPTY: 229 creature + 8 prop whole-object models landed across 7 judged waves) and **510 regular
monsters** (original desc + spice-graded d8 flavor table each, MM-2024 vision-grounded). The story
layer reaches them all: habitat/behavior/displaced flow to the DM digest, significant foes mint
codex records (custom-d10 rolls canon-locked at first mint), quest hooks name the destination's
actual threat, traits apply live in combat (cmApplyTraits, divergence licensed within CR budget),
and MONSTER-PARLEY + THE ANOMALY LAW make recruitment real but difficult af (grind clamps at
Friendly; bondEligible only via nat-20 / decisive lever / 3% friendly spawn; pet/hireling/sidekick
tiers). Reference layer: all five books have committed vision-verified page indexes
(dev/model-qa/*-page-index.json — see CLAUDE.md gotcha).

**Adam's open ledger:** ① **Phase 2b go/no-go** (realm traits at his 100% ruling + realm d8
tables + own treasure/habitat/activity for 1307 — ~2.5× the 510-corpus token spend; specs locked,
machinery proven, launches on his word — TOKEN-LEAN until Mon-eve refresh) ② REALM-RENDER-STYLE
tune ③ PACING-DIALS §3 (octane/lethality/drip + player-type presets — his "high octane" thread)
④ prop size→footprint veto row (REALM-PROPS-WIRING §3) ⑤ 11 `_review` flags in
realm-bestiary-draft.json ⑥ deep /code-review (+ ultra if wanted) Monday post-refresh.

**Do next:** (1) Adam's ledger above; (2) Phase 2b when authorized; (3) **a live playtest in a
breach** — realm creatures with descs + models + story wiring + parley have never been FELT
together (the soak DIRECTION calls for); (4) the flavor-d8 engine roll at mint
(MONSTER-FLAVOR-TABLES §4 F4 — small unit, stacks clean now); (5) the standing seat program.

## Latest (2026-07-04 later-3 — the REALM arc: 100% models, floors, figure AO, realm content + wiring) [Opus]

**Everything landed + pushed; master green (check-manifest OK · verify-theater-data 165/0 ·
verify-theater-figures 38/0 · verify-realm-wiring 20/0); working tree carries only dev tooling (this
close commits it).** A very large session that took the battle theater from "models exist" to "each
breach realm is a populated, floored, wired place."

**What shipped (all on master):**
- **Model coverage 32% → 100%** — 280 silhouette aliases + **66 net-new bespoke monsters**
  (docs/CREATURE-MODELS-P2.md; 56 via a Workflow fan-out). No cuboid fallbacks left.
- **17 procedural floor materials** (docs/FLOOR-TEXTURES.md) derived from rolled terrain + **baked
  figure AO** (on the models, per Adam's correction).
- **Realm content at scale (approach C, text-first, IP-clean):** bestiary **1092 creatures** (~100/
  realm) + a **legal familiar-icons batch** (219; PD source-versions + archetypes, source-tagged) +
  **88 surfaces** + **308 props** (cross-realm tagged). Docs: REALM-BESTIARY-{DRAFT,SCAN,ICONS},
  REALM-SURFACES-DRAFT, REALM-PROPS-DRAFT. **suburb LOCKED to 1980s Americana.**
- **The active-realm WIRING seam** (docs/REALM-WIRING.md) — breaches spawn the realm's creatures
  (filter + 18% adjacent leak); frame=stats/modelKey=render/name=realm; `data/realm-bestiary.js`. This
  seam also carries surface-select + the render grade.
- Proposals awaiting Adam: **REALM-RENDER-STYLE.md** (per-realm sat/tint/contrast/shape). Dream:
  **DREAM-HORIZON §H∞ "The Private Cut."**

**Do next (pick up here — Adam: "finish modeling, writing, and speccing the realm enrichment"):**
1. **MODELING** — the net-new geometry queue: **207 net-new creature models + 31 net-new prop
   models** (net-new floor bases already done). Build via the proven Workflow fan-out (spec pattern =
   CREATURE-MODELS-P2), gate visual wave sheets, land. Dedupe the cross-realm-`all` props first (build
   once, share) to shrink the 31.
2. **WRITING + STAT/DESCRIPTION pass** — review/reshape the drafts (BESTIARY-SCAN = fast read), fold
   the icons batch in, regenerate `data/realm-bestiary.js`; **then author per-creature stats +
   narratable descriptions** (curated off the SRD chassis — OGL-clean; original prose `desc`).
3. **STORY WIRING** — fold the realm creatures into the narrative layer: a breach foe mints/attaches a
   **codex** entry, and its `desc`/name/realm flows through `dwalkEncounter` → encounter → DM digest so
   the DM narrates the REALM creature (not the generic chassis) and it can recur/tie to factions.
4. **SPECCING** — Adam's ruling on **REALM-RENDER-STYLE** → spec the grade; **surface-select wiring**
   on the `activeRealmsFor` seam; the **prop-sizing render pass** (size → zone occupancy); **urban/
   wilderness creature-wiring** (dungeon done).

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
