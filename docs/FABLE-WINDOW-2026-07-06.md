---
type: session-runbook
project: Genesis
window: 2026-07-06 19:15–23:45 (Adam live, Fable seat)
status: PRE-STAGED 2026-07-05 — expires after the window; fold outcomes into HANDOFF/CHANGELOG then delete or archive
---

# FABLE WINDOW — Mon 2026-07-06, 7:15–11:45 PM

Adam has Fable for ~4.5 hours. Principle: **Fable only does frontier-locked work** — rulings
with Adam, spec-locking, DM prose, gating. Everything mechanical fans out to background
Sonnet/Opus executors (per `genesis-orchestrate`) that run in parallel.

**Timing bonus:** it's Monday post-token-refresh — the deep `/code-review` over the accumulated
wave diff was explicitly queued for exactly this window (HANDOFF later ledger item ③).

## Corrections vs. the plan as drafted (found during pre-stage)

- ✅ **`fix/event-source-enum` is ALREADY MERGED** to master (`1dbb984`) and pushed — HANDOFF
  later-5's "held for merge confirmation" is stale. No merge step needed at 7:15.

## Schedule

### 19:15–19:25 — Light the background fires (no rulings needed)
Spawn immediately, low/med-effort executors; they run all evening:
1. **CI wiring** — GitHub Action: `check-manifest.py` + full `dev/verify-*.mjs` +
   `dev/playtest-bug-probes.mjs` on every push. (NEXT-STEPS item 6; Sonnet-grade.)
2. **Deep `/code-review`** over the accumulated wave diff (Monday item; ultra stays
   Adam-triggered).
3. (Optional) **one-DM-turn walkthrough artifact** draft off a real telemetry row
   (`.dm/telemetry.jsonl`) — the POSITIONING killer exhibit; Fable polishes prose at gate time.

### 19:25–20:10 — The ruling batch (Adam live; decisive answers = build authorization)
Agenda in §Rulings below. Every ruling converts directly into a locked spec unit.

### 20:10–21:00 — Spec-lock + fan out
Fable finalizes the spec skeletons (§Spec below) per the rulings, to the 6-point Sonnet-ready
rubric (+7th: mutation-test regression checks — the BUG-01 lesson). Executors launch in
background. Fable never executes directly.

### 21:00–22:45 — The breach playtest soak (the DIRECTION prize)
Adam plays live; Fable DMs. First time realm creatures (desc+model+traits+flavor+parley) +
dressed rooms + initiative UI are FELT together. Kit checklist in §Playtest below.
Every turn produces telemetry; the transcript supplies fixture exchanges for SEAT-PROMPT.md.

### 22:45–23:30 — Re-gate and land
Fable personally re-gates every executor unit (never trust self-reported green): red-first
proof, probe suite (`node dev/playtest-bug-probes.mjs`), full verify sweep, `check-manifest`,
then `--no-ff` merges. If the playtest was strong: first SEAT-PROMPT.md distillation pass off
tonight's turns (frontier-locked artifact, spec-moratorium-exempt per DIRECTION §3.4).

### 23:30–23:45 — Clean close
`/genesis-clean-close`: CHANGELOG + HANDOFF + NEXT-STEPS together, push, batch leftover ledger.

## §Rulings — the agenda (each parked "needs Adam")

1. **Freeze lift for the social-spine cluster?** Standing freeze = "harness/testing yes,
   building no" (later-6). The BUG-17/18 + caster-discoverability units are contract FIXES to
   filed bugs, not new subsystems — recommend lifting for this cluster only. DIRECTION §8's
   "attitude/parley waits" refers to the NEW subsystem build, not repairing the existing spine.
2. **CAL-1 confirmation → seat-prompt language.** Adam already ruled (failed suicide-mind-control
   save LANDS; the save is the mercy, not the narration after it). Tonight: bless the exact
   seat-prompt guidance line so it ships in the BUG-17 prompt-alignment unit.
3. **⏸ Across-the-board spice/lethality raise?** Parked off CAL-1, explicitly "do not act."
   This is the design talk it was parked FOR. Options: rule now / park until soak-5 data /
   fold into PACING-DIALS when it builds.
4. **BUG-02 clock semantics** (hotfix candidate): combat ≥6s/round; how much do distance +
   hand-waves advance? Ruling → the hotfix unit joins tonight's queue.
