---
type: system-spec
project: Genesis
status: SPEC-LOCKED 2026-07-06 — build DEFERRED (freeze; executes post-Fable via Opus-orchestrated Sonnet executors)
consumer: Opus orchestrator + Sonnet executors; Adam skims anything marked PROVISIONAL
folds: BUG-02 (clock never ticks), BUG-04 (no non-lethal KO), BUG-05 (discovery doesn't move the PC), FIX-B
source: GPT-5.5 outside read §"Transition Contract" (GPT-5.5-advice-for-Claude/README.md:41-53) + Adam's DETECTED-FIRST HYBRID ruling 2026-07-06
---

# TRANSITION CONTRACT — first-class time / location / state transitions

**Thesis.** Movement, time, walk-start, arrival, knockout, and capture are STATE TRANSITIONS, not
narration. Today the world clock moves only through a handful of UI paths (`passTime`, travel
walks, the ritual-cast rider, the bardo) — a purely DM-narrated session freezes at Day 1, 06:00
(BUG-02), a declared capture wrongly starts death saves (BUG-04), and a narrated journey leaves
`currentNodeId` behind (BUG-05). The clock is load-bearing: difficulty, corpse decay, faction
pressure, bardo gaps, rest risk, deadlines all soften when time only moves through the UI.

**Adam's binding ruling (2026-07-06): DETECTED-FIRST HYBRID.** Every mechanical path auto-ticks
the clock (script owns the number); the DM gets exactly one hand-wave lever, `advance_clock
{minutes, cause}`, with sanity clamps. Never a model call in any of this — inference cost of this
entire spec is **zero model calls** (see §9).

Everything below was verified against the tree on 2026-07-06. Line numbers are pre-build
anchors; the executor re-verifies each before editing (drift = re-anchor by symbol, never guess).

---

## §1 · Inventory — every EXISTING time-mutation path (verified)

The complete set of `advanceClock` writers today. **No other code writes `w.clock`** (grep
`advanceClock\|w.clock` over `src/` — the remaining hits are reads).

| # | path | site | minutes today |
|---|------|------|---------------|
| 1 | `passTime("short")` | src/world/play.js:321-326 | 60 |
| 2 | `passTime("dawn")` | src/world/play.js:323 | until next 06:00 (computed) |
| 3 | `passTime("montage")` | src/world/play.js:324 | 1440 |
| 4 | `explore()` legacy instant-travel fallback | src/world/play.js:240 | `route.travelMin` |
| 5 | `walkAdvance` — `kind:"travel"` segment | src/world/prep.js:452-456 | `round(travelMin/segCount)` |
| 6 | `walkComplete` — travel arrival remainder | src/world/prep.js:513-515 | `travelMin − elapsedMin` |
| 7 | `cast` event, ritual flow | src/world/dm.js:1904-1908 | +10 |
| 8 | `bardoGap` (death → rebirth) | src/world/rebirth.js:27 | `days × 1440` |

Paths that **narrate time but tick zero** (the gaps this spec closes): the `rest` DM event
(dm.js:1967), combat (`round_tick`/`combat_end`), non-travel `walk_advance`, `downtime`
(dm.js:3165 — "a week" that moves nothing), `chase_round`, shop transactions
(`buyItem`/`sellItem`, src/world/shop.js:64/79), `capture` (capture.js:148), and every
DM-narrated relocation (`prep_contact enter`, `discovery`).

---

## §2 · THE TICK TABLE (the law — concrete minutes, all decided)

| path | tick (minutes) | mechanism | source stamp |
|------|----------------|-----------|--------------|
| combat | `max(1, round(round×6/60))` at `combat_end` (≥6s/round, min 1 min/fight) | dm.js `combat_end` case | detected |
| chase | +1 per `chase_round` | dm.js `chase_round` case | detected |
| `rest` event, `kind:"short"` | +60 | dm.js `rest` case | detected |
| `rest` event, `kind:"long"` | +480 | dm.js `rest` case | detected |
| `walk_advance`, `kind:"travel"` | unchanged: `round(travelMin/segCount)` | prep.js:452 (+ §5 E22 no-op guard) | detected |
| `walk_advance`, non-travel | `WALK_SEG_MIN[walk.environment]` → dungeon 10 · urban 15 · wilderness 45 · holding 0 · unknown 15 | prep.js `walkAdvance` else-branch | detected |
| `walk_complete` travel remainder | unchanged, **clamped ≥0** (§5 E23) | prep.js:513-515 | detected |
| `downtime` event (all 6 intents incl. seek-work) | +10080 (7 days) + ONE `worldTurn(w,"montage")` | dm.js `downtime` case | detected |
| shop transaction (each completed buy/sell) | +5 (`SHOP_TXN_MIN`) | shop.js `buyItem`/`sellItem` after `applied.ok` | player |
| `open_shop` | 0 — intentional (DM is usually already standing there; travel to it is `move_node`/`advance_clock`) | — | — |
| `prep_contact {enter:true}` / `start_walk` | soft-edge `travelMin` if >0, else **60** (the approach) | via `pcMoveTo` (§3.2) | detected |
| `move_node` | `p.travelMin` → else edge `travelMin` (`findEdge`, state.js:114) → else **60** | dm.js `move_node` case | declared |
| `discovery {enter:true}` | `p.travelMin` else **60** | dm.js `discovery` case | declared |
| `capture` event | +60 (dragged to the holding) | capture.js `applyCapture` | detected |
| `advance_clock` | DM-supplied, clamped **1..10080** | new dm.js case | declared |
| KO natural wake | `rollDie(4)×60` after KO (SRD 1d4 h), applied lazily by `koCheckWake` | §3.7 | detected |
| ritual cast / passTime / bardo | unchanged | — | — |

Constants (all new, single-source, registered in `manifest.json` `owns`):
`WALK_SEG_MIN` (prep.js) · `SHOP_TXN_MIN = 5` (shop.js) · `TRANS_CLOCK_MAX_MIN = 10080` (dm.js).

---

## §3 · New / changed events (exact surfaces)

Five NEW event types: `advance_clock`, `move_node`, `start_walk`, `travel_start`, `knockout`.
`DM_EVENT_TYPES` (src/world/dm.js:1218) grows **87 → 92** entries; each gets a switch case
(dev/verify-dm-seam.mjs parity holds) and a `DM_EVENT_FIELDS` row (dm.js:1237). Per RV-2's
lesson: every alias TARGET below is itself in the `accept` list.

### 3.1 `advance_clock {minutes, cause}` — the ONE hand-wave lever

`DM_EVENT_FIELDS` row: `advance_clock: { accept:["minutes","hours","days","cause"], alias:{ mins:"minutes", min:"minutes" } }`

Handler (new case in dm.js, placed after `distant_word`):

1. `min = p.minutes` if numeric; else `p.hours×60` if numeric; else `p.days×1440` if numeric;
   else → `{ok:false, reason:"no-minutes"}`.
2. `min = Math.round(min)`; `min < 1` → `{ok:false, reason:"bad-minutes:"+min}` (clock is
   monotonic — never backward, never zero).
3. `GS.combat && GS.combat.active` → `{ok:false, reason:"combat-active"}` (in combat, rounds own
   time — script owns the number).
4. Clamp: `clamped = Math.min(min, TRANS_CLOCK_MAX_MIN)`; `wasClamped = clamped !== min`.
5. `const c = advanceClock(w, clamped);` (`advanceClock` returns the mutated clock object, state.js:78-79 — this is the `c` steps 7-8 read); if `clamped >= 1440 && typeof worldTurn === "function"` →
   `worldTurn(w, "montage")` (fires ONCE per event, not per day — ruling).
6. `koCheckWake(w)` (§3.7).
7. Ledger: `addLedger(w,"transition",{kind:"dm-clock",advanceMin:clamped,cause:p.cause||null,clamped:wasClamped,source:src}, "⌛ "+(p.cause||"Time passes")+" — now Day "+c.day+", "+timeOfDay(c.min)+".")`.
8. Return `{ok:true, minutes:clamped, clamped:wasClamped, day:c.day, min:c.min, band:timeOfDay(c.min)}`.

### 3.2 `move_node {nodeId, travelMin?, cause?}` + the shared mover `pcMoveTo`

`DM_EVENT_FIELDS` row: `move_node: { accept:["nodeId","travelMin","cause"], alias:{ to:"nodeId", node:"nodeId", id:"nodeId" } }`

**New helper `pcMoveTo(w, nodeId, opts)` in src/world/play.js** (owns += `pcMoveTo`) — the ONE
place a non-walk relocation happens; `prep_contact {enter}`, `move_node`, and
`discovery {enter}` all route through it (kills three-way drift):

```js
function pcMoveTo(w, nodeId, opts){ opts=opts||{};
  const from=w.currentNodeId, min=(typeof opts.travelMin==="number")?Math.max(0,Math.min(Math.round(opts.travelMin),TRANS_CLOCK_MAX_MIN)):0;
  if(typeof turnStampVisit==="function" && from) turnStampVisit(w,from);      // WORLD-TURN T3 departure stamp
  if(min>0) advanceClock(w,min);
  w.currentNodeId=nodeId; seeNode(w,nodeId);
  if(typeof worldTurn==="function") worldTurn(w,"revisit",{nodeId});          // drift on arrival
  if(typeof koCheckWake==="function") koCheckWake(w);
  const c=clockOf(w);
  addLedger(w,"transition",{kind:"move",fromNodeId:from,toNodeId:nodeId,advanceMin:min,cause:opts.cause||null,source:opts.src||"declared"},
    "→ "+nodeName(w,nodeId)+(min?(" — "+Math.round(min/6)/10+"h on the way"):"")+". Now Day "+c.day+", "+timeOfDay(c.min)+".");
  return { nodeId, fromNodeId:from, minutes:min, day:c.day, band:timeOfDay(c.min) };
}
```

Handler (new dm.js case): refuse `!p.nodeId || !mapOf(w).nodes[p.nodeId]` →
`"no-node:"+id` (move_node NEVER mints — minting is `discovery`'s job); refuse
`p.nodeId===w.currentNodeId` → `"already-there"`; refuse `prepOf(w).activeWalkId` →
`"walk-active"` (finish or abandon via `walk_complete` first). Minutes: `p.travelMin` if
numeric ≥0, else `findEdge(w,cur,id).travelMin`, else 60. Then
`return Object.assign({ok:true}, pcMoveTo(w,p.nodeId,{travelMin:min,cause:p.cause||null,src}))`.

Boundary vs `travel_start` (§3.6): `move_node` = the narrative jump (no walk, no encounters);
`travel_start` = play the road. The DM picks; both are legal for any known node.

### 3.3 `discovery` grows `enter:true` (BUG-05)

`DM_EVENT_FIELDS` discovery row becomes: `{ accept:["makeNode","nodeId","reveal","what","enter","travelMin"], alias:{ name:"what" } }`

In the existing `discovery` case (dm.js:2635-2647), after the `makeNode` block: if
`nodeId && p.enter` — when `prepOf(w).activeWalkId` is set, mint but DON'T move, return
`{ok:true, nodeId, moved:false, reason:"walk-active"}`; else `pcMoveTo(w,nodeId,{travelMin:(typeof p.travelMin==="number")?p.travelMin:60,cause:"discovery",src})`
and return `{ok:true, nodeId, moved:true}`.

### 3.4 `prep_contact {enter:true}` now ticks the approach

Replace the enter block (dm.js:3051-3057) with `pcMoveTo(w,p.nodeId,{travelMin:approachMin,cause:"prep-contact",src})`
where `approachMin` = the node's soft-edge `travelMin` when >0 (soft edges mint with
`travelMin:0`, prep.js:273 — so today this always resolves to) **60**. `lockOnContact` still
runs first, unchanged (its canon ledger line stays; `pcMoveTo` adds the transition line — two
lines, intended). Note `pcMoveTo` subsumes the exact `turnStampVisit`/`seeNode`/`worldTurn`
sequence the block does today — behavior change is ONLY the +60 tick.

### 3.5 `start_walk {nodeId, enter?}` — the player/DM-facing wrapper

`DM_EVENT_FIELDS` row: `start_walk: { accept:["nodeId","enter"], alias:{ id:"nodeId", node:"nodeId" } }`

Handler = pure delegation (one case, no new mechanics):

```js
case "start_walk":{                       // TRANSITION-CONTRACT §3.5 — sugar over prep_contact, enter defaults TRUE
  if(!p.nodeId) return {ok:false, reason:"no-node"};
  const P=(typeof prepOf==="function")?prepOf(w):null;
  if(!(P&&P.nodes&&P.nodes[p.nodeId])) return {ok:false, reason:"no-prepped-walk:"+p.nodeId};
  return applyEvent(w,{type:"prep_contact",payload:{nodeId:p.nodeId,enter:(p.enter!=null?!!p.enter:true)},source:src});
}
```

**Player UX half** (the GPT walk-wiring note: choosing a rumored frontier must visibly fire the
handshake, not depend on DM memory): new global `startWalkTo(nodeId)` in src/world/play.js
(owns += `startWalkTo`): `applyEvent(w,{type:"start_walk",payload:{nodeId},source:"player"})`,
then `saveU(U); renderWorld(); toast(...)`. UI: in the map panel body at src/world/render.js:656
(directly after `renderHexMap(w)`), render one native `<button class="mi">` per **visible soft
node** (`mapVisibleIds` ∩ `n.soft`, render.js:8-13): label `⟶ Set out — <name>`, `onclick="startWalkTo('<id>')"`,
`aria-label="Set out for <name>, a rumored frontier"`. No buttons when no soft nodes (render
nothing, not an empty box).

### 3.6 `travel_start {toNodeId, travelMin?, cause?}` + `travelDepart` extraction

`DM_EVENT_FIELDS` row: `travel_start: { accept:["toNodeId","travelMin","cause"], alias:{ nodeId:"toNodeId", to:"toNodeId", dest:"toNodeId" } }`

**RULING — no `travel_arrive` event.** Arrival already has a DM-reachable surface:
`walk_complete` on a `kind:"travel"` walk IS arrival (prep.js:500-536). A synonym event would
be pure drift surface. Document this in EVENT-CONTRACT.md's travel_start row ("arrive via
walk_complete").

**Extract `travelDepart(w, toNodeId, opts)` into src/world/play.js** (owns += `travelDepart`)
from `explore()`'s Place branch (play.js:214-245), so the DM and the UI share ONE departure
path. Signature/behavior:

1. Refuse: unknown node → `"no-node:"+id`; `toNodeId===currentNodeId` → `"already-there"`;
   `prepOf(w).activeWalkId` → `"walk-already-active"`.
2. `edge=findEdge(w,fromId,toNodeId)`. Route:
   - **edge branch** — `route={bearing:edge.bearing, travelMin:(typeof opts.travelMin==="number"?Math.max(0,Math.round(opts.travelMin)):edge.travelMin), leagues:edge.leagues||Math.max(1,Math.round(route.travelMin/45))}` (leagues falls back to a travelMin-derived value only when the edge carries none — an established edge always has leagues, so the fallback fires only for a malformed edge).
   - **no-edge branch** — `rollRoute()` takes **no arguments** (`function rollRoute(){…}`, state.js:119) — it CANNOT accept a travelMin. **DECISION (the latent fork, resolved):** call `rollRoute()` to seed `{bearing, travelMin, leagues}`, then when `opts.travelMin` is numeric OVERRIDE and RECOMPUTE both dependent fields on the returned object so the route is internally consistent — never a mixed state where `leagues` is the random-seed value but `travelMin` is the DM's:
     ```js
     const route=rollRoute();
     if(typeof opts.travelMin==="number"){
       route.travelMin=Math.max(0,Math.round(opts.travelMin));
       route.leagues=Math.max(1,Math.round(route.travelMin/45));   // recomputed, NEVER left stale from the seed roll
     }
     ```
     Then `addEdge(w,fromId,toNodeId,route)` + `placeTravelNode(w,fromId,toNodeId,route)` (typeof-guarded) — same canon-route minting `explore()` does today (which calls `rollRoute()` with no override, play.js:219). Both branches thus derive `leagues` from the FINAL `travelMin` by the identical `max(1,round(travelMin/45))` rule — two competent executors produce byte-identical `route.leagues`. TRC-9 (explicit `addEdge` before `travel_start`) exercises the edge branch; **TRC-9b (§7, new) exercises this no-edge override branch** so both are pinned.
3. `seeNode(w,fromId); seeNode(w,toNodeId)`; encounters/biomes/tier/region/walk exactly as
   play.js:223-229 (`encN`, `travelLegBiomes`, `pbundleTierForLevel`, `regionForNode`,
   `rollWildernessWalk({legCount,biomes,tier,kind:"travel",region})`).
4. Walk minted → `prepStartTravelWalk(w,{destNodeId,originNodeId:fromId,travelMin:route.travelMin,walk})`
   + the `"transition"/"travel-depart"` ledger line (mirror play.js:234-235). Return
   `{ok:true, walk:true, travelMin:route.travelMin, destNodeId:toNodeId, segCount:walk.segCount}`.
5. Walk engine unavailable → the instant-arrival degrade (mirror play.js:238-244:
   `turnStampVisit` + `advanceClock(route.travelMin)` + `currentNodeId=toNodeId` + `worldTurn`
   + `"travel"` ledger line). Return `{ok:true, walk:false, instant:true, travelMin, destNodeId}`.

Refactor `explore()`'s Place branch to call `travelDepart` (it keeps its own dedupe/gazetteer/
reveal/toast wrapping). New dm.js case = guard `p.toNodeId` then
`return travelDepart(w,p.toNodeId,{travelMin:p.travelMin,cause:p.cause||null})` (typeof-guarded
→ `"travel-unavailable"`).

