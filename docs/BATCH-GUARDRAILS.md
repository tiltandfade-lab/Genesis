---
type: build-guardrails
status: BINDING addendum to the seven overnight-batch specs (2026-07-01). The build agent reads this AFTER CLAUDE.md and the unit spec; where this document rules, the ruling is FINAL.
created: 2026-07-01
---

# Overnight-Batch Guardrails — rulings that close every latent decision

**Contract:** you are a competent-but-unimaginative executor. If you hit a decision this document
and the spec do not close, you STOP that step, record it in `uncertainties`, and move on — you
never guess. These rulings override any "or"/"reconcile" language in the specs.

## G0. Global don't-touch (all units)

- NEVER edit: `tables.json` · `data/bestiary.js` · `data/class-progression.js` ·
  `data/spells*.js` · any header-stamped generated file (regenerate via its `build/` script only —
  and only when the spec says so).
- NEVER edit: `docs/DM-BRIDGE.md` · `docs/SYNTHESIS-CONTRACT.md` (orchestrator lands those) ·
  anything under `Engine/` (EXCEPT the one NEW file ECONOMY-SINKS §B creates) · `.dm/` ·
  `ui-sketches/` · `CLAUDE.md` · other units' spec docs.
- `genesis.html`: script-tag registration ONLY. Minimal diffs everywhere; no drive-by refactors,
  no formatting sweeps, no renaming existing symbols.
- No new npm dependencies. jsdom only, resolved the way existing `dev/verify-*.mjs` do it.

## G1. Gate lines (acceptance = command + number; report these literal counts)

| unit | gates |
|---|---|
| all | `python3 build/check-manifest.py` → exits 0 · full sweep: every existing `dev/verify-*.mjs`/`*.py` → **0 failed** (same counts as before your change) |
| digest-diet | `node dev/verify-digest-diet.mjs` → **≥8 asserts, 0 failed** (incl. the <12 KB size guard) |
| roll-branches | `node dev/verify-roll-branches.mjs` → **≥7/0** |
| on-demand-gen | `node dev/verify-gen.mjs` → **≥12/0** |
| travel-walks | `node dev/verify-travel-walks.mjs` → **≥7/0** |
| economy-sinks | `node dev/verify-economy-sinks.mjs` → **≥7/0** · `verify-economy` stays 43/43 · `verify-shop-ui` stays 46/46 |
| combat-tracker | `node dev/verify-combat-tracker.mjs` → **≥8/0** |
| prep-autopilot | its asserts → **≥3/0** · `verify-prep` suite unchanged counts |

Every spec-named mutation check must be SHOWN RED (break the guard, run, confirm fail, restore)
and the red run mentioned in `gateSummary`.

## G2. DIGEST-DIET rulings

- **Turn-envelope audit (§3 last bullet): investigate and REPORT ONLY.** You may remove a field
  ONLY if it is a byte-duplicate of data already in the digest. Anything else → list in
  `uncertainties` with its size; do NOT cut. (The ~14.8 KB gap may be load-bearing.)
- `peek-state.py` commands are EXACTLY: `codex <id>` · `codex --kind <kind>` · `ledger -n <N>` ·
  `walk` · `handoff` (the last lands in unit 7; stub it printing `{}` now). Output: compact JSON
  to stdout; unknown id/kind → exit 2 with a one-line error.
- `codexRoster` entry is EXACTLY `{id, kind, name, at, known}` — no other keys, no `dm`, no
  `fields`.

## G3. ROLL-BRANCHES rulings + the worked example (the one risky insertion site)

- The branch path is a GUARD CLAUSE at the top of the roll-resolution flow in `dmRollFor`,
  AFTER the dice are rolled and BEFORE `sendTurn`. Shape (adapt names to the real code, logic
  verbatim):

```js
// BEFORE (today, end of dmRollFor):
sendTurn("(I roll "+skill+advTag+": "+total+")",rolls).catch(()=>{});

// AFTER:
const br=w.dm&&w.dm.rollReq&&w.dm.rollReq.branches;
if(br && die!==20 && die!==1 && typeof resolveCheck==="function" && typeof w.dm.rollReq.dc==="number"){
  resolveBranch(w, w.dm.rollReq, rolls, total);   // renders DM-voice entry + applies events + sets lastResolution; NO sendTurn
} else {
  sendTurn("(I roll "+skill+advTag+": "+total+")",rolls).catch(()=>{});
}
```

- Degree→branch: use the REAL `resolveCheck` margin ladder; map its success degree(s)→`success`,
  its near-miss degree→`nearMiss`, everything below→`fail`. If `resolveCheck`'s ladder has more
  degrees than three, collapse toward those three — never invent a fourth branch key.
- `lastResolution` = `{turnId, skill, total, degree, branch}` EXACTLY; attach to the next
  `sendTurn` payload top-level, clear after one ride.
- Branch events run through the SAME `applyEvent`; stamp by setting `e.source="branch"` before
  apply (do not add a new envelope field).

## G4. ON-DEMAND-GEN rulings

- **Ambient/inhabited predicate (one predicate, reused by economy-sinks):** new
  `nodeInhabited(w, nodeId)` in `src/world/prep.js` → true if the node is the world's START node,
  OR ≥1 codex npc record has `status.at === nodeId`, OR `/town|village|city|hamlet|settlement|port|market/i`
  matches the node's `type` or `name`. That exact rule; no other heuristics.
