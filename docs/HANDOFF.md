---
type: session-handoff
project: Genesis
updated: 2026-07-03
---

# Genesis — Session Hand-off

*Read this first in a new session. It orients you; the linked docs are the source of truth.*

## ⭐ Latest (2026-07-03 (later 7) — SESSION CLOSE: the G5 art loop, table doctrine, and a clean handoff) [Fable]

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
