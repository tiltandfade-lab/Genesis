---
type: build-spec
project: Genesis
status: SPEC — ready for Sonnet execution (no code written yet)
wave: HQ3-B
authored: 2026-07-07
sources: dev/playtest-0707/FINDINGS.md (SET-08-F1/F2, SET-02-F2, SET-01-F1, SET-12-F1); docs/PLAYTEST-BUGS.md
depends-on: fix/event-source-enum (Root A/B/C — MERGED), SOCIAL-SPINE-FIXES §S1/S2 (MERGED), HQ2-1 num-fold (MERGED)
---

# HQ3-B — combat-XP / branch-seam / triage cluster

Four independent units off the 2026-07-07 marathon. **B1** (HIGH) closes a live XP exploit
(flee-or-lose a fight, still collect encounter XP). **B2** (LOW) seals combat_end's last
field-drift. **B3** (MED) makes a branch-carried `social_check` grade against the *live* die.
**B4** (LOW, cost-only) trims two triage false-positives without building an NLU.

Each unit is self-contained; they touch disjoint symbols and may be built in any order or in
parallel. Every unit respects the two binding disciplines: **normalization lives at the contract
boundary (`DM_EVENT_FIELDS`/`dmFoldPayload`), never per-handler** (B2), and **XP economy numbers
live in `src/engine/advancement.js`, priced off the retune tunables** (B1).

---

## Adam's ledger (defaults taken, overridable)

These are decisive defaults so the executor has **zero open design questions**. Adam can veto any
line; absent a veto, build exactly as written.