- Ambient pool size: **exactly 3**; reserve cap: **exactly 2 per kind**; gen cap: **exactly 4
  per response** (5th+ logs `gen-overflow` and no-ops).
- **Segment effect-die capture (closing the spec's one open "or"):** new event
  **`walk_update`** — `{payload:{seg:<num>, overlay:{effectDie:{...}|rolledFace:<n>}}}` → deep-merge
  into the active walk's per-segment overlay (`P.overlays`, keyed exactly how `applyPrep` keys
  them). Unknown seg → `{ok:false,reason:"no-seg"}`. Register it in the applyEvent switch next to
  `walk_advance`.
- `gen-names.py` output shape is EXACTLY backward-compatible:
  `CHAR_NAMES[species] = { first:[...union...], last:[...], female:[...], male:[...] }` (+
  `child:[...]` only for Elf). `roster.js` keeps working untouched — verify asserts it.
- `rollNPC` gender: `1d2` → pick from `female`/`male` when non-empty, else `first`. Record
  `rolled.gender`.
- `digest.minted` entry is EXACTLY `{id, kind, name, genRef}`.

## G5. TRAVEL-WALKS rulings

- **Per-leg biome sampling:** straight line origin→dest in axial coords; sample `terrainAt` at
  `t=(i+0.5)/legCount` for leg i (linear interp on q,r then round). That algorithm, no other.
- Per-segment clock: `Math.round(travelMin/segCount)` per `walk_advance`; on `walk_complete`,
  add the rounding remainder so total elapsed === original `travelMin` exactly.
- The travel walk stores under the DESTINATION node's prep slot with `kind:"travel"`,
  `originNodeId`, `destNodeId`, `travelMin`. If the exact storage shape of frontier walks differs
  from the spec's assumption, MATCH the frontier shape and add `kind`.
- Turn-back (`abandoned:true`): `currentNodeId` unchanged; clock keeps only segments already
  advanced; ledger line `"turned back on the road to <dest>"`.

## G6. ECONOMY-SINKS rulings + worked example

- Inhabited check: **the same `nodeInhabited` from G4** — do not write a second predicate.
- **"Maxed coin roll" trigger (closing the ~top-third latent):** after reconciling `dwalkCoin`'s
  actual return, the valuable attaches when the rolled coin total ≥ **80% of that expression's
  maximum possible total**. Exactly that threshold, computed from the real dice expression.
- `previewSell` override — worked shape:

```js
// BEFORE (inside previewSell, price lookup):
const p=itemPrice(inst.name); if(!p||p.gp==null) return {ok:false,reason:"unpriceable"};

// AFTER:
const p=(typeof inst.value==="number")?{gp:inst.value,source:"instance"}:itemPrice(inst.name);
if(!p||p.gp==null) return {ok:false,reason:"unpriceable"};
```

- Valuables table: EXACTLY d100, 1..100 full coverage, band shares 66/20/9/4/1, columns
  `Band | Item | Value (gp) | Note`, frontmatter `status: draft` + the PROVISIONAL callout, file
  path exactly as the spec names it. Values: Grounded 5–50 gp, Textured 40–150, Strange 120–600,
  Volatile 500–2500, Mythic priceless-but-numbered (pick one number 3000–8000). Voice per
  `REAUTHORING-RUBRIC.md`; this is the ONE Engine/ file you may create.
- Lodging trigger fires INSIDE `passTime` after the clock advances, before `restRecover`;
  shortfall path per spec (never blocks the rest).

## G7. COMBAT-TRACKER rulings

- **v1 is read-only → NO new module.** `combatPanel(...)` + helpers live in
  `src/world/render.js` exactly like `shopPanel` does. No new manifest entry, no new file. (If
  you believe a handler is unavoidable, STOP and flag — don't create one.)
- Band lane order and names: read them from the combat engine's band constants — render in the
  engine's canonical order, melee-first.
- Foe chip state word: `down` if `down||hp<=0`, else `bloodied` if `hp<=maxHp/2`, else `fresh`.
  The comparison happens in JS; **neither `foe.hp`, `foe.maxHp`, nor `foe.ac` may appear in any
  rendered string** — the verify greps the full rendered HTML for those numbers.
- Auto-open: on render, if `GS.combat&&GS.combat.active&&GS.gamePanel!=="combat"` → save
  `GS.prevPanel=GS.gamePanel`, set `"combat"`. On combat end → restore `GS.prevPanel||"map"`
  once, clear it.
- Abilities tab: features come ONLY from `CLASS_PROGRESSION` (+subclass where the sheet has one)
  filtered `level<=sheet.level`; render name + first sentence + expand-on-tap; NO advice verbs
  ("should", "best", "consider") anywhere in template strings — verify greps for them.

## G8. PREP-AUTOPILOT rulings

- `prepPending` present IFF `P.bundle` exists AND (≥1 prep node lacks an overlay OR has
  `needsReskin`). Shape EXACTLY `{session, frontiers:[«id (env)»...], reason:"no-overlays"|"needsReskin"}`
  (if both, `"needsReskin"` wins).
- `peek-state.py handoff` prints the prep bundle JSON the fan-out workflow takes as `args` —
  byte-equivalent to what `prepHandoff` summarizes, but the RAW bundle object.

## G9. When in doubt

Stop the step, write the doubt into `uncertainties`, continue with the rest. A skipped step with
a precise flag is a good outcome; an invented decision is the worst outcome. The reviewer reads
`uncertainties` first.
