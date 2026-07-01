---
type: system-spec
branch: Genesis
status: draft
created: 2026-06-21
---

# Event Contract — the DM ↔ Script Interface

The spine of advancement, difficulty, and combat. This doc defines the **only** way game
events become state. The other three specs (`ADVANCEMENT.md`, `DIFFICULTY.md`, `COMBAT.md`)
reference the event types defined *here* rather than restating them — that's what keeps the
four docs from drifting against each other.

## Thesis

Genesis exists because AI DMs drift over long play. The fix is the same one used for world
state: **the script owns state; the AI only interprets.** Applied to advancement, that means
the DM never invents a number. It **reports what happened as a typed event**, and the script
computes the consequence (XP, escalation, leveling) from the rules. XP becomes a state machine
the DM feeds — not a value it improvises.

## Core principle: detected > declared

Every event carries a `source`:

- **`detected`** — the script derived the event from an observed change in world state (a
  faction clock hit max; a front's status flipped; a write-once fact landed). The DM didn't
  have to report it; the script *saw* it. **Prefer this.** It is the tightest container —
  the DM can't forget it, inflate it, or fake it.
- **`declared`** — the DM reported something the script can't yet observe (a clever social
  resolution, a meaningful choice with no mechanical footprint). The fallback. Every declared
  event is a candidate to promote to detected later by giving the script a state hook for it.

**Design pressure, always:** move events from declared → detected. The more advancement is
driven by observed state deltas, the less the DM can drift.

## Event envelope

```
{
  type:    <event type, below>,
  payload: { ...type-specific fields },
  source:  "detected" | "declared",
  sessionClock, worldClock,        // the two existing counters
  ledgerRefs: [ ...affected ledger ids ]
}
```

The script validates each event against this contract, applies it (ledger write + any XP /
difficulty consequence), and returns a **state delta the DM must honor in narration**. The DM
does not get to contradict the returned state — that is the anti-drift guarantee.

## Event taxonomy (v1)