### 3.7 KNOCKOUT — `hp_changed {nonlethal:true}` + dedicated `knockout` event (BUG-04)

**RULING (fork resolved): BOTH thin entrances over ONE implementation.**
`hp_changed {delta, nonlethal:true}` handles the damage-driven KO (5e: the attacker declares
non-lethal on the dropping blow); a dedicated `knockout {cause?}` handles the no-damage-math KO
(sap, sleep, narrative subdual). Both land in one helper. A dedicated event ALONE would bypass
HP bookkeeping; the flag ALONE leaves the DM doing subtraction for a narrative KO.

`DM_EVENT_FIELDS`: `hp_changed` accept becomes `["delta","crit","meleeAdjacent","nonlethal"]`;
new row `knockout: { accept:["cause"] }`.

**KO state shape** (new, on the sheet): `sh.ko = { stable:true, cause:<string|null>, at:{day,min}, wakeDay:<int>, wakeMin:<int> }`
— wake time = KO time + `rollDie(4)*60` minutes (SRD: stable at 0, wakes with 1 HP after 1d4 h).
Plus the string `"unconscious"` pushed onto `t.c.conditions` (guarded by `indexOf`, the exact
capture.js:174-176 string-condition precedent).

**New helper `applyKnockout(w, t, cause)` in src/world/dm.js** (owns += `applyKnockout`): sets
`sh.hpCur=0` (if not already), `clearDeathSaves(t.sh)` guard-called, writes `sh.ko` as above,
pushes `"unconscious"`, ledger
`addLedger(w,"outcome",{kind:"knockout",pc:t.c.name,cause,wakeDay,wakeMin,source:…}, "✦ "+t.c.name+" goes down — out cold, breathing. (non-lethal)")`.
Returns `{ok:true, ko:true, wakeInMin}`.

