---
type: system-spec
status: SPEC-LOCKED 2026-07-06 — build DEFERRED (freeze; executes post-Fable via Opus-orchestrated Sonnet executors)
consumer: Opus orchestrator + Sonnet executors; Adam skims anything marked PROVISIONAL
created: 2026-07-06
related:
  - "[[DIFFICULTY]]"
  - "[[BREACH]]"
  - "[[WALK-CONSUMPTION]]"
  - "[[DIGEST-DIET]]"
  - "[[SESSION-PREP]]"
  - "[[SPICE-CURVE]]"
---

# Scene Risk Contract — the fairness contract for danger

> GPT-5.5 outside read (§Scene Risk Contract + §Difficulty And Itemization,
> `GPT-5.5-advice-for-Claude/README.md`), ADOPTED by Adam's 2026-07-06 rulings. One shape —
> `{dangerBand, rewardBand, telegraph, escapeModes, pressureClock, deathStakes, promisedReward,
> persistentTrace}` — stamped on every minted walk, so the AI DM never has to infer from prose
> alone whether a scene is "spooky" or "this can kill you."

## §0. The rulings this spec encodes (binding, Adam 2026-07-06)

1. **Deadly is allowed ONLY telegraphed, with ≥1 real escape mode.** A one-shot unwarned trap is a
   **bug**, not difficulty. (Extends `docs/DIFFICULTY.md` "Threat-signaling" — that doc's
   fiction-only telegraphing stays; this spec gives it a typed, validated carrier.)
2. **No global level scaling; fixed regions** (`docs/DIFFICULTY.md` locked decisions, unchanged —
   this contract *describes* danger, it never rubber-bands it).
3. **Difficulty is a reward ladder** (safe → deep breach, GPT README §Difficulty): rewardBand is
   *derived from* dangerBand one-to-one. Danger pays; the ladder is not negotiable per-scene.
4. **Script owns the number** (SPEED doctrine): the contract is pure deterministic derivation from
   already-rolled walk facts. **Zero model calls. Zero new dice.**
