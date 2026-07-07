---
type: system-spec
project: Genesis
status: SPECCED — Sonnet-ready, not built
authored: 2026-07-07
source-findings: SET-07-F2, SET-07-F1, SET-06-F1, SET-03-F1, SET-06-F2, SET-08-F3 (dev/playtest-0707/FINDINGS.md)
cluster: HQ3-C — rest-economy + concentration
supersedes: nothing (new)
---

# HQ3-C — Rest-Economy + Concentration cluster

Five contained engine fixes caught in the 2026-07-07 marathon. Every one closes a place where the
**memoryless bridge seat** either can't see a load-bearing PC fact (hit dice, active concentration, a
pending rest obligation) or where the rest system misbehaves versus 5e RAW. **None of these makes the
game safer than RAW** — the interrupted-rest partial refund (C2) is a *correction of a double-penalty
bug*, and the once-per-24h gate (C3) makes rest **stricter**, not looser. Rest stays dangerous:
`restRiskRoll` and its interrupt chances are UNTOUCHED.

All units share one discipline reminder from `CLAUDE.md`: **normalization lives at the contract
boundary** (`DM_EVENT_FIELDS`), **not** in handlers; and **a validator/gate must preserve the thing's
job** — the digest byte-budget guard (`dev/verify-digest-diet.mjs`) must be extended to *account for*
the new fields, never satisfied by hiding them.

---

## Adam's ledger (defaults taken, overridable)

Every open design question is resolved here so the executor has zero decisions to make. Adam can flip
any of these before the build.

1. **[C1] Hit-Dice pool lives on the sheet as `sh.hitDice = {cur, max}`; `max = character level`,
   the die size comes from the class** (`CLASSES[sh.class].hd`, fallback = parse `sh.hitDie` → `8`).
   Regain on a long rest = **⌊level/2⌋, minimum 1** (5e RAW), capped at `max`. Initialized lazily in
   `ensureResources` (full: `cur = max`), grown in `applyLevelUp` (parity with slot growth).
