---
type: system-spec
branch: Genesis
status: SPEC-LOCKED 2026-07-06 — build DEFERRED (freeze; executes post-Fable via Opus-orchestrated Sonnet executors)
created: 2026-07-06
consumer: Opus orchestrator + Sonnet executors; Adam skims anything marked PROVISIONAL
related:
  - "[[ITEMS]]"
  - "[[DEATH-AND-REBIRTH]]"
  - "[[EVENT-CONTRACT]]"
  - "[[CODEX]]"
  - "[[LOOT-REMAP]]"
  - "[[PARKING]]"
---

# ITEM-LEGACY — the item lifecycle contract (death → loot → claim → recovery)

**What this is.** GPT-5.5's §"Item Legacy Contract" (`GPT-5.5-advice-for-Claude/README.md` lines
102–120), adopted by Adam 2026-07-06: strong items get lifecycle fields — `{origin, claimant,
lastSeen, lossState, recoveryHook, factionInterest, decayOrChargeRule}` — so that when the PC dies,
their best item does not vanish or sit inert. It can be looted, scavenged, faction-claimed,
carried by an enemy, or recovered by a successor. This is what makes CAL-1-grade lethality
*emotionally profitable*: the world is allowed to take the toys back, remember who took them, and
make the recovery story better than the original pickup.

**Inference cost: ZERO.** No model call anywhere in this spec. Every transition is either a typed
event the DM already emits-adjacent-to, or a deterministic lazy check at an existing read site.
(SPEED-DOCTRINE compliant; detected-first per tonight's clock ruling — the script owns every
number, including the scavenge die.)

**Blind-playable parity.** This spec ships **no new visual panel**. Its player-facing surface is
(a) the existing corpse-recovery affordance (`src/world/render.js:1608–1614`, the `⚰ Recover
<name>'s effects` prose link — already keyboard/screen-reader-reachable text) and (b) one ledger
prose line per lifecycle transition (rendered by the Chronicle via `chronicleLine`,
`src/world/durability.js`). Ledger prose IS the prose twin; there is no visual it twins. The DM-side
surface is a digest slice (text by construction).

---

## §0. Verified current state (all refs opened 2026-07-06)

| fact | where |
|---|---|
| Instance shape `{id,name,qty?,conditions[],base?,ench?,codexId?}` — congruent model BUILT | `docs/ITEMS.md` §E; minted at `src/world/dm.js:2016–2030` (`item_changed` add loop) |
| Death mints the corpse: `c.corpse={context,items,gold,looted}`, `c.fellWhere`, `c.fellWhen`, `c.status="fallen"` | `src/world/fate.js:9–32` (`killCharacter`; corpse at line 24 — a **shallow slice** of `sheet.inventory`) |
| Corpse decay: `CORPSE_CONTEXTS` (sealed 120d / wild 30d / travelled 7d / den 2d), `corpseStatus` → `none/looted/fresh/disturbed/gone`, `corpsesAt`, `claimCorpse` | `src/world/rebirth.js:158–202` |
| `claimCorpse`'s re-mint lambda **DROPS `base`/`ench`/`codexId`** — a looted +1 sword comes back mundane. Real bug, fixed by this spec (§4.2). | `src/world/rebirth.js:192–194` |
| Recover UI + entry point | `src/world/render.js:1608–1614`; `src/world/fate.js:89–98` (`recoverFallen`) |
| Codex item records exist (`kind:"item"`), pointers-not-copies, `origin`/`source` mint-time tags, `codexFindByOrigin` | `src/world/codex.js:66–109` (`codexAdd`), `:30` (`codexFindByOrigin`), `:442` (`codexGazKind`); `src/engine/codex-roll.js:152` (`rollItem`), `:181` (`rollLoot`) |
| Thread-seed pattern (mint a soft `kind:"thread"` record + `codexLink` part-of) — reused verbatim for recovery hooks | `src/world/dm.js:2037–2047` (the Outlandish intrusion thread) |
| Event registry: `DM_EVENT_TYPES` at `src/world/dm.js:1218`; `DM_EVENT_FIELDS` at `:1237` (`item_changed` accept list at `:1256`); `item_changed` handler at `:1990`; `livingSheet` at `:824` |
| Digest: `dmDigest()` at `src/world/dm.js:270`; `pc.inventory` identity-only slice at `:301`; `powers[]` (factions, name-keyed, `clockId:slug(f.name)`) at `:314–317` |
| Item mechanics resolvers: `itemDef`/`magicDef`/`enchOf`/`baseDef` | `src/engine/combat.js:387–402` |
| Factions have **no stable id** — keyed by `name` (digest `clockId = slug(f.name)`), clock `{size,filled}` | `src/engine/world-gen.js:27–33`, `src/world/dm.js:314` |
| Bardo: `runBardo` orchestrates gap + visions | `src/world/rebirth.js:142–149` |
| The Bastion is **PARKED** (player stronghold / cross-character legacy vault) | `docs/PARKING.md:13–14` |

---

## §1. Decision — where the seven fields live (RESOLVED, no fork left)

**All seven GPT lifecycle fields live on the CODEX item record, under one new block `r.legacy`.
The inventory instance gains ZERO new fields.** The existing `inst.codexId` link (ITEMS.md §E
layer 3, built) is the only seam.

Why this side of the fork, definitively:

1. **Instance ids are not stable across custody transitions.** `claimCorpse` re-mints new ids by
   design (alias/duplicate-id safety, `src/world/rebirth.js:190–194` comment). Identity that must
   survive death→loot→recovery cannot key off `inst.id`. The codex id (`"item:heirloom-longsword"`)
   is the durable name.