**`hp_changed` integration** (the 0-HP branch, dm.js:1461-1480):
- `delta<0 && r.to<=0 && p.nonlethal` → `applyKnockout` INSTEAD of the massive/auto-fail/
  startDeathSaves ladder. Non-lethal can never kill: massive overkill still just KOs (§5 E15).
  Skipped entirely when the PC was ALREADY dying (`wasDown && sh.deathSaves`) — non-lethal
  damage cannot convert dying→stable (§5 E16).
- **Lethal damage on a KO-stable PC** (`wasDown && sh.ko && delta<0 && !p.nonlethal`): clear
  `sh.ko` + remove `"unconscious"`, then the EXISTING `autoFailDeathSave` path runs
  (`startDeathSaves` implicit in it; 1 fail, 2 on crit/melee-adjacent) — CAL-1 posture: the
  mercy was the non-lethal choice; a blade to the sleeping throat has teeth.
- **Heal while KO** (`delta>0 && r.to>0`, dm.js:1442-1443): alongside the existing
  `clearDeathSaves`, also clear `sh.ko` + remove `"unconscious"` — healing wakes.

**`knockout` case** (new): `livingSheet` guard → `no-pc`; refuse when already dying
(`sh.deathSaves` set) → `{ok:false, reason:"already-dying"}` (§5 E19); if `hpCur>0` first apply
the drop as a detected ledgered fact (set `hpCur=0` inside `applyKnockout` — do NOT recurse into
`hp_changed`); then `applyKnockout(w,t,p.cause||null)`.