2. **[C1] Each spent hit die heals `roll(dieSize) + CON mod`**, summed over N dice; a die can't heal
   negative (per-die floor 0). Engine rolls by default; a transparent client MAY pass literal rolls
   via `payload.hdRolls:[…]` (mirrors `item_use`'s `payload.roll`). No new event type — this is a
   `rest {kind:"short", spendHitDice:N}` payload extension.
3. **[C1] `pc.hitDice` ships INSIDE `pc.resources`** (`resourceDigest`), not as a bare top-level
   `pc.hitDice`. Rationale (validators-preserve-the-job): hit dice are a rest resource and belong with
   `hp`/`slots`/`pools` that the seat already reads as one economy block. Shape:
   `resources.hitDice = {cur, max, die}` (e.g. `{cur:3, max:10, die:8}`). Only shipped when `max>0`
   (always true for a real PC — sparse-safe anyway).
4. **[C2] An interrupted rest advances a ROLLED partial window, not the full duration.**
   `restInterruptMinutes(restKind)` = `randBetween(⌊full/4⌋, ⌊full·3/4⌋)` — long-rest window 480 →
   **120–360 min (2–6 h)**; short-rest window 60 → **15–45 min**. The threat struck partway through;
   you still lost real hours (stays dangerous) but not the whole day. Zero recovery is unchanged.
5. **[C3] The 24-h benefit gate keys on IN-WORLD clock elapsed since the last *completed* long rest**
   (`sh.lastLongRest = {day, min}`). A second long rest with `elapsed < 1440 min` advances the clock +
   rolls risk **as normal** but grants NO recovery and does NOT re-stamp `lastLongRest`; result field
   `restored:"no-benefit-24h"`. No refusal, no nanny — the world still moves and can still bite.
6. **[C4] `pendingSituation` is a first-class digest field**, stored at `w.dm.pendingSituation`, set by
   `restRiders` on any **severe or interrupted** rest-risk (the "a Threat is already inside the site"
   class). It rides the NEXT digest and is **auto-cleared in `applyResponse`** once the DM has answered
   the turn that carried it (same ack lifecycle as the mint spotlight). Shape below (§HQ3-C4).
7. **[C5] Concentration duration source = `data/spells.js`'s free-text `duration`**, parsed to minutes
   by a new pure `spellDurationMinutes(name)`. **Unindexed / unparseable concentration spell default =
   10 minutes** (the modal non-trivial value; long enough not to cut a scene, short enough to lapse
   across travel/rest). `"up to N rounds"` → `max(1, ⌈N·6/60⌉)` min.
8. **[C5] Concentration expires on clock passage** via a `concentrationTick(w)` hook fired from
   `advanceClock` (exact mirror of the existing `koCheckWake` hook), **clears on a completed long
   rest**, and the **voluntary-drop path already exists** — `concentration_broken {cause:"ended"}`
   works today (confirmed, §HQ3-C5). Read-side ships `pc.concentration {spell, sinceDay, sinceMin,
   expiresInMin}` (omitted when not concentrating — digest diet).

---

## Shared code facts (verified against the tree, 2026-07-07)

| symbol | file:line | shape / note |
|---|---|---|
| `rest` handler | `src/world/dm.js:2298-2316` | advances clock **then** calls `restRiders`; returns `{ok,rest,restored,interrupted,exhaustion,lodging,leveled,minutes}` |
| `restRiders(w,o)` | `src/world/play.js:420-510` | the ONE shared rest cost/rider/recovery stack (UI `passTime` + DM `rest` both call it). `o={restKind,dayScale,via}`. Rolls `restRiskRoll`, then `restRecover` unless interrupted |
| `passTime(kind)` | `src/world/play.js:512-529` | UI rest path; `advanceClock(w,min)` then `restRiders(...)` |
| `restRiskRoll(w,opts)` | `src/world/wiring-a.js:142-152` | returns `{ok,class,text,band,severe,interrupted}`; `severe` = row text reads as a threat; `interrupted` = severe AND interrupt-chance roll hit |
| `restRecover(sh,kind)` | `src/engine/resources.js:140-158` | long → HP/slots/pact/pools full; short → pact + short-pools. **Comment already says short-rest HP is "the player spending Hit Dice — left to an explicit `hp_changed`"** (this spec fills that gap) |
| `ensureResources(sh)` | `src/engine/resources.js:69-86` | lazy idempotent init (cur=max where missing) |
| `deriveResources(sh)` | `src/engine/resources.js:50-63` | derives maxes from class/level |
| `applyLevelUp(sh,to)` | `src/engine/advancement.js:183-…` | grows HP/pb/slots/pools per level; **the insertion precedent for HD-max growth** |
| `resourceDigest(sh)` | `src/engine/resources.js:163-173` | builds `pc.resources` (`hp`/`slots`/`pactSlots`/`pools`) — **C1 + C5 read-side edit site** |
| `applyHpDelta(sh,delta)` | `src/engine/resources.js:104` | returns `{delta,from,to,max,dropped}` |
| `rollDie(max)` | `src/engine/core.js:5` | `Math.floor(Math.random()*max)+1` — the RNG primitive |
| `CLASSES` | `data/species-backgrounds.js:10-21` | `{Bard:{hd:8,…},…}` keyed by capitalized class name = `sh.class`; `.hd` = die size int |
| `advanceClock(w,min)` | `src/world/state.js:81-88` | ticks clock; already fires `koCheckWake(w)` via a re-entrancy-guarded hook — **C5 expiry-hook insertion site** |
| concentration engine | `src/engine/concentration.js` | `startConcentration(sh,spell,castRound)` :37, `breakConcentration(sh,cause)` :46, `isConcentrating(sh)` :31, `spellIndexByName` :20 |
| `cast` handler | `src/world/dm.js:2228-2255` | starts concentration via `startConcentration(t.sh,name,round)` |
| `concentration_start` handler | `src/world/dm.js:2257-2267` | direct set |
| `concentration_broken` handler | `src/world/dm.js:2269-2284` | reads `p.cause||"dm"` — **voluntary drop already works** |
| `dmDigest` pc block | `src/world/dm.js:334-370` | `pc.resources` at :350; add `pc.concentration` here (C5) |
| `dmDigest` return tail | `src/world/dm.js:390-…` | add top-level `pendingSituation` here (C4) |
| `DM_EVENT_FIELDS` | `src/world/dm.js:1453-1457` | `cast`, `concentration_*`, `rest` accept rows — C1 edits the `rest` row |
| `applyResponse` w.dm rebuild | `src/world/dm.js:602-603` | **reconstructs `w.dm` from a literal — DROPS any unlisted key.** C4's `pendingSituation` MUST be carried/cleared here |
| spell `duration` data | `data/spells.js` | free-text `"Concentration, up to 1 minute"` etc.; **distinct concentration durations: 1min ×66, 10min ×37, 1h ×24, 8h ×2, 1day ×2, 2h ×1, 6rounds ×1** |
| SEAT prompt event table | `docs/SEAT-PROMPT.md:127-155` (between `<!-- DM-CONTRACT:EVENTS:… -->`) | `rest`/`cast`/`concentration_broken` bullets — C1/C4/C5 doc diffs land here |

> **NOTE on the SEAT prompt filename.** The task brief calls it `DM-SEAT-PROMPT.md`; the live shipped
> file is **`docs/SEAT-PROMPT.md`** (the `dev/playtest-saves/…/DM-SEAT-PROMPT.md` copy is a frozen
> playtest snapshot — do NOT edit that one). All doc diffs below target `docs/SEAT-PROMPT.md`. The
> event bullets are auto-region-bounded by `<!-- DM-CONTRACT:EVENTS:START/END -->`; edit within.

---

# HQ3-C1 · Hit-Dice spend on a short rest  *(from SET-07-F2 · MED-HIGH)*

**Bug.** `rest {kind:"short"}` returns `restored:"nothing to restore"` and never heals — the engine
models no 5e Hit-Dice spend. A hurt low-level PC has no incremental between-fights heal; it's a full
long rest or nothing. The seat can't even see a HD pool to adjudicate one.

### Files + symbols + insertion points

**1. `src/engine/resources.js` — the HD pool (init + growth + a spend mutator).**

- **`deriveResources` (`:50`)** — add to the returned object a HD spec:
  ```js
  // Hit-Dice pool: max = character level, die size from the class table (fallback: parse sh.hitDie, else 8).
  const hdDie = (typeof CLASSES!=="undefined" && CLASSES[sh.class] && CLASSES[sh.class].hd)
    || (sh.hitDie ? (parseInt(String(sh.hitDie).replace(/\D/g,""),10)||8) : 8);
  out.hitDiceMax = sh.level||1;
  out.hitDie = hdDie;
  ```
- **`ensureResources` (`:69`)** — lazy init after the slots block (:78-79):
  ```js
  if(!sh.hitDice){ sh.hitDice={cur:d.hitDiceMax, max:d.hitDiceMax, die:d.hitDie}; changed=true; }
  ```
  (cur=max on a fresh/legacy sheet — heals in at full, same posture as slots.)
- **New mutator `spendHitDice(sh, n, rolls)`** (place beside `restRecover`, ~`:158`):
  ```js
  /* Spend up to n hit dice on a short rest: roll (die + CON mod, floored at 0) each, sum, heal,
     decrement the pool. rolls[] (optional) lets a transparent client pass the player's own dice.
     Returns {ok, spent, healed, hp, cur, max} or {ok:false,reason}. Pure mutator on sh. */
  function spendHitDice(sh, n, rolls){
    ensureResources(sh);
    const want = Math.max(0, Math.floor(Number(n)||0));
    if(want<=0) return {ok:false, reason:"none-requested"};
    const have = (sh.hitDice&&sh.hitDice.cur)||0;
    if(have<=0) return {ok:false, reason:"no-hit-dice", cur:0, max:(sh.hitDice&&sh.hitDice.max)||0};
    const spend = Math.min(want, have);
    const die = (sh.hitDice&&sh.hitDice.die)||8;
    const con = (sh.mods&&sh.mods.con)||0;
    let healed=0;
    for(let i=0;i<spend;i++){
      const roll = (Array.isArray(rolls)&&typeof rolls[i]==="number") ? rolls[i]
                 : (typeof rollDie==="function"? rollDie(die) : Math.ceil((die+1)/2));
      healed += Math.max(0, roll + con);        // per-die floor 0 (a negative CON never drains HP)
    }
    sh.hitDice.cur = have - spend;
    const r = applyHpDelta(sh, healed);
    return {ok:true, spent:spend, healed:r.delta, hp:r.to+"/"+r.max, cur:sh.hitDice.cur, max:sh.hitDice.max};
  }
  ```
- **`restRecover` (`:140`)** — on a **long** rest, regain ⌊level/2⌋ (min 1) hit dice, capped at max:
  ```js
  if(long && sh.hitDice){
    const back = Math.max(1, Math.floor((sh.level||1)/2));
    const before = sh.hitDice.cur;
    sh.hitDice.cur = Math.min(sh.hitDice.max, sh.hitDice.cur + back);
    if(sh.hitDice.cur>before) parts.push("hit dice");
  }
  ```
- **`resourceDigest` (`:163`)** — ship it (read-side, ledger default #3):
  ```js
  if(sh.hitDice && sh.hitDice.max>0) out.hitDice={cur:sh.hitDice.cur, max:sh.hitDice.max, die:sh.hitDice.die};
  ```

**2. `src/engine/advancement.js` — grow HD max on level-up** (`applyLevelUp`, in the `deriveResources`
delta block ~`:195`, beside slot growth):
```js
if(sh.hitDice){ const grow=Math.max(0,(sh.level||to)-(sh.hitDice.max||0));
  if(grow){ sh.hitDice.max=(sh.hitDice.max||0)+grow; sh.hitDice.cur=(sh.hitDice.cur||0)+grow; } }
```
(A level-up coincides with a rest, so growing `cur` alongside `max` matches the existing slot posture.)

**3. `src/world/dm.js` — the `rest` handler (`:2298-2316`)** — spend HD on a short rest BEFORE
`restRiders`:
```js
const kind=(p.kind==="long")?"long":"short";
let hd=null;
if(kind==="short" && p.spendHitDice && typeof spendHitDice==="function"){
  hd=spendHitDice(t.sh, p.spendHitDice, p.hdRolls);
  if(hd.ok) addLedger(w,"outcome",{kind:"hit-dice",pc:t.c.name,spent:hd.spent,healed:hd.healed,hp:hd.hp,source:src},
    "✦ "+t.c.name+" spends "+hd.spent+" Hit "+(hd.spent===1?"Die":"Dice")+" — heals "+hd.healed+" ("+hd.hp+").");
}
```
Then include `hd` in the return: `return {ok:true, rest:kind, restored:rr.restored, hitDice:hd, interrupted:…, …};`

**4. `src/world/dm.js` — accept map (`DM_EVENT_FIELDS`, `:1457`)** — the ONE normalization site:
```js
rest:              { accept:["kind","spendHitDice","hdRolls"], num:["spendHitDice"] },
```
(`hdRolls` is an array — NOT `num`-coerced; `dmNum` would NaN it, same trap as `condition_add.ttl`.)

### Payload / field shapes
```jsonc
// short rest, spend 2 hit dice (engine rolls):
{"type":"rest","payload":{"kind":"short","spendHitDice":2}}
// transparent client passing the player's own HD rolls:
{"type":"rest","payload":{"kind":"short","spendHitDice":2,"hdRolls":[5,7]}}
```
Digest gains: `pc.resources.hitDice = {cur:3, max:10, die:8}`.

### Doc diff — `docs/SEAT-PROMPT.md` (event bullet, replace the `rest` line at :136)
```
- `rest` — fields: `kind`, `spendHitDice`, `hdRolls` — e.g. `{"type":"rest","payload":{"kind":"short","spendHitDice":2}}` — a SHORT rest heals ONLY by spending Hit Dice (`spendHitDice`:N); each heals a Hit-Die roll + CON mod. Read the pool from `pc.resources.hitDice {cur,max,die}` — never spend more than `cur`. A LONG rest heals fully and regains ⌊level/2⌋ hit dice.
```
Also add one line to the resources note near :79 ("The digest is the only truth about resources"):
`pc.resources.hitDice {cur,max}` is the short-rest heal budget — `cur:0` means a short rest restores no HP.

### Acceptance criteria
- A wounded PC at 4/9 HP, `rest{kind:"short", spendHitDice:1}` → HP rises by (d8+CON, floored 0),
  `hitDice.cur` drops by 1, ledger line emitted.
- `spendHitDice` > `cur` spends only `cur` (clamped, `spent` reflects the real number).
- `cur:0` → `{ok:false,reason:"no-hit-dice"}`, HP unchanged, no false ledger heal.
- A long rest refills HP AND regains ⌊level/2⌋ (min 1) hit dice up to max.
- Digest ships `pc.resources.hitDice {cur,max,die}`.
- `hdRolls:[5,7]` uses those literals instead of rolling.
- Level-up (via `applyLevelUp`) grows `hitDice.max` by the level delta.

### Mutation-test regression (goes RED if reverted)
- **verify-rest.mjs** (new): assert HP MUTATED after a HD short rest (not just `ok:true`) AND
  `hitDice.cur` decremented — the mutation-gap that hid this class. Assert `spendHitDice` beyond `cur`
  clamps. Assert long-rest HD regain = ⌊level/2⌋ min 1. Assert `ok:false` on empty pool.
- **verify-digest-diet.mjs**: assert `pc.resources.hitDice` present + within byte budget (adds ~30 B).

---

# HQ3-C2 · Interrupted rest burns only a partial clock  *(from SET-07-F1 · MED)*

**Bug.** A `rest{kind:"long"}` that rolls a "Raided — no recovery" interrupt returns
`{interrupted:true, restored:null}` but STILL advances the full `minutes:480`. A raided rest is a
double penalty: the whole 8 h of world-time is spent AND no benefit. RAW gives a partial refund (the
threat struck partway through).

### The reorder (contract-boundary fix, both callers)

Today both callers advance the clock **before** `restRiders` rolls the risk, so they can't know the
rest was interrupted. Fix: `restRiders` rolls risk first (it already does, `play.js:469-477`) and
**returns the minutes to advance**; the callers advance AFTER, by that value.

**1. `src/world/wiring-a.js` — new helper (beside `restRiskRoll`, ~`:152`):**
```js
/* Minutes elapsed before an INTERRUPTED rest was broken — a rolled partial window (the threat struck
   partway through). Band: ⌊full/4⌋ … ⌊full·3/4⌋ (long 480 → 120-360; short 60 → 15-45). Still a real
   time cost — the rest was NOT free — but not the full duration (that was the SET-07-F1 double penalty). */
function restInterruptMinutes(fullMin){
  const lo=Math.max(1,Math.floor(fullMin/4)), hi=Math.max(lo,Math.floor(fullMin*3/4));
  return lo + Math.floor(Math.random()*(hi-lo+1));
}
```

**2. `src/world/play.js` — `restRiders` (`:420`)** — accept the intended full window, return the
clock minutes, and DO NOT advance the clock itself:
- Signature/opts: read `o.fullMinutes` (the caller's intended window).
- After the `restRisk` roll (`:477`), compute:
  ```js
  const fullMinutes = (typeof o.fullMinutes==="number") ? o.fullMinutes : 0;
  const clockMinutes = (restRisk && restRisk.interrupted && typeof restInterruptMinutes==="function")
    ? restInterruptMinutes(fullMinutes) : fullMinutes;
  ```
- Add `clockMinutes` (and `interruptedMinutes: restRisk&&restRisk.interrupted ? clockMinutes : null`)
  to the returned object (`:509`).

**3. `src/world/dm.js` — `rest` handler (`:2311-2313`)** — move the advance to AFTER `restRiders`:
```js
const restMin=(kind==="long")?480:60;
const rr=(typeof restRiders==="function")?restRiders(w,{restKind:kind, dayScale:(kind==="long")?1:0, fullMinutes:restMin, via:"dm"}):{};
const advanced=(typeof rr.clockMinutes==="number")?rr.clockMinutes:restMin;
if(typeof advanceClock==="function") advanceClock(w,advanced);
return {ok:true, rest:kind, restored:rr.restored, hitDice:hd, interrupted:!!rr.interrupted,
        interruptedMinutes:rr.interruptedMinutes||null, exhaustion:rr.exhaustionAfter,
        lodging:rr.lodging||null, leveled:rr.leveled||null, minutes:advanced};
```
> Ordering note: lodging/wages/camp-cooking inside `restRiders` are day-scale (not clock-time
> dependent) and their ledger lines stamping at pre-advance clock is *more* honest (the risk/cost
> happened during the night). No behavioral regression from the reorder.

**4. `src/world/play.js` — `passTime` (`:517-523`)** — same reorder for the UI path:
```js
// (compute min/label/rest as today)
const rr = (typeof restRiders==="function") ? restRiders(w,{restKind:rest, dayScale:(kind==="dawn"||kind==="montage")?1:0, fullMinutes:min, via:"ui"}) : {};
advanceClock(w, (typeof rr.clockMinutes==="number")?rr.clockMinutes:min);
```
(Move the `advanceClock(w,min)` call from :517 to here, using `rr.clockMinutes`.)

### applyResponse result surfacing (per the finding's ask)
The `rest` handler's return (`interrupted`, `interruptedMinutes`, `minutes`) already flows into
`applyResponse`'s `applied[]` (`dm.js:551`) and into `pushDmLog(…{applied}…)` (`:566`) — the seat's
telemetry/recap sees the honest partial. **No extra plumbing needed** beyond returning the fields above.

### Acceptance criteria
- A long rest forced to `interrupted` advances the clock by a value in **120…360**, never 480; the
  return carries `interruptedMinutes` in that band and `minutes` equals the advanced value.
- A non-interrupted long rest still advances exactly 480; a short rest 60.
- `restored` is still `null` on interruption (zero recovery unchanged — NOT safer than RAW).
- The UI `passTime` dawn/montage path advances the same partial on interruption.

### Mutation-test regression (goes RED if reverted)
- **verify-rest.mjs**: stub `restRiskRoll` to force `interrupted:true`, apply a long `rest`, assert the
  clock delta is `< 480` and `>= 120` AND `restored===null`. Revert (advance-before-riders) → clock
  delta is exactly 480 → RED.

---

# HQ3-C3 · Once-per-24h long-rest benefit gate  *(from SET-06-F1 · LOW)*

**Bug.** No "benefit once per 24 h" gate. In a secure node a player can chain long rests, each refilling
all slots + HD, braked only by the +480 clock and lodging cost. RAW allows one long-rest benefit per
24 h.

### Files + symbols

**`src/world/play.js` — `restRiders` (`:420`), in the long-rest branch.** Stamp on completion, gate on
entry.

- **The gate** — at the top of `restRiders`, after `restKind` is resolved, for long rests only:
  ```js
  let benefitGated=false;
  if(restKind==="long" && restingPC && restingPC.sheet && restingPC.sheet.lastLongRest){
    const c=clockOf(w), last=restingPC.sheet.lastLongRest;
    const elapsed=(c.day-last.day)*1440 + (c.min-last.min);
    if(elapsed < 1440) benefitGated=true;   // < 24 h since the last COMPLETED long rest → no benefit
  }
  ```
  > Computed on ENTRY (current clock vs the last stamp) — before this rest advances. Two back-to-back
  > rests: the first stamps time T; the second lies down still at ≈T (elapsed ≈ 0) → gated. Correct.
- **Skip recovery when gated** — extend the recovery guard (`:481`):
  ```js
  if(!(restRisk && restRisk.interrupted) && !benefitGated && typeof restRecover==="function" && …){ … }
  let restored = benefitGated ? "no-benefit-24h" : (restRisk&&restRisk.interrupted ? null : <the restRecover result>);
  ```
  (When gated: no `restRecover`, no charge-refill/−1-exhaustion/temp-HP-clear, no HD regain. The clock
  still advanced and the risk still rolled — the world still moves and can still bite.)
- **Stamp on a real benefit** — only when the rest actually granted recovery (long, not interrupted,
  not gated), right after the recovery block:
  ```js
  if(restKind==="long" && !benefitGated && !(restRisk&&restRisk.interrupted)){
    const c=clockOf(w); restingPC.sheet.lastLongRest={day:c.day, min:c.min};
  }
  ```
  > Stamped at the current (pre-advance) clock — the "when you last benefited" anchor. Fine for the
  > 24 h math either way (both rests use the same convention). Interrupted/gated rests never stamp.

### Field shape
`sh.lastLongRest = {day: <int>, min: <int>}` — absent until the first completed long rest.
`rest` handler return already carries `restored`; `"no-benefit-24h"` is a new value the seat reads.

### Doc diff — `docs/SEAT-PROMPT.md` (append to the `rest` bullet from C1)
> A long rest inside 24 in-world hours of the last one still passes time + rolls risk but grants **no
> recovery** (`restored:"no-benefit-24h"`) — narrate a restless, unrewarding night, not a refusal.

### Acceptance criteria
- Two `rest{kind:"long"}` back-to-back in a secure node: the first refills slots/HP/HD and stamps
  `sh.lastLongRest`; the second returns `restored:"no-benefit-24h"`, slots/HP UNCHANGED, clock still
  +partial-or-480, risk still rolled, `lastLongRest` NOT re-stamped.
- A long rest ≥ 24 h after the last one recovers normally and re-stamps.
- An interrupted long rest never stamps `lastLongRest` (you didn't benefit).
- Short rests are entirely unaffected by the gate.

### Mutation-test regression (goes RED if reverted)
- **verify-rest.mjs**: spend slots, long-rest (assert full refill), immediately long-rest again
  (assert slots did NOT refill, `restored==="no-benefit-24h"`). Revert → second refills → RED.

---

# HQ3-C4 · Rest-risk obligations become a first-class `pendingSituation`  *(from SET-03-F1 · MED)*

**Bug.** A severe rest-risk ("a Threat is already inside the site when you wake") is a *pending
obligation the DM must honor next turn*, but it surfaces only as ONE `recentLedger` line. A memoryless
seat can narrate a peaceful wake that contradicts the engine.

### Storage + lifecycle

`w.dm.pendingSituation` — set by `restRiders` when a rest-risk is severe/interrupted; ships on the
NEXT digest; auto-cleared once the DM answers the turn that carried it (mint-spotlight ack lifecycle).

**Shape:**
```jsonc
w.dm.pendingSituation = {
  kind: "rest-risk",
  text: "The Watch Fails — a Threat is already inside the site when you wake…",
  class: "camp",            // security class from restRiskRoll
  severe: true,
  interrupted: false,       // true if it also broke the rest (C2)
  day: 3, min: 375          // clock when it fired (so the seat knows "this happened at your rest")
}
```

**1. `src/world/play.js` — `restRiders` (`:475`, right where the rest-risk ledger line is written):**
```js
if(restRisk && restRisk.ok && (restRisk.severe || restRisk.interrupted)){
  w.dm=w.dm||{}; const c=clockOf(w);
  w.dm.pendingSituation={ kind:"rest-risk", text:restRisk.text, class:restRisk.class,
    severe:!!restRisk.severe, interrupted:!!restRisk.interrupted, day:c.day, min:c.min };
}
```
(Non-severe flavor rolls do NOT set it — only real obligations. Keeps the field meaningful.)

**2. `src/world/dm.js` — `dmDigest` return tail (~`:390`, beside `recentLedger`):**
```js
pendingSituation:(w.dm&&w.dm.pendingSituation)||null,
```

**3. `src/world/dm.js` — `applyResponse` w.dm reconstruction (`:602-603`)** — CRITICAL. The literal
rebuild drops any unlisted key, so `pendingSituation` must be threaded with a **set-this-turn vs
seen-last-turn ack**:
- Capture at the top of the `try` (before events apply, ~`:540`):
  ```js
  const _hadPending = (w.dm && w.dm.pendingSituation) || null;
  ```
- In the rebuild (`:602`), carry a FRESH one, drop a SEEN one:
  ```js
  const _newPending = (w.dm && w.dm.pendingSituation && w.dm.pendingSituation !== _hadPending)
    ? w.dm.pendingSituation : null;    // set by a rest THIS turn → ride next digest; last turn's → acked, clear
  w.dm={rollReq:GS.dm.rollReq, ask:GS.dm.ask, pendingTurnId:null, lastNarratedNodeId:narratedNode,
        digestAckSeq:ackSeq, mintQueue, sessionSeqWatermark, pendingSituation:_newPending};
  ```
  > Identity compare is exact and cheap: a rest event applied this turn assigns a NEW object (`!==` the
  > captured `_hadPending`), so it rides forward; the one the DM just saw is dropped (acked). This is
  > the same "cleared only on a real, scene-delivered response" rule the mint spotlight uses.

### Doc diff — `docs/SEAT-PROMPT.md` (add under "Hard rules" or the digest-reading section)
> **`pendingSituation`** (when present in the digest) is a hard obligation the engine rolled at the
> PC's last rest — e.g. a threat already inside the camp. You MUST honor it this turn: the wake is not
> peaceful. It clears automatically once you've answered — do not carry it past the turn it appears on.

### Acceptance criteria
- A severe rest-risk sets `w.dm.pendingSituation`; the NEXT `dmDigest()` ships it top-level.
- After the DM answers that turn (`applyResponse`), `w.dm.pendingSituation` is null again (acked).
- A rest applied within the answered turn sets a fresh one that survives the `w.dm` rebuild and rides
  the following digest.
- A non-severe (flavor-only) rest-risk sets nothing.

### Mutation-test regression (goes RED if reverted)
- **verify-rest.mjs** (or verify-dm-contract.mjs): force a severe rest-risk, assert `dmDigest`
  ships `pendingSituation` with the text; simulate an `applyResponse` cycle, assert it clears. Revert
  the `w.dm` rebuild thread (drop `pendingSituation:`) → the field is wiped before the digest → RED.
  Revert the ack (carry `_hadPending` instead of `_newPending`) → it never clears → RED.

---

# HQ3-C5 · Concentration lifecycle + visibility  *(from SET-06-F2 + SET-08-F3 · MED)*

**Bug.** Concentration persists indefinitely across scenes AND session boundaries — a 1-minute
Suggestion cast days ago still reads active. Nothing expires it on time passage or a long rest, and the
digest exposes no concentration field, so a stale flag rides unseen and a memoryless seat can't
adjudicate a break.

### Write-side

**1. `src/engine/concentration.js` — parse a duration to minutes (new pure fn, after
`spellIsConcentration` ~`:28`):**
```js
/* Parse data/spells.js's free-text `duration` to a minute count. Handles the concentration set:
   "Concentration, up to N minutes|hours|days", "…up to N rounds". Unindexed / unparseable
   concentration spell → DEFAULT_CONCENTRATION_MIN (10 min — the ledger default). */
const DEFAULT_CONCENTRATION_MIN = 10;
function spellDurationMinutes(name){
  const s = spellIndexByName(name);
  const raw = s && s.duration ? String(s.duration).toLowerCase() : "";
  const m = raw.match(/(\d+)\s*(round|minute|hour|day)/);
  if(!m) return DEFAULT_CONCENTRATION_MIN;
  const n = parseInt(m[1],10)||1;
  switch(m[2]){
    case "round": return Math.max(1, Math.ceil(n*6/60));   // 6 s/round → minutes, min 1
    case "minute": return n;
    case "hour": return n*60;
    case "day": return n*1440;
  }
  return DEFAULT_CONCENTRATION_MIN;
}
```

**2. `src/engine/concentration.js` — `startConcentration` (`:37`)** — stamp the clock + duration so
expiry is checkable. Add a 4th arg `meta` (kept pure — no `w`):
```js
function startConcentration(sh, spell, castRound, meta){
  if(!sh) return { started:null, dropped:null };
  const dropped = (sh.concentration && sh.concentration.spell) ? sh.concentration.spell : null;
  meta = meta || {};
  sh.concentration = { spell, castRound:(castRound==null?0:castRound),
    sinceDay:(meta.day!=null?meta.day:null), sinceMin:(meta.min!=null?meta.min:null),
    durationMin:(meta.durationMin!=null?meta.durationMin:spellDurationMinutes(spell)) };
  return { started:spell, dropped };
}
```

**3. `src/world/dm.js` — both start sites pass the clock.**
- `cast` handler (`:2248`): `const c=clockOf(w); const s=startConcentration(t.sh,name,round,{day:c.day,min:c.min});`
- `concentration_start` handler (`:2261`): same `{day:c.day,min:c.min}` meta.

**4. `src/engine/concentration.js` — the expiry tick (new world-aware fn):**
```js
/* Expire the living PC's concentration when clock time passes its duration. Called from advanceClock
   (mirrors koCheckWake). Breaks + returns {expired, spell} or {expired:false}. */
function concentrationTick(w){
  if(!w || typeof clockOf!=="function") return {expired:false};
  const cur=(w.characters||[]).filter(x=>x.status==="living").slice(-1)[0];
  const sh=cur&&cur.sheet;
  if(!isConcentrating(sh)) return {expired:false};
  const cc=sh.concentration;
  if(cc.sinceDay==null || cc.durationMin==null) return {expired:false};   // legacy flag w/o stamp — leave (recast still displaces)
  const c=clockOf(w);
  const elapsed=(c.day-cc.sinceDay)*1440 + (c.min-cc.sinceMin);
  if(elapsed < cc.durationMin) return {expired:false};
  const spell=cc.spell; breakConcentration(sh,"duration");
  if(typeof addLedger==="function") addLedger(w,"outcome",{kind:"concentration",pc:cur.name,spell,cause:"duration",broken:true,source:"detected"},
    "✦ "+cur.name+"'s concentration on "+spell+" lapses — the spell's duration ran out.");
  return {expired:true, spell};
}
```

**5. `src/world/state.js` — `advanceClock` (`:81-88`)** — fire the tick after `koCheckWake`, same
re-entrancy guard:
```js
if(!advanceClock._busy){
  advanceClock._busy=true;
  try{ if(typeof koCheckWake==="function") koCheckWake(w);
       if(typeof concentrationTick==="function") concentrationTick(w); }
  finally{ advanceClock._busy=false; }
}
```

**6. `src/world/play.js` — `restRiders` recovery block (`:481-487`)** — clear concentration on a
COMPLETED long rest (not interrupted, not benefit-gated):
```js
if(restKind==="long" && typeof breakConcentration==="function" && isConcentrating(restingPC.sheet)){
  const b=breakConcentration(restingPC.sheet,"long-rest");
  if(b.broken) addLedger(w,"outcome",{kind:"concentration",pc:restingPC.name,spell:b.spell,cause:"long-rest",broken:true,source:"detected"},
    "✦ "+restingPC.name+" sleeps — concentration on "+b.spell+" ends.");
}
```

**7. Voluntary-drop path — ALREADY EXISTS (confirmed, no code).** `concentration_broken` handler
(`dm.js:2269-2284`) calls `breakConcentration(t.sh, p.cause||"dm")` — so `concentration_broken
{cause:"ended"}` drops it cleanly today. `cause` and `spell` are already in the accept map
(`:1455`). This unit only DOCUMENTS it (below); no handler change.

### Read-side — `src/world/dm.js` `dmDigest` pc block (after `resources:` ~`:350`)
```js
// SET-08-F3 — active concentration is a load-bearing PC fact the memoryless seat must see. Omitted
// (undefined) when not concentrating — digest diet. expiresInMin derived from the stamp when present.
concentration:(sh&&sh.concentration&&sh.concentration.spell)?(function(){
  const cc=sh.concentration, out={spell:cc.spell};
  if(cc.sinceDay!=null){ out.sinceDay=cc.sinceDay; out.sinceMin=cc.sinceMin;
    if(cc.durationMin!=null){ const c=clockOf(w); out.expiresInMin=Math.max(0, cc.durationMin-((c.day-cc.sinceDay)*1440+(c.min-cc.sinceMin))); } }
  return out; })():undefined,
```

### Doc diff — `docs/SEAT-PROMPT.md`
- Replace the `concentration_broken` bullet (:135):
```
- `concentration_broken` — fields: `cause`, `spell` — e.g. `{"type":"concentration_broken","payload":{"cause":"ended"}}` — use `cause:"ended"` for a VOLUNTARY drop when the PC lets a spell go. Concentration also ends automatically: on a recast, at 0 HP, on a failed damage save, when its duration lapses (clock), and on a completed long rest — you don't emit those.
```
- Add to the digest-reading / resources note (near :79):
> `pc.concentration {spell, sinceDay, sinceMin, expiresInMin}` (present only while concentrating) is
> the truth of what the PC is holding — do not narrate a second concentration spell without dropping
> it, and honor `expiresInMin:0` as lapsed.

### Manifest / registration
No new module — all edits land in existing registered files (`concentration.js`, `state.js`,
`play.js`, `dm.js`). Run `python3 build/check-manifest.py` after edits (no `owns`/`path` changes
expected; the new symbols `spellDurationMinutes`/`concentrationTick`/`spendHitDice`/`restInterruptMinutes`
are added to files that already own their symbol space — **verify each new top-level symbol is covered
by its file's `owns` glob in `manifest.json`; if `owns` lists explicit symbol names, add the new ones**).

### Acceptance criteria
- `spellDurationMinutes("Suggestion")` → 480 (8 h), `("Hold Person")` → 1, `("Bless")` → 1,
  `("Dominate Person")` → 60, an unindexed name → 10.
- Cast a 1-minute concentration spell, `advanceClock(w, 600)` → concentration auto-breaks (cause
  "duration"), ledger line emitted, `sh.concentration===null`.
- A concentration spell still active at a completed long rest is cleared (cause "long-rest"); an
  interrupted long rest does NOT clear it (you never slept).
- `concentration_broken {cause:"ended"}` drops it.
- Recast still displaces the prior (unchanged).
- Digest ships `pc.concentration {spell, sinceDay, sinceMin, expiresInMin}` while concentrating,
  omits it otherwise.

### Mutation-test regression (goes RED if reverted)
- **verify-concentration.mjs** (extend): (a) `spellDurationMinutes` boundary table; (b) start →
  advanceClock past duration → assert `isConcentrating` flips false AND a "duration" ledger line
  exists (mutation-sensitive — not just the label); (c) long-rest clear; (d) digest exposes
  `pc.concentration`. Revert the `advanceClock` hook → the clock-past-duration case stays concentrating
  → RED. Revert the digest field → (d) can't find `pc.concentration` → RED.

---

## Verify plan (roll-up)

| unit | harness | key assertions |
|---|---|---|
| C1 | **new `dev/verify-rest.mjs`** + `verify-digest-diet.mjs` | HD spend heals + decrements; clamp; empty-pool refusal; long-rest ⌊lvl/2⌋ regain; level-up grows max; digest ships `resources.hitDice` |
| C2 | `dev/verify-rest.mjs` | forced-interrupt long rest advances 120-360 (< 480) with `restored===null` |
| C3 | `dev/verify-rest.mjs` | back-to-back long rests: 2nd = `no-benefit-24h`, slots unchanged, no re-stamp |
| C4 | `dev/verify-rest.mjs` (+ `verify-dm-contract.mjs` for the digest field) | severe risk sets `pendingSituation`; digest ships it; `applyResponse` cycle clears it |
| C5 | **extend `dev/verify-concentration.mjs`** | duration parse table; clock-expiry break; long-rest clear; voluntary `cause:"ended"`; digest `pc.concentration` |

`dev/verify-rest.mjs` structure: copy the jsdom-load harness header from `verify-concentration.mjs`
(loads real `data/*.js` + `src/engine/*.js` + `src/world/*.js` in document order under `vm`/jsdom),
build a minimal `w` + a living PC sheet, and drive `applyEvent(w,{type:"rest",…})` directly. Stub
`restRiskRoll` (or `Math.random`) to force interrupt/severe branches deterministically. **Never trust
a subagent's self-reported green** — Opus re-gates each unit's harness output.

Run after every module edit: `python3 build/check-manifest.py`, then the harnesses above, then
`node dev/playtest-bug-probes.mjs` (no existing probe covers this cluster; adding rest/concentration
probes there is an optional stretch, not required by this spec).

## Coherence / doc updates to land WITH the build (CLAUDE.md discipline)
- `docs/SEAT-PROMPT.md` — the four bullet/note diffs above (C1, C3, C4, C5). The event region is
  auto-bounded; keep it inside the `<!-- DM-CONTRACT:EVENTS -->` markers and mind the size budget note
  at :172 (these adds are ~4 short lines — well within the cached-prefix justification).
- `docs/EVENT-CONTRACT.md` — add `spendHitDice`/`hdRolls` to the `rest` row; note the new `restored`
  value `"no-benefit-24h"`.
- `docs/DESIGN.md` + `docs/NEXT-STEPS.md` — register the cluster as landed; check it off the HQ3 queue.
- Cowork auto-memory — one line under the tier-scope / rest notes: "HQ3-C landed — HD short-rest heal,
  interrupted-rest partial clock, 24h long-rest gate, rest-risk `pendingSituation`, concentration
  expiry+long-rest-clear+digest visibility."