2. **Lifecycle is relational, and the codex is the relational layer** (claimant links, faction
   interest, recovery-hook threads are exactly `codexLink`/`kind:"thread"` material — CODEX.md).
3. **ITEMS.md §E already ruled it**: mechanics on the instance, *story* through the codex link,
   "the codex is a link, not a storage path" — for *mechanics*. Lifecycle is story-state, so the
   record is its home.
4. Not every item is lifecycle-worthy; the codex-record gate IS the significance gate (no bloat on
   20 Arrows).

### §1.1 The `r.legacy` block — exact shape

```js
r.legacy = {
  // GPT field → home
  origin:   { how:"loot"|"plot"|"gift"|"craft"|"start"|"unknown", ref:null|string }, // set ONCE at ensure-time (§1.3)
  claimant: { kind:"pc"|"npc"|"creature"|"faction"|"corpse"|"none", ref:string|null, name:string|null },
  lastSeen: { nodeId:string|null, day:number },          // in-world day (clockOf(w).day), NEVER wall-clock
  lossState:"held"|"transferred"|"dropped"|"on-corpse"|"claimed-npc"|"claimed-creature"|"claimed-faction"|"cached"|"destroyed"|"unknown",
  recoveryHookId: string|null,                            // a codex kind:"thread" record id (§5)
  factionInterest: string|null,                           // faction NAME (factions are name-keyed; slug() where an id is needed)
  decayRef: null | { kind:"corpse", charId:string },      // POINTER to the clock that governs recoverability — never a second clock
  instSnapshot: { name:string, base?:string, ench?:object, qty?:number } // deep-copied at EVERY custody transition; the re-mint source of truth (§4.3)
};
```

**`decayOrChargeRule` ruling (GPT field 7): no new decay machinery.** Charges already live on
`inst.ench.charges` (BUILT, ITEMS.md §E); corpse recoverability already decays via `corpseStatus`
(BUILT, rebirth.js:170). `decayRef` is a *pointer* to the governing clock so digest readers know
which existing timer applies. Inventing a parallel item-decay clock here would violate
anti-drift (two clocks, one truth). `"cached"` in the lossState enum is the **Bastion seam** —
reserved, never set by any v1 code path; the parked Bastion vault (`docs/PARKING.md:13`) will own
it. Do not design or build anything Bastion-shaped in this unit.

### §1.2 Which instances are legacy-grade — exact predicate

```js
function legacyGrade(inst){
  if(!inst || typeof inst!=="object") return false;            // legacy string items never qualify
  if(inst.codexId) return true;                                 // anything already storied
  if(inst.ench){                                                // any enchanted non-consumable, non-stack
    const md=(typeof magicDef==="function")?magicDef(inst.name):null;
    if(md && md.consumable) return false;                       // potions/oils burn, they don't legacy
    if(inst.qty && inst.qty>1) return false;                    // stacks are never legacy-grade
    return true;
  }
  return false;
}
```

Mundane unenchanted gear (a plain Scimitar) is NOT legacy-grade unless the DM has minted it a
codex record (an heirloom). That is the intended dial: significance is opt-in via codex, magic is
opt-out-proof.

### §1.3 `origin` derivation — set once, exact mapping

At `legacyEnsureRecord` time (§3), if `r.legacy.origin` is unset:

| record evidence | `origin.how` | `origin.ref` |
|---|---|---|
| `r.source && r.source.type==="plot"` | `"plot"` | `r.source.ref` (e.g. `"plot-item#298"`) |
| `r.source && r.source.type==="loot"` | `"loot"` | `r.source.ref` |
| record minted by this spec's death auto-promotion (§4.1) | `"start"` | `null` |
| a `gift` event minted/linked it (existing gift ledger kind) | `"gift"` | `null` |
| anything else | `"unknown"` | `null` |