5. **DM-agency law:** the contract informs narration; it never rolls the player's dice, never
   coaches ("you could flee" is presenting a listed exit as world-fact, not tactics advice — the
   DM names what's *visible*, the player decides).

## §1. The contract shape + enumerated vocabularies (exact — closed sets)

New module **`src/engine/scene-risk.js`** owns the shape and the vocab. Field order and value
strings are exact; executors copy them verbatim.

```js
walk.risk = {
  schema: "scene-risk/v1",
  dangerBand,        // "safe" | "risky" | "deadly" | "nightmare" | "mythic"
  rewardBand,        // "ordinary" | "good" | "rare" | "strange" | "legendary"
  telegraphs,        // [ { kind, text, source, minted? } ]  — kind ∈ TELEGRAPH vocab; ≥1 REQUIRED when dangerBand ∈ {deadly,nightmare,mythic}
  escapeModes,       // non-empty subset of ["flee","bargain","stealth","environment","sacrifice"], in THAT fixed order
  pressureClock,     // { kind:"heat"|"hunt", start?, note } | null
  deathStakes,       // "loot-risk" | "corpse-hard-to-recover" | "bardo-only" | "world-shift"
  promisedReward,    // { band:<rewardBand>, hint:<string|null> }
  persistentTrace,   // "story" | "clock" | "map" | "world-shift"
  entry,             // "threshold" | "ambush" | null   (breach rows only — from walk.skin.entry)
  derived: { tier, enemyShare, heatStart, skinBand, tail }   // provenance for eval/telemetry
};
```

```js
const SCENE_RISK_VOCAB = Object.freeze({
  dangerBand:  ["safe","risky","deadly","nightmare","mythic"],
  rewardBand:  ["ordinary","good","rare","strange","legendary"],
  telegraph:   ["rumor","corpse","sign","scout","map","survivor"],   // GPT README §Difficulty, verbatim
  escapeModes: ["flee","bargain","stealth","environment","sacrifice"],
  deathStakes: ["loot-risk","corpse-hard-to-recover","bardo-only","world-shift"],
  persistentTrace: ["story","clock","map","world-shift"],
});
const SCENE_RISK_LADDER = Object.freeze({   // ruling 3: danger IS the reward ladder — 1:1, no fork
  safe:"ordinary", risky:"good", deadly:"rare", nightmare:"strange", mythic:"legendary" });
const SCENE_RISK_STAKES = Object.freeze({   // deathStakes per band — total map, no fork
  safe:"loot-risk", risky:"loot-risk", deadly:"loot-risk",
  nightmare:"corpse-hard-to-recover", mythic:"world-shift" });
```

`"bardo-only"` is **in the vocab but unreached by v1 derivation** — reserved for a future
safe-zone/social-scene consumer (documented in-file; the validator accepts it, nothing emits it).
`"corpse"/"scout"/"map"/"survivor"` telegraph kinds are likewise vocab-complete but unminted by v1
engine seams (they arrive when tables/codex supply them); the validator accepts all six.

## §2. Storage seam — DECIDED: generated metadata, stamped at walk mint

**Primary seam (the ONE): a pure engine derivation stamped onto the walk record at mint time**
(`walk.risk`), by `sceneRiskOf(walk, w)` called at the tail of each of the three walk rollers.

- **Not table frontmatter:** the corpus doesn't uniformly carry risk columns, and danger is a
  property of the *assembled* walk (tier + skin + tail + encounter mix), not of any single row.
  Table columns remain a future *enrichment channel* (§7), never the carrier.
- **Not digest-computed:** the digest is a pure read (`dm.js` digest functions never mutate `w`);
  recomputing per turn invites drift and violates the rolled-facts-are-canon discipline that
  `skin`/`light`/`dressing` already follow. Stamp once, read forever.
- Same persistence ride as every other walk field (walks live on `w.prep` / the bundle — no new
  storage layer, no migration).

`sceneRiskOf` is **idempotent** (a walk already carrying `walk.risk` is returned untouched —
mirrors `breachPersistenceRoll`, `src/engine/breach.js:145-152`) and **deterministic** (no RNG
anywhere in this module; fallback telegraph text is a fixed template).

## §3. Derivation rules (total functions — every input maps, no judgment calls)

All helpers live in `src/engine/scene-risk.js`, all pure, all null-safe on malformed walks.

### §3.1 `sceneRiskEnemyShare(walk)` → number 0..1

`numerator` = count of `walk.segments` where `s.encounter && s.encounter.isEnemy === true`, **plus 1**
if a finale segment exists and (`walk.finaleTrack === "Combat"` — urban, `src/engine/walk.js:106-111`
— or the finale segment carries `finale.bossCreature` — dungeon, stamped in
`base.finale={…bossCreature…}` at `src/engine/dungeon-walk.js:589`, computed lines 584-588).
`denominator` = `walk.segments.length`. Empty/absent segments → 0.

### §3.2 `sceneRiskDangerBand(walk, ctx)` → dangerBand

`ctx = { marooned, physics, tail, skinBand, tier, enemyShare, heatStart }` where:
- `marooned` = `!!(w && w.realm && w.realm.active)` at mint (`src/engine/breach.js:177-183`)
- `physics` = `(w && w.realm && Array.isArray(w.realm.physics)) ? w.realm.physics : []` — the
  marooned realm's physics tags; carried on ctx so §3.6 never touches `w` (ctx is the ONLY
  seam through which `w` reaches the sub-helpers; §3.8 builds it once)
- `tail` = `walk.skin && walk.skin.tail` (`"center"|"breach"|"nightmare"`, from
  `rollWalkSkinBreach`, `src/engine/breach.js:88-113`; **`tailWanted` fallback counts as center** —
  graceful fallback ships center *content*, so it gets center *danger*)
- `skinBand` = `walk.skin && walk.skin.band`, compared case-insensitively
- `tier` = `walk.tier` (1|2); `heatStart` = `walk.heatStart||0` (urban only, others 0)

Rules, in order, first match wins:
1. `marooned` → `"mythic"` (deep breach: "you may not come back")
2. `tail === "breach" || tail === "nightmare"` → `"nightmare"`
3. else `score = (tier===2 ?1:0) + (enemyShare>=0.5 ?1:0) + (heatStart>=2 ?1:0) + bandScore`
   where `bandScore = ({strange:1, volatile:2, mythic:3})[String(skinBand||"").toLowerCase()] || 0`
   — exactly that expression: case-insensitive lookup over the three hot bands; **every other
   input — Grounded, Textured, null, undefined, an unrecognized/typo'd band string, a
   non-string — scores 0** (the `||0` default is the ruling, not an inference; no strict-map
   throw, no NaN leak).
   **`score 0 → "safe"` · `1–2 → "risky"` · `≥3 → "deadly"`.** (nightmare/mythic are reachable
   ONLY via rules 1–2 — no score inflation can fake a breach.)

### §3.3 `rewardBand` / `deathStakes` / `persistentTrace`

- `rewardBand = SCENE_RISK_LADDER[dangerBand]` — always, no exceptions (ruling 3).
- `deathStakes = SCENE_RISK_STAKES[dangerBand]` — always.
- `persistentTrace`: `marooned → "world-shift"` · else `tail ∈ {breach,nightmare} → "map"` (the
  exit persistence roll can write map canon, `breachStableDoor`, `src/engine/breach.js:159-166`) ·
  else `heatStart>0 → "clock"` · else `"story"` (ledger canon lines persist regardless).