**Wake — `koCheckWake(w)` (new, src/world/dm.js, owns += `koCheckWake`).** Lazy check (no tick
loop exists, by design): if living PC has `sh.ko` and `clockOf(w)` ≥ `{wakeDay,wakeMin}` →
`sh.hpCur=Math.max(sh.hpCur||0,1)`, clear `sh.ko`, remove `"unconscious"`, `clearDeathSaves`,
ledger `"✦ <name> comes to — 1 HP, the world still turning."`. Call sites (all typeof-guarded):
(1) end of the `advance_clock` case, (2) `passTime` right after `advanceClock` (play.js:326),
(3) inside `pcMoveTo`, (4) end of the `rest` event case after its tick.

**Bardo/death-loop interaction (ruling):** `knockout`/non-lethal NEVER touches `killCharacter`
(src/world/fate.js:9) or the Death & Rebirth flow — no bardo, no death-save tracker, no corpse.
Only the lethal ladder (unchanged) routes there. `capture` composes as: DM emits
`hp_changed {delta, nonlethal:true}` (→ KO-stable) then `capture {…}` — the capture case itself
gains only its +60 tick (§2) via `advanceClock(w,60)` before its ledger beat (capture.js:181),
with `advanceMin:60` added to the beat's data.

**Digest:** in `dmDigest`'s pc block (src/world/dm.js:288-313, beside `hp` at :291) add
`ko: (sh&&sh.ko) ? { stable:true, wakeInMin:Math.max(0, (sh.ko.wakeDay-c.day)*1440 + sh.ko.wakeMin-c.min) } : undefined`
— `c` is the clock captured at `dmDigest` top (`const c=clockOf(w)`, dm.js:272) and `sh.ko.wakeDay`/`sh.ko.wakeMin` are the KO wake fields (§3.7 KO state shape); both are in scope at this site. **Omitted entirely when null** (digest-diet: 0 bytes on the normal turn).

