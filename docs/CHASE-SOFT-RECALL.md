# CHASE-SOFT-RECALL — an "away" ending leaves a codex handle, not just prose

```
type: system-spec
status: SPECCED (locked 2026-07-04; Adam approved. From dev/playtest-chase-0704-findings.md
finding #7 — documented-but-unbuilt: TABLE-GAPS-070126.md §1 promised "the fled foe persists
soft, recall fodder"; the built chase writes only a static ledger line.)
consumer: Sonnet executor; orchestrator gates
branch: feat/chase-soft-recall
```

## The gap (finding #7 — verified against the current tree)

The chase case-block (src/world/dm.js:2363–2408) performs NO codex mutation — its only codex
touch is a READ (`codexGet`, dm.js:2370, used only for an npcId quarry's name). On an "away"
ending (chase_round: gap >= gapSize*CHASE_AWAY_MULT = 6, graded in src/world/gap-wiring.js:102–105;
surfaced at dm.js:2389–2393) the quarry leaves one prose ledger line and is mechanically gone
forever: `turnRecall` (src/world/turn.js:407–428) draws ONLY from records with
`r.status.known && !r.status.soft` (turn.js:414), and a bare combat-foe object is not a record
at all. Confirmed empirically in the playtest: `dmDigest().codexRoster` was `[]` after both
organic away endings.

## Decisions (recorded — do not re-litigate)

1. **Significance threshold — individuated quarries only.** The engine's significance ladder
   for combat outcomes is the kill event's gate: `victimClass` distinguishes
   `monster|hostile|neutral|civilian|authority` (docs/DIFFICULTY.md:60–62) and "A monster kill
   carries no factionId → no escalation" (src/world/dm.js:2081–2084). Foe objects already carry
   the needed signals (src/engine/combat.js:520–542: `factionId` :532, `codexId` :534;
   cmFoeFrom keeps a bespoke label over the bestiary name, combat.js:71–74 + resolveCreature
   :124). Threshold, computed ONCE at chase_start while GS.combat is alive:
   `significant = !!( foe.codexId || foe.factionId ||
      (foe.name && foe.name!=="Walk-on" &&
       (!foe.statId || !BESTIARY[foe.statId] || foe.name!==BESTIARY[foe.statId].name)) )`
   — a foe whose display name is exactly its bestiary entry with no faction and no codex link
   is a generic mook: ledger prose only (today's behavior).
2. **Snapshot at start, mint at end.** By away time GS.combat is legally torn down
   (COMBAT-LIFECYCLE §3d; chaseInit copies only the fid string, gap-wiring.js:72–83). So
   chase_start (dm.js, after :2368, using the locals resolved at :2369–2378) stamps
   `GS.chase.quarry` — the stamp lives in dm.js; chaseInit stays pure and untouched.
3. **Mint hard + known, not soft.** The party FOUGHT and CHASED this creature — touch = canon
   (docs/CODEX.md §8b). A soft/unknown mint would be invisible to turnRecall (turn.js:414).
   Status: `{known:true, soft:false, at:<escape node>, condition:"fled"}`.
4. **Provenance split.** `"rolled"` when the quarry has a `statId`, `"authored"` when statless
   quick-stats — keeps the CODEX.md §8b mechanical-vs-invented tally honest. (Flagged on
   Adam's ledger: flip to always-`rolled` if he wants escapee mints excluded from the
   "invented" ratio — one word.)
5. **`chase_yield {side:"pursuer"}` also mints** (outcome "away", gap-wiring.js:111–115;
   dm.js:2400–2408). Grounds: finding #6 shows yield is the pressure-valve for dragging
   chases. `side:"quarry"` (outcome "contact") never mints.
6. **Create-or-update via the origin tag.** Mint-time `origin:"chase-escaped:"+slug(name)`
   (codexAdd persists origin set-once, src/world/codex.js:77,:96); a later away for the same
   name resolves through `codexFindByOrigin(w, origin, "npc")` (codex.js:30–34, the
   PLOT-ITEM-RECURRENCE discipline, dm.js:520–531) and UPDATES instead of duplicating.
7. **Shape precedent is `turnMintSuccessorThread`** (src/world/turn.js:380–395): a
   script-detected codexAdd with `prepCastId(w,kind,name)` (src/world/prep.js:139) falling
   back to slug+uid, dm-lane fields, a guarded codexLink, and one ledger line. Mirror it.

## Data shapes (exact)

`GS.chase.quarry` (stamped in dm.js chase_start, additive to the chaseInit object):
```js
{ name, statId, cr, factionId, codexId, victimClass, significant }   // nulls where unknown
```
For an npcId quarry: `quarry.codexId = opts.npcId`, name from the codexGet record (:2370),
significant true.

Minted record (the codexAdd payload, on away, when no existing record resolves):
```js
codexAdd(w, {
  id: (typeof prepCastId==="function") ? prepCastId(w,"npc",q.name) : ("npc:"+slug(q.name)+"-"+uid()),
  kind:"npc", name:q.name,
  provenance: q.statId ? "rolled" : "authored",
  rolled: q.statId ? { statId:q.statId, cr:q.cr } : null,
  fields:{ role:"escaped quarry" },
  dm:{ chaseEscaped:true, escape:{ nodeId:w.currentNodeId, day:clockOf(w).day,
       terrain:GS.chase.terrain, walk:wkStamp } },          // wkStamp: dm.js:836
  origin:"chase-escaped:"+slug(q.name),
  status:{ known:true, soft:false, at:w.currentNodeId, condition:"fled" }
})
```
Plus, guarded: `codexLink(w, rec.id, "member-of", "faction:"+slug(q.factionId))` ONLY when
`codexGet(w,"faction:"+slug(q.factionId))` resolves (ensureCodex ids, codex.js:424–427).
Plus the mintQueue push, mirroring dm.js:525–541:
`w.dm.mintQueue.push({ id:rec.id, kind:"npc", name:rec.name, genRef:null,
  note:"escaped quarry — persists; recallable" })`.

## Behavior (ordered, with guards)

1. `chase_start` (dm.js:2363–2382): after `GS.chase=chaseInit(opts)` (:2368) and the
   foe/rec/fallback resolution (:2369–2378), stamp `GS.chase.quarry` per the shape above.
   Guards: quarry name falsy or the literal "the quarry" → `significant:false`.
2. Extract ONE helper (`chaseEscapeRecall(w, src, wkStamp)`) called from BOTH away sites:
   the `chase_round` ended-away branch (dm.js:2389–2393, before `GS.chase=null` at :2392) and
   the `chase_yield` away branch (dm.js:2400–2408, before `GS.chase=null` at :2406).
3. Helper resolution order (first hit wins):
   a. `GS.chase.npcId` or `quarry.codexId` → `codexUpdate(w, id, {status:{condition:"fled",
      at:w.currentNodeId}, dm:{chaseEscaped:true, escape:{…}}})` (merge semantics,
      codex.js:126–147; codexTouch rides the DIGEST-DIET delta for free).
   b. `codexFindByOrigin(w,"chase-escaped:"+slug(name),"npc")` → same codexUpdate (re-escape).
   c. `quarry.significant` → the codexAdd mint + guarded codexLink + mintQueue push.
   d. else → return null (ledger prose only, byte-identical to today).
4. On any a–c hit, ONE new ledger line after the existing chase-end line (unchanged):
   `addLedger(w,"outcome",{kind:"chase-escaped",codexId:rec.id,name:q.name,source:src},
   "◆ "+q.name+" got away — the world remembers.")` (prose-twin parity via the ledger).
5. Null-safety: every codex call gated `typeof codexAdd==="function"` etc.; helper failure
   never blocks the chase end.

## Out of scope

Gap-clock bite (CHASE-BITE, review-gated) · PC-as-quarry (finding #8) · solo-foe morale
triggers (finding #3) · CR-fallback flavor (finding #4) · any UI panel for escapees ·
re-approach mechanics (turnRecall/distant-word already consume codex records — no new
consumer here).

## Verification (dev/verify-chase-soft-recall.mjs — sibling of verify-chase-contract.mjs)

1. ⊗ RED-FIRST (finding #7 automated): combat_start ONE foe `{name:"Cartel Lookout", cr:0.25,
   factionId:"The Cartel"}` → foe_morale flee → chase_start{targetFid} → combat_end{fled} →
   chase_round quarry-wins to away. Assert a codex npc record exists with status
   `{known:true, soft:false, condition:"fled", at:<node>}`, origin prefixed "chase-escaped:",
   dm.chaseEscaped, and the mintQueue entry. RED on current master.
2. Mook guard: same flow, foe `"Goblin"` (exact bestiary match, no factionId) → codex record
   COUNT unchanged; chase-end ledger line still present.
3. npcId path: chase_start{npcId:<existing codex npc>} → away → NO new record; existing
   record's condition "fled", at updated, touchedSeq bumped.
4. Re-escape: check 1's quarry to away twice → exactly ONE record; second away = update.
5. chase_yield: side:"pursuer" → mints (same asserts as 1); side:"quarry" → no mint.
6. Recall integration: with the escapee the only known+hard record, `turnRecall(w,{})`
   returns it (the turn.js:414 filter satisfied — the actual point of the unit).
7. Snapshot survival: after combat_end, `GS.chase.quarry.name` still reads the real name.
8. ⊗ MUTATION: (a) stub chaseEscapeRecall to a no-op → checks 1/5/6 red; (b) force
   significant=true unconditionally → check 2 red. Re-apply → green. Record both runs.
9. `python3 build/check-manifest.py` → RESULT: OK; full dev/verify-*.mjs sweep — named:
   verify-chase-contract.mjs, verify-gap-callers.mjs, verify-gap-wiring.mjs, verify-codex.mjs,
   verify-world-turn.mjs, verify-digest-diet.mjs; gauntlet-fuzz-events + gauntlet-monkey
   (0 harness-aborted).
