---
type: system-spec
project: Genesis
status: SPEC-LOCKED 2026-07-06 — build DEFERRED (freeze; executes post-Fable via Opus-orchestrated Sonnet executors)
consumer: Opus orchestrator + Sonnet executors; Adam skims anything marked PROVISIONAL
source: GPT-5.5 outside read §"Outside The Seat" item 1 (GPT-5.5-advice-for-Claude/README.md — "Move more declared events to detected events")
related:
  - "[[EVENT-CONTRACT]]"
  - "[[TRANSITION-CONTRACT]]"
  - "[[SRD-MECHANIZATION]]"
  - "[[MONSTER-TACTICS]]"
  - "[[WALK-CONSUMPTION]]"
  - "[[ECONOMY-SINKS]]"
  - "[[DM-BRIDGE]]"
---

# DETECTED EVENTS — the declared→detected migration sweep

**Thesis.** Every event the app can infer from state is one less thing the model must declare
perfectly — and one less line the seat prompt must carry forever. The DM seat gets cheaper,
smaller models get viable, and a whole class of "the DM forgot to emit X" bugs becomes
unrepresentable. The model can be poetic; the app should be stubborn.

**The precedent pattern (already shipped — cite, imitate, never reinvent):**

- `combat_end` auto-fires when the last foe drops — `cmMaybeAutoEnd` (src/world/dm.js:905-921),
  called from all three foe-state-change sites (dm.js:1701, 2299, 2345). Fled/surrendered ends
  stay a DM decision by locked doctrine ("script owns detection; DM owns the end decision").
- `combat_end` fan-outs the combat CONSEQUENCES detected: it builds and applies
  `encounter_resolved` + one `kill` per downed foe through the same applyEvent cases
  (dm.js:1584-1585). Combat consequences are already a detected family.
- `condition_expired` auto-emits off `round_tick`'s TTL sweep, `source:"detected"`
  (dm.js:2226-2252) — "the container the DM can't forget to close."
- `opportunity_attack` auto-fires when `move_zone` vacates a threatened zone (dm.js:1807).
- XP is NEVER declared: `xp_granted` is a no-op by design (dm.js:3212-3218); `grantXp`
  (dm.js:857-905) prices resolved-tension events as a side effect.
- `level_applied` is detected at the rest gate (src/world/play.js:394-404).
- Submersion rust is detected off a completed travel walk's rolled wet-biome legs
  (src/world/prep.js:522-534) — never DM bookkeeping.

This spec extends that pattern to five more surfaces (§3) and files the honest remainder (§4).
**Invariant: `DM_EVENT_TYPES` (dm.js:1218) does NOT grow — 87 entries before, 87 after.** This
sweep moves work from the model to the script inside the existing vocabulary. (Contrast:
TRANSITION-CONTRACT.md adds 5 new types, 87→92; if it builds first, the invariant here reads
"92 before, 92 after" — the point is *this spec adds none*.)

Everything below was verified against the tree on 2026-07-06. Line numbers are pre-build
anchors; the executor re-verifies each by symbol before editing (drift = re-anchor, never guess).

---

## §1 · The audit — every event in `DM_EVENT_TYPES`, classified

Classes: **D** = already detected on its primary path (precedent, no work) · **I** = inherently
interpretive, stays declared (a fiction judgment the engine cannot make) · **M** = MIGRATE NOW
(this spec, §3) · **P** = detectable with plumbing (deferred, §4). Dual entries name both paths.

