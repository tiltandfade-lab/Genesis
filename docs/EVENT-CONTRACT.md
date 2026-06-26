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
| `inspiration_granted` | `{pc, reason}` | declared (DM judgment) | (play-quality, NOT XP) |
| `crit_outcome` | `{natural, magnitude, tier, scope, lenses:[{row,lens,detail,placeHandoff}], cascade, placeHandoff, mythSeed?}` | declared (DM, from the `rollCritMagnitude` payload) | CRIT-MAGNITUDE (Mythic→Ledger canon, amplified→outcome) |
| `level_applied` | `{pc, from, to}` | detected (threshold + rest gate) | ADVANCEMENT |
| `adjudication` | `{situation, ruling, precedentId}` | declared | precedent ledger |
| `hp_changed` | `{delta}` | declared (damage `<0` / heal `>0`) | resources (clamp 0..maxHP) |
| `slot_spent` | `{level}` | declared (player casts a leveled spell) | resources (Vancian, falls back to pact) |
| `resource_spent` | `{key, n?}` | declared | resources (Rage / Bardic Inspiration / Channel Divinity / Focus / Sorcery Points / Action Surge) |
| `rest` | `{kind: short\|long}` | declared (or the `passTime` UI) | resources (restore slots + HP + per-rest pools) |

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