### 3.8 The remaining auto-ticks (existing cases, small edits)

- **`rest` case (dm.js:1967-1988):** before `restRecover`, `advanceClock(w, kind==="long"?480:60)`;
  add `advanceMin` to the ledger data; call `koCheckWake(w)` at the end. (The UI `passTime` path
  never emits `rest` — no double tick; verified play.js:388-390 calls `restRecover` directly.)
- **`combat_end` case (dm.js:1579-1602):** before `GS.combat=null`:
  `const combatMin=Math.max(1,Math.round(((GS.combat.round||1)*6)/60)); advanceClock(w,combatMin);`
  add `minutes:combatMin` to the combat-end ledger data. Ticks on EVERY outcome incl. `pc-dead`
  (time passed regardless).
- **`chase_round` case (dm.js:3121-3144):** after the guards, `advanceClock(w,1)`; add `min:1`
  to both round/end ledger data.
- **`downtime` case (dm.js:3165-3191):** after `r.ok` (INCLUDING the seek-work branch):
  `advanceClock(w,10080); if(typeof worldTurn==="function") worldTurn(w,"montage");` — the week
  passes BEFORE the yield lands (distant-word salience reads the post-week day). ONE montage
  turn, not seven (ruling — WORLD-TURN T1 fires per long elapse, not per day). Lodging is NOT
  auto-charged (parity with today; a downtime-lodging sink is a future ECONOMY hook — non-goal).
- **`walkAdvance` (prep.js:443-458):** (a) **no-op guard first**: `if(pn.cursor.current===toSeg) return {ok:true,current:toSeg,touched:…,atFinale:…,noop:true}`
  BEFORE any tick — a memoryless DM re-emitting the current segment must not inflate the clock
  (this also closes the latent travel bug where a re-emit inflates `elapsedMin` and turns the
  arrival remainder NEGATIVE → `advanceClock` runs the clock BACKWARD); (b) non-travel branch:
  `else if(typeof advanceClock==="function"){ const per=(WALK_SEG_MIN[walk.environment]!=null)?WALK_SEG_MIN[walk.environment]:15; if(per>0){advanceClock(w,per); pn.elapsedMin=(pn.elapsedMin||0)+per;} }`
  with `const WALK_SEG_MIN={dungeon:10,urban:15,wilderness:45,holding:0};` at module top.
- **`walkComplete` (prep.js:513-515):** `const remainder=Math.max(0,(pn.travelMin||0)-(pn.elapsedMin||0));`
  (clamp — belt on top of the no-op guard).
- **shop (shop.js:64-77 `buyItem`, :79-92 `sellItem`):** after `applied.ok` and before `saveU`:
  `if(typeof advanceClock==="function") advanceClock(w,SHOP_TXN_MIN);` with
  `const SHOP_TXN_MIN=5;` at module top. No extra ledger line (the item_changed line + the
  header clock are the record).

---

## §4 · Contract/registry surfaces the build must keep in lockstep

1. `DM_EVENT_TYPES` (dm.js:1218): append `"advance_clock","move_node","start_walk","travel_start","knockout"` → 92 entries.
2. `DM_EVENT_FIELDS` (dm.js:1237): the 5 new rows (§3) + the 2 edited rows (`hp_changed`,
   `discovery`). ROOT-B probe invariant holds (every FIELDS key ∈ TYPES).
3. `docs/EVENT-CONTRACT.md` taxonomy table: one row per new event (type · payload · usual
   source · consumed-by), `nonlethal` documented on `hp_changed`, `enter`/`travelMin` on
   `discovery`, and the "arrive via walk_complete" note on `travel_start`.
4. `manifest.json`: owns — play.js += `pcMoveTo`,`travelDepart`,`startWalkTo`; dm.js +=
   `applyKnockout`,`koCheckWake`,`TRANS_CLOCK_MAX_MIN`; prep.js += `WALK_SEG_MIN`; shop.js +=
   `SHOP_TXN_MIN`. callTimeDeps — dm.js += `pcMoveTo`,`travelDepart`,`findEdge`,`rollDie`;
   play.js += `koCheckWake`; shop.js += `advanceClock`. Then `python3 build/check-manifest.py`
   and fix anything it flags.