1. **B1 — the encounter-XP payout matrix (by `combat_end` outcome):** a win pays, a non-win does not.

   | outcome | multiplier | meaning |
   |---|---|---|
   | `resolved` | 1.0 | foes down / you won (the default) |
   | `surrender` | 1.0 | foes yield to you |
   | `negotiated` | 1.0 | talked down in your favor |
   | `fled` | 1.0 | the **foes** flee — you drove them off |
   | `aborted` | **0** | broken off / PC disengaged / **PC captured** |
   | `pc-dead` | **0** | the PC fell |
   | `captured` / `pc-captured` | **0** | (aliases of aborted's intent) |
   | *(any unknown outcome)* | 1.0 | forward-compat; the empty-foes gate (below) still protects |

2. **B1 — the real root fix (the load-bearing half):** encounter XP prices **strictly off foes
   actually downed**. The flat per-tier fallback in `encounterResolvedXp` must fire **only when
   `foes.length > 0` but the foes carry no CR** (the legit "narratively-resolved CR-less fight"
   case) — **never when `foes.length === 0`** (nobody down). The matrix in (1) is belt; this gate
   is suspenders. Downed foes always pay their real CR-XP regardless of outcome (you earned the
   kills; the decay guard already caps farming). Net effect: fled/aborted/pc-dead/pc-captured with
   0 foes down → **0 XP**; a genuine win with real kills → unchanged.

3. **B1 — no new advancement tunables beyond the matrix.** The matrix is a new named const
   `ENCOUNTER_OUTCOME_MULT` living beside `XP_TUNE`; it is a gate/mult, not a re-tune of the
   §0-locked E(L) numbers. Do not touch `XP_TUNE`, `CR_XP`, or `XP_THRESHOLDS`.

4. **B2 — accept a free-text `reason` (and alias `note→reason`) on `combat_end`.** It is
   documentation-only from the engine's view; the handler folds it into the combat-end ledger
   **detail** object (not the prose) so it is captured, not dropped, and never burns a drift line.

5. **B3 — inject the live d20 total into branch `social_check` payloads.** In `resolveBranch`,
   any branch event of type `social_check` gets `payload.total` (and `payload.natural`) **overwritten
   with the live resolved roll** (the `total`/`rolls[0].result` the resolver already holds). The
   authored literal is discarded. The seat prompt is also told to **omit `total` in branch
   social_checks** (it can't know the die). Injection is the enforcement; the prompt note is hygiene.

6. **B4 — FIX IT (light), do not merely tolerate.** Ship **negation-scoping only**: a combat verb
   immediately preceded (within a small window) by a negator (`no`, `not`, `don't`, `never`,
   `without`, `n't`) does **not** raise `combat-action`. Do **not** build quote/dialogue-context
   downweighting — under-routing a real oblique threat delivered in-character is worse than the
   cheap over-route. **Explicit tolerated-false-positive list (accepted, not fixed):** a real combat
   verb inside quoted NPC dialogue that is *not* negated (e.g. a quoted threat) still routes deep;
   a violence **noun** with no verb (`saboteur`, `knife`, `dagger`) does **not** currently trip
   `combat-action` at all (verified — `DM_COMBAT_VERBS` is verb-only) and needs no change. Rationale:
   the classifier is a coarse pre-model cost router; a false-positive only overspends, never breaks
   correctness — so the fix ceiling is one regex guard, no parser.

---

## HQ3-B1 · gate encounter XP on a real win + document combat_end/outcome  (HIGH)

### The bug (verified)
`combat_end` (dm.js:1900) defaults `outcome` to `"resolved"` (line 1903) and calls
`combatOutcomeEvents(GS.combat,{outcome,method})` (combat.js:981). That helper prices the
`encounter_resolved` payload's `foes` off **downed foes only** (`down = foes.filter(f=>f.down)`,
combat.js:984) — correct. But when **zero foes are down**, it emits `foes:[]`, and the XP math in
`encounterResolvedXp` (advancement.js:148-162) hits its fallback:

```js
const base = sum || (XP_AWARDS.encounterObjectivePerTier*tier);   // advancement.js:158
```

With `foes:[]`, `sum===0`, so `base` becomes the flat per-tier award (`100 * tier`). For a Tier-2
PC that is `200`; with an `objectiveRef` present the `×1.25` bonus makes **250** — the observed
`+250` on a fled fight (SET-08-F1, set-08 T2). An `outcome:"aborted"` (the PC's own capture) hits
the same fallback and, decayed `×0.5` for a repeat (band,node), paid the observed **+125** (set-08
T5). The fallback was designed for "foes present but CR-less," not "nobody down" — that conflation
is the seam. `encounterResolvedXp` never reads `p.outcome` at all today.

### Files + symbols + insertion points

**A. `src/engine/advancement.js`** — the fix lives here (XP economy, per discipline).

1. **New const, beside `XP_TUNE` (after line 43):**
   ```js
   /* HQ3-B1 — encounter XP is a WIN reward. combat_end's outcome gates the payout: a non-win
      (broke off / captured / fell) pays no encounter XP even if the fallback would. Downed foes
      still pay their real CR-XP through the foes[] array regardless (you earned those kills); this
      only governs the encounter-level award + the CR-less fallback. Unknown outcomes → 1.0 (the
      empty-foes gate below still blocks the fallback exploit). */
   const ENCOUNTER_OUTCOME_MULT = {
     resolved:1, surrender:1, negotiated:1, fled:1,
     aborted:0, "pc-dead":0, captured:0, "pc-captured":0
   };
   function encounterOutcomeMult(outcome){
     const m = ENCOUNTER_OUTCOME_MULT[outcome];
     return (m==null) ? 1 : m;   // unknown/absent → full; the empty-foes gate is the real backstop
   }
   ```

2. **`encounterResolvedXp` (advancement.js:148-162)** — two edits:
   - Gate the fallback to a non-empty foes array (line 158):
     ```js
     // BEFORE:  const base = sum || (XP_AWARDS.encounterObjectivePerTier*tier);
     // AFTER:
     const base = foes.length ? (sum || (XP_AWARDS.encounterObjectivePerTier*tier)) : 0;
     ```
     (When `foes.length===0`, `base=0`; the CR-less fallback still fires for `foes.length>0 && sum===0`.)
   - Fold the outcome multiplier into `full`/`paid` (lines 159-160):
     ```js
     const om   = encounterOutcomeMult(p.outcome);
     const full = Math.round(base * bonus * om);
     const paid = Math.round(base * bonus * om * mult);
     ```
   `p.outcome` is already on the `encounter_resolved` payload (accept-listed, dm.js:1503; set by
   `combatOutcomeEvents`, combat.js:992). No payload/plumbing change needed.

**B. Export for the harness** — confirm `encounterOutcomeMult` (or at least the const) is reachable
   from jsdom the same way `encounterResolvedXp`/`crXp` are (they are top-level `function`/`const`
   in global scope — no change needed; the verify harness reads `win.encounterResolvedXp` directly).

**C. `combatOutcomeEvents` (combat.js:981) — NO code change.** Its `down` filter is already correct;
   the fix is downstream in the pricing. Leave it. (Do not "fix" it by adding fled foes back — that
   would re-open the grind vector its comment guards.)

### The seat-prompt documentation diff (combat_end + outcome)
The seat prompt's `### Common event types` region is **generated** (build/gen-dm-contract.py →
DM-CONTRACT:EVENTS markers). Do not hand-edit inside the markers. Instead:

1. **`build/gen-dm-contract.py`** — add `"combat_end"` to `PROMPT_TAUGHT` (line 185-190), right
   after `"combat_start"`. Its example already exists in `dm-contract.json`
   (`"combat_end": {"outcome": "resolved"}`, line 43). The accept fields (`method`, `outcome`, and
   B2's new `reason`) are read from `DM_EVENT_FIELDS` by the generator.
2. **Regenerate:** `python3 build/gen-dm-contract.py` (rewrites both PROMPT_TARGETS; the second,
   `docs/SEAT-PROMPT.md`, exists — both get the new line).
3. **Hand-authored guidance** (OUTSIDE the generated region — append after the `combat_start` note
   block, near DM-SEAT-PROMPT.md:117): add
   ```md
   - `combat_end` `{payload:{outcome:"resolved"}}` — end a fight. **`outcome` gates encounter XP:**
     `resolved`/`surrender`/`negotiated`/`fled` = a win → foes you downed pay their XP; `aborted`
     (you broke off or were captured) and `pc-dead` pay **no** encounter XP. A fight you fled or lost
     is not an XP source — omitting `outcome` defaults to `resolved`, so declare the honest outcome.
     Optional free-text `reason` is recorded, never graded.
   ```

### Acceptance criteria
- A `combat_end` with **0 foes down** grants **0 encounter XP** for every outcome (`resolved`,
  `fled`, `aborted`, default/omitted).
- A `combat_end` after downing all foes still grants full CR-XP (existing behavior, verify-combat-
  lifecycle check 4c stays green).
- `outcome:"aborted"`/`"pc-dead"`/`"captured"` grant 0 even when foes ARE down (non-win gate).
- A `foes:[{cr:5}]` `encounter_resolved` (CR present) is unchanged (verify-xp-retune 121-125 green).
- A `foes:[{victimClass:"monster"}]` (present, CR-less) still pays the flat fallback (legit case).
- The seat prompt's generated region now lists `combat_end`; the hand-authored outcome note is present.

### Verify plan
- **Extend `dev/verify-xp-retune.mjs`** — new block "§HQ3-B1 outcome gate":
  - `encounterResolvedXp({foes:[], outcome:"resolved"}, 5, {}).paid === 0` (the +250 killer).
  - same for `outcome:"fled"` and `outcome` omitted → `0`.
  - `encounterResolvedXp({foes:[{cr:3}], outcome:"aborted"}, 5, {}).paid === 0` (non-win gate with a real foe).
  - `encounterResolvedXp({foes:[{cr:3}], outcome:"fled"}, 5, {}).paid === crXp(3)` (a win with a kill still pays).
  - `encounterResolvedXp({foes:[{victimClass:"monster"}], outcome:"resolved"}, 5, {}).paid > 0` (CR-less fallback preserved).
  - Re-run the existing objectiveRef checks (121-125) unchanged → green.
- **Upgrade `dev/verify-combat-lifecycle.mjs` block 5 (lines 214-232)** — this block's comment
  (216-219) currently *documents the bug as intended*; rewrite it and harden:
  - Rewrite the NB comment: the empty-foes fallback is now gated → a fled fight pays **0 overall**.
  - New **5e**: capture `world.characters[0].sheet.xp` before the `combat_end{fled}`; assert it is
    **unchanged** after (the mutation anchor — the exact SET-08-F1 exploit).
  - New block **5g**: `combat_end{outcome:"aborted"}` from a 2-goblin fixture (0 down) → PC XP
    unchanged; and `combat_end` with **no** outcome (0 down) → PC XP unchanged.

### Mutation-test regression checks (what goes RED if reverted)
- Revert the `foes.length ?` gate → verify-combat-lifecycle **5e** (PC XP flat on fled) and the
  verify-xp-retune empty-foes checks flip RED.
- Revert the `encounterOutcomeMult` fold → verify-xp-retune "aborted with a real foe → 0" flips RED.
- Break the seat-prompt regen → `build/check-manifest.py` is unaffected, but a grep-assert in the
  verify block (`combat_end` present in the generated region) flips RED (add it).

---

## HQ3-B2 · accept a free-text `reason`/`note` on combat_end  (LOW)

### The bug (verified)
`combat_end`'s accept map is `{accept:["method","outcome"]}` (dm.js:1444). A DM's intuitive
`payload.reason` is neither accepted nor aliased → `dmFoldPayload` **keeps it but warns + burns one
`recentLedger` slot on a `payload-drift` line** (SET-08-F2, set-08 T2). BUG-16 contract-drift class,
on the combat lifecycle.

### Files + symbols + insertion points
**`src/world/dm.js` — `DM_EVENT_FIELDS.combat_end` (line 1444), one edit:**
```js
// BEFORE:  combat_end:        { accept:["method","outcome"] },
// AFTER:
combat_end:        { accept:["method","outcome","reason"], alias:{ note:"reason" } },
```
This is the **only** normalization site (per the boundary discipline — no handler-side coercion).
`reason` becomes an accepted free-text field; `note` is aliased onto it.

**`src/world/dm.js` — combat_end handler (`addLedger` call, line 1917):** thread `p.reason` into the
ledger **detail object** (not the prose) so it is captured, not inert:
```js
addLedger(w,"outcome",{kind:"combat-end",outcome,method,downed:downCount,fled:fledCount,
  minutes:combatMin, ...(p.reason?{reason:String(p.reason)}:{}), source:src}, "⚔ The fight ends — "+...);
```

### Acceptance criteria
- `combat_end {outcome:"fled", reason:"the PC ran"}` produces **no** `payload-drift` ledger line.
- The combat-end ledger entry's detail carries `reason:"the PC ran"`.
- `note` is accepted and lands as `reason` (alias fold).
- `method`/`outcome` behavior unchanged.

### Verify plan
- **Extend `dev/verify-combat-lifecycle.mjs`** (new block or fold into block 5): after a
  `combat_end{outcome:"fled", reason:"…"}`, scan `world.dm.ledger` (or wherever `addLedger` writes)
  for the last `kind:"drift"`/`payload-drift` entry and assert **none was added for this event**;
  assert the `kind:"combat-end"` entry carries `reason`.
- Optionally cover it in `dev/verify-event-num-fold.mjs` / a `DM_EVENT_FIELDS` census check if one
  asserts accept-map completeness (grep for `combat_end` there first).

### Mutation-test regression checks
- Revert the accept-map edit → the drift-line-absent assertion flips RED (the drift line returns).

---

## HQ3-B3 · inject the live d20 total into branch social_checks  (MED)

### The bug (verified)
In a `rollRequest.branches` resolution, the harness rolls the real d20 to **select** the branch, but
a branch's authored `social_check` event carries a **pre-authored literal `total`** the DM wrote
blind. `resolveBranch` (dm.js:843) applies branch events as-authored
(`events=(branch.events||[]).map(e=>Object.assign({},e,{source:"branch"}))`, line 865). The
`social_check` handler grades attitude against `p.total` (dm.js:2985, inside `resolveSocialCheck({…
total:p.total …})`). Nothing enforces that the literal agrees with the die that selected the branch
(SET-02-F2) — same *class* as BUG-18, vector = the branch pipeline.

### Files + symbols + insertion points
**`src/world/dm.js` — `resolveBranch` (line 865), replace the events map** so branch `social_check`
events get the **live** roll spliced in (the function already holds `total` (the resolved total) and
`rolls[0].result` (the natural)):
```js
// BEFORE:
//   const events=(branch.events||[]).map(e=>Object.assign({},e,{source:"branch"}));
// AFTER:
const _liveNat=(rolls&&rolls[0]&&rolls[0].result)|0;
const events=(branch.events||[]).map(e=>{
  const ev=Object.assign({},e,{source:"branch"});
  if(ev.type==="social_check"){
    // HQ3-B3: the branch was SELECTED by the live d20 — grade the committed attitude shift against
    // that die, not the DM's blind literal. Clone the payload (never mutate the authored branch),
    // override total + natural; leave dc/skill/target/levers as authored.
    ev.payload=Object.assign({}, ev.payload, { total: total, natural: _liveNat });
  }
  return ev;
});
```
- **Cloning `ev.payload`** is required — the authored `branch.events[i].payload` must stay pristine
  (a re-render / re-resolution reads the original `rq`).
- Leave the fold/apply loop (lines 867-875) untouched; the injected values flow through `applyEvent`
  → the `social_check` case → `resolveSocialCheck`. `dmFoldPayload` runs inside `applyEvent` and
  will `num`-coerce `total`/`natural` as usual (both are tagged, dm.js:1494) — passing numbers is a
  no-op there.

### The seat-prompt note (hygiene, not enforcement)
**`dev/playtest-saves/sella-shimmering-maw/DM-SEAT-PROMPT.md`** (hand-authored social_check block,
~lines 111-116) — append:
```md
- **In a rollRequest branch, OMIT `total` on a `social_check`** — the engine grades it against the
  live die that selected the branch, so any literal you write is overwritten. Carry `dc`, `skill`,
  `target`, and `lever(s)`; leave `total`/`natural` to the roll.
```
(Injection is the guarantee; this only stops the seat wasting a field.)

### Acceptance criteria
- A branch `social_check` authored with `total:5` resolves (branch selected by a live total of, say,
  22) → the applied event grades against **22**, not 5 (`status.attitude` moves per the live die).
- A branch with **no** `social_check` is unaffected (the map only rewrites that one type).
- `dc`/`skill`/`target`/`levers` on the branch social_check are preserved.
- The authored `rq.branches[k].events[i].payload.total` literal is **not** mutated in place.

### Verify plan
- **Extend `dev/verify-roll-branches.mjs`** — new block after the existing success/nearMiss/fail
  blocks (the harness already stubs fetch and drives `resolveBranch` via the real roll path):
  - Author a `rollRequest` whose `success` branch carries
    `{type:"social_check", payload:{target:"npc:…", skill:"Persuasion", total:5, dc:15}}` on a target
    seeded in the codex with a known attitude.
  - Drive a roll that resolves `success` with a live total well above 5 (e.g. 22).
  - Assert the **applied** event's payload `total === 22` (read `last.events`/`last.applied`, the
    block already inspects these), and that the codex attitude moved as the live 22 dictates.
  - Assert the source `rq.branches.success.events[0].payload.total` is **still 5** (no in-place mutation).

### Mutation-test regression checks
- Revert the injection (restore the plain `Object.assign` map) → the "applied total === 22" and the
  "literal still 5 / attitude matches live die" assertions flip RED (grades against the stale 5).

---

## HQ3-B4 · light negation-scoping in dmTriage  (LOW, cost-only)

### The bug (verified)
`dmTriage` raises `combat-action` whenever `DM_COMBAT_VERBS` matches the raw action
(triage.js:39). The regex (triage.js:20) is verb-only (`attack|…|lunge|lunges|grapple|smite|
disarm` + `cast … at`), so a **negated** violence clause still trips it: SET-12-F1's
*"I lunge and headbutt … AND I make no move toward him at all"* routed `deep` on `"lunge"` despite
being self-negated; a griefer can force the pricier opus lane with *"I do NOT attack"*. Harmless to
correctness (lanes only route cost/model tier), but a real cost false-positive. (Note: violence
**nouns** — `saboteur`, `knife` — do **not** match the verb-only regex and need no change; the
FINDINGS "combat noun" framing conflates a noun in a quote with a real verb elsewhere in the line.)

### Ruling: FIX (light) — negation-scoping only, no NLU, no quote downweighting. (Ledger item 6.)

### Files + symbols + insertion points
**`src/world/triage.js` — the `combat-action` branch (line 39)**, replace the bare `.test`:
```js
// BEFORE:  if (DM_COMBAT_VERBS.test(txt)) reasons.push("combat-action");
// AFTER:
// C — the action itself opens violence. HQ3-B4: skip a violence verb whose nearest preceding word
//     is a negator ("I make no move", "I do not attack", "without striking") — a self-negated
//     clause is not an attack. Coarse by design (a cost router, never a correctness gate): scan
//     each verb hit and require it NOT be immediately negated within a short window.
if (combatActionAsserted(txt)) reasons.push("combat-action");
```
Add the helper (module-scope, above `dmTriage`, near the regex consts line 20-21):
```js
// HQ3-B4 — negation scope. A combat verb is "asserted" unless a negator sits within the ~3 tokens
// immediately before it. Deliberately tiny: no dependency parse, no clause splitting — one lookbehind
// window over the matched verb. False-positives that survive this (a NEGATED verb far from its
// negator, or a quoted un-negated threat) are TOLERATED (see spec §B4 ruling).
const DM_NEGATORS = /\b(?:no|not|n't|never|without|nor|hardly|dont|don't|doesnt|doesn't)\b/;
function combatActionAsserted(txt){
  const re=new RegExp(DM_COMBAT_VERBS.source, "g");
  let m;
  while((m=re.exec(txt))!==null){
    const pre=txt.slice(Math.max(0, m.index-24), m.index);   // ~3-4 words of lookbehind
    const preWords=pre.split(/[^a-z']+/).filter(Boolean).slice(-3).join(" ");
    if(!DM_NEGATORS.test(preWords)) return true;             // this hit is asserted → combat-action
  }
  return false;                                              // every hit was negated
}
```
- `DM_COMBAT_VERBS` stays the single source of truth (the helper reuses `.source` with a `g` flag —
  do not duplicate the pattern).
- Nothing else in `dmTriage` changes; `combat-active` (live GS.combat) and `pc-*` reasons are
  untouched, so an actual fight still routes deep even with a negated verb in the line.

### Tolerated-false-positive list (documented, NOT fixed)
- A real, **un-negated** combat verb inside quoted NPC dialogue → still `deep` (accepted: an oblique
  in-character threat *should* be able to route deep; under-routing it is worse than overspending).
- A violence verb negated by a distant negator outside the 3-token window → may still trip (accepted).
- Violence **nouns** with no verb (`saboteur`, `knife`, `dagger`) → never tripped `combat-action`
  (no change; verified verb-only regex).

### Acceptance criteria
- `"I make no move toward him at all."` → **no** `combat-action`.
- `"I do not attack anyone."` → **no** `combat-action`.
- `"I lunge and stab the guard."` → `combat-action` (real attack still routes deep).
- `"cast fire bolt at the wolf"` → `combat-action` (the cast-at branch unaffected).
- `"He called me a saboteur and shook a knife."` (nouns, no verb) → **no** `combat-action`
  (unchanged behavior; confirms nouns were never the trip).
- All existing verify-triage assertions (lines 47-93) stay green.

### Verify plan
- **Extend `dev/verify-triage.mjs`** (fold into the combat-action section, ~lines 62-73):
  - `T(mkWorld(), "I make no move toward him.")` → `!reasons.includes("combat-action")`.
  - `T(mkWorld(), "I do not attack anyone.")` → `!reasons.includes("combat-action")`.
  - `T(mkWorld(), "I lunge and stab the guard.")` → `reasons.includes("combat-action")`.
  - `T(mkWorld(), "He called me a saboteur and shook a knife.")` → `!reasons.includes("combat-action")`.
  - Keep the existing "combat verb → deep" and cast-at checks (they must stay green — proves the fix
    didn't over-suppress).

### Mutation-test regression checks
- Revert to the bare `DM_COMBAT_VERBS.test(txt)` → the two negation checks ("make no move", "do not
  attack" → no combat-action) flip RED.
- Over-suppress (e.g. drop the assertion loop and always return false) → the "I lunge and stab" and
  "cast … at" checks flip RED (proves the guard is scoped, not a blanket off-switch).

---

## Cross-unit build & gate checklist
- No `manifest.json` changes (no new modules; all edits are in-place to registered files:
  `src/engine/advancement.js`, `src/engine/combat.js` [no-op], `src/world/dm.js`, `src/world/triage.js`,
  `build/gen-dm-contract.py`, the two seat prompts). Run `python3 build/check-manifest.py` after edits
  regardless (it validates nothing broke).
- After the B1 seat-prompt change: `python3 build/gen-dm-contract.py` (regenerates both PROMPT_TARGETS).
- Green gate per unit: the named verify-*.mjs above + `node dev/playtest-bug-probes.mjs` (no
  regression on existing probes). B1 additionally must leave `dev/verify-advancement.mjs` green.
- Land each unit as its own `fix/…` branch, `--no-ff` merge (per CLAUDE.md git workflow). B1 and B2
  both touch `dm.js`/its combat_end region — if built in parallel, sequence the merges to avoid a
  trivial conflict at the accept-map / handler.
