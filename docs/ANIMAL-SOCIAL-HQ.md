# ANIMAL-SOCIAL-HQ — fix queue from the U1–U6 landed-wave code review

```
type: fix-spec
status: SPECCED (locked 2026-07-09)
source: /code-review of 8234aca^1..e7df0c4 — 10 confirmed findings, 13 verifier passes
owner: orchestrator (Fable session 2026-07-09); executors = Sonnet
```

**The wave's disease, named:** U1/U3/U6 mechanisms were built and their verify scripts pass,
but the scripts hand-feed options and ledger shapes production never supplies. Every unit
below therefore carries the same acceptance law:

> **THE WIRING LAW: every verify check added by this queue must drive a PRODUCTION entry
> point** (`prepCastEnvAnimals`, `prepCastAmbientScene`, `applyEvent`, `codexDigest`) —
> never the new function directly. A check that calls the fixed function with hand-built
> options proves plumbing, not wiring, and is a spec violation.

All `file:line` anchors verified against master @ `e7df0c4` on 2026-07-09.

---

## Decisions (recorded — executors never re-litigate)

- **D1 (holder promotability):** the wilderness territory-holder IS promotable.
  ANIMAL-SOCIAL.md §4 names it "the one who gets promoted first"; the `!rec.dm.ambient`
  guard was meant to no-op *landmarks* (already `promoted:true`), not holders.
- **D2 (pcClass source):** the living PC, via the established inline pattern
  `(w.characters||[]).filter(c=>c.status==="living").slice(-1)[0]` (the dm.js:1048
  `livingSheet` shape) reading `c.sheet.class`. Inline it in prep.js — do NOT import/call
  `livingSheet` (it's world.dm-owned; prep must not gain an upward dep).
- **D3 (realm source):** `activeRealmsFor(null, w)[0] || null` — the exact pattern
  prep.js:378 (`hookDiscoveryChance`) already uses. The scene caster forwards the
  `realmId` it ALREADY computes at prep.js:306.
- **D4 (digest routing):** animal partials get `parleyAbility` in the digest by widening
  the codex.js:408 gate; levers merge follows the existing `creatureLevers` pattern
  exactly — same place, same shape.
- **D5 (engagement):** animals follow the same `p.engaged` discipline as NPCs. Spec text
  is "engages twice"; the SEAT contract already documents the flag. The code comment
  claiming every contact counts is a self-declared deviation — remove it with the fix.
- **D6 (animal_care):** mirrors `animal_interview`'s not-an-animal refusal; gains
  `alias:{ id:"target" }`. `dm-contract.json` is generated — executors do NOT commit it;
  the orchestrator regenerates at the master merge.
- **D7 (witness ledger):** the kill writer stamps `nodeId`; `outcome:move-zone` is REMOVED
  from the predator scope's ledgerTypes (its `from`/`to` are combat `band:lane` strings,
  not map nodes — it can never satisfy a node-scoped witness). The loc filter itself is
  correct and stays.
- **D8 (row coupling):** VALIDATE, don't re-key. The wild-animal-kind rows are Adam's
  CRAFT-LANE drafts — his pass owns their order and text. We do not retag his tables or
  re-derive categories. Instead: a compiled-table FINGERPRINT check that fails loud (verify
  RED + runtime `console.warn`) the moment row count or row identity drifts from what the
  positional maps assume. Truth over green: after his pass, the fingerprint fails, and
  whoever re-syncs the maps does so eyes-open.
- **OUT OF SCOPE:** the urban→rural tier-0 banding (documented deliberate tradeoff —
  goes to Adam's design ledger, not this queue); boolean payload coercion (systemic,
  predates the wave); witness-scan efficiency (measured negligible; future ledger-window
  item); dead `animalCheckAdvantage` beyond what HQ-3 wires (SwA advantage handling is
  DM-narrated in v1).

---

## Queue

| unit | branch | files | depends on |
|---|---|---|---|
| HQ-1 mint wiring (realm + pcClass) | `fix/hq1-mint-wiring` | prep.js | — |
| HQ-2 holder promotion gate | `fix/hq2-holder-promotion` | codex.js | — |
| HQ-3 digest parley routing | `fix/hq3-digest-routing` | codex.js, dm.js | — |
| HQ-4 handler guards (engaged + care) | `fix/hq4-handler-guards` | dm.js | — |
| HQ-5 witness ledger stamps | `fix/hq5-witness-ledger` | dm.js, data/animal-knowledge-scope.js | — |
| HQ-6 row-coupling fingerprint | `fix/hq6-row-fingerprint` | codex-roll.js, new verify | — |
| HQ-7 cleanup (mint helper, predicate, manifest) | `fix/hq7-cleanup` | prep.js, codex.js, dm.js, social.js, turn.js, manifest.json | HQ-1..6 landed |