5. Seat teaching (Fable applies post-build, listed in Registry updates): the live seat prompt
   gains the five events + `nonlethal` (+~120 tokens of system prompt — declared in §9). The
   only canonical prompt in-tree today is the playtest fixture
   `dev/playtest-saves/sella-shimmering-maw/DM-SEAT-PROMPT.md` — fixtures are NOT edited.

**No new files** except probe additions to `dev/playtest-bug-probes.mjs`. No new modules, no
`<script>` tag changes, no `loadOrder` changes.

---

## §5 · Edge cases — enumerated rulings (all decided)

| # | case | ruling |
|---|------|--------|
| E1 | `advance_clock` minutes 0 / negative / NaN / non-numeric | refuse `bad-minutes` / `no-minutes` — the clock is monotonic |
| E2 | `advance_clock` > 10080 | clamp to 10080, `clamped:true` in result AND ledger data |
| E3 | `advance_clock` while `GS.combat.active` | refuse `combat-active` — rounds own combat time |
| E4 | `advance_clock` during an active travel walk | ALLOWED (a rest on the road); remainder math unaffected (`elapsedMin` untouched) |
| E5 | `move_node` during any active walk | refuse `walk-active` |
| E6 | `move_node` to unknown node | refuse `no-node:<id>` — never mints |
| E7 | `move_node` to the current node | refuse `already-there` |
| E8 | `move_node travelMin:0` | allowed (adjacent hand-off); clamp 0..10080 |
| E9 | `discovery {enter:true}` with active walk | node minted, move SKIPPED, `{ok:true,moved:false,reason:"walk-active"}` |
| E10 | `start_walk` on a non-prepped node | refuse `no-prepped-walk:<id>` |
| E11 | `start_walk` on an already-locked frontier | `lockOnContact` already:true path resumes the cursor; enter still applies — idempotent |
| E12 | `travel_start` with active walk | refuse `walk-already-active` |
| E13 | `travel_start` to current node | refuse `already-there` |
| E14 | `travel_start` with walk engine absent | instant-move degrade (clock += travelMin) — play never stalls |
| E15 | non-lethal drop with overkill ≥ max HP | KO, never instant death (the attacker chose mercy; CAL-1 is about failed SAVES, not chosen restraint) |
| E16 | `nonlethal` damage on an already-DYING PC | no tracker change, no KO — dying is exited only by heal/stabilize/death |
| E17 | lethal damage on a KO-stable PC | ko cleared → auto-fail death-save path (1 fail; 2 on crit/melee-adjacent) — hard-and-dangerous holds |
| E18 | heal>0 while KO | immediate wake at the healed HP (ko + unconscious + tracker all clear) |
| E19 | `knockout` on an already-dying PC | refuse `already-dying` |
| E20 | `knockout` with no living PC | refuse `no-pc` |
| E21 | clock jumps far past `wakeAt` (montage) | wake exactly once, `hpCur` → 1 |
| E22 | `walk_advance` re-emitting the CURRENT segment | `{ok:true, noop:true}`, ZERO tick — both travel and frontier walks |
| E23 | travel arrival remainder | clamped ≥0 — the clock can never run backward on arrival |
| E24 | `nonlethal:true` with `delta>0` | flag ignored; ordinary heal |
| E25 | `downtime` seek-work | ticks the full week like every other intent |
| E26 | KO and the bardo | never connected: no `killCharacter`, no bardo, no corpse from any non-lethal path |

---

## §6 · Worked before→after (one per changed site)

**dm.js `hp_changed` 0-HP branch** — before: `hp_changed {delta:-3, nonlethal:true}` on hpCur 3
→ `startDeathSaves` → `sh.deathSaves={succ:0,fail:0}`, "dying. Roll death saves." (the BUG-04
session had to cap damage at 1 HP). After: `sh.hpCur=0`, `sh.deathSaves=null`,
`sh.ko={stable:true,…,wakeDay:1,wakeMin:480+d4×60}`, conditions gain `"unconscious"`, ledger
"goes down — out cold, breathing."

**dm.js `combat_end`** — before: 4-round fight ends, `w.clock` 480 → 480. After: 480 → 481
(`max(1, round(24/60)) = 1`), ledger data gains `minutes:1`.

**dm.js `rest` case** — before: `rest {kind:"long"}` restores slots, clock frozen. After:
clock 480 → 960, `advanceMin:480` in ledger data, `koCheckWake` runs.

**dm.js `downtime`** — before: "…a week of lie-low" lands, still Day 1 06:00. After: Day 1 →
Day 8 (min unchanged), one `worldTurn(w,"montage")` fired, then the yield rolls.

**dm.js `discovery`** — before: `{what:"The Salt Door", makeNode:true}` mints the node,
`currentNodeId` unchanged (BUG-05). After: with `enter:true` → node minted AND
`currentNodeId==="the-salt-door"`, clock +60, worldTurn revisit fired, transition ledger line.

**dm.js `prep_contact {enter:true}`** — before: lock + move, clock frozen. After: identical
lock + move via `pcMoveTo`, clock +60, "→ <name> — 1h on the way." transition line added.

**prep.js `walkAdvance`** — before: dungeon walk seg 1→2, clock frozen; re-emit seg 2 on a
travel walk double-charges `elapsedMin` (latent negative-remainder bug). After: dungeon seg
advance +10 min; re-emit → `{noop:true}`, zero tick, both walk kinds.

**shop.js `buyItem`** — before: purchase applies, clock frozen. After: purchase applies, clock
+5, gold delta unchanged.

**play.js `explore()` Place branch** — before: inline departure code. After: identical behavior
through `travelDepart` (same ledger lines, same walk mint, same degrade path).