### §3.4 `sceneRiskTelegraphs(walk, dangerBand)` → array (collection order fixed)

Collect in this exact order (always collect; the ≥1 *requirement* applies only deadly+):

1. **Tail walk** (`tail ∈ {breach,nightmare}`): `{ kind:"sign",
   text: walk.skin.text (truncated 140 chars), source: walk.skin.ref }` — the threshold IS visible;
   the world going wrong at the door is the tell.
2. **Wilderness**: first segment ascending by `num` with `encounter.isEnemy && encounter.signal`
   (the sign-of-passage stamp, `src/engine/wild-walk.js:200`) →
   `{ kind:"sign", text: encounter.signal, source:"wilderness-sign-of-passage" }`.
3. **Dungeon**: `walk.threat && walk.threat.signs` truthy (the 7-col threat identity,
   `src/engine/dungeon-walk.js:525`) →
   `{ kind:"sign", text: walk.threat.signs, source:"dungeon-threat-identity" }`.
4. **Urban**: `walk.threat` present (always, `src/engine/walk.js:528-532`) →
   `{ kind:"rumor", text:"Word on the street: " + walk.threat.id + " holds this ground.",
      source:"urban-threat-identity", minted:true }`. (Template prose over a table-rolled noun —
   same precedent as wild-walk's `` `${sign}: ${signEffect}` `` string build.)
5. **Fallback guarantee** — if `dangerBand ∈ {deadly,nightmare,mythic}` and nothing collected:
   push `SCENE_RISK_FALLBACK_TELEGRAPH = { kind:"rumor", text:"Grim word travels ahead of this
   place: those who pressed on came back wrong, or not at all.", source:"scene-risk-fallback",
   minted:true }`. By construction `sceneRiskOf` can NEVER emit an untelegraphed deadly scene.

**Ambush ruling:** a breach row whose Entry column reads `"ambush"` (`breachEntryOf`,
`src/engine/breach.js:119-126`) keeps its full telegraph — ambush changes *surprise inside the
scene*, it never removes the pre-commitment tell. `risk.entry` carries the value through so the
DM can play the ambush; the fairness contract is untouched.

### §3.5 `sceneRiskEscapes(walk, dangerBand)` → array (fixed order, filtered)

Emit in the fixed order `SCENE_RISK_VOCAB.escapeModes = ["flee","bargain","stealth","environment",
"sacrifice"]` — **the §1 vocab order, the single source of truth**; the emitted array IS the vocab
array filtered by the membership tests below (implement it as exactly that filter, so the two can
never diverge). Membership, per mode:
- `"flee"` — **always** (chase machinery + soft-recall + CHASE-BITE exist; fleeing is a decision,
  `docs/DIFFICULTY.md:41-54`). This makes `escapeModes` non-empty by construction.
- `"bargain"` — any segment with `s.encounter && s.encounter.type === "Social"` or
  `s.type === "Social"`, OR `walk.finaleTrack === "Social"`. (Deliberate **SUPERSET** of
  `breachHasSocialSegment`, `src/engine/breach.js:295-298`, which checks segments only — the added
  `finaleTrack` clause is intentional: an urban Social finale is a track flag, not a segment
  `type`, and it absolutely affords bargaining. Implemented locally as `sceneRiskHasSocial` with a
  cross-ref comment, NOT called cross-module, so lean/headless load orders that omit
  `engine.breach` derive identically. Do NOT drop the finaleTrack clause to "match" breach.js, and
  do not "deduplicate" the twin into a load-order coupling.)
- `"stealth"` — unless `walk.posture === "Reactive"` (urban Reactive topologies = already burning,
  `WALK_TOPOLOGY_POSTURE`, `src/engine/walk.js:100-105`; dungeon/wilderness walks carry no
  `posture` → stealth granted).
- `"environment"` — any segment with non-null `interactable`, OR `.object`, OR `.feature`, OR
  (`sceneFrame && sceneFrame.detail === "full"`). (Dungeon rooms always carry object+feature →
  dungeons always afford environmental play; that is correct, not a bug.)
- `"sacrifice"` — `dangerBand ∈ {nightmare, mythic}` only (drop-the-prize becomes a real exit at
  the top of the ladder; ties the Item Legacy Contract's losable-gear loop).

### §3.6 `sceneRiskClock(walk, ctx)` → pressureClock|null

- `ctx.marooned && ctx.physics.indexOf("huntRules") >= 0` (physics rides ctx — §3.2; this helper
  never sees `w`) → `{ kind:"hunt", note:"apex threat stalks between segments" }` (wins all ties)
- else `walk.environment==="urban" && (walk.heatStart||0) > 0` →
  `{ kind:"heat", start:walk.heatStart, note:walk.heatGuidance||null }`
- else `null`.

### §3.7 `sceneRiskPromise(walk, rewardBand)` → promisedReward

`hint` = first match over the finale segment (`walk.segments.find(s=>s.isFinale)`), else null:
1. `finale.macguffin` (urban Discovery, `src/engine/walk.js:482`) → `.name`
2. `loot.magic` → `` `${loot.magic.rarity}: ${loot.magic.name}` `` (`dwalkLoot` shape,
   `src/engine/dungeon-walk.js:173-177`)
3. `loot.valuable` → `.name`
4. `loot.coin` → the label string
Truncate hint at 80 chars. Return `{ band: rewardBand, hint }`.

### §3.8 `sceneRiskOf(walk, w)` — the assembler

Computes ctx (§3.2 — the assembler is the ONLY function that reads `w`; sub-helpers get ctx),
runs §3.1–3.7, stamps `walk.risk`, returns `walk`. Idempotent (§2). If `walk` is
null/lacks `segments`, return it unstamped (never throw — BATCH-GUARDRAILS G9 discipline).

### §3.9 `sceneRiskValidate(risk)` → `{ ok, errors:[] }` — THE fairness validator

Error strings exact (the harness asserts them):
- `"dangerBand:invalid"` / `"rewardBand:invalid"` / `"deathStakes:invalid"` /
  `"persistentTrace:invalid"` — value ∉ vocab
- `"ladder:broken"` — `rewardBand !== SCENE_RISK_LADDER[dangerBand]`
- `"stakes:broken"` — `deathStakes !== SCENE_RISK_STAKES[dangerBand]` **unless** it is
  `"bardo-only"` (the reserved value passes)
- `"telegraph:kind-invalid"` / `"escape:invalid"` — any member ∉ vocab
- **`"deadly-untelegraphed"`** — `dangerBand ∈ {deadly,nightmare,mythic}` and
  `telegraphs.length === 0` ← **the ruling, mechanized**
- **`"no-escape"`** — `escapeModes.length === 0` (any band; flee-always makes this unreachable
  from `sceneRiskOf`, but the validator guards table-supplied/hand-built contracts forever)
- `null`/non-object risk → `{ ok:false, errors:["risk:missing"] }`

### §3.10 `sceneRiskDigest(risk)` — the compact digest projection

```js
{ danger, reward, stakes, trace, escapes,
  clock: risk.pressureClock ? { kind, note } : null,
  promise: risk.promisedReward ? risk.promisedReward.hint : null,
  telegraphs: risk.telegraphs.slice(0,2).map(t=>({ kind:t.kind, text:(t.text||"").slice(0,140) })) }
```
Fixed-size, DIGEST-DIET-safe (≤ ~450 bytes worst case; full `telegraphs`/`derived` stay on the
walk record, never ship).

## §4. Attachment sites — worked before→after per changed site

### §4.1 NEW `src/engine/scene-risk.js` (module, ~130 lines)

Header comment names this spec; all internals `sceneRisk`/`SCENE_RISK_`-prefixed. Owns:
`SCENE_RISK_VOCAB`, `SCENE_RISK_LADDER`, `SCENE_RISK_STAKES`, `SCENE_RISK_FALLBACK_TELEGRAPH`,
`sceneRiskEnemyShare`, `sceneRiskDangerBand`, `sceneRiskTelegraphs`, `sceneRiskEscapes`,
`sceneRiskHasSocial`, `sceneRiskClock`, `sceneRiskPromise`, `sceneRiskOf`, `sceneRiskValidate`,
`sceneRiskDigest`. `callTimeDeps: []` (reads only its arguments — the purest module in the tree).

### §4.2 `src/engine/walk.js` — rollUrbanWalk return (line 619)

Before:
```js
  return (typeof applySkinGrants==="function") ? applySkinGrants(walk, skin, opts.world||null) : walk;
```
After:
```js
  const out = (typeof applySkinGrants==="function") ? applySkinGrants(walk, skin, opts.world||null) : walk;
  // SCENE-RISK-CONTRACT §4.2 — stamp the fairness contract AFTER grants (the contract reads the final walk).
  return (typeof sceneRiskOf==="function") ? sceneRiskOf(out, opts.world||null) : out;
```

### §4.3 `src/engine/dungeon-walk.js` — rollDungeonWalk return (line 613)

Identical two-line pattern (same before-text at that line, same after-shape; comment cites
§4.3).

### §4.4 `src/engine/wild-walk.js` — rollWildernessWalk return (line 260)

Identical two-line pattern (comment cites §4.4). Travel walks (`opts.kind==="travel"`) get the
contract too — **no exemption** (they're walked, they can kill).

### §4.5 `src/world/dm.js` — activeWalkDigest (insert immediately BEFORE the `cursor:` line)

**Coordination with SPICE-RAISE (same-day spec, SITE G1 — `docs/SPICE-RAISE.md:325-338`):** that
unit inserts a `spiceTier:` line after the same `skin:` line (dm.js:62). Both edits are additive
single-field inserts; **the anchor for THIS edit is therefore content, not a line number: insert
the `risk:` block immediately BEFORE the `cursor:{ current:cur.current, …` line of the
`activeWalkDigest` return object (dm.js:63 on current master), whatever now sits between `skin:`
and `cursor:`.** Both possible before-states are valid; the after-state is identical either way.

Before — master today (dm.js:62-63):
```js
    skin: walk.skin ? { text:walk.skin.text, band:walk.skin.band } : null,
    cursor:{ current:cur.current, touched:cur.touched, done:!!cur.done, total:walk.segCount },
```
Before — if SPICE-RAISE G1 merged first (also valid; anchor on `cursor:` regardless):
```js
    skin: walk.skin ? { text:walk.skin.text, band:walk.skin.band } : null,
    spiceTier: walk.spiceTier||null,   // SPICE-RAISE: …
    cursor:{ current:cur.current, touched:cur.touched, done:!!cur.done, total:walk.segCount },
```
After (in both cases — the `risk:` block sits directly above `cursor:`):
```js
    // SCENE-RISK-CONTRACT §5 — WHY this walk is dangerous, what the player saw before committing,
    // and which exits are real. Pure read of the mint-time stamp; null on pre-contract walks.
    risk: (walk.risk && typeof sceneRiskDigest==="function") ? sceneRiskDigest(walk.risk) : null,
    cursor:{ current:cur.current, touched:cur.touched, done:!!cur.done, total:walk.segCount },
```

And extend the `rule` string (dm.js:113-116). The final concatenated segment on master (line 116)
ends `"…at the finale → {type:'walk_complete'}."` — append ONE more `+`-joined string segment
whose text **begins with a single space** (`" risk is …"`), so the concatenated rule reads
`…{type:'walk_complete'}. risk is the fairness contract…` (never `…}.risk is…`). Exact
before→after of line 116:
```js
// before
         "segment → emit {type:'walk_advance',payload:{toSeg:N}}; at the finale → {type:'walk_complete'}."
// after
         "segment → emit {type:'walk_advance',payload:{toSeg:N}}; at the finale → {type:'walk_complete'}."+
         " risk is the fairness contract: voice at least one telegraph in narration BEFORE the party "+
         "commits to lethal danger, keep every listed escape genuinely reachable as world-fact (never "+
         "as tactics coaching), and never spring untelegraphed lethality — a one-shot unwarned trap "+
         "is a bug, not difficulty."
```

### §4.6 `src/engine/prep-bundle.js` — pbundleSummWalk (lines 157–168)

Add one field to the returned object, after `skin:` (line 167):
```js
           risk: (walk.risk && typeof sceneRiskDigest==="function") ? sceneRiskDigest(walk.risk) : null,
```
(The Stage-1 synthesis view sees danger/reward/telegraphs before any walk is active — prep casts
with the ladder in view.)

### §4.7 `manifest.json` + `genesis.html`

- New module entry `{ id:"engine.scene-risk", path:"src/engine/scene-risk.js", type:"logic",
  owns:[the §4.1 list], callTimeDeps:[], layer: same layer value as engine.breach }`.
- `loadOrder`: insert `"src/engine/scene-risk.js"` immediately after `"src/engine/breach.js"`.
- `genesis.html`: matching `<script src="src/engine/scene-risk.js"></script>` immediately after
  the `<script src="src/engine/breach.js"></script>` tag — **line 1285 on current master**
  (line 1284 is `skin-grants.js`; anchor on the breach.js tag CONTENT, and land the new tag
  between breach.js and `crit.js`, line 1286).
- Add `sceneRiskOf` + `sceneRiskDigest` to the `callTimeDeps` of `engine.walk`,
  `engine.dungeon-walk`, `engine.wild-walk` (`sceneRiskOf`), `world.dm` and `engine.prep-bundle`
  (`sceneRiskDigest`) — then `python3 build/check-manifest.py` must pass.

## §5. Digest slice — what the DM sees (and what it may not do)

`digest.activeWalk.risk` (shape §3.10). The DM: narrates telegraphs as world-facts before lethal
commitment; treats `escapes` as scene affordances that must stay reachable (the "miraculous out"
objectification law, `docs/DIFFICULTY.md:51-54`); reads `promise.hint` as the drip fuel (slow-drip
Charter discipline — hint at, never itemize). The DM may NOT: invent extra escapes as coaching,
downgrade a band, or narrate the `derived` provenance (it never ships). **No new event type** —
the contract is stamped state, not a DM declaration; `DM_EVENT_TYPES` (`src/world/dm.js:1218`) is
untouched. Event-vs-param fork: RESOLVED — param/state, no event.

## §6. Prep-bundle + breach/nightmare attachment summary

- **Walk segment metadata**: `walk.risk` (§4.2–4.4) — the primary carrier.
- **Prep bundles**: ride automatically (bundle environments hold the stamped walks;
  `prepBundleSummary` projects §4.6).
- **Breach/nightmare rows**: reach the contract through `walk.skin.tail` / `.band` / `.entry`
  (already carried by `rollWalkSkinBreach` results) — rules §3.2.2, §3.4.1, §3.4-ambush. No table
  edit in this unit.

## §7. Future table-column enrichment (contract only — NOT built in this unit)

When the breach-tables unit (six d20s) or any re-authored table wants to *author* risk directly,
the sanctioned channel is: a `Telegraph` column (values from the 6-kind vocab) and/or an `Entry`
column (`threshold|ambush`) read via `rollTable().cells` — `breachEntryOf`/`breachRealmsOf`
(`src/engine/breach.js:119-133`) are the accessor precedent. Authored values feed
`sceneRiskTelegraphs` step 1 *text/kind*; they never override the derivation of `dangerBand`
(bands come from tail/spice/tier — labeling discipline, not distribution cowardice, per the
Spice Ruler ruling). Executors: do not build this section; it exists so the breach-tables spec
can cite it.

## §8. Edge cases — enumerated rulings

| # | Case | Ruling |
|---|---|---|
| 1 | Walk minted with no skin (tables uncompiled) | `skinBand null → bandScore 0`; contract still stamps off tier/enemy/heat. |
| 2 | `tailWanted` fallback (breach tail fired, table absent) | Counts as **center** (§3.2) — center content gets center danger. |
| 3 | Wilderness deadly walk with zero enemy legs (hot skin only) | No sign-of-passage collected → fallback telegraph mints (§3.4.5). Never untelegraphed. |
| 4 | Urban walk, threat fallback `{id:"Unknown Threat"}` | Rumor template still mints ("Word on the street: Unknown Threat holds this ground." is ugly but fair); fallback telegraph is NOT also added if the rumor minted. |
| 5 | Travel walks (`kind:"travel"`) | Full contract, no exemption (§4.4). |
| 6 | Job walks / capture walks (`job-walks.js:198`, `capture.js:105`) | Covered automatically — they activate walks minted by the three rollers; no extra call site. |
| 7 | Pre-contract walks in saved worlds | `walk.risk` absent → digest `risk:null`. **No lazy back-stamp** (digest reads never mutate `w`); the walk rides contract-less until walked out. DM falls back to DIFFICULTY.md manual telegraphing (rule text unchanged for that case). |
| 8 | Lean/headless load order omitting scene-risk.js | Rollers' `typeof sceneRiskOf` guard → walks mint exactly as today (byte-identical minus `risk`). Nothing throws. |
| 9 | `sceneRiskOf` called twice (e.g. a future re-mint path) | Idempotent — first stamp wins, rolled-facts-are-canon. |
| 10 | Marooned realm walk that is also urban with heat | `dangerBand "mythic"` (rule 1 wins); clock = hunt if `huntRules` physics, else heat (§3.6 precedence). |
| 11 | Ambush breach entry | Telegraph kept, `entry:"ambush"` carried (§3.4 ambush ruling). Surprise ≠ unfairness. |
| 12 | Finale-less malformed walk | `enemyShare` finale term skipped; `promise.hint null`; contract still valid. |
| 13 | Segments array empty | `enemyShare 0`, escapes = flee(+stealth), telegraphs per env rules; stamps fine. |
| 14 | `skin.band` cased oddly by an authored table ("volatile") | Case-insensitive compare (§3.2). |
| 15 | `skin.band` OUTSIDE the five-band vocab entirely (a typo'd string, a number, an object) | `bandScore 0` — the §3.2 `||0` lookup default is the ruling; the contract stamps normally off the other score terms. Never throw, never NaN. |

## §9. Don't-touch list

- **Generated files — never hand-edit:** `tables.json`, `tables.js`, `data/bestiary.js`,
  `data/realm-bestiary.js`, `data/class-progression.js`, `data/wiki.js` (this unit needs NO
  generator edits either — zero table changes).
- `src/engine/breach.js` — read-only reference (the deliberate `sceneRiskHasSocial` twin exists
  precisely so breach.js is untouched).
- `docs/DIFFICULTY.md`, `docs/DM-BRIDGE.md` (never mid-live-session), `DM_EVENT_TYPES` and the
  `DM_EVENT_SHAPES` accept-lists in `src/world/dm.js` — no new events.
- Walk roller internals above the return lines (§4.2–4.4 are two-line tail edits only).
- Spice distributions, `walkSpiceBand`, the 2d10 bell constants — the contract *labels*, it never
  *re-weights* (Spice Ruler ruling).
- Everything under `Engine/` markdown; the Shifting Vale / Playtest Sandbox vaults.

## §10. Acceptance — commands + expected numbers (RED-FIRST, mutation-asserting)

New harness **`dev/verify-scene-risk.mjs`**, modeled byte-for-byte on `dev/verify-breach.mjs`'s
jsdom loader (manifest loadOrder + `tables.js`, accessor-wrapper gotcha for top-level consts).
**14 enumerated checks; run: `node dev/verify-scene-risk.mjs` → prints `14 passed / 0 failed`,
exit 0.**

RED-FIRST protocol: the executor commits the harness FIRST and runs it against the un-built tree —
expected result **`0 passed / 14 failed`** (`sceneRiskOf` undefined) — pastes that output into the
PR/branch notes, then builds until green. Mutation checks assert values MOVED, not labels
(the BUG-01 lesson).

1. Module loads; `SCENE_RISK_VOCAB` frozen; all six vocab arrays exact (deep-equal against §1).
2. T1 urban walk, forced Grounded skin (`centerFn` stub) → `risk.dangerBand==="safe"` or
   `"risky"` per its rolled enemyShare — recompute expected band in-harness from the same walk and
   assert equality (derivation is deterministic given the walk: recomputation must agree).
3. **MUTATION (band moves):** same walk object, delete `walk.risk`, set
   `walk.skin={text:"x",band:"Volatile"}`, restamp → assert `after !== before` AND
   `after==="deadly"` when `tier===2` is also forced (score 2+... assert the exact expected
   band from §3.2 arithmetic), i.e. the value MOVED and landed where the table says.
4. Breach-tail walk (stub `rollWalkSkinBreach` path or hand-set `skin.tail="breach"`, restamp) →
   `dangerBand==="nightmare"`, `deathStakes==="corpse-hard-to-recover"`, `persistentTrace==="map"`
   — all three MOVED from the center walk's values.
5. Marooned world (`w.realm={active:true,physics:["huntRules"],debt:1}`) →
   `dangerBand==="mythic"`, `deathStakes==="world-shift"`, `pressureClock.kind==="hunt"`.
6. Ladder + stakes maps hold for all five bands (loop the vocab; assert
   `SCENE_RISK_LADDER`/`SCENE_RISK_STAKES` round-trip through a stamped contract).
7. **THE MANDATED PROBE (RED-first by construction):**
   `sceneRiskValidate({dangerBand:"deadly", rewardBand:"rare", deathStakes:"loot-risk",
   persistentTrace:"story", telegraphs:[], escapeModes:[]})` → `ok:false`, errors CONTAIN
   `"deadly-untelegraphed"` AND `"no-escape"`. (Against un-fixed code this check — like all 14 —
   fails RED because the validator doesn't exist.)
8. `sceneRiskOf` can never emit #7's shape: mint a wilderness walk with zero enemy legs + forced
   Mythic skin → stamped `telegraphs.length>=1` with `[0].minted===true`,
   `[0].source==="scene-risk-fallback"`.
9. `escapeModes[0]==="flee"` on every minted walk (urban Reactive topology included); a forced
   Reactive urban walk EXCLUDES `"stealth"` while a forced Investigative one INCLUDES it (the
   membership MOVED with posture).
10. Bargain: a walk whose segments include one `encounter.type==="Social"` includes `"bargain"`;
    strip the segment, restamp fresh → `"bargain"` gone (moved, not just labeled).
11. Idempotency: capture `JSON.stringify(walk.risk)`, call `sceneRiskOf` again, assert
    byte-identical (and a mutated-then-restamped walk WITHOUT deleting `risk` is untouched).
12. Digest: build a live world with an active walk (the `lockOnContact` path,
    `src/world/prep.js:362-375`) → `activeWalkDigest(w).risk` non-null, `telegraphs.length<=2`,
    each text `<=140` chars, deep-equals `sceneRiskDigest(walk.risk)`; digest `rule` string
    contains `"unwarned trap is a bug"` AND contains
    `"{type:'walk_complete'}. risk is the fairness contract"` (pins the §4.5 concatenation seam —
    a missing leading space yields `"}.risk is"` and fails this substring).
13. Pre-contract walk (delete `walk.risk` after activation) → digest `risk===null`, digest does
    NOT re-stamp (`walk.risk` still undefined after the digest call — the no-mutate law).
14. Validator vocab sweep: every error string in §3.9 is reachable by one crafted bad contract
    each; `"bardo-only"` passes `stakes` (the reserved-value carve-out).

Regression gates (all must stay green on the branch):
- `python3 build/check-manifest.py` → exit 0, no orphans/drift.
- `node dev/verify-breach.mjs` → exit 0, `0 failed` (its own printed count unchanged vs master).
- `node dev/verify-prep-bundle.mjs` → exit 0, `0 failed`.
- `node dev/verify-digest-diet.mjs` → exit 0, `0 failed` (the risk slice must not break scope
  budgeting).
- `node dev/playtest-bug-probes.mjs` → exit 0 (standing drift guards).

## §11. Blind-playable parity (doctrine gate)

**No new visual surface is created** — the contract's player-facing carrier IS prose: the DM
narrates telegraphs/escapes from `digest.activeWalk.risk` (§5), which is itself structured text.
Prose-twin path, named: `digest.activeWalk.risk` + the extended `rule` sentence (§4.5). If a
future IN-SESSION-UI panel ever renders a danger badge/icon, it must render *this same digest
text* alongside it (flagged for that spec; nothing to build here). Full-session-via-screen-reader
acceptance is unaffected (no DOM changes in this unit).

## §12. Inference cost declaration (SPEED doctrine)

**Zero.** Pure deterministic derivation at walk mint; no model call, no new dice, no new turn
payload beyond ≤ ~450 digest bytes on walk turns (within DIGEST-DIET's here-slice budget). Cost
delta per session: ~0 tokens beyond the digest bytes.

## §13. Executor sizing + queue position

One Sonnet executor, size **M** (1 new module ~130 lines, 3 two-line roller tails, 2 one-field
projections, 1 rule-string edit, manifest/html registration, 1 harness ~220 lines).

Coordination with the other 2026-07-06 spec-locked units (exact filenames):
- **`docs/ITEM-LEGACY.md`** — no shared edit sites; fully parallel-safe.
- **`docs/TRANSITION-CONTRACT.md`** (the detected-first clock hybrid; folds BUG-02/04/05) — no
  shared edit sites; fully parallel-safe.
- **`docs/SPICE-RAISE.md`** — **ONE shared edit site**: its SITE G1 (`SPICE-RAISE.md:325-338`)
  and this spec's §4.5 both insert a single field into `activeWalkDigest` at dm.js:62-63. NOT a
  blocker and merge order stays free, because §4.5's anchor is content-based (insert the `risk:`
  block immediately before the `cursor:` line — both before-states worked in §4.5). Whichever
  unit lands second applies cleanly; no rebase decision is left to the executor.

Depends only on already-merged code (breach-core, WALK-REFRESH, WALK-CONSUMPTION — all live on
master).

PROVISIONAL (taste, Adam-skim — recommended defaults already encoded above):
- **P1:** the §3.2 score thresholds (0/1–2/≥3) — recommended default as written; moving a
  threshold is a one-line tune, the harness recomputes.
- **P2:** the two minted template strings (§3.4.4 urban rumor, §3.4.5 fallback) — engine-authored
  prose the player will eventually hear verbatim; Adam may re-voice the strings (constants, one
  place each).

## Registry updates

*(Fable applies these — the executor does NOT touch these files.)*

- `docs/DESIGN.md` (decision registry): add — "**Scene Risk Contract (2026-07-06):** every minted
  walk carries a typed fairness contract `walk.risk` (danger/reward ladder 1:1, telegraphs,
  escapes, stakes, trace — vocab in SCENE-RISK-CONTRACT.md §1); deadly+ REQUIRES ≥1 telegraph +
  ≥1 real escape (validator-enforced; an unwarned one-shot trap is a bug); storage seam = engine
  derivation stamped at walk mint (not table frontmatter, not digest-computed); no new DM event.
  Spec: docs/SCENE-RISK-CONTRACT.md — SPEC-LOCKED, build deferred."
- `docs/NEXT-STEPS.md`: add to the deferred-build queue — "☐ **SCENE-RISK-CONTRACT** (spec-locked
  07-06, size M, parallel-safe): `src/engine/scene-risk.js` + roller tail stamps + digest/bundle
  slices; gate = `node dev/verify-scene-risk.mjs` 14/14 (committed RED-first) + the §10 regression
  set."
- `docs/README.md` (index, under `type: system-spec`): add — "`SCENE-RISK-CONTRACT` — the fairness
  contract: danger/reward bands, telegraphs, escape modes, death stakes on every walk; the digest
  slice that tells the DM *why* a scene is dangerous."
- `docs/DIFFICULTY.md`: append one line under "Open questions" — "Threat-surfacing partially
  resolved 2026-07-06: fiction-only presentation stands; the typed carrier is
  docs/SCENE-RISK-CONTRACT.md (`walk.risk` + digest slice)." (No supersession — DIFFICULTY.md
  remains the parent doctrine.)
- No doc superseded.