HQ-1 through HQ-6 run parallel (each in its own worktree, branched off
`fix/animal-social-hq` @ this spec's commit). HQ-7 is a stacked second wave off the
integrated result. All branches: commit only — the orchestrator gates and merges.

---

## HQ-1 — mint wiring: realm skins + ranger/druid bump reach production

**Defect:** `rollPartial` accepts `opts.realm` and `opts.pcClass`
(src/engine/codex-roll.js:383, :396) but neither production mint site passes them, so the
entire `data/animal-realm-skins.js` overlay and the ANIMAL-SOCIAL §3 class bump are dead
in live play. `regionEnsure` records carry no `.realm` (region.js:192–208) and never will
here — the realm arrives as an explicit opt.

**Change 1 — env caster.** src/world/prep.js:183, inside `prepCastEnvAnimals`:
currently `const p=rollPartial("animal", { env:band, region });`
- Above the mint loop (once, not per-draw), resolve:
  - `const realmId=(typeof activeRealmsFor==="function")?((activeRealmsFor(null,w)||[])[0]||null):null;` (D3)
  - `const pc=(w.characters||[]).filter(c=>c&&c.status==="living").slice(-1)[0];`
    `const pcClass=(pc&&pc.sheet&&pc.sheet.class)||null;` (D2)
- Call becomes `rollPartial("animal", { env:band, region, realm:realmId, pcClass })`.

**Change 2 — scene caster.** src/world/prep.js:334, inside `prepCastAmbientScene`:
currently `const p=rollPartial(kind, { region });`. The function ALREADY computes
`realmId` at prep.js:306 — forward it, and add the same living-PC lookup:
`rollPartial(kind, { region, realm:realmId, pcClass })`. Pass them for every kind —
`rollPartial` ignores the opts for non-animal kinds (verify this claim by reading
rollPartial; if any non-animal path reads them, gate to `kind==="animal"` and note the
deviation in your report).

**Guards:** both lookups must tolerate `w.characters` missing/empty and
`activeRealmsFor` undefined (jsdom partial boots) → `null`, never a throw.

**Out of scope:** any change inside `rollPartial`/`animalRealmSkin`/`animalOpeningStep`
(the plumbing is correct); region records; non-animal partial behavior.

**Verification** (extend `dev/verify-animal-social-u1.mjs` for realm, `-u3.mjs` for class
— production entry points per the WIRING LAW):
1. ⊗ RED-FIRST: world with an active realm that has a skin for a wild row → run
   `prepCastEnvAnimals` until a realm-skin-tagged row mints (seed/loop) → assert
   `fields.animalKind` is the SKINNED text, not "(reskin slot)". Prove RED on master first.
2. ⊗ RED-FIRST: world whose living PC has `sheet.class="ranger"` → mint a wild animal via
   `prepCastEnvAnimals` → its opened attitude is one step better than the same seed with
   `sheet.class="fighter"`. Prove RED on master first.
3. Mutation check: revert Change 1 only → check 1 goes red. Revert Change 2 only → a
   scene-cast assertion goes red.
4. No-PC world (characters empty) → prep runs clean, attitude unbumped, no throw.
5. Regression: `node dev/verify-animal-social-u1.mjs` … `-u6.mjs` all green;
   `python3 build/check-manifest.py` RESULT: OK.

---

## HQ-2 — the territory-holder can promote

**Defect:** `animalMaybePromote` (src/world/codex.js:834) opens with
`if(!rec.dm.ambient) return false;` — but `prepCastEnvAnimals` mints the holder with
`ambient:!(isHolder||isLandmark)` → `false`, `status.soft:true`, no
`promoted`/`homeNodeId` (prep.js:191–194). Every promotion trigger dies before evaluation;
a named/befriended holder that never receives `codex_contact` stays soft-evictable.

**Change.** In `animalMaybePromote`, replace the guard so holders pass:
`if(!rec.dm.ambient && !rec.dm.territoryHolder) return false;` (D1). Then read the rest of
the function: if it separately no-ops on `rec.dm.promoted` already-true, landmarks stay
correctly excluded; if it does NOT, add `if(rec.dm.promoted) return false;` FIRST and say
so in the report. Fix the misleading comment ("dm.ambient is already false at mint" —
it misdiagnoses the holder as the landmark case).

**Promotion effects must apply to the holder exactly as to ambients:** `status.soft=false`,
`dm.promoted=true`, `dm.homeNodeId` stamped, the ◆ ledger beat. No holder-specific
special case beyond the guard.

**Out of scope:** promotion trigger definitions (named / engaged-twice / attitude>0 stay
as-is — HQ-4 fixes what feeds the counter); eviction (`codexEvictSoft`) itself.

**Verification** (extend `dev/verify-animal-social-u5.mjs` — drive `applyEvent`, not
`animalMaybePromote` directly):
1. ⊗ RED-FIRST: prep a wilderness node → grab the `territoryHolder:true` record → apply a
   `codex_update` naming it → assert `dm.promoted===true`, `status.soft===false`,
   `dm.homeNodeId` set. Prove RED on master first.
2. Landmark record → same naming → promotion path does NOT re-fire (no duplicate ledger beat).
3. Plain ambient animal promotion still works (existing u5 checks stay green).
4. Mutation check: restore the old guard → check 1 red.
5. Regression: full u1–u6 sweep + check-manifest.

---

## HQ-3 — animal parley routing reaches the DM digest

**Defect:** `codexFullRecord` (src/world/codex.js:408) attaches `parleyAbility` only for
`kind==="creature"`; animal partials are `kind:"npc"` + `dm.partialKind==="animal"`, so
the digest never tells the DM to route WIS/Animal Handling, and `animalLevers` has zero
production callers — the DM defaults to Cha/Persuasion and the engine resolves it verbatim.

**Change 1 — digest ability.** Widen the codex.js:408 gate:
`if((r.kind==="creature" || (r.kind==="npc" && r.dm && r.dm.partialKind==="animal")) && typeof socialCheckAbilityFor==="function") o.parleyAbility=socialCheckAbilityFor(r);`
(`socialCheckAbilityFor` already returns `{ability:"wis", skill:"Animal Handling"}` for
animal partials — src/engine/social.js:113–118; do not touch it.)

**Change 2 — levers.** Find where the digest/social_check merges `creatureLevers(rec)`
for creatures (grep `creatureLevers` in codex.js + dm.js; the social_check handler is
dm.js:~3190). At the SAME merge point(s), merge `animalLevers(rec)` for animal partials,
same output shape. Read `animalLevers` (src/engine/social.js) first and honor its
signature — do not modify it.

**Out of scope:** `animalCheckAdvantage` (SwA advantage stays DM-narrated in v1);
resolveSocialCheck internals; forcing the DM's declared skill (the digest informs, the
DM decides — DM-agency law).