**dm.js:1218/1237** — before: 87 types, no fields rows for the five. After: 92 types, 5 new
rows + 2 edited rows; `node dev/verify-dm-seam.mjs` parity green.

**dev/playtest-bug-probes.mjs BUG-02/04/05** — before: probes assert the ABSENCE (PRESENT ●).
After: rewritten to assert the fix by MUTATION (§7) and flip ○ resolved.

---

## §7 · Acceptance — commands + expected numbers (all probes RED-FIRST, mutation-asserted)

Probes go in `dev/playtest-bug-probes.mjs` (same `probe(id, desc, present, detail)` convention;
`present:true` = bug present). **Red-first protocol: the executor commits/runs the probe
additions against UN-FIXED master first and records the `● PRESENT` lines in the build log,
then builds, then shows the flip.** Every assertion below moves a VALUE (clock minutes, node
id, HP, tracker) — never a label (the BUG-01 lesson).

Rewrite three existing probes (their current forms can never flip):

- **BUG-02** → `applyEvent(w,{type:"advance_clock",source:"declared",payload:{minutes:90}})`
  from `{day:1,min:480}`. PRESENT unless `w.clock.min===570 && day===1`.
- **BUG-04** → two-sided mutation: (a) `hp_changed {delta:-9, nonlethal:true}` from hpCur 9 →
  PRESENT if `sh.deathSaves` truthy OR `sh.ko` falsy OR `conditions.indexOf("unconscious")<0`;
  (b) plain `hp_changed {delta:-9}` on a fresh world must STILL set `sh.deathSaves` (the lethal
  ladder must not soften — assert `{succ:0,fail:0}`).
- **BUG-05** → `discovery {what:"A New Place", makeNode:true, enter:true}` → PRESENT unless
  `currentNodeId==="a-new-place"` AND `clock.min` moved 480→540.

New probes (seed world = the existing `seedWorld` fixture, clock `{day:1,min:480}`):

| id | drive | resolved when (exact values) |
|----|-------|------------------------------|
| TRC-1 | `advance_clock {minutes:999999}` | `w.clock.day===8 && w.clock.min===480`, result `clamped:true` |
| TRC-2 | `advance_clock {minutes:0}` then `{minutes:-30}` | both `{ok:false}`, `clock.min===480` (unmoved) |
| TRC-3 | `combat_start` (1 foe) → 3× `round_tick {phase:"end"}` → `combat_end {outcome:"resolved"}` | `clock.min===481` |
| TRC-4 | `rest {kind:"long"}` | `clock.min===960`; `{kind:"short"}` on a fresh seed → `540` |
| TRC-5 | fixture frontier walk (`P.bundle.environments=[{walk:{environment:"dungeon",segCount:3,segments:[{num:1,depth:0,exits:[]},{num:2,exits:[]},{num:3,isFinale:true,exits:[]}]}}]`, `P.nodes["probe-dg"]={env:"dungeon",idx:0,soft:false}`, `walkSetActive`) → `walk_advance {toSeg:2}` → re-emit `{toSeg:2}` | first: `clock.min===490`; second: result `noop:true` AND `clock.min===490` (unmoved) |
| TRC-6 | second node minted via `addNode`, no edge → `move_node {nodeId}` | `currentNodeId` moved AND `clock.min===540` |
| TRC-7 | `knockout {cause:"sap"}` on hpCur 9 | `hpCur===0 && sh.ko && !sh.deathSaves`; then `advance_clock {minutes:300}` → `hpCur===1 && !sh.ko` (E21 wake) |
| TRC-8 | KO'd PC (TRC-7 setup) takes `hp_changed {delta:-2}` (lethal) | `!sh.ko && sh.deathSaves && sh.deathSaves.fail===1` (E17) |
| TRC-9 | `addEdge(w,a,b,{bearing:"N",travelMin:120,leagues:3})` → `travel_start {toNodeId:b}` → advance every segment → `walk_complete` | `currentNodeId===b` AND total `clock.min` delta `===120` exactly (remainder math, E22/E23) |
| TRC-9b | second node `c` minted via `addNode`, **NO edge** → `travel_start {toNodeId:c, travelMin:90}` (drives the no-edge `rollRoute()`-override branch, §3.6 step 2) | the newly-minted edge `findEdge(w,a,c)` has `travelMin===90` AND `leagues===2` (= `max(1,round(90/45))`, RECOMPUTED — PRESENT if `leagues` is any other value, i.e. left at the random `rollRoute` seed) |
| TRC-10 | `downtime {intent:"lie-low"}` | `clock.day===8` (skip-guard: if result reason `no-table`, probe reports skipped, not resolved) |
| TRC-11 | soft-frontier fixture (as TRC-5 but node `soft:true` + soft edge) → `start_walk {nodeId}` | `P.activeWalkId===nodeId && currentNodeId===nodeId && clock.min===540` |
| TRC-12 | `open_shop {name:"Probe Goods",tier:1}` → grant gold via `item_changed {gold:999}` → `win.buyItem(shopId, firstStockLine.name)` | gold DECREASED and `clock.min` moved exactly +5 from its pre-buy value |

Commands + expected results (the whole gate):