5. **Quick picks (batch, ~10 min):** grit (zoom4x) · CHASE-BITE design pick · NEAREST_SUB
   taste · Frame-field schema (unblocks Frontier + Noir mythic re-proposals, Batch C).
6. **BUG-03/04/05 scope check:** digest current-HP (BUG-03) is contract-mechanical — fold into
   tonight's queue? BUG-04 (non-lethal KO) + BUG-05 (travel event) may need more design than the
   window allows — default: spec-note and defer.
7. **Future dev-tools mega-agenda (spec only; no build auth tonight):** skim `docs/FABLE-DEV-TOOLS.md`. Adam has
   already ruled the headline shape: Table Atlas is a Reference Shelf companion to MM/Wiki; list
   any table connection; count rolls per table from test sessions; let Fable choose the telemetry
   storage seam; dream endpoint is true in-browser writability; order is Table Atlas → NPC Library
   → Town Builder → Building Builder. New rulings: combat state diagram is an overlay on the 3D
   theater with movement/range preview + inspect cards; item plaques can reveal legendary facts
   through appraisal/lore/bards/merchants; table heatmaps may carry dev flags; town scaffold and
   true in-browser writing are Fable-spec candidates; player authoring in pre-alpha is part of the
   product thesis. Tonight's Fable work is to turn that into executable spec guardrails, not to
   reopen the shelf/product question.

## §Spec — skeletons for the executor queue (finalize after rulings)

> These are FIX specs for filed bugs (PLAYTEST-BUGS.md), pre-staged under the freeze;
> nothing here builds until Adam's go at the ruling batch. Code refs verified 2026-07-05.

### Unit S1 — BUG-17: `attitude_shift` contract repair (field + value-type drift)
- **Faults (both must fix; ledger, code-verified):** (a) `DM-SEAT-PROMPT.md` says `id`, handler
  reads `target` → verbatim-prompt events no-op to the drift line. (b) Prompt says string
  `"friendly|neutral|hostile"`, `codexSetAttitude` needs int −2…2; `Number("hostile")||0 → 0`.
- **Fix shape:** handler accepts BOTH `id` and `target` (alias-fold, Root-B pattern from
  `dmFoldPayload`) AND maps attitude strings→ints (hostile:-2, unfriendly:-1, neutral/
  indifferent:0, friendly:1, helpful:2) while still accepting raw ints. Align the seat-prompt
  line to the canonical form. Also fold the minor `concentration_broken {spell}` drift (same
  class, same unit).
- **Red-first:** probe emits a verbatim-per-prompt `attitude_shift {id, to:"hostile"}` and
  asserts `status.attitude.value` MOVED (mutation check, not label check).
- **Code refs:** handler `src/world/dm.js:2573–2582` (reads `p.target`, passes `p.to` raw);
  accept list `dm.js:1280` (`["cause","target","to"]` — add `id` alias);
  `codexSetAttitude` `src/world/codex.js:223–233` → `attitudeClampInt` does `Number(value)||0`
  (the string→0 fault); ladder `codex.js:194` (`-2 Hostile … +2 Helpful`); attitude stored at
  `r.status.attitude` with per-NPC `floor`/`ceiling` clamps (respect them in the mapping).

### Unit S2 — BUG-18: `social_check` fiction-DC threading
- **Fault:** resolver grades the raw total vs the engine's internal `socialDC(a.value)`
  (dm.js:2507), decoupled from the DM's narrated DC → attitude promoted on a narrated miss.