`"craft"` is reserved for the economy/craft track — never derived in v1. Once set, never
overwritten (same posture as `codexAdd`'s `origin` mint-time tag, codex.js:84–86).

---

## §2. Events — one new type, one widened payload (RESOLVED shapes)

### §2.1 NEW event: `item_claimed`

The single custody-transition event. Registry edits (exact):

- `DM_EVENT_TYPES` (`src/world/dm.js:1218`): insert `"item_claimed"` immediately after
  `"item_rust_exposure"`.
- `DM_EVENT_FIELDS` (`src/world/dm.js:1237` block): add
  `item_claimed: { accept:["codexId","by","lossState","at","note","factionInterest"], alias:{ id:"codexId", item:"codexId" } },`

**Payload:**

```js
{ codexId: string,                                   // the codex item record — REQUIRED
  by: { kind:"pc"|"npc"|"creature"|"faction"|"none", ref?:string|null, name?:string|null },
  lossState: <LEGACY_LOSS_STATES member>,            // REQUIRED
  at?: string,                                        // nodeId; defaults to w.currentNodeId
  factionInterest?: string,                           // faction NAME; writes r.legacy.factionInterest
  note?: string }                                     // ledger prose override
```

**Handler (new `case "item_claimed"` in `applyEvent`, placed directly after `case "item_rust_exposure"`):**

1. `const r = codexGet(w, p.codexId)`; missing or `r.kind!=="item"` → `{ok:false, reason:"no-item-record:"+p.codexId}`.
2. `p.lossState` not in `LEGACY_LOSS_STATES` → `{ok:false, reason:"bad-loss-state:"+p.lossState}`.
3. Idempotence: if `r.legacy` exists AND `r.legacy.lossState===p.lossState` AND
   `(r.legacy.claimant.ref||null)===((p.by&&p.by.ref)||null)` → `{ok:true, unchanged:true}` (no
   ledger line — a re-declared claim must not bury the drift lane).
4. `legacyStamp(w, r, patch, prose)` (§3): writes claimant/lossState/lastSeen(+`at`)/
   factionInterest, refreshes `instSnapshot` **only if** the item is currently in a live sheet
   (else the last snapshot stands), appends one `addLedger(w,"outcome",{kind:"item-claimed",...})`
   prose line.
5. Hook lifecycle (§5): transition **out of** `"held"` with `by.kind!=="pc"` and no open hook →
   mint one; transition **to** `"held"` with `by.kind==="pc"` and an open hook → resolve it
   (`codexUpdate(w, hookId, {status:{condition:"resolved"}})`). `"destroyed"` → resolve the hook
   with the note `"lost with the item"`.
6. Return `{ok:true, codexId:r.id, lossState:p.lossState, claimant:r.legacy.claimant, hookId:r.legacy.recoveryHookId}`.

**Who emits it, per source:**

| source | emitter | when |
|---|---|---|
| `detected` | `corpseLegacyStamp` (§4.1) | PC death stamps every legacy-grade carried item `on-corpse` |
| `detected` | `claimCorpse` (§4.2) | recovery hauls each legacy item back to `held` by the taker PC |
| `detected` | `corpseScavengeResolve` (§4.4) | the scavenge die moves one item to `claimed-*` |
| `detected` | `item_changed` handler (§2.2) | any add/remove touching a `codexId`-bearing instance |
| `declared` | the DM | off-screen custody moves only (an NPC sells it to a faction; the DM casts the unknown holder as a real codex NPC; destruction) |

### §2.2 Widened event: `item_changed` (fold-in, no second inventory event)

Add `"takenBy"` to the accept list at `src/world/dm.js:1256`:

```js
item_changed: { accept:["add","force","gold","note","remove","removeAll","removeIds","takenBy"] },
```

Handler additions inside `case "item_changed"` (dm.js:1990), **after** the existing remove/add
loops, **before** the gold write:

- **Removes:** for each entry of `removed[]` where `legacyGrade(it) && it.codexId`:
  emit (via recursive `applyEvent`, `source:"detected"`) one `item_claimed` with
  - `p.takenBy` present → `lossState:"claimed-"+takenBy.kind` (kind must be `npc|creature|faction`;
    any other kind → treat as absent), `by: takenBy`.
  - `p.takenBy` absent → `lossState:"dropped"`, `by:{kind:"none",ref:null,name:null}` (the item
    lies where the PC stands; `at` = `w.currentNodeId`). **Ruling:** an un-attributed removal is a
    *drop*, not a mystery — the DM must say who took it (`takenBy`) for it to count as taken.
  - `removeAll` (the stripped prisoner): same rule, applied to every legacy-grade removed instance.
- **Adds:** for each `added[]` instance with `inst.codexId` where the record has `r.legacy` and
  `r.legacy.lossState!=="held"`: **overlay restore** — if the add spec carried no `ench`/`base`,
  deep-copy them from `r.legacy.instSnapshot` onto the instance (the snapshot is the truth of what
  the thing IS; the DM re-granting "the heirloom longsword" must not silently strip its +1). Then
  emit detected `item_claimed {codexId, by:{kind:"pc",ref:t.c.id,name:t.c.name}, lossState:"held"}`.

**Recursion guard ruling:** `item_claimed` never mints inventory and `item_changed` only ever
emits `item_claimed` — the edge is one-directional, depth-1, no cycle. Do not add a re-entrancy
flag; do not "fix" this with one.

### §2.3 Explicitly NOT new events

`equip`, `condition_add{dropped}`, `gift`, `kill` do **not** touch legacy state in v1. A legacy
item's custody changes ONLY through: death, corpse claim, scavenge, `item_changed`
remove/add, atomic `item_transfer`, or a declared `item_claimed`. A whole `item_transfer` with a
`codexId` folds the matching lifecycle transition before physical ownership commits. Voluntary
transfer/entrust/gift/loan/place uses neutral `transferred` and creates no recovery hook; only explicit
confiscated/stolen/lost intent uses claimed/dropped state. A partial storied stack is refused so one
Codex identity cannot fork. (Rationale:
`dropped` the *condition* is a combat-round
disarm — transient, wrong altitude; `gift` already ledgers and the accompanying `item_changed`
remove with `takenBy:{kind:"npc",...}` is the legacy write.)

---

## §3. New module — `src/world/item-legacy.js`

Classic `<script>`, shared global scope (CLAUDE.md). Registered in `manifest.json` (new entry, id
`world.item-legacy`, `type:"logic"`) and a `<script>` tag in `genesis.html` **immediately after
`src/world/rebirth.js`** in both `loadOrder` and tag order. Run `python3 build/check-manifest.py`
after (expected: `OK` with **110 modules**; the tree holds 109 today).

**Owns (manifest `owns` list, exhaustive):**
`LEGACY_LOSS_STATES`, `legacyGrade`, `legacySnapshot`, `legacyEnsureRecord`, `legacyStamp`,
`legacyMintHook`, `corpseLegacyStamp`, `corpseScavengeResolve`, `SCAVENGE_TEETH`, `legacyDigest`.

**callTimeDeps:** `magicDef`, `codexGet`, `codexAdd`, `codexUpdate`, `codexLink`, `codexTouch`,
`codexOf`, `clockOf`, `addLedger`, `uid`, `slug`, `rollDie`, `applyEvent`, `corpseStatus`,
`prepCastId`.

**`codexTouch` signature — BINDING (verified `src/world/codex.js:37`).** `codexTouch(C, r)` takes
the **codex container**, not the world: `function codexTouch(C, r){ r.touchedSeq=(C.seq=(C.seq||0)+1); … }`.
Every call in this module MUST pass `codexOf(w)` as the first arg — `codexTouch(codexOf(w), r)` —
exactly as the codebase does at codex.js:158/164/179. Calling `codexTouch(w, r)` is a bug: it
would stamp the monotonic seq onto `w.seq` instead of the codex's, silently breaking the
delta-digest ride-along. That is why `codexOf` is a callTimeDep here.

Function contracts (signatures are binding):

```js
const LEGACY_LOSS_STATES=["held","transferred","dropped","on-corpse","claimed-npc","claimed-creature",
                          "claimed-faction","cached","destroyed","unknown"];

function legacyGrade(inst)            // §1.2 predicate, verbatim
function legacySnapshot(inst)         // → {name, base?, ench?(deep copy), qty?} — JSON deep-copy ench
function legacyEnsureRecord(w, inst, opts) // → codex item record. inst.codexId set → codexGet it (missing
    // record → mint at that id). No codexId → codexAdd({id:"item:"+slug(inst.name), kind:"item",
    // name:inst.name, provenance:"rolled", fields:{object:inst.name}, status:{known:true, at:opts.at||null}})
    // and WRITE inst.codexId back. Then ensure r.legacy exists (defaults: origin per §1.3 with
    // opts.originHow override; claimant {kind:"pc",ref:opts.pcId,name:opts.pcName}; lossState "held";
    // lastSeen {nodeId:opts.at, day:clockOf(w).day}; hook null; factionInterest null; decayRef null;
    // instSnapshot legacySnapshot(inst)). Returns r.
function legacyStamp(w, r, patch, prose)   // the ONLY writer of r.legacy after ensure. Object.assign
    // sub-objects (claimant/lastSeen replaced whole; origin never overwritten; instSnapshot only when
    // patch.instSnapshot given). Calls codexTouch(codexOf(w), r) (delta-digest ride-along — NOTE the
    // codexOf(w) wrapping; codexTouch takes the container, §3 signature note) + addLedger(w,"outcome",
    // {kind:"item-claimed", codexId:r.id, ...patch-summary}, prose). Returns r.legacy.
function legacyMintHook(w, r, why)    // §5. Returns the thread record id.
function corpseLegacyStamp(w, c)      // §4.1. Called by killCharacter. Returns count stamped.
function corpseScavengeResolve(w, c)  // §4.4. Lazy, once per corpse. Returns null | {taken:codexId, by:{...}}.
function legacyDigest(w)              // §6. Returns null | array (cap 5).
```

---

## §4. The death loop — site-by-site build plan (worked before→after per site)

### §4.1 `src/world/fate.js` — `killCharacter` stamps legacy at death

**Before** (fate.js:24–25, verbatim today):

```js
  c.corpse={context:rollCorpseContext(),items:((c.sheet&&c.sheet.inventory)||[]).slice(),gold:(c.sheet&&c.sheet.gold)||0,looted:false};
  logEvent(w,`<span style="color:var(--blood)">${c.name} fell at ${c.fellWhere}.</span>`);
```

**After:**

```js
  c.corpse={context:rollCorpseContext(),items:((c.sheet&&c.sheet.inventory)||[]).slice(),gold:(c.sheet&&c.sheet.gold)||0,looted:false};
  if(typeof corpseLegacyStamp==="function") corpseLegacyStamp(w,c);   // ITEM-LEGACY §4.1 — every legacy-grade carried item → on-corpse
  logEvent(w,`<span style="color:var(--blood)">${c.name} fell at ${c.fellWhere}.</span>`);
```

`corpseLegacyStamp(w,c)` behavior, exactly:

1. For each `inst` in `c.corpse.items` with `legacyGrade(inst)`:
   `legacyEnsureRecord(w, inst, {at:w.currentNodeId, pcId:c.id, pcName:c.name, originHow:"start"})`
   (auto-promotion — an enchanted item with no codex record gets one now; the write-back of
   `inst.codexId` lands on the shared object the dead sheet and the corpse both reference — the
   shallow slice at fate.js:24 makes that a feature here).
2. Emit detected `applyEvent(w,{type:"item_claimed",source:"detected",payload:{codexId:inst.codexId,
   by:{kind:"corpse",ref:c.id,name:c.name}, lossState:"on-corpse", at:w.currentNodeId}})`.
3. After the loop, for each stamped record: `legacyStamp` the pointer
   `decayRef:{kind:"corpse",charId:c.id}` (folded into the same stamp — one ledger line per item,
   not two) and mint the recovery hook (§5) — the successor's breadcrumb exists the moment the
   body cools.
4. Fires **before** `openBardo` by construction (it sits above the existing `saveU(U)` at
   fate.js:30) — the bardo's faction drift happens in an already-stamped world.

Note `killCharacter` runs `applyEvent` combat teardown already (fate.js:19), so calling
`applyEvent` here introduces no new layering.

### §4.2 `src/world/rebirth.js` — `claimCorpse` fidelity fix + detected claims

**Before** (rebirth.js:192–194, verbatim today — the mint drops `base`/`ench`/`codexId`):

```js
  const mint=it=>(typeof it==="string")
    ? {id:uid(),name:it,conditions:[]}
    : {id:uid(),name:it.name,qty:it.qty,conditions:(it.conditions||[]).slice()};
```

**After:**

```js
  const mint=it=>{ if(typeof it==="string") return {id:uid(),name:it,conditions:[]};
    const o={id:uid(),name:it.name,conditions:(it.conditions||[]).slice()};
    if(it.qty!=null)o.qty=it.qty;
    if(it.base)o.base=it.base;                                          // ITEM-LEGACY §4.2 — the congruent
    if(it.ench)o.ench=JSON.parse(JSON.stringify(it.ench));              // overlay survives the grave
    if(it.codexId)o.codexId=it.codexId;                                 // (fresh id, same soul)
    return o; };
```

Additional edits inside `claimCorpse` (function at rebirth.js:184):

- **First line of the function body:** `if(typeof corpseScavengeResolve==="function") corpseScavengeResolve(w,c);`
  (the lazy scavenge fires before the status read — a "disturbed" corpse may genuinely be missing
  its best piece when the successor arrives; a "gone" corpse resolves where everything went).
- **After the taker transfer** (after the existing `taker.sheet.gold` line, rebirth.js:197–198):
  for each hauled instance with `codexId`, emit detected
  `item_claimed {codexId, by:{kind:"pc",ref:taker.id,name:taker.name}, lossState:"held", at:w.currentNodeId}`
  — which resolves the recovery hook per §2.1 step 5. Guard the whole emission on
  `taker && typeof applyEvent==="function"`.

### §4.3 Snapshot refresh rule

`instSnapshot` re-copies from the live instance at every transition where the instance is in a
living sheet (`item_changed` paths); at death it copies from the corpse item; at scavenge/declared
transitions (no live instance) the prior snapshot **stands untouched**. This is the exact rule
that makes "enemy uses your gear, you kill the enemy, DM re-grants via `item_changed
add:[{name,codexId}]`" return the true `+1`/rider/charges — charges included, at their
last-witnessed `cur` (**ruling:** the world does not refill your wand while a goblin holds it).

### §4.4 Scavenge — `corpseScavengeResolve(w,c)` (the enemy-gets-your-gear path, detected)

Lazy, deterministic, **one roll per corpse ever**, engine-owned die.

Preconditions: `c.corpse && !c.corpse.looted && !c.corpse.scav && corpseStatus(w,c)` ∈
`{"disturbed","gone"}` — otherwise return null untouched. On run, stamp
`c.corpse.scav={rolled:true, taken:null}` first (never re-rolls, even on early exit).

```js
const SCAVENGE_TEETH={ den:3, travelled:2, wild:1, sealed:0 };   // rollDie(6) <= teeth ⇒ scavenged
```

*(PROVISIONAL — taste: the odds ladder. Recommended default as written: a beast's larder strips a
body half the time, a roadside body sometimes, deep wilds rarely, a sealed tomb never. Adam may
retune the three integers; nothing else moves.)*

1. Roll `rollDie(6)`; if `> SCAVENGE_TEETH[c.corpse.context.tag]` → record `taken:null`, done
   (one `addLedger(w,"drift",{kind:"corpse-undisturbed",char:c.id},…)` line ONLY when status is
   `"disturbed"` — a "gone" miss still falls through to step 4).
2. On a hit, pick ONE victim from `c.corpse.items`: the legacy-grade instance with `ench` (first
   by array order); else the first legacy-grade instance; **none legacy-grade → nothing is
   lifecycle-tracked, record `taken:null`**, done (mundane pickings are already covered by decay).
3. Remove the victim from `c.corpse.items` (splice by identity). Claimant, exact precedence:
   - the victim's record has `r.legacy.factionInterest` → `by:{kind:"faction", ref:slug(name), name}`,
     `lossState:"claimed-faction"` (an interested faction hears of a fall — context is irrelevant
     to precedence);
   - else context `den` or `wild` → `by:{kind:"creature", ref:null, name:null}`, `lossState:"claimed-creature"`;
   - else (`travelled`) → `by:{kind:"npc", ref:null, name:null}`, `lossState:"claimed-npc"`.
   **Ruling — the nameless holder:** `ref:null,name:null` is deliberate. The engine owns nouns but
   this noun is *unknown by design* — a mystery hook, not a gap. The recovery-hook thread (§5)
   carries `dm:{castHolder:true}`; the DM casts a real codex NPC/creature when the thread surfaces
   in play, then emits a declared `item_claimed` with the real `by.ref` to harden it. No name is
   invented app-side; no name is invented DM-side without being captured.
4. Emit detected `item_claimed` per step 3, `at` = the corpse's node (`slug(c.fellWhere)`).
   Then, if `corpseStatus(w,c)==="gone"`: every REMAINING legacy-grade corpse item gets a detected
   `item_claimed {lossState:"unknown", by:{kind:"none",ref:null,name:null}}` — the GPT contract's
   core promise: a strong item never simply vanishes; its hook stays open, its trail goes cold.
5. Record `c.corpse.scav.taken = <victim codexId or null>`.

**Call sites (exactly two):** the top of `claimCorpse` (§4.2) and the tail of `runBardo`
(`src/world/rebirth.js:142–149` — insert `corpseScavengeResolve(w,c);` after `bardoVisions`, so
the 0–49-day gap can cost the dead PC their sword before the successor even wakes). **Ruling: NOT
called from `corpsesAt`/`corpseStatus`** — those are read-path functions used by render
(render.js:1608); mutation-on-render is a bug class we do not open.

**Enemy-USES-your-gear, scope fence:** v1 delivers the *knowledge* (digest slice §6 + claimant on
the record) and the *round trip* (kill/beat the holder → DM re-grants via `item_changed
add:[{name, codexId}]` → §2.2 overlay-restores the true ench). Making a `GS.combat` foe's attack
rolls mechanically use the stolen weapon's ench is **explicitly deferred** to a COMBAT fast-follow
(the foe damage path resolves off the bestiary stat block; overlaying player-gear riders on
`cmFoeFrom` is its own contract). Do not wire it here.

---

## §5. Recovery hooks — reuse the thread-seed pattern verbatim

`legacyMintHook(w, r, why)` mirrors `src/world/dm.js:2037–2047` exactly:

```js
function legacyMintHook(w, r, why){
  if(r.legacy.recoveryHookId){ const ex=codexGet(w,r.legacy.recoveryHookId);
    if(ex && ex.status && ex.status.condition!=="resolved") return r.legacy.recoveryHookId; } // one open hook max
  const tid=(typeof prepCastId==="function")?prepCastId(w,"thread",r.name+" — where it lies now")
    :("thread:"+slug(r.name)+"-recovery-"+uid());
  const t=codexAdd(w,{ id:tid, kind:"thread", provenance:"rolled",
    name:r.name+" — where it lies now",
    fields:{ desc:why, itemCodexId:r.id },
    dm:{ legs:"thread-seed", pool:"item-legacy", castHolder:(r.legacy.claimant.ref==null && r.legacy.claimant.kind!=="corpse") },
    status:{ known:false, soft:true, at:(r.legacy.lastSeen&&r.legacy.lastSeen.nodeId)||null } });
  if(t) codexLink(w, t.id, "part-of", r.id);
  r.legacy.recoveryHookId=t?t.id:null;
  return r.legacy.recoveryHookId;
}
```

`why` strings, fixed vocabulary (prose the DM may read aloud when the thread surfaces):
- on-corpse: `"It lies with <PC>'s body at <fellWhere>."`
- claimed-npc: `"Someone walked away from <fellWhere> carrying it."`
- claimed-creature: `"Something dragged it off toward its den."`
- claimed-faction: `"<faction> holds it now, and knows what it has."`
- unknown: `"The trail went cold at <fellWhere>."`

Hook resolution (§2.1 step 5) is `codexUpdate(w, hookId, {status:{condition:"resolved"}})` — no
new thread machinery, threads already live and die in the codex.

---

## §6. Digest slice — `itemLegacy`

In `dmDigest()` (`src/world/dm.js:270`), add one top-level key directly after `powers` (dm.js:314):

```js
    itemLegacy:(typeof legacyDigest==="function")?legacyDigest(w):null,
```

`legacyDigest(w)` returns `null` when empty (digest diet — zero bytes on the common turn), else an
array capped at **5**, sorted by `lastSeen.day` descending:

```js
[{ codexId, name, lossState, claimant:{kind,name},           // name null = "holder unknown — cast when it surfaces"
   lastSeenAt, lastSeenDay, hookId, factionInterest, ench:!!snapshot.ench }]
```

Selection: every codex record with `r.kind==="item" && r.legacy && r.legacy.lossState` not in
`{"held","destroyed"}`. This is the DM's whole license to weave the lost sword into rumor, a
foe's hand, or a faction's vault — read it, never invent custody that contradicts it
(EVENT-CONTRACT: the DM does not get to contradict returned state).

**Measured budget:** ≤ ~120 B per entry × 5 = ≤ 0.6 KB worst case, 0 B typical (null). Within
DIGEST-DIET posture; no section-budget change needed.

---

## §7. Edge cases — enumerated rulings

1. **Two legacy items, both enchanted, scavenge hits** → exactly ONE taken (array-order-first
   among enched). Never two. The rest ride the corpse.
2. **`item_claimed` on a record with no `r.legacy`** → the handler runs `legacyEnsureRecord`-style
   defaulting on the record first (origin `"unknown"`, snapshot `{name:r.name}`), then stamps.
   Declared claims on plot items the PC never held are legal (a faction seizes the macguffin).
3. **`item_claimed{lossState:"cached"}`** → REFUSED `{ok:false, reason:"bastion-parked"}` in v1.
   The enum member exists; the transition does not, until the Bastion unships from PARKING.
4. **`item_claimed{lossState:"destroyed"}`** → claimant becomes `{kind:"none",ref:null,name:null}`,
   hook resolved with note `"lost with the item"`, record persists (the codex remembers what was
   lost — legend material). Never deletes the record.
5. **Successor dies too, carrying a recovered legacy item** → the loop simply runs again:
   `corpseLegacyStamp` re-stamps `on-corpse` with the NEW corpse's `decayRef`; the resolved old
   hook stays resolved; a fresh hook mints. No special case.
6. **Stackables/consumables** → never legacy-grade (§1.2). A "legendary arrow" wants a codex
   record and `qty` absent; author it that way, the gate then admits it via `codexId`.
7. **`removeAll` on a searched prisoner with 2 legacy items, `takenBy` a faction** → two detected
   `item_claimed{claimed-faction}` emissions, two hooks (one per item), one `item_changed` ledger
   line + two claim lines. Correct and intended: each item's trail is its own story.
8. **Corpse `"sealed"` context** → scavenge teeth 0, never fires; at 120 days it decays `"gone"`
   → all legacy items `"unknown"` per §4.4 step 4. A tomb keeps things a long time, not forever.
9. **`corpseScavengeResolve` on a corpse with gold but no legacy items** → roll happens, `taken:null`,
   gold untouched (gold has no lifecycle — it is fungible by definition; decay already eats it via
   `"gone"`).
10. **The same codex item re-enters via loot table coincidence** (`item_changed add` names an item
    whose slug-id record exists with lossState `"claimed-npc"`) → only fires the legacy path when
    the add spec carries `codexId` explicitly. A bare `add:[{name:"Longsword"}]` mints a fresh
    mundane instance and touches nothing (two longswords may exist; the storied one is the one
    with the link). No name-based matching, ever — ids or nothing (the ITEMS.md lesson).
11. **Old saves** (pre-spec worlds): no migration needed — `r.legacy` is additive and lazily
    ensured; corpses predating the spec stamp on their first `claimCorpse`/`runBardo` touch.
    `migrateWorld` (`src/world/state.js:157`) is NOT edited by this unit.
12. **CAL-1 interaction:** none mechanical — but note for the DM-CHARTER follow-up: a save-landed
    death with a legacy item is the intended showcase (the mercy was the save; the sword's
    afterlife is the consolation arc).

---

## §8. Acceptance — commands + expected numbers (RED-FIRST, mutation-asserting)

New harness: **`dev/verify-item-legacy.mjs`** — jsdom boot copied from
`dev/playtest-bug-probes.mjs:26–46` (manifest loadOrder eval, same STUBS list **plus**
`win.prompt=()=>"Probe Hold"` and the DOM additions `<div id="bardoModal"><div id="bardoBody">
</div></div>` so `killCharacter`→`openBardo` runs headless), `seedWorld` per
playtest-bug-probes.mjs:49–68. **EXPOSE list — add `LEGACY_LOSS_STATES`.** Top-level `const`s do
not auto-attach to `window` under jsdom the way `function` declarations do — the harness's `EXPOSE`
block (playtest-bug-probes.mjs:30) exists for exactly this. `function`-declared symbols
(`legacyGrade`, `killCharacter`, `claimCorpse`, `codexGet`, `dmDigest`, `applyEvent`,
`corpseScavengeResolve`) are reachable as `win.<name>` without EXPOSE; the `const`
`LEGACY_LOSS_STATES` is NOT — check #4 (`LEGACY_LOSS_STATES.length`) throws a reference error
without the EXPOSE entry. Use the `applyMutates` guard pattern (playtest-bug-probes.mjs:74–81,
the BUG-01 lesson) for every event check: **assert the ok-flag AND that the watched state slice's
serialized value MOVED — never a label check alone.**

### §8.1 RED-FIRST proof (run BEFORE building — must fail exactly like this)

The harness ships with the branch's FIRST commit, before any engine edit. Command and expected
output against the un-fixed tree:

```
node dev/verify-item-legacy.mjs
✗ item-legacy: 3 passed, 21 failed
```

The 3 passes are the pre-existing-behavior baselines (R1–R3 below); every legacy check fails
because nothing exists yet. Two of the failures prove **current live bugs**, not just absences:

- **P-DEATH (the assigned probe):** seed a PC carrying
  `{id, name:"Longsword", ench:{bonus:1}, codexId:"item:probe-heirloom"}` + `codexAdd` the record;
  `win.killCharacter("c1")`; assert `codexGet(w,"item:probe-heirloom").legacy.lossState === "on-corpse"`
  AND the serialized record CHANGED across the kill (moved, not vanished: also assert
  `w.characters[0].corpse.items.length === <pre-death inventory length>` — the item is ON the
  corpse, not deleted). **Today:** `r.legacy` is `undefined` → RED.
- **P-FIDELITY (current live bug):** same world; advance nothing; `claimCorpse(w, dead, taker)`;
  assert the hauled instance has `ench.bonus===1 && codexId==="item:probe-heirloom"`. **Today:**
  the mint at rebirth.js:192–194 strips both → RED. (This alone justifies the unit shipping even
  if Adam retunes everything PROVISIONAL.)

### §8.2 GREEN gate (run AFTER building)

```
node dev/verify-item-legacy.mjs
✓ item-legacy: 24 passed, 0 failed
```

The 24 checks, enumerated (executor implements exactly these, in this order):

| # | check | mutation assertion |
|---|---|---|
| R1 | baseline: `corpseStatus` fresh→gone ladder unchanged (2 checks: fresh at day 0, gone past decayDays) | value moves fresh→gone |
| R3 | baseline: mundane-only corpse claim still hauls (no legacy machinery invoked) | taker inventory length +N |
| 4 | `LEGACY_LOSS_STATES` has length 10 and includes `"transferred"` + `"cached"` | — |
| 5–6 | `legacyGrade`: true for ench non-consumable; false for `{name:"Potion of Healing",ench:{}}` (consumable) and for `qty:20` stack | — |
| 7 | P-DEATH (§8.1) now green | before≠after on record JSON |
| 8 | death minted a recovery hook: `r.legacy.recoveryHookId` resolves to a `kind:"thread"` record linked `part-of` the item | hook record exists |
| 9 | death stamped `decayRef.charId==="c1"` | — |
| 10 | P-FIDELITY (§8.1) now green | ench+codexId present on haul |
| 11 | claim emitted detected re-claim: post-claim `lossState==="held"`, `claimant.ref===taker.id` | lossState MOVED on-corpse→held |
| 12 | claim resolved the hook: thread `status.condition==="resolved"` | condition moved |
| 13 | scavenge (den, `rollDie` stubbed →1): `corpse.items.length` 2→1, victim record `lossState==="claimed-creature"`, claimant ref null | length + lossState both move |
| 14 | scavenge is once-only: second call returns null, no further change | serialized corpse unchanged |
| 15 | scavenge miss (stub →6): `scav.rolled===true, taken===null`, items intact | — |
| 16 | factionInterest precedence: set `r.legacy.factionInterest="The Ironwood Circle"`, den context, stub →1 → `lossState==="claimed-faction"` | — |
| 17 | gone-corpse sweep: force clock past decayDays, resolve → remaining legacy item `"unknown"`, hook still open | lossState moved |
| 18 | `applyMutates`: declared `item_claimed{claimed-npc}` → ok && record JSON moved | ✔ pattern |
| 19 | idempotent re-claim → `{ok:true,unchanged:true}`, ledger length unchanged | ledger count static |
| 20 | `item_claimed{lossState:"cached"}` → `{ok:false,reason:"bastion-parked"}` | state untouched |
| 21 | `item_changed removeIds` + `takenBy:{kind:"faction",name:"The Ironwood Circle"}` → detected claim `claimed-faction`; without takenBy → `"dropped"` (2 checks) | lossState moves each way |
| 22 | overlay restore: after a claimed-npc state, `item_changed add:[{name:"Longsword",codexId:"item:probe-heirloom"}]` → new inst has `ench.bonus===1` from snapshot; lossState→held | ench value present, moved |
| 23 | digest: `dmDigest().itemLegacy` null when all held; length 1 with exact `{codexId,lossState}` after a claim (2 checks) | slice appears |
| 24 | `DM_EVENT_TYPES.indexOf("item_claimed")>=0` and FIELDS accept list matches §2.1 | — |

### §8.3 Regression gates (all must hold, exact expected outputs)

| command | expected |
|---|---|
| `python3 build/check-manifest.py` | `OK` — 110 modules |
| `node dev/verify-item-legacy.mjs` | `✓ item-legacy: 24 passed, 0 failed` |
| `node dev/verify-items.mjs` | `✓ items: 123 passed, 0 failed` (count today: 123 checks — unchanged) |
| `node dev/verify-dm-events.mjs` | 0 failed (count as on branch base; no existing event contract loosened) |
| `node dev/verify-bardo-port.mjs` | 0 failed |
| `node dev/playtest-bug-probes.mjs` | identical PRESENT/RESOLVED table to branch base (no probe flips) |

If `verify-items.mjs` reports a different pass count on the branch base than 123, the BASE number
is the gate — the rule is **zero delta from base**, and the executor records both numbers in the
unit report.

---

## §9. Don't-touch list

- **Generated files — never hand-edit:** `tables.json`, `tables.js`, `data/bestiary.js`,
  `data/realm-bestiary.js`, `data/class-progression.js`, `data/wiki.js`, **`data/items.js`**
  (this spec needs NO generator change — `ITEM_CONDITIONS` at data/items.js:5396 is untouched;
  lossState is codex-side, not an item condition).
- `src/world/state.js` `migrateWorld` — additive spec, no migration (§7.11).
- `corpsesAt`/`corpseStatus`/`render.js` — read paths stay pure (§4.4 call-site ruling).
- `dev/dm-bridge.py`, `docs/DM-BRIDGE.md`, `.dm/` — never mid-anything (standing rule).
- The Bastion — seam noted (`"cached"`, refused in v1); zero design, zero code.
- Foe-uses-ench combat math — deferred COMBAT fast-follow (§4.4 scope fence).
- Adam's hand-authored tables — this unit touches no table markdown at all.

## §10. Executor packaging

One branch `feat/item-legacy`, four commits in order: (1) `dev/verify-item-legacy.mjs` + RED run
output pasted into the commit body (§8.1 — 3/21), (2) `src/world/item-legacy.js` + manifest +
`genesis.html` tag, (3) the four edit sites (`fate.js`, `rebirth.js`, `dm.js` ×{registry, fields,
handler, item_changed, digest}), (4) `docs/EVENT-CONTRACT.md` taxonomy rows for `item_claimed` +
the `item_changed` `takenBy` widening (copy §2.1/§2.2 shapes verbatim). Size **M** (~1 new 250-line
module, ~60 edited lines across 3 files, 1 harness). No model calls added anywhere: **inference
cost delta = $0.00/session.**

---

## Registry updates (Fable applies these — this doc does NOT edit shared files)

- `docs/DESIGN.md` (decision registry) — add: `2026-07-06 — ITEM-LEGACY locked: lifecycle lives on the codex item record (r.legacy), instance stays lean via inst.codexId; ONE new event item_claimed + item_changed takenBy widening; scavenge = lazy engine d6 at claim/bardo only; "cached" reserved for the parked Bastion. Spec: docs/ITEM-LEGACY.md (build deferred).`
- `docs/NEXT-STEPS.md` — add to the deferred-build queue: `☐ ITEM-LEGACY (spec-locked 2026-07-06, size M) — after the S1–S5 window units; pairs the CAL-1 lethality ruling with its payoff loop. RED-first harness dev/verify-item-legacy.mjs ships first (P-FIDELITY documents a LIVE bug: claimCorpse strips ench/codexId, rebirth.js:192).`
- `docs/README.md` (docs index) — add under system specs: `ITEM-LEGACY.md — item lifecycle: death→corpse→scavenge→recovery custody contract (type: system-spec, SPEC-LOCKED, build deferred).`
- `docs/EVENT-CONTRACT.md` — no edit NOW (frozen tonight); the executor adds the `item_claimed` row + `item_changed` `takenBy` widening at build time (§10 commit 4). Fable notes the pending row in the contract doc's own follow-up list if one exists.
- `docs/ITEMS.md` — one-line pointer in the Fast-follows section: `Item lifecycle (death/claim/recovery custody) → docs/ITEM-LEGACY.md (spec-locked 2026-07-06).`
- `docs/PARKING.md` (Bastion entry) — append: `ITEM-LEGACY reserves lossState:"cached" as the vault seam; the transition is refused until this unparks.`
- Seat-prompt follow-up (frontier-owned, NOT the executor): teach `item_claimed` + the `itemLegacy` digest slice in `SEAT-PROMPT.md`/DM-BRIDGE prompt at build time.