| type | payload | usual source | consumed by |
|---|---|---|---|
| `front_closed` | `{ledgerId, how}` | detected (ledger status flip) | ADVANCEMENT (XP), DIFFICULTY |
| `clock_fired` | `{clockId, factionId, forPlayer}` | detected (clock → max) | ADVANCEMENT, DIFFICULTY |
| `clock_advanced` | `{clockId, delta}` | detected | DIFFICULTY (escalation) |
| `fact_canonized` | `{factId}` | detected (write-once fact) | ADVANCEMENT (discovery) |
| `discovery` | `{what, nodeId?}` | detected (new node / lazy-history reveal) | ADVANCEMENT |
| `encounter_resolved` | `{foes:[{cr,victimClass}], method, objectiveRef?, outcome}` | declared→detected | ADVANCEMENT, DIFFICULTY |
| `kill` | `{victimClass, factionId?}` | declared (until combat engine emits it) | DIFFICULTY (escalation) |
| `choice_logged` | `{weight:minor\|major, forecloses:[...]}` | declared | ADVANCEMENT |
| `inspiration_granted` | `{pc, reason}` | declared (DM judgment) | sets `sh.inspiration=true` (SRD-MECHANIZATION §1 — a mechanized spend-to-reroll token, not just play-quality) |
| `check` | `{kind:skill\|save\|ability, key, dc, d20, advantage?, bonus?}` | declared (the player's open roll) | `resolveCheck`/`resolveSkillCheck`/`resolveSaveCheck`/`resolveAbilityCheck` (SRD-MECHANIZATION §1) — returns `{total,natural,success,margin,degree}`, the DIFFICULTY margin ladder as a COMPUTED value |
| `inspiration_spend` | `{on:check\|attack\|save, o, d20b}` | declared (spend the flag, reroll) | reruns the original resolver with the new d20 (`d20b`), clears `sh.inspiration` |
| `cast` | `{spell, level?, ritual?, concentration?}` | declared (player casts) | (§2) the marker that owns concentration + ritual: auto-drops any prior concentration on a recast, spends a slot UNLESS ritual (ritual adds 10 min instead) |
| `concentration_start` | `{spell}` | declared/detected (usually rides `cast`) | `startConcentration` — sets `sh.concentration`, auto-drops any prior |
| `concentration_broken` | `{cause}` | detected (failed damage-save / 0-HP / incapacitating condition) or declared (DM drop) | `breakConcentration` + lifts any §3 condition tagged `{ttl:{concentration:casterId}}` |
| `condition_add` | `{itemId, condition}` OR `{target:"pc"\|fid, condition, ttl?, n?}` | declared | **widened (§3)**: an `itemId` tags one inventory instance (`ITEM_CONDITIONS`); a `target` tags a creature/the PC with a §3 condition + a structured `ttl` (`{rounds}\|{untilSave}\|{endOfNextTurn}\|{concentration:casterId}\|{indefinite}`) — EXCEPT `condition:"exhaustion"`, which routes to `addExhaustion` (§5, its own 0–6 counter, not the §3 table); `n` sets how many levels (default 1) |
| `condition_remove` | `{itemId, condition}` OR `{target, condition}` | declared | untags it (either holder kind) |
| `condition_expired` | `{target, condition}` | detected (a `ttl` counter lapsed) | lifts the condition — the DM narrates the lift without deciding when |
| `round_tick` | `{round?, phase?:start\|end}` | detected (a turn boundary) | (§3) `tickConditions` for every live holder (the PC + every `GS.combat` foe) — advances `{rounds}`/`{endOfNextTurn}` counters and AUTO-emits `condition_expired` per lapse; the container the DM can't forget to close |
| `death_save` | `{d20}` | declared (the player's open roll, each round dying) | `resolveDeathSave` (§4): 10+ success, nat20 revive+1hp+clear, nat1=2 fails; 3 succ→stable, 3 fail→dead (→ Death & Rebirth) |
| `temp_hp` | `{n}` | declared (a grant — Aid/False Life/etc.) | `grantTempHp` (§4): takes the HIGHER of current-vs-new (never stacks) |
| `action` | `{kind, target?, dir?, ally?, trigger?}` | declared (a standard action) | `standardAction` (§6): Dodge/Disengage/Dash/Help/Ready/Hide/Search/Study/Utilize — spends the Action budget + applies the real mechanical effect |
| `opportunity_attack` | `{foe, d20?}` | detected (an undefended Melee-leave) | resolves the named foe's swing (engine-rolled unless `d20` supplied) against the PC, applies damage |
| `grapple` | `{target, d20, bonus?, defenderD20?}` | declared (the PC's open Athletics roll) | `resolveGrapple` (§6): CONTESTED vs the target's higher of Athletics/Acrobatics, tie favors the defender |
| `shove` | `{target, d20, bonus?, defenderD20?, intent?:prone\|push}` | declared | `resolveShove` — same contest shape; `intent` names the declared outcome on success |
| `hazard_tick` | `{kind:fall\|on-fire\|suffocating\|drowning, feet?, holdRounds?, roundsHeld?}` | declared/detected | (§5) `resolveFall`/`hazardTick` — falling rolls the SRD bludgeoning formula; on-fire reuses ITEMS.md §D's Burning rate; suffocating/drowning run the hold-breath-then-drop timer |
| `crit_outcome` | `{natural, magnitude, tier, scope, lenses:[{row,lens,detail,placeHandoff}], cascade, placeHandoff, mythSeed?}` | declared (DM, from the `rollCritMagnitude` payload) | CRIT-MAGNITUDE (Mythic→Ledger canon, amplified→outcome) |
| `level_applied` | `{pc, from, to}` | detected (threshold + rest gate) | ADVANCEMENT |
| `adjudication` | `{situation, ruling, precedentId}` | declared | precedent ledger |
| `hp_changed` | `{delta}` | declared (damage `<0` / heal `>0`) | resources (clamp 0..maxHP) |
| `attack` | `{d20, targetAC, slot?, cover?, advantage?, crit?, attackIndex?}` | declared (player's open roll) | resolves the PC's EQUIPPED-weapon swing (pcAttack→resolveAttack: base+magic damage, ability+prof+magic to-hit); `null` weapon → DM resolves manually. `attackIndex` (§6, Extra Attack) is the 0-based Nth swing this Action — `attacksPerAction(sh)` (CLASS_PROGRESSION-derived) gates how many are legal |
| `slot_spent` | `{level}` | declared (player casts a leveled spell) | resources (Vancian, falls back to pact) |
| `resource_spent` | `{key, n?}` | declared | resources (Rage / Bardic Inspiration / Channel Divinity / Focus / Sorcery Points / Action Surge) |
| `rest` | `{kind: short\|long}` | declared (or the `passTime` UI) | resources (restore slots + HP + per-rest pools) |
| `item_changed` | `{removeAll?, removeIds?:[id], add?:[{name,qty?,base?,ench?,bonus?,codexId?}], gold?:delta, force?, note?}` | declared | the living PC's `sheet.inventory`/`sheet.gold`; `add` mints the congruent overlay (base/ench/codex — §E) and is REFUSED if it would breach the STR×30 hard cap (`force:true` overrides — Dec 4) |
| `item_split` | `{itemId, qty}` | declared | splits `qty` off a stackable instance into a new instance (its own id) |
| `item_use` | `{itemId, roll?}` | declared (player drinks/applies a consumable) | fires the consumable effect (heal numeric / buff structured / harm) + consumes one; `roll` supplies the player's own heal roll |
| `charge_spend` | `{itemId, n?}` | declared (activate a charged magic item) | spends N (default 1) off `inst.ench.charges.cur` |
| `charge_restore` | `{itemId, n?}` | declared | restores N charges, or refills to max if `n` omitted (long rest auto-refills) |
| `condition_add` | `{itemId, condition}` | declared | tags one inventory instance (`condition` ∈ `ITEM_CONDITIONS`, `data/items.js`) |
| `condition_remove` | `{itemId, condition}` | declared | untags it |
| `equip` | `{itemId, slot: mainHand\|offHand\|armor}` | declared | `sheet.equipped[slot] = itemId` (clears whatever was there) |
| `unequip` | `{slot}` | declared | `sheet.equipped[slot] = null` |
| `set_grip` | `{grip: 1h\|2h}` | declared (Versatile wield choice) | `sheet.equipped.grip`; 2h needs a free off-hand (Dec 1) |
| `attune` | `{itemId}` | declared | binds a magic item; enforces the SRD max-3 cap (its ench is dormant until attuned) |
| `unattune` | `{itemId}` | declared | releases attunement (frees a slot) |
| `walk_advance` | `{toSeg, nodeId?}` | declared (DM, party clears a segment) | WALK-CONSUMPTION (moves the active-walk cursor; `nodeId` defaults to the active walk) |
| `walk_complete` | `{nodeId?, abandoned?}` | declared (DM, finale resolved / walk left) | WALK-CONSUMPTION (finalize provenance + promote/reskin the next frontier) |
| `capture` | `{captorFactionId?, disposition?, holdingSeg?, leverId?}` | declared (DM, on subdual) | WALK-CONSUMPTION §6 (re-entry into a holding segment; all fields script-filled if omitted) |
| `open_shop` | `{shopId?, codexId?, tier?, archetype?, nodeId?, name?}` | declared (DM, on entering a shop / talking to a merchant) or the dev "Open test shop" affordance | docs/SHOP-UI.md §2b — reopens a known `w.shops[shopId]` (depleted coin/stock persist) or mints one via `makeShop`, links `codexId` if given, sets `GS.activeShopId`/`GS.gamePanel='shop'` |

**The ITEMS events (`docs/ITEMS.md`, the type/instance split — built 2026-06-30).**
`sheet.inventory` entries are instances (`{id,name,qty?,conditions:[]}`); `name` resolves against
`ITEMS_BY_NAME` (`data/items.js`, generated) for objective facts (damage/AC/weight/cost/properties) —
the bestiary pattern reapplied to gear. `item_changed` is the **one** event that touches gear/coin —
confiscation, loot, buy/sell, a consumed item. `removeAll` strips the whole inventory (a searched/bound
prisoner); `removeIds` targets specific instances **by id, never by name** (a flat string can't
disambiguate two of the same item or target "the cursed one" specifically); `add` mints new instances
(used both for loot *and* for returning confiscated gear — removed items are recoverable because the
ledger records exactly what left); `gold` is a signed delta, clamped at 0. `item_split` divides a
stackable instance (e.g. "drop 5 of 20 arrows") without merging it back on a later `add` — two same-
name instances may legitimately coexist with different `conditions`. `equip`/`unequip` use **named
slots** (`mainHand`/`offHand`/`armor`), not a single pointer, because two-weapon fighting needs two
weapons equipped at once. All logged to the ledger (kind `inventory`/`inventory-split`/`item-condition`/
`equip`) so state is always reconstructable from history. (Capture's confiscation, WALK-CONSUMPTION §6,
currently moves gear via `codex_update` rather than this event — a candidate to reconcile later.)

The **walk events** (docs/WALK-CONSUMPTION.md) are forward-compatible no-ops when prep/capture is unavailable.
`walk_advance`/`walk_complete` are script-bookkeeping over the active walk the DM is handed in `digest.activeWalk`
every turn (the DM owns *when* the beat lands; the script owns the cursor + provenance). `capture` lands a
subdued PC inside the walk already in motion — captor (most-advanced hostile faction), cell (a holding segment
of the active walk, reused or minted), and lever (a pre-cast NPC) come from LIVE state; only the disposition /
confiscation / opening are new dice. The disposition opens a real, **fireable** front-clock — a capture that
can't go wrong is a free vacation (DM hard/dangerous discipline).

The resource events mutate the **current** layer of the living PC's sheet through `src/engine/resources.js`
(the deterministic owner of the consumable economy) — maxes derive from `CLASS_PROGRESSION`, never hand-entered.
`rest` recovery: `long` = full reset; `short` = pact slots + short-rest pools (Channel Divinity, Focus, Action
Surge) + 1 Rage (HP via Hit Dice and Vancian slots are unchanged on a short rest). `resource_spent.key` accepts
friendly aliases (`rage`, `bardic`, `ki`, `sorcery`, …). `passTime('short')`→short rest, `passTime('dawn'|'montage')`→long.

`method` ∈ `combat | stealth | social | environmental | avoided`.
`victimClass` ∈ `monster | hostile | neutral | civilian | authority` — the axis that lets
DIFFICULTY tell a goblin-slayer from a baker-murderer (see `DIFFICULTY.md`).

## Meaningful choice = a recorded state fork

A `choice_logged(major)` is only real if it **forecloses** something — took path A, so front B
now drifts. Meaningfulness is an *opportunity cost the ledger can see*, not the DM's sense of
drama. This is the route to promoting `choice_logged` from declared → detected: when the script
can see that selecting A advanced one clock and abandoned another, it detects the fork itself.

## Adjudication becomes precedent

When the DM hits a situation the script can't determine, it makes a call and emits an
`adjudication` event. The ruling is **written to the ledger as canon**. Next time the same
situation arises, the script surfaces the precedent and the DM rules consistently. The container
tightens over a campaign without every case being authored up front — the responsive-world
thesis applied to the rules themselves. The game doesn't have to be unbreakable; it has to be
*consistent and responsive*.

## Worked examples (these double as test fixtures)

1. **Stealth past 3 goblins guarding nothing.**
   `encounter_resolved {foes:[CR1/4 ×3, monster], method:"stealth", objectiveRef:null}`
   → 0 combat XP (no objective tied), small `discovery` credit if it revealed the area. No
   escalation (victimClass monster, no faction).

2. **Kill a town guard mid-robbery.**
   `kill {victimClass:"authority", factionId:"townwatch"}`
   → no XP by itself; `clock_advanced` on the town-watch front against the PC (detected). Repeat
   → eventually `clock_fired` → DIFFICULTY spawns a named response.

3. **Close the "smugglers choke the harbor" front by burning their ledger-house.**
   `front_closed {ledgerId:"harbor-smugglers", how:"destroyed records"}` (detected)
   → ADVANCEMENT pays the front's award + a combat bonus *only if* a fight was part of it.

## Open questions

- Exact JSON field names once the runtime ledger schema is fixed.
- Which `declared` events get state hooks first (priority order for the declared→detected migration).
- Whether `inspiration_granted` needs a cap enforced by the script (likely yes — see `ADVANCEMENT.md`).