**Verification** (extend `dev/verify-animal-social-u3.mjs`; WIRING LAW — assert on
`codexDigest` output / `applyEvent` results):
1. ⊗ RED-FIRST: prep node with an animal partial here-now → build the digest → the
   animal's record carries `parleyAbility:{ability:"wis", skill:"Animal Handling"}`.
   Prove RED on master first.
2. A hungry-tagged animal's digest record (or social_check result — wherever creatures
   surface levers today) carries the feeding lever from `animalLevers`.
3. Creatures (kind:"creature") unchanged — existing parleyAbility checks green.
4. Human NPC records carry NO parleyAbility (gate didn't over-widen).
5. Mutation: revert Change 1 → check 1 red. Regression: u1–u6 + check-manifest.

---

## HQ-4 — handler guards: engagement discipline + animal_care target guard

**Defect A:** dm.js:3177–3178 increments `dm.animalContactCount` on EVERY `codex_contact`
for an animal, ignoring `p.engaged` — while the NPC stamp three lines up requires it. Two
passing canon-locking contacts promote a walk-on to permanent canon (spec says "engages
twice", ANIMAL-SOCIAL §4).

**Change A:** gate the increment on `p.engaged` (truthy), matching the NPC discipline.
Delete the comment declaring the deviation. The contact's canon-locking side effect
(`soft:false, known:true`) is UNCHANGED — only the engagement counter gains the gate.

**Defect B:** the `animal_care` handler (dm.js:3356) validates only record existence —
a human NPC / location / faction accepts care with `ok:true`, a ledger line, and a
polluted `fields.care` that feeds the Helpful(+2) gate. Registry entry (dm.js:1631)
also lacks the `id` alias every sibling animal event effectively honors.

**Change B1:** first line of the handler after the codexGet, mirror animal_interview
(dm.js:3140–3141) exactly:
`if(!r || r.kind!=="npc" || !(r.dm && r.dm.partialKind==="animal")) return {ok:false, reason:"not-an-animal:"+(p.target||"?")};`
**Change B2:** registry entry becomes
`animal_care: { accept:["event","target"], alias:{ id:"target" } },` (D6). Do NOT commit
`dm-contract.json` — orchestrator regenerates at merge.

**Out of scope:** promotion thresholds; what counts as `engaged` (the DM's judgment);
other events' aliases.

**Verification** (extend `dev/verify-animal-social-u5.mjs` care/promotion sections;
drive `applyEvent` only):
1. ⊗ RED-FIRST: two `codex_contact` events WITHOUT `engaged` on an ambient animal →
   `dm.promoted` stays falsy AND the record is canon-locked (`soft:false`). Then two WITH
   `engaged:true` → promoted. Prove the first half RED on master.
2. ⊗ RED-FIRST: `animal_care` targeting a human NPC → `{ok:false, reason:"not-an-animal:…"}`,
   no `fields.careLog`, no ledger line. Prove RED on master.
3. `animal_care` with `{id:"npc:x"}` (no target) on a real animal → care ticks (alias works).
4. Care on a real animal via `target` still ticks; Helpful gate math unchanged.
5. Mutation: drop the engaged gate → 1 red; drop the guard → 2 red. Regression: u1–u6 +
   check-manifest + `node dev/gauntlet-fuzz-events.mjs` (event-surface change).

---

## HQ-5 — witness scopes match production ledger shapes

**Defect:** `animalWitnessSeen` (codex.js:662) requires `data.nodeId`/`data.at`, but the
kill writer (dm.js:3542) stamps neither — the predator scope's ledgerTypes
(`outcome:kill`, `outcome:move-zone`) match NOTHING a real game writes. move-zone's
`from`/`to` are combat `band:lane` strings, structurally never map nodes.

**Change 1 — kill writer stamps location.** At dm.js:3542, add `nodeId` to the kill
entry's data. Source of truth for "current node": copy the EXACT expression the drift
writer uses (turn.js:163/184 — grep how it resolves the party's node; use the same
accessor, do not invent a new one). If the kill event can carry an explicit node in its
payload, prefer payload → fallback current-node; say which in the report.

**Change 2 — predator scope drops move-zone.** In `data/animal-knowledge-scope.js`,
remove `"outcome:move-zone"` from the predator ledgerTypes (D7). Leave a one-line comment:
move-zone is combat-zone-scoped, not map-scoped — re-add only with a node-stamped writer.

**Change 3 — verify-u6 stops lying.** Rewrite `dev/verify-animal-social-u6.mjs`'s seeded
entries to be written BY the production writers: apply a real kill-outcome event through
`applyEvent` and let dm.js write the ledger line, then interview the animal. Hand-seeded
`{kind:"kill", nodeId:"home"}` fixtures are the exact false-green this review caught —
purge them.

**Out of scope:** the loc filter (correct); other writers (npc-life, companions) — a
follow-up once scopes that need them exist; scope categories themselves.

**Verification:**
1. ⊗ RED-FIRST: kill an enemy via the production combat path at a node → open an
   interview on a predator-scope animal there → its `seen[]` contains the kill. Prove RED
   on master (it is red today — that's the finding).
2. Herd/burrower drift-based checks still green (they already worked).
3. The kill ledger line's prose twin is unchanged (only data gains nodeId).
4. Mutation: strip the nodeId stamp → 1 red. Regression: u1–u6 + check-manifest +
   gauntlet-fuzz (ledger data shape changed).

---

## HQ-6 — row-coupling fingerprint (fail loud under the craft pass)

**Defect:** `ANIMAL_ENV_WEIGHTS` (codex-roll.js:435, positional 12-vectors) and
`ANIMAL_KNOWLEDGE_SCOPE` (data/animal-knowledge-scope.js:56, row-number keys) both assume
the CURRENT row order/count of animal-kind + wild-animal-kind — tables whose header says
Adam's pass WILL rewrite them. `weightedTableRow`'s mismatch fallback (codex-roll.js:453)
silently reverts to flat rolls.

**Change 1 — loud fallback.** In `weightedTableRow`, when the length check fails AND the
table exists, `console.warn("[animal-env] weight/row count mismatch for "+id+" — env weighting DISABLED (flat roll)");`
once per table id per session (a module-local Set; transient guard state is fine as a
`const` here — it is not world state).

**Change 2 — fingerprint validator.** New harness `dev/verify-animal-table-fingerprint.mjs`
(copy the jsdom bootstrap of verify-animal-social-u1.mjs): loads compiled `tables.js`,
asserts for BOTH tables (a) row count === 12, (b) each row's text/tags still matches a
distinguishing token pinned per row (executor: read the 12 current rows of each table in
compiled form and pin the stablest token per row — the tag cell where distinctive, a text
stem otherwise). On mismatch, print WHICH row drifted and name the two consumers that must
be re-synced (`ANIMAL_ENV_WEIGHTS`, `ANIMAL_KNOWLEDGE_SCOPE`). Header comment: "this
harness is SUPPOSED to go red under a craft pass — it converts silent drift into a named
re-sync task; never green it by loosening tokens."

**Out of scope:** re-keying either map (D8); editing the markdown tables (Adam's);
the fallback's flat-roll behavior itself.

**Verification:**
1. Fingerprint harness green on the current compiled tables.
2. ⊗ RED-FIRST for the harness itself: mutate a copy of the loaded table object (drop a
   row / reorder two rows) inside a self-test mode → harness reports red with the right
   row named. (The harness tests itself; no production mutation.)
3. Warn fires exactly once when `weightedTableRow` is fed a 13-row stub.
4. Regression: u1–u6 + check-manifest (codex-roll.js edit).

---

## HQ-7 — cleanup wave (stacked after HQ-1..6 land)

**Scope:** three mechanical consolidations. NO behavior change — every existing verify
harness must pass before AND after, unchanged.

1. **`isAnimalPartial(rec)`** — one shared predicate
   (`return !!(rec && rec.kind==="npc" && rec.dm && rec.dm.partialKind==="animal");`) in
   src/world/codex.js next to the other record predicates. Replace ALL ~12 inline copies
   (grep `partialKind==="animal"` across src/ — codex.js, dm.js, prep.js, turn.js,
   social.js). social.js keeps its own local check IF replacing would create an
   engine→world upward dep — in that case leave it and note it (engine purity beats DRY).
2. **`mintAnimalPartial(w, p, atId, opts)`** — extract the six duplicated mint-tail rules
   (cruelty penalty, landmark derivation, landmark-name fallback, soft:!isLandmark, the
   promoted/named/homeNodeId stamps, codexAttitudeOpen) from prepCastEnvAnimals
   (prep.js:177–206) and prepCastAmbientScene (prep.js:330–349) into one helper in
   prep.js; callers pass their genuine differences ({band, isHolder} vs {sceneBucket}).
   Byte-identical record output for identical inputs — assert via a before/after fixture
   in the report.
3. **Manifest registration** — add to `owns`: engine.social (`ANIMAL_NEED_LEVERS`,
   `animalLevers`, `ANIMAL_OPENING_CLASSES`, `animalOpeningStep`, `animalCheckAdvantage`,
   `ANIMAL_HELPFUL_CARE_VISITS`, `animalHelpfulAllowed`), world.codex (the 15 animal
   globals, codex.js:594–831 — enumerate from the tree, plus new `isAnimalPartial`),
   world.prep (`ENV_PARTIALS`, `nodeEnvBand`, `prepCastEnvAnimals`,
   `ANIMAL_LANDMARK_NAMES`, `ANIMAL_LANDMARK_NAMES_DEFAULT`, `animalLandmarkName`, new
   `mintAnimalPartial`), world.turn (`turnAnimalAllyTellRefresh`). Add `callTimeDeps`:
   world.dm → animalMaybePromote/animalPropagatePackAttitude/animalHelpfulAllowed (+
   animalLevers after HQ-3), engine.codex-roll → animalOpeningStep, world.prep →
   codexAttitudeOpen. Add `data.animal-knowledge-scope` to check-manifest.py's LAYER dict
   (L0, beside animal-realm-skins). check-manifest must end RESULT: OK with the new
   entries actually validated (it errors on owns-without-definition — that's the point).

**Verification:** full u1–u6 sweep + fingerprint harness + check-manifest + gauntlet-monkey
(0 harness-aborted), before and after, identical results.

---

## Orchestrator landing checklist (not the executors')

- checkout law + stash law before every merge; merge `--no-ff`; push after the batch.
- Regenerate `dm-contract.json` (HQ-4 changed the registry) via `build/gen-dm-contract.py`
  AT the master merge, never on unit branches.
- Conflicts expected at merge (dm.js: HQ-3/4/5; codex.js: HQ-2/3): resolve by taking both
  hunks — they touch disjoint functions.
- After all of wave 1: run the full sweep on the INTEGRATED tree before the first master
  merge (the batch-3 pattern).
- Close: CHANGELOG + HANDOFF + NEXT-STEPS via /genesis-clean-close; register this spec in
  DESIGN.md; ledger item for Adam: the urban→rural tier-0 banding ruling (kept-as-designed
  vs a node-type signal).