| # | event | class | ruling / note |
|---|-------|-------|---------------|
| 1 | `hp_changed` | I + D | Narrated harm ("the fall costs you 7") is interpretive. Already detected on the attack path (dm.js:1756), foe_action (2335, 2366), hazard_tick (1866-1879). Death cascade inside it is detected (1461-1480). |
| 2 | `death_save` | I / P | The d20 must stay the player's (DM-agency law). The *request* while dying is detectable → PL-2 (§4). |
| 3 | `temp_hp` | I | Whether a boon grants temp HP is a fiction call. |
| 4 | `combat_start` | I | "Violence opens" is the DM's single most interpretive transition call. |
| 5 | `combat_end` | D + I | Detected on last-foe-drops (`cmMaybeAutoEnd`); negotiated/fled ends declared by locked doctrine (CHASE-CONTRACT-FIX). Precedent, cite only. |
| 6 | `attack` | I | Declares the PC's swing; resolution/damage/crit fan-out inside is detected. |
| 7 | `action` | I | Which standard action the fiction constitutes is interpretive. |
| 8 | `opportunity_attack` | D | Auto off `move_zone` (dm.js:1807). Precedent. |
| 9 | `move_zone` | I | Player intent. |
| 10 | `grapple` | I | Player intent; contest resolved in-engine. |
| 11 | `shove` | I | Same. |
| 12 | `hazard_tick` | I | The DM invokes the hazard; damage inside is detected. |
| 13 | `slot_spent` | **M** | DE-3: `cast {level}` already spends the slot (dm.js:1909-1910) — the separate declaration is a live double-spend hazard and 2 prompt lines. |
| 14 | `cast` | I | Recording the player's cast is a report of player action; concentration/ritual/slot riders inside are detected. |
| 15 | `concentration_start` | D | Rides `cast` (dm.js:1914-1920). Standalone case kept for direct sets; no prompt line needed. |
| 16 | `concentration_broken` | **M** + I | DE-2: damage-save failure and incapacitation become detected; the voluntary drop (`cause:"dm"`) stays declared. |
| 17 | `resource_spent` | I | Which narrated stunt spends Rage/Ki is interpretive. |
| 18 | `rest` | **M** | DE-1: the *declaration* stays (player/DM chooses to rest); every COST and RIDER (lodging, rest-risk, rust, wages, pets, level-up claim, charge refill) becomes detected — the DM rest event currently bypasses all of them. |
| 19 | `item_changed` | I + D | Loot/confiscation is interpretive. Already script-fired for lodging (play.js:343), wages (companions.js:102), shop buy/sell (shop.js:71, 86). |
| 20 | `item_split` | I | Player UI verb. |
| 21 | `item_use` | I | Player verb; effect resolution inside is detected. |
| 22 | `charge_spend` | I | Player verb. |
| 23 | `charge_restore` | I + D | Long-rest refill already detected (dm.js:1973-1974; DE-1 extends it to the UI rest). |
| 24 | `condition_add` | I | Interpretive; DE-2b adds a detected auto-break rider for incapacitating adds on the PC. |
| 25 | `condition_remove` | I / P | Narrative cures declared; *timed* out-of-combat expiry → PL-1 (§4). |
| 26 | `item_rust_exposure` | P | Honest block: no weather/acid signal exists to detect rain-combat/acid (EVENT-CONTRACT.md:109). Submersion already detected. PL-4. |
| 27 | `condition_expired` | D | Off `round_tick` (dm.js:2226-2252). Precedent. |
| 28 | `round_tick` | I | The turn boundary is a fiction judgment (no strict turn loop by design); everything inside it is detected. |
| 29 | `foe_morale` | **M** | DE-4: `moraleTrigger` + once-per-fight flags already exist in-engine (monster-tactics.js:124-141) — the checkpoint firing becomes detected. |
| 30 | `foe_action` | I + D | Bare = script plays the foe (already); the named-foe choice is interpretive. |
| 31-35 | `equip` `unequip` `set_grip` `attune` `unattune` | I | Player UI verbs (world/inventory.js buttons). |
| 36 | `fact_canonized` | I | Canon-stamping is the DM's job. |
| 37-41 | `codex_add/_link/_update/_reveal/_contact` | I | Assigning MEANING is the one job the engine must never take (engine owns nouns, DM owns verbs). `codex_contact` also fires script-side on prep contact (prep.js:371). |
| 42 | `social_check` | I | Declared; S2 (FABLE-WINDOW) threads the fiction DC. |
| 43 | `attitude_shift` | I + D | Declared shifts stay; the witness cascade is already detected (kill case, dm.js:2741-2749). |
| 44 | `morale_check` | I | Kept for DM-initiated (parley-adjacent) checks; the combat checkpoints move to DE-4. |
| 45 | `parley_open` | I | The ask is narrated by doctrine (dm.js:2258-2260). |
| 46 | `insight_read` | I | Player roll rides in. |
| 47 | `discovery` | I | Interpretive; TRANSITION-CONTRACT §3.3 adds the `enter` mover. |
| 48 | `clock_advanced` | I + D | Declared ticks stay; kill-escalation tick already detected (dm.js:2755-2763). |
| 49 | `clock_fired` | D + I | Transition-to-full detected (dm.js:2760-2762); DM may also declare. |
| 50 | `front_closed` | I | Story judgment. |
| 51 | `encounter_resolved` | D + I | Detected at combat_end fan-out; declared for non-combat resolutions. |
| 52 | `kill` | D + I | Detected per downed foe at combat_end; declared for narrative kills. |
| 53-55 | `claim_deed` `gift` `epithet_grant` | I | Reputation verbs — player/DM declared by design (REPUTATION.md: "the script prices every deed; the DM only declares/claims/gifts"). |
| 56-60 | `hire` `dismiss` `tend_pet` `companion_update` `recruit_creature` | I + D | Companion picks are interpretive; wages/neglect ticks already script-fired (play.js:358-368). |
| 61 | `choice_logged` | I | |
| 62 | `inspiration_granted` | I | DM taste, by design (SRD-MECHANIZATION §1). |
| 63 | `inspiration_spend` | I | Player verb. |
| 64 | `check` | I | Which check the fiction demands is interpretive; grading is engine-owned (resolveCheck). |
| 65 | `crit_outcome` | D | Auto off attack (dm.js:1696-1698) and dmRollFor (dm.js:706-708). Precedent. |
| 66 | `stage_fx` | I | Expressive verb, whitelisted — keep it the DM's hand. |
| 67 | `adjudication` | I | |
| 68 | `level_applied` | D | Rest-gate detected (play.js:394-404); DE-1 extends the gate to the DM `rest` event. |
| 69 | `prep_applied` | I | Synthesis result. |
| 70 | `prep_contact` | I | Player movement intent. |
| 71 | `walk_advance` | I | "The party cleared the segment" is a fiction judgment. |
| 72 | `walk_update` | I / P | Effect-die face capture; auto-capture from the dice tray → PL-3 (§4). |
| 73 | `walk_complete` | I + **M** | The FINALE resolving stays declared (interpretive — WALK-CONSUMPTION's own law: "reaching a finale segment does NOT complete the walk", prep.js:437-438). The ABANDONMENT case becomes detected → DE-5 (the party walking onto a different walk/node is observable state). |
| 74 | `capture` | I | |
| 75-77 | `chase_start` `chase_round` `chase_yield` | I | Pursuit is a choice; round math engine-owned; clock ticks are TRANSITION-CONTRACT's. |
| 78 | `downtime` | I | Intent declared; ledger roll + payout detected inside. |
| 79 | `distant_word` | I + D | Trigger declared; content script-rolled (anti-invention, payload `{}` by design). |
| 80 | `shrine_omen` | I | |
| 81 | `xp_granted` | D | No-op forever (dm.js:3212); `grantXp` detects. Precedent. |
| 82 | `open_shop` | I + D | Opening is interpretive; every transaction thereafter is player-UI-owned (shop.js `buyItem`/`sellItem` → `item_changed` through applyEvent). Shop transactions need NO migration — the UI already owns them; the prompt discipline is "open the shop, let the plaques transact" (already the built posture, SHOP-UI.md §2b). |
| 83 | `district_mint` | I | Idempotent mint on demand. |
| 84-85 | `building_approach` `building_contact` | I | |
| 86-87 | `job_board_read` `job_accept` | I | Walk mint + payout detected inside job-walks.js. |

**Score:** 87 types → 11 already-detected precedents · 5 migrations locked now (§3) ·
4 plumbing items filed (§4) · the rest correctly interpretive. The interpretive column IS the
product ("DM owns verbs") — the goal is zero *bookkeeping* left in the declared column.

---

## §2 · Shared rules for every migration

1. **Source stamp:** every auto-fired event/ledger line carries `source:"detected"`
   (`DM_EVENT_SOURCES`, dm.js:1226). Branch-resolved consequences keep `source:"branch"`
   (resolveBranch stamps it, dm.js:765).
2. **Idempotence over suppression:** where the DM may still declare the same event (morale,
   walk_complete, concentration_broken), the handler's existing guards make the double-fire a
   clean no-op (`moraleAlreadyFired`, `cursor.done`, `broken:false`) — we never *reject* the
   declared form.
3. **No new event types, no new model calls.** Detection runs inside already-executing code
   paths. SPEED-DOCTRINE cost: zero (§8).
4. **Prompt shrinkage is the win and it is counted** (§5). Every migration names the exact
   runbook line(s) deleted or never-written.
5. **Don't build the clock here.** All time-advance is TRANSITION-CONTRACT.md's (its §2 tick
   table already covers `rest`, `downtime`, combat, chase). DE units touch zero clock math.

---

## §3 · The five migrations (build scope)

### DE-1 · Rest costs & riders — the DM `rest` event inherits the full `passTime` stack

**Declared burden today.** The DM `rest` case (dm.js:1967-1988) does `restRecover` + item-charge
refill + exhaustion −1 + temp-HP clear — and NOTHING else. The UI path `passTime`
(src/world/play.js:321-409) owns the whole cost/risk economy: lodging (330-346), camp cooking
(347-354), companion wages (358-361), pet neglect tick (366-368), rest-risk + interruption
(375-383), `rustMaintainAll` (392), rest-gated level-up claim (394-404). The asymmetry cuts BOTH
ways: a DM-declared rest pays no lodging, rolls no risk, claims no level-up (the exact free-rest
exploit a Rennick-class griefer reaches by asking the DM instead of pressing the button —
"Genesis should be hard & dangerous"); and a UI rest never refills charges, never reduces
exhaustion, never clears temp HP. Two half-rests, one bug class.

**Detection seam.** Extract ONE shared stack:

- **New function `restRiders(w, o)` in src/world/play.js** (manifest `owns` += `restRiders`),
  `o = { restKind:"short"|"long", dayScale:0|1, via:"ui"|"dm" }`. Body = the passTime blocks
  moved VERBATIM, in the exact current order — lodging *(gate: `o.dayScale>=1 &&
  nodeInhabited`)* / camp cooking *(gate: `o.dayScale>=1 && !inhabited`)* → wages
  *(`o.dayScale>=1`)* → pet tick *(`o.dayScale>=1`)* → rest-risk roll *(any restKind; env from
  the active walk exactly as play.js:376-380)* → recovery *(skipped when
  `restRisk.interrupted`)* → rust maintain → level-up claim *(runs regardless of interruption —
  parity with today's play.js:394 gate)*. The recovery step = `restRecover(sh, o.restKind)`
  **plus** the three long-rest riders moved from the dm.js case: charge refill (dm.js:1973-1974),
  `removeExhaustion(sh,1)` (1979), `clearTempHp` (1980) — so the UI rest gains them too.
  Returns `{ lodging, restRisk, restored, recharged, exhaustionAfter, leveled, interrupted }`.
  `restRiders` owns the `kind:"rest"` recovery ledger line — the dm case's richer prosody
  (dm.js:1982-1986, with recharged/exhaustion fields) wins; passTime's simpler line
  (play.js:390) is superseded by it.
- **`passTime` (play.js:321-409)** keeps: kind→minutes mapping, `advanceClock`, the
  `transition` ledger line (405), `logEvent` (406), the montage `worldTurn` (407-409). The
  extracted middle becomes one call:
  `restRiders(w,{restKind:rest, dayScale:(kind==="dawn"||kind==="montage")?1:0, via:"ui"})`.
- **The dm.js `rest` case (1967-1988)** becomes: (1) NEW guard
  `if(GS.combat && GS.combat.active) return {ok:false, reason:"combat-active"}` (no resting
  mid-fight — decided); (2)
  `const rr = restRiders(w,{restKind:kind, dayScale:kind==="long"?1:0, via:"dm"});`
  (3) return `{ok:true, rest:kind, restored:rr.restored, interrupted:!!rr.interrupted,
  exhaustion:rr.exhaustionAfter, lodging:rr.lodging||null, leveled:rr.leveled||null}`.
  Clock tick for this case is TRANSITION-CONTRACT §3.8's edit (+480/+60) — DE-1 does not touch
  it; build order in §10.

**Worked before→after.**
Before: `applyEvent(w,{type:"rest",payload:{kind:"long"}})` at an inhabited node with 30 gp and
312 XP → slots/HP restored, gold **30** (no lodging), no rest-risk line, `sheet.level` **1**
(pending level-up unclaimed until the player finds the UI button).
After: same event → lodging ledger line fires (`kind:"lodging"`, gold 30−price), one
`kind:"rest-risk"` line (interruption possible — the rest can now FAIL, CAL-1 spirit),
`kind:"rest"` line with `recharged`/`exhaustion` fields, `sheet.level` **2** via detected
`level_applied` — and the UI `passTime('dawn')` now also refills item charges and drops one
exhaustion level.

**Prompt lines.** None deleted (no rest instruction exists in DM-BRIDGE.md — that absence was
the bug); one 1-line EDIT: DM-BRIDGE.md:213 "dawn/montage rests at inhabited places charge the
tier price" → "any long rest at an inhabited place charges the tier price (UI or `rest` event)".
Prevents the future SEAT-PROMPT.md ever needing a "remember rest costs" paragraph.

**Red-first probes** (dev/verify-detected-events.mjs, §7):
- **DE-P1a** — seed inhabited node, `sh.gold=30`; `applyEvent rest{kind:"long"}`. RED today:
  `sh.gold===30`. Green: `sh.gold` **MOVED** to exactly `30 - lodgingPrice(tier,att)` (compute
  the expected number in the probe from the same functions; assert the value, not "a charge
  happened").
- **DE-P1b** — seed `sh.xp=300` (SRD level-2 threshold); `applyEvent rest{kind:"short"}`. RED
  today: `sheet.level===1`. Green: `sheet.level===2` (mutation: the level MOVED).
- **DE-P1c** (reverse direction) — UI path: seed exhaustion 2, a 0/3-charge item;
  `passTime('dawn')` at an uninhabited node. RED today: exhaustion `2`, charges `0`. Green:
  exhaustion `1`, charges `3`.

---

### DE-2 · Concentration breakage — the save resolves itself

**Declared burden today.** `hp_changed` already DETECTS the threat: it computes the DC and
ledgers "must make a DC N Constitution save" (dm.js:1448-1459, `out.concentrationSave`), and
auto-breaks at 0 HP. But then the loop goes soft: the DM must remember to (a) issue the
rollRequest and (b) emit `concentration_broken` on a failure. A memoryless seat drops (b)
constantly — the spell just quietly persists. The engine machinery is COMPLETE and idle:
`concentrationDamageSave` / `concentrationAutoBreak` (src/engine/concentration.js:60-79) have
zero dm.js callers beyond the 0-HP inline break.

**Detection seam — three edits:**

1. **Queue the pending save.** In the hp_changed concentration block (dm.js:1453-1458), beside
   `out.concentrationSave`, push
   `t.sh.concentration.pendingSaves=(t.sh.concentration.pendingSaves||[]).concat([{dc,spell:t.sh.concentration.spell}]);`
   One entry per damage instance (SRD); persisted on the sheet, reload-safe; the whole queue
   dies with `sh.concentration=null` on any break (free cleanup).
2. **Script-authored branched rollRequest.** New function **`dmScriptRollReq(w)` in
   src/world/dm.js** (manifest `owns` += `dmScriptRollReq`): if a living sheet has
   `concentration.pendingSaves.length`, return
   ```js
   { scripted:"concentration", skill:"Concentration", ability:"con", dc:ps.dc, adv:null,
     why:"You took damage while concentrating on "+ps.spell+" — DC "+ps.dc+" CON save to hold it.",
     branches:{
       success:{ narration:"(You keep your grip on "+ps.spell+".)", events:[] },
       fail:{ narration:"(The weave slips — your concentration on "+ps.spell+" breaks.)",
              events:[{type:"concentration_broken", payload:{cause:"damage"}}] } } }
   ```
   (else `null`). Injection sites, both guarded `if(!GS.dm.rollReq && typeof
   dmScriptRollReq==="function")`: **(a)** applyResponse, AFTER the `sceneDelivered`
   computation (dm.js:497) and before the `w.dm` reassignment (519) — a scripted request must
   NOT mark the scene undelivered (triage would wrongly deep-lane the next turn), and the
   DM's own rollRequest always wins the slot (the queue simply waits one turn); **(b)**
   resolveBranch, after `w.dm.lastResolution=...` (dm.js:771), mirroring into `w.dm.rollReq`
   — so chained saves (a branch's own hp_changed queuing a new save) drain one per resolution.
3. **Local resolution + consumption in `dmRollFor` (dm.js:689-740).** After
   `GS.dm.rollReq=null` (701): if `rq.scripted==="concentration"`, shift the head off
   `pendingSaves`. Branch guard (730-731) becomes
   `if(br && (rq.scripted || (die!==20 && die!==1)) && …)` — scripted saves ALWAYS resolve
   locally (a concentration save is bookkeeping, not a crit-magnitude theater beat — decided).
   In resolveBranch, after `branchKey` is computed (dm.js:757-758):
   `if(rq.scripted && rolls[0].result===1) branchKey="fail"; if(rq.scripted && rolls[0].result===20) branchKey="success";`
   (SRD 2024 d20-Test auto-fail/auto-succeed on saves — decided).
4. **Incapacitation auto-break (DE-2b).** In the condition_add CREATURE/PC path
   (dm.js:2168-2176), after `addCondition` succeeds and only when the target is the PC
   (`p.target==null || p.target==="pc"`): call `concentrationAutoBreak(t2.sh, holder.obj)`
   (`t2=livingSheet(w)`); on `broken`, write the same ledger shape as the 0-HP break
   (dm.js:1451-1452) with `cause:"incapacitated"`, `source:"detected"`, and include
   `concentrationBroken` in the return. Direct break + ledger, no recursive event — the 0-HP
   precedent's exact posture.

`concentration_broken` stays in the vocabulary: the voluntary drop (`cause:"dm"`) and S1's
`{spell}` alias fold are untouched. `DM_EVENT_FIELDS` unchanged.

**Worked before→after.**
Before: PC concentrating on *Hold Person* takes 22 damage → ledger says "must make a DC 11 CON
save"; DM narrates past it; *Hold Person* runs forever.
After: same damage → the very next response-apply hands the player a script-owned branched CON
save (DC 11). Player clicks roll; a 3+2=5 resolves the fail branch locally —
`concentration_broken {cause:"damage"}` applies with `source:"branch"`, `sh.concentration`
nulls, the held foe's `{concentration:"pc"}` conditions lift (dm.js:1946-1948), zero DM turns
spent.

**Prompt lines.** DM-BRIDGE.md never taught this (the gap); the win is 3-4 NEVER-WRITTEN lines:
S3 (FABLE-WINDOW-2026-07-06.md, Unit S3) adds the `cast` contract to the seat prompt — without
DE-2 it would ALSO need "when the save fails, emit concentration_broken {cause:'damage'}" plus
the incapacitation rule. Those lines are now permanently unnecessary. EVENT-CONTRACT.md:79's
source column tightens to "detected (damage-save / 0-HP / incapacitating condition) or declared
(voluntary drop only)".

**Red-first probe DE-P2** — seed a concentrating sheet (`cast {spell:"Hold Person", level:2,
concentration:true}`), then `applyEvent hp_changed{delta:-22}`, then simulate a turn close via
`applyResponse({turnId:"t-x", narration:"", events:[]})`. RED today: `GS.dm.rollReq===null`.
Green step 1: `GS.dm.rollReq.scripted==="concentration" && GS.dm.rollReq.dc===11`. Then
reassign `rollDie` in the jsdom window to force die=3 and call
`dmRollFor("Concentration","con",null)`. RED today: n/a (no request). Green step 2:
`sh.concentration===null` (**MOVED** from `{spell:"Hold Person",…}`) and `pendingSaves` drained.

---

### DE-3 · Slot economy — `cast {level}` is the single spender; the `slot_spent` prompt duty dies

**Declared burden today.** DM-BRIDGE.md:186-187 orders: "A leveled spell is cast →
`slot_spent`… The slot is NOT consumed unless you fire this." But the `cast` case ALREADY
spends the slot when `p.level` rides (dm.js:1909-1910, "a non-ritual leveled cast spends a
slot"). A DM that learns both events (S3 is about to teach `cast`) and obediently fires both —
`cast {level:1}` + `slot_spent {level:1}` — **double-spends**. A DM that fires only
`slot_spent` (today's runbook-obedient DM) never starts concentration, which is the S3 gap.

**Ruling (decided):** `cast {spell, level}` is the one caster event the prompt teaches.
`slot_spent` REMAINS in the vocabulary (UI/legacy/direct-spend uses, EVENT-CONTRACT.md:99) but
loses its runbook bullet, and the engine adds a batch dedupe guard so the transition period
(and any stale-learned DM) is harmless.

**Detection seam.** New function **`dmFoldSlotSpends(events)` in src/world/dm.js** (manifest
`owns` += `dmFoldSlotSpends`): scan one TurnResponse's `events[]`; pair each `cast` carrying a
numeric `payload.level` with the first *unpaired* `slot_spent` of the SAME level anywhere in the
same array (either order — a DM may emit slot_spent first); pairing is 1:1 (two casts + two
slot_spents at the same level = two pairs). A paired `slot_spent` is not applied — its `applied`
entry records `{type:"slot_spent", res:{ok:true, folded:"rides-cast"}}` and ONE ledger line
(`kind:"slot-fold"`, `source:"detected"`, prose: "◇ the slot spend rides the cast — not
double-charged."). Call sites: applyResponse before the map (dm.js:475) and resolveBranch
before its map (dm.js:766) — both apply paths, one implementation. `seatApplyResponse`
delegates to applyResponse (seat.js:426-429) — covered for free.

**Worked before→after.**
Before: events `[cast{spell:"Cure Wounds",level:1}, slot_spent{level:1}]` against slots `2/2` →
slots land at **0/2** (double-spent).
After: same response → slots **1/2**; ledger shows the cast line + one slot-fold line.

**Prompt lines DELETED: 2** — DM-BRIDGE.md:186-187 (the whole `slot_spent` bullet). S3's seat
prompt teaches only `cast {spell, level}` + "cantrips carry no level". Coordination note for
the S3 executor: do NOT add a slot_spent bullet.

**Red-first probe DE-P3** — seed a caster sheet `slotsMax=[2]`, `slots=[2]`; run
`applyResponse` with the two-event array above. RED today: `sh.slots[0]===0`. Green:
`sh.slots[0]===1` (assert the exact remaining count, not the ledger label — BUG-01 lesson).

---

### DE-4 · Foe morale checkpoints — the trigger detection already exists; fire it

**Declared burden today.** DM-BRIDGE.md:511-513: "Morale checkpoints per MONSTER-TACTICS
(first blood, half strength, leader down): emit `morale_check`/`foe_morale` — the verdict is
binding." The engine already owns EVERYTHING except the firing: `moraleTrigger(foe, combat)`
detects side-bloodied / leader-down / bloodied-outnumbered / fear-effect
(src/engine/monster-tactics.js:124-137), and `moraleAlreadyFired`/`markMoraleFired`
(:140-141) make re-fires no-ops. A forgetful DM = foes that never break = every fight to the
death = the lethality curve reads wrong.

**Detection seam.** New function **`cmMoraleSweep(w)` in src/world/dm.js** (manifest `owns` +=
`cmMoraleSweep`), placed beside `cmMaybeAutoEnd`:

```js
function cmMoraleSweep(w){
  if(!GS.combat || !GS.combat.active) return [];
  if(typeof moraleTrigger!=="function") return [];
  const fired=[];
  (GS.combat.foes||[]).forEach(f=>{
    if(f.down||f.fled||f.surrendering||f.surrendered) return;
    const trig=moraleTrigger(f,GS.combat);
    if(!trig || moraleAlreadyFired(GS.combat.moraleFlags||{}, f.fid, trig)) return;
    fired.push({fid:f.fid, trigger:trig,
      res:applyEvent(w,{type:"foe_morale", payload:{foe:f.fid, trigger:trig}, source:"detected"})});
  });
  return fired;
}
```

ONE call site: the attack case, immediately before `cmMaybeAutoEnd` (dm.js:1699-1701) — the
only site where a PC damages/downs a foe, i.e. the only place checkpoint state can newly become
true. Ordering (decided): sweep FIRST, then `cmMaybeAutoEnd` — a swept flee can complete the
"all foes resolved" picture and set `resolvable` in the same apply. The existing `foe_morale`
case (dm.js:2261-2306) is reused verbatim: it re-checks the guard, marks the flag, rolls the
WIS save in the open, and mechanically moves the foe (flee/rout/surrender) — no recursion risk
(the case damages nothing). The DM may still declare `foe_morale`/`morale_check` (parley
setups, fear beats) — the once-per-fight-per-trigger flags make any overlap a clean
`{ok:false, reason:"already-fired"}`.

**Worked before→after.**
Before: 2 bandits; the PC downs one. Nothing happens until the DM remembers the checkpoint —
usually never; bandit 2 fights to −HP.
After: the same `attack` event's own apply sweeps: `moraleTrigger(bandit2)` returns
`"side-bloodied"` → detected `foe_morale` rolls the open WIS save → on a fail bandit 2 is
mechanically `fled` (band moved out) with `huntedBehavior` stashed, ledger + digest carry it;
the DM's next turn narrates a rout it didn't have to remember to check for.

**Prompt lines DELETED: net −2** — DM-BRIDGE.md:511-513's instruction sentence is replaced by
one line: "Morale fires itself at the checkpoints (detected) — narrate the verdict the ledger
hands you; `foe_morale` remains available for fear beats you initiate."

**Red-first probe DE-P4** — `combat_start` with 2 CR-appropriate foes; force `rollDie` to 1
(save fails); apply an `attack {target:"f1", d20:19, …}` sized to down f1. RED today:
`GS.combat.foes[1].fled` is `undefined` and `GS.combat.moraleFlags` is `undefined`. Green:
`foes[1].fled===true` (**MOVED**) and `GS.combat.moraleFlags.f2["side-bloodied"]===true`.

---

### DE-5 · Walk abandonment — an orphaned walk closes itself

**Declared burden today.** DM-BRIDGE.md:197-200 + 273-277 make the DM responsible for
`walk_complete {abandoned:true}` when the party wanders off. The observable fact: activating a
DIFFERENT walk overwrites `P.activeWalkId` (prep.js:419) with the old walk's cursor never
`done`, its walkLog entry never finalized — a provenance leak and a promote-queue stall that
`walkPromoteNext` then half-hides (prep.js:581 skips un-done walks *as candidates* but nothing
ever closes them). The FINALE case stays declared — "finale resolved" is a fiction judgment
(prep.js:437-438's own law).

**Detection seam.** New function **`walkCloseOrphan(w, exceptNodeId)` in src/world/prep.js**
(manifest `owns` += `walkCloseOrphan`):

```js
function walkCloseOrphan(w, exceptNodeId){
  const P=prepOf(w);
  if(!P.activeWalkId || P.activeWalkId===exceptNodeId) return null;
  const pn=P.nodes && P.nodes[P.activeWalkId];
  if(!pn || !pn.cursor || pn.cursor.done) return null;
  return walkComplete(w,{ nodeId:P.activeWalkId, abandoned:true, noPromote:true });
}
```

- `walkComplete` (prep.js:497) gains `opts.noPromote`: the frontier tail's promotion line
  (prep.js:571) becomes `const next = opts.noPromote ? null : walkPromoteNext(w,nodeId,here);`
  — when the party abandoned Walk A *by choosing Walk B*, B IS the next road; promoting a third
  frontier on top would be noise (decided). All three kind-branches (travel/job/frontier) run
  their existing abandonment semantics unchanged: travel = turned back (currentNodeId stays,
  prep.js:506-509), job = no payout + return to origin (prep.js:550-559), frontier = the
  "road left unwalked" ledger line (prep.js:567-570).
- Call site 1: top of `walkSetActive` (prep.js:416-418), first statement:
  `walkCloseOrphan(w, nodeId);` — covers `prep_contact`, `prepStartTravelWalk`, and job-walk
  activation in one seam (all route through walkSetActive).
- Call site 2 (coordination, only if TRANSITION-CONTRACT has built): `pcMoveTo`
  (TRANSITION-CONTRACT §3.2) adds one guarded line
  `if(typeof walkCloseOrphan==="function") walkCloseOrphan(w, nodeId);` — a non-walk relocation
  off the walk's node is the same abandonment fact. Listed in §10 as a cross-spec edit for the
  orchestrator, not a dependency (DE-5 is complete without it).

**Worked before→after.**
Before: party mid-Walk-A (segment 2 of 5), player says "forget this, we go to the Gilded
Quarter"; DM emits `prep_contact` for B and forgets `walk_complete{abandoned:true}` → Walk A's
cursor dangles forever; the wrap's provenance report shows a walk that never ended.
After: the same `prep_contact` → `walkSetActive(B)` first closes A detected: `cursor.done=true`,
walkLog `finaleReached:false`, the "road left unwalked" ledger line, no spurious promotion —
then B activates. The DM did nothing extra.

**Prompt lines DELETED: net −2** — the `{abandoned:true}` duty drops from both bullets:
DM-BRIDGE.md:197-200 → "Finale resolved? Emit `walk_complete` `{payload:{}}` — walking off to
another road closes the old walk itself (detected)." and the twin at 273-277 shrinks the same
way. The finale instruction stays.

**Red-first probe DE-P5** — activate frontier walk A (`walkSetActive`), advance to segment 2,
then `lockOnContact(w, B)` for a second prepped frontier. RED today:
`P.nodes[A].cursor.done===false` while `P.activeWalkId===B`. Green: `P.nodes[A].cursor.done===true`
(**MOVED**), walkLog A `finaleReached===false`, `P.activeWalkId===B`, and NO new promotion
entry beyond B (assert `P.nodes` keys unchanged).

---

## §4 · Detectable-with-plumbing — filed, NOT in build scope

| id | surface | missing plumbing | owner/when |
|----|---------|------------------|------------|
| PL-1 | Timed out-of-combat condition expiry (poisoned 1h, frightened 10min) | a `{minutes}` ttl kind: stamp `expiresAtMin` (absolute clock total) at `addCondition`, sweep on clock movement. Needs TRANSITION-CONTRACT's moving clock to mean anything; sweep site = inside `advanceClock` (state.js:78, has `w`) | post-TRANSITION follow-up; spec as a TRANSITION-CONTRACT amendment |
| PL-2 | Death-save auto-request while dying | reuse DE-2's `dmScriptRollReq` seam: when `sh.deathSaves` is active and no rollReq pending, script-author the open death-save request (branches unusable — nat 20/1 matter → live) | fast-follow after DE-2 proves the scripted-request pattern in play |
| PL-3 | `walk_update` effect-die face auto-capture | the dice tray knows the roll but not that it WAS the room's effect die; needs a "rolling the room die" UI affordance that tags the roll | IN-SESSION-UI backlog |
| PL-4 | `item_rust_exposure` rain-combat/acid | no weather/hazard signal exists (EVENT-CONTRACT.md:109's own honest note) | blocked on a weather system; do not fake it |

---

## §5 · Prompt shrinkage — the counted win

| migration | surface | lines |
|-----------|---------|-------|
| DE-3 | DM-BRIDGE.md:186-187 deleted | **−2** |
| DE-4 | DM-BRIDGE.md:511-513 → 1 line | **−2** |
| DE-5 | DM-BRIDGE.md:197-200 + 273-277 abandonment clauses | **−2** |
| DE-1 | DM-BRIDGE.md:213 edited (scope widens, no growth) | 0 |
| DE-2 | future SEAT-PROMPT.md lines never written (concentration-failure duty + incapacitation rule S3 would otherwise add) | **~4 avoided** |

Net: **−6 lines from the live runbook, ~4 never written into the seat prompt** — and those
lines ride EVERY turn of every session at seat-prompt position (DM-SEAT §2 prefix), so the
shrinkage compounds per-turn, forever. The doc edits land in the SAME merge as their code unit
(runbook and engine must never disagree — but per the standing gotcha, never edit DM-BRIDGE.md
mid-live-session).

---

## §6 · Edge cases — enumerated rulings (all decided)

| # | case | ruling |
|---|------|--------|
| E1 | DM emits `rest` during active combat | `{ok:false, reason:"combat-active"}` (new guard, DE-1). |
| E2 | DM `rest` at an inhabited node with insufficient gold | charge what's there, ledger the shortfall unpaid — passTime's existing convention rides through `restRiders` unchanged (play.js:342-345). |
| E3 | Two rests in one day (UI dawn + DM rest) | both charge, both roll risk — each is a real rest; no dedupe (a rest is not idempotent). |
| E4 | Rest-risk interrupts a DM-declared rest | recovery skipped (parity with passTime); lodging already paid stays paid (you bought the bed, not the sleep); return carries `interrupted:true` — the DM narrates it. |
| E5 | Concentration pendingSave queued, DM's own rollRequest arrives same turn | DM's request wins the slot; the scripted save fires on the next response-apply (queue persists on the sheet). |
| E6 | Multiple damage instances before any save | one queue entry per instance, drained one per apply/branch-resolution (sequential; SRD one-save-per-instance honored in order). |
| E7 | Nat 1 / nat 20 on a scripted concentration save | auto-fail / auto-succeed, resolved LOCALLY (no crit-magnitude live turn — a concentration save is bookkeeping, not a spike beat). |
| E8 | Concentration breaks by 0-HP while saves are queued | `sh.concentration=null` destroys the queue with it — no orphaned scripted requests. |
| E9 | `cast` with no `level` (cantrip) + a stray `slot_spent` | NOT paired (pairing requires a numeric cast level); the slot_spent applies as declared — the engine can't prove it's spurious. |
| E10 | `slot_spent` at a different level than the cast (upcast bookkeeping quirks) | NOT paired — levels must match exactly; mismatches apply as declared. |
| E11 | DM declares `foe_morale` for a trigger the sweep already fired | existing guard returns `{ok:false, reason:"already-fired"}` — clean no-op (dm.js:2267). |
| E12 | Morale sweep marks the last live foe fled | sweep runs before `cmMaybeAutoEnd` → same apply sets `GS.combat.resolvable` — the DM's cue rides the very digest that reports the rout. |
| E13 | `walkCloseOrphan` when the "new" walk IS the active walk (re-entry) | `exceptNodeId` short-circuit — re-entry resumes the cursor exactly as today (prep.js:365). |
| E14 | Orphan closure of a TRAVEL walk (party contacts a frontier mid-road) | travel-abandon branch: turned back, currentNodeId untouched, remainder minutes NOT added (prep.js:506-509 unchanged). |
| E15 | Orphan closure of a JOB walk | job-abandon branch: no payout, return to origin (prep.js:550-559 unchanged). |
| E16 | Detected events and the DIGEST delta | all new ledger lines ride `addLedger` → the existing digest ledger slice carries them; no digest schema change, no byte-budget review needed beyond the standing verify-digest-diet gate. |

---

## §7 · Acceptance — commands + expected numbers (RED-FIRST, mutation-asserted)

**New harness: `dev/verify-detected-events.mjs`** — boot pattern copied from
dev/playtest-bug-probes.mjs (jsdom, manifest loadOrder, same STUBS list; force dice via
window-scope `rollDie` reassignment). It contains probes DE-P1a/b/c, DE-P2, DE-P3, DE-P4,
DE-P5 (7 probes). Every probe asserts the VALUE MOVED (gold amount, level number, slots
remaining, `fled===true`, `cursor.done===true`, `sh.concentration===null`) — never a label.

| gate | command | expected |
|------|---------|----------|
| Red-first (run against un-fixed master BEFORE building; commit the output in the branch description) | `node dev/verify-detected-events.mjs` | `detected-events: 0 RESOLVED / 7 PRESENT` · exit 1 |
| Post-build | `node dev/verify-detected-events.mjs` | `detected-events: 7 RESOLVED / 0 PRESENT` · exit 0 |
| Event-runtime regression | `node dev/verify-dm-events.mjs` | exit 0, no check count lost vs master |
| Standing bug probes (no regressions) | `node dev/playtest-bug-probes.mjs` | every probe currently RESOLVED stays RESOLVED; exit code unchanged vs master |
| Vocabulary invariant | `node -e "..."` one-liner in the harness: `DM_EVENT_TYPES.length` | `87` (or `92` if TRANSITION-CONTRACT built first — assert equality with master+TRANSITION, i.e. THIS spec added 0) |
| Seat-vocab parity | inside verify-detected-events: `seatEventVocabulary(true).length === DM_EVENT_TYPES.length` | `true` |
| Module registry | `python3 build/check-manifest.py` | exit 0 (after `owns` += `restRiders` (play), `dmScriptRollReq`, `dmFoldSlotSpends`, `cmMoraleSweep` (dm), `walkCloseOrphan` (prep)) |
| Ledger-parity spot check (DE-1 refactor safety) | probe DE-P1c also asserts `passTime('dawn')`'s ledger kind sequence === master's sequence ∪ {the richer `rest` line fields} | listed kinds match |

---

## §8 · Inference cost (SPEED-DOCTRINE declaration)

**Zero model calls added.** All detection runs inside already-executing deterministic paths
(applyEvent cases, walkSetActive, applyResponse). Net inference is NEGATIVE: −6 runbook lines
ride out of every turn's prompt position; DE-2 deletes an entire DM round-trip per
concentration save (the "did the save fail?" turn); DE-4 deletes the morale-checkpoint turn;
DE-3 prevents correction turns after double-spends.

---

## §9 · Blind-playable parity (BLIND-PLAYABLE FULLY)

No new visual surface ships. Every detected firing lands as an `addLedger` prose line (the
prose twin channel: lodging, rest-risk, concentration break, morale verdict, road-left-unwalked
— exact strings specced in §3), which the feed already narrates through the ARIA live region.
The one new interactive surface — DE-2's scripted rollRequest — renders through the EXISTING
roll-request UI (keyboard-reachable, prose `why` line included in the request payload). Nothing
here is visual-only; nothing needs a new twin.

---

## §10 · Execution plan (for the orchestrator)

| unit | scope | size | depends on |
|------|-------|------|------------|
| DE-3 slot fold | `dmFoldSlotSpends` + 2 call sites + DM-BRIDGE edit + probe | S | coordinate wording with S3 (seat prompt teaches `cast` only) |
| DE-5 walk orphan | `walkCloseOrphan` + `noPromote` + walkSetActive call + doc edits + probe | S | none (pcMoveTo line only if TRANSITION built — apply as a cross-edit then) |
| DE-4 morale sweep | `cmMoraleSweep` + attack-case call + doc edit + probe | S | none |
| DE-2 concentration | pendingSaves queue + `dmScriptRollReq` + dmRollFor/resolveBranch edits + condition_add auto-break + probe | M | S1 first (its `concentration_broken {spell}` alias fold touches the same case) |
| DE-1 rest unification | `restRiders` extraction + passTime slim + rest-case rewrite + probes ×3 | M | TRANSITION-CONTRACT U1 first (its rest-case clock tick lands before/with this rewrite — one merge conflict avoided by ordering, not by merging specs) |

Queue: DE-3 ∥ DE-4 ∥ DE-5 (parallel, disjoint files-regions) → DE-2 → DE-1. Each unit: its own
`fix/…` branch, red-first output captured, re-gated personally (never trust the executor's
self-reported green), `--no-ff` merge.

**Don't-touch list (hard):** `tables.json` · `tables.js` · `data/bestiary.js` ·
`data/realm-bestiary.js` · `data/class-progression.js` · `data/wiki.js` (all generated — spec
generator edits only, never hand-edits; none are needed here) · `src/engine/concentration.js`,
`src/engine/resources.js`, `src/engine/monster-tactics.js` (pure engine stays pure — every DE
edit is world-layer) · `DM_EVENT_TYPES` / `DM_EVENT_FIELDS` rows (no additions, no removals) ·
DM-BRIDGE.md while a live session runs (standing gotcha) · Adam's hand-authored tables (not in
scope, listed for completeness).

**PROVISIONAL (Adam skims — recommended defaults already locked in the text):**
1. DE-4 shifts morale checkpoints from DM-timed to script-timed beats (the verdict was already
   binding; this makes the *check* un-forgettable). Default: ON as specced.
2. DE-1's `combat-active` rest refusal (E1). Default: refuse, as specced.
3. DE-2's E7 (scripted concentration saves resolve locally even on nat 20/1 — no
   crit-magnitude theater on a bookkeeping save). Default: as specced.

---

## Registry updates (Fable applies — NOT this executor)

- **docs/DESIGN.md** (decision registry): add one line — "DETECTED-EVENTS (2026-07-06,
  SPEC-LOCKED): declared→detected sweep — rest costs/riders unified (`restRiders`),
  concentration saves script-authored + auto-break, `cast` owns the slot (slot_spent folded),
  morale checkpoints auto-fire (`cmMoraleSweep`), walk abandonment detected
  (`walkCloseOrphan`); vocabulary unchanged; −6 runbook lines. Spec: docs/DETECTED-EVENTS.md."
- **docs/NEXT-STEPS.md**: add the 5-unit queue (DE-3 ∥ DE-4 ∥ DE-5 → DE-2 → DE-1) to the
  post-freeze build ledger, ordered AFTER TRANSITION-CONTRACT U1 and FABLE-WINDOW S1/S3.
- **docs/README.md** (docs index): register `DETECTED-EVENTS.md` — `type: system-spec`, one
  line: "the declared→detected migration sweep (GPT outside-read item 1); audit table +
  5 locked migrations."
- **docs/EVENT-CONTRACT.md**: after DE-2/DE-3 build, update row sources — line 79
  `concentration_broken` → "detected (damage-save / 0-HP / incapacitating condition) or
  declared (voluntary drop only)"; line 99 `slot_spent` → "declared (UI/direct) — folded when
  it rides a `cast {level}` in the same response"; line 101 `rest` → "declared (or `passTime`
  UI) — costs/riders detected via `restRiders`". (These are build-time lockstep edits, listed
  here so the registry knows they're owed.)
- **docs/DM-BRIDGE.md**: the §5 deletions/edits land with their code units (never
  mid-live-session).
- No doc is superseded by this spec.