```
node dev/playtest-bug-probes.mjs
  → BUG-02 ○ resolved · BUG-04 ○ resolved · BUG-05 ○ resolved
  → TRC-1..TRC-12 (incl. TRC-9b) ○ resolved (TRC-10 may report "skipped (no-table)" only if the
    downtime table is uncompiled — it is compiled today, so expect resolved)
  → BUG-07 stays ● PRESENT (WAI, by ruling) · every probe already ○ before this build stays ○
python3 build/check-manifest.py        → exit 0 (no orphans, no drift)
node dev/verify-dm-seam.mjs            → exit 0 (type↔switch parity at 92)
node dev/verify-roll-branches.mjs      → exit 0 (regression: branches untouched)
node dev/verify-dm-events.mjs          → exit 0 (applyEvent runtime green under jsdom)
```

---

## §8 · Don't-touch list

- **Generated — never hand-edit:** `tables.json`, `tables.js`, `data/bestiary.js`,
  `data/realm-bestiary.js`, `data/class-progression.js`, `data/wiki.js` (spec generator edits
  only; this spec requires NONE).
- Engine table markdown (no table content changes in this unit).
- `docs/DM-BRIDGE.md` (never mid-live-session), `dev/playtest-saves/**` (fixtures),
  `dev/playtest-bridgeless.mjs`.
- `advanceClock`/`clockOf` themselves (`clockOf` state.js:57, `advanceClock` state.js:78) — every tick goes THROUGH them, none
  reimplements them; `w.clock`'s shape `{day,min}` is frozen (no `sec` field — sub-minute time
  lives only in the ×6s combat math).
- `killCharacter` / bardo / Death & Rebirth flow — untouched (E26).
- `xp_granted` no-op, XP economy, `grantXp` pricing — untouched.
- The `Shifting Vale/` and `Playtest Sandbox/` vaults.

## §9 · Inference cost (SPEED-DOCTRINE declaration)

**Zero model calls added.** Every tick is deterministic script. Digest delta: `pc.ko` omitted
when null → 0 bytes on the normal turn, ~45 B while KO'd. Seat-prompt delta when Fable teaches
the five events: ~120 tokens of system prompt per turn. Net play-cost effect is NEGATIVE:
BUG-02-class hand-fix turns (harness `patch` round-trips) disappear.

## §10 · Blind-playable parity (BLIND-PLAYABLE FULLY)

No new visual-only surface. Every transition writes a ledger `transition`/`outcome` line ("Now
Day X, <band>") — the Chronicle feed is the prose twin and is already screen-reader-rendered.
The one new UI element (map "Set out" buttons, §3.5) uses native `<button>`s (keyboard-reachable
by default) with explicit `aria-label`s naming the destination and its rumored status; its
outcome is narrated by the prep-contact + transition ledger lines, not by the SVG. The SVG map
itself gains nothing new to see.

## §11 · Execution plan (for the orchestrator)

Three Sonnet units, dependency-ordered; each gate = the §7 commands relevant to its diff, run
by the orchestrator (never trust self-reported green):

- **U1 — clock core (M):** `TRANS_CLOCK_MAX_MIN`, `advance_clock` case, `rest`/`combat_end`/
  `chase_round`/`downtime` ticks, `walkAdvance` no-op guard + env tick + `WALK_SEG_MIN`,
  remainder clamp, `SHOP_TXN_MIN` + shop ticks, probes BUG-02/TRC-1..5/TRC-10/TRC-12.
- **U2 — movement (M, after U1):** `pcMoveTo`, `travelDepart` extraction + `explore()` refactor,
  `move_node`/`start_walk`/`travel_start` cases, `discovery enter`, `prep_contact` refactor,
  `startWalkTo` + map buttons, probes BUG-05/TRC-6/TRC-9/TRC-9b/TRC-11.
- **U3 — knockout (S, independent of U2, after U1 for `koCheckWake` call sites):**
  `applyKnockout`/`koCheckWake`, `hp_changed nonlethal`, `knockout` case, digest `ko`, capture
  +60, probes BUG-04/TRC-7/TRC-8.

Each unit updates `DM_EVENT_TYPES`/`DM_EVENT_FIELDS`/EVENT-CONTRACT.md rows for ITS events and
its manifest entries; `check-manifest` runs after every module edit.

---

## Registry updates (Fable applies — NOT this executor)

- **docs/DESIGN.md** — add: `2026-07-06 · TRANSITION-CONTRACT — time/location/state transitions are first-class typed events; DETECTED-FIRST HYBRID (mechanical paths auto-tick per the §2 tick table; advance_clock {minutes,cause} is the one DM hand-wave, clamped 1..10080); knockout = hp_changed nonlethal + dedicated knockout event, KO never touches the bardo; no travel_arrive (walk_complete IS arrival). → docs/TRANSITION-CONTRACT.md`
- **docs/NEXT-STEPS.md** — queue: `TRANSITION-CONTRACT build (U1 clock core → U2 movement → U3 knockout; specs locked, Sonnet-ready; folds BUG-02/04/05 + FIX-B)`.
- **docs/README.md** — index row: `TRANSITION-CONTRACT.md · type: system-spec · first-class time/location/state transitions (tick table, advance_clock, move_node, start_walk, travel_start, knockout) · SPEC-LOCKED 2026-07-06, build deferred`.
- **docs/PLAYTEST-BUGS.md** — annotate BUG-02, BUG-04, BUG-05 and FIX-B: `SPEC'D 2026-07-06 → docs/TRANSITION-CONTRACT.md (build deferred)`.
- **Seat prompt (post-build):** teach `advance_clock` / `move_node` / `start_walk` /
  `travel_start` / `knockout` + `hp_changed nonlethal` in the live seat prompt when U1-U3 land.
- **GPT-5.5-advice-for-Claude/README.md §Transition Contract** — no edit (external advice doc);
  this spec is its adoption record. No doc superseded.