- **Fix shape (pick at ruling):** thread an optional `dc` field through `social_check` (DM
  supplies the fiction DC; falls back to internal `socialDC` when absent) + seat-prompt rule:
  don't emit `social_check` on a narrated near-miss/fail. Degrees-of-failure grading stays
  MARGIN-based (near-miss tight — Adam's calibration).
- **Red-first:** emit `social_check` total 18 with `dc:20` on a Friendly NPC → assert NO
  promotion; same total without `dc` → current behavior preserved.
- **Code refs:** resolver `src/world/dm.js:2507` (`applyLeverage(socialDC(a.value), levers)`);
  accept list `dm.js:1279` has NO `dc` field — add it; internal ladder
  `src/engine/social.js:15` (`-2:25, -1:20, 0:15, 1:10, 2:null` — a Friendly NPC is always
  DC 10 regardless of what the DM narrated).

### Unit S3 — Caster discoverability (the "highest-value caster fix")
- **Gap (not a bug — enforcement is proven built):** seat prompt never documents
  `cast`/`slot_spent`; digest ships slot COUNTS but not the known-spell list, so a memoryless
  DM never emits `cast` and can't verify spell knowledge.
- **Fix shape:** (a) digest pc block gains `cantrips` + `spells` (known/prepared list — keep it
  lean, names only, respect the digest diet; measure bytes before/after). (b) Seat prompt gains
  the `cast {spell, level}` contract + the slot-refusal semantics. (c) BUG-17's visibility
  note folds in here.
- **Red-first:** digest snapshot asserts spell list present for a caster PC and ABSENT
  overhead for a martial; verify-digest-diet stays green with the byte budget noted.
- **Code refs:** digest builder `src/world/dm.js:270–374` →
  `resourceDigest` `src/engine/resources.js:163–173` (ships `slots {1:"2/4",…}`; the sheet's
  `sh.cantrips`/`sh.spells` are never serialized — that's the add); `cast` handler
  `dm.js:1897–1924` (ritual skips the slot, cantrip has no `p.level`); `slot_spent`
  `dm.js:1887–1895`; `spendSlot` `resources.js:114–120`. Seat prompt: the event vocabulary
  (`DM-SEAT-PROMPT.md` §events) lists `attitude_shift` but not `cast`/`slot_spent`.
- **Design nuance (respect it):** teaching `cast` = documenting the EVENT for the DM's
  vocabulary. It does NOT license coaching the player — DM-CHARTER line 67 ("no 'you could
  cast X'") stands untouched. The DM learns to *record* casts, never to *suggest* them.

### Unit S4 — BUG-02 clock hotfix (only if ruled tonight)
- DM-reachable clock-advance path: combat ≥6s/round auto; travel/distance and hand-wave
  passes per Adam's ruling. Red-first: probe BUG-02 flips to resolved.

### Unit S5 — BUG-03 digest current-HP (fold-in candidate, tiny)
- Digest pc block shows current/max HP. Red-first: digest snapshot assertion.

**Queue order:** S1 → S2 (S2 touches the same resolver; serialize) · S3 ∥ S5 parallel ·
S4 independent. Every unit: mutation-asserting probe + the standing drift guards stay green.

## §Playtest — breach-soak kit checklist

- **Bridge, not plain server:** `python3 dev/dm-bridge.py` (serves app + mailbox). Runbook:
  `docs/DM-BRIDGE.md`. Skill: `genesis-playtest-rig` (bridge in background, DM loop in-session,
  complaints catcher + hotfix lane).
- **NEVER run `verify-bridge.py` during the live session** (it resets the .dm mailbox).
- **Telemetry is live:** every turn logs to `GS.dm.telemetry` + `.dm/telemetry.jsonl` —
  read it at close; run `session-cost-report.py --seat` after (SPEED rule 6).
- **Charter discipline:** DM-CHARTER voice · never roll the player's dice · verbatim player
  dialogue · open handoff, no coaching · margin-based degrees of failure (near-miss TIGHT) ·
  CAL-1 (failed save LANDS) if blessed at the ruling batch.
- **Goal of the soak:** friction ledger entries + felt-together verdicts (creatures, rooms,
  initiative UI, parley if it comes up naturally) — DIRECTION §3.3 says session friction
  drives all subsequent build order.
- Save/kit if continuing Sella instead of a fresh breach PC:
  `dev/playtest-saves/sella-shimmering-maw/` (turns 11–20 are a clean pickup). Default is a
  FRESH breach-focused session; Sella is the fallback if setup fights us.

## Not tonight (explicitly out)
Craft/re-authoring pass (Adam's hands) · Wiki detail pages · Props & Scenery · env waves W+U ·
anything DIRECTION §8 freezes that didn't get an explicit lift at the ruling batch.

Future dev tools (`docs/FABLE-DEV-TOOLS.md`) are **discussion/queue only** in this window unless
Adam explicitly promotes one to a post-freeze spec/build unit.
