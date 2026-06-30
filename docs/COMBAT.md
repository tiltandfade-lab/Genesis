---
type: system-spec
branch: Genesis
status: spec
created: 2026-06-21
updated: 2026-06-30
---

# Combat — Theater-of-the-Mind 5.5 Engine

**Status: spec (firmed 2026-06-30).** Promoted from sketch → spec when Adam called the combat track:
a *rudimentary, pre-Fable* SRD/DMG combat layer — *"combat is the most fun in the game in most
situations."* The two central forks are resolved (below); the engine is now buildable. Fable later
deepens it (per-creature initiative, richer monster AI, a full tactical UI), but the **mechanical
spine and the event surface this spec defines are the permanent contract** — `ADVANCEMENT.md` and
`DIFFICULTY.md` already build against `encounter_resolved` / `kill`.

## The central decision — the automation split (resolved 2026-06-30)

**The script owns the numbers; the DM owns the decisions.** This is the same engine/AI split the
whole game runs on (`CLAUDE.md`: *the engine does deterministic mechanical work; the AI does only the
DM's interpretive job*), applied to combat:

| The SCRIPT (engine) owns — deterministic | The DM (AI) owns — interpretive |
|---|---|
| Monster stat blocks (the bestiary index) | What a monster *does* on its turn (tactics, targeting) |
| Attack rolls, saves, damage math, conditions | Narration of every blow, the scene, the stakes |
| HP / condition / range-band tracking (the state) | Whether the scene offers cover / an escape / a lever |
| Side-based initiative order | When a foe checks morale / flees / parleys (→ `SOCIAL.md`) |
| CR→XP pricing; emitting `encounter_resolved` / `kill` | The honest danger read (`DIFFICULTY.md` threat-signal) |

The DM never invents a number — it calls the resolver and reports the *typed event*. The script
computes the consequence and returns a state delta the DM must honor (the anti-drift guarantee,
`EVENT-CONTRACT.md`). **Monster turn *choices* stay DM-narrated in v1** — exactly like the
interpretive level-up picks: the engine guarantees the math, the DM supplies the judgment. A full
script-driven monster-AI tactics policy is a Fable upgrade, deliberately *not* MVP (it would push the
feel toward an auto-battler and balloon the build).

**Dice transparency holds (`DESIGN.md`):** the **player rolls their own d20 openly** — the resolver
*accepts* the player's roll and applies the modifiers/AC comparison (it never rolls *for* the player,
per the DM-agency rule). The script rolls the **monsters'** dice (adversary dice are shown too). So
every resolver primitive takes an optional pre-rolled d20: supplied for the PC, rolled by the engine
for foes.

## Range bands (resolved: 4 bands, side-based)

Discrete bands, no grid. Each maps to a 5.5 distance so spell/weapon ranges and movement resolve by
the book:

| band | ~5.5 distance | meaning |
|---|---|---|
| **Melee** | ≤ 5 ft | in reach; melee attacks land |
| **Near** | ~ 30 ft (one Move) | one Move closes to Melee |
| **Far** | 60 ft+ | two+ Moves, or ranged/spell territory |
| **Out of the fight** | — | fled / disengaged / not yet engaged |

Movement = changing band: a **Move** shifts one band closer/farther, a **Dash** two. Spell/weapon
ranges check against the band's distance. Position is tracked as `combat.bands[combatantId]` — write
state, not coordinates. This keeps tactical positioning meaningful (closing, kiting, breaking off)
without grid math, and keeps the solo pace fast.

## Initiative — side-based (resolved 2026-06-30)

**One initiative roll for the PC side, one for the enemy side** (a legal 5.5 DMG variant, and the
right call for solo pace). The PC side = the PC + any companions; the enemy side = all foes. The
winner's whole side acts, then the other side. Within a side, the player orders their own actions and
the DM orders the foes. Per-creature 5.5 initiative is the Fable upgrade (flagged in Open questions).

`rollInitiative(pcInitMod, foeInitMod)` → `"pc" | "enemy"` (ties: PC side, the solo-friendly bias).

## The combat state container — `GS.combat`

All transient combat state lives in one object on `GS` (per CLAUDE.md: *new mutable state goes in
`GS`*). It exists only while a fight is live; `combatEnd` tears it down (foes become corpses/codex
handles or vanish, per `DESIGN.md` corpse & loot).

```
GS.combat = {
  active:   true,
  round:    1,
  side:     "pc" | "enemy",          // whose turn-side is active
  first:    "pc" | "enemy",          // who won initiative (for round bookkeeping)
  pcRef:    <living PC sheet>,        // HP lives on the sheet's current layer (hp_changed events)
  foes: [{
    fid:        "f1",                 // combat-local id
    name:       "Hobgoblin Captain",
    statId:     "hobgoblin-captain",  // → bestiary index (null if unresolved → quick-stat fallback)
    cr, victimClass,                  // for the kill/encounter_resolved events
    factionId:  null,                 // escalation target (DIFFICULTY.md)
    ac, maxHp, hp,
    conditions: [],                   // 5.5 condition strings
    band:       "near",               // range band vs the PC side
    down:       false                 // 0 HP — out, for kill emission
  }],
  bands:        { pc: "melee" },      // the PC side's reference band (foes carry their own)
  objectiveRef: null,                 // gates combat XP (ADVANCEMENT.md)
  scene:        { cover:{}, hazards:[], exits:[] },  // objectified affordances (see below)
  ledgerRefs:   []
}
```

## Layer 1 — the bestiary index (`data/bestiary.js`)

The fix for *creature = dead name-string*. **Generated, never hand-edited** (edit-source → compile-
artifact): `build/gen-bestiary.py` parses the 374 `Asset Library/Monsters & Enemies/*.md` files into a
`<script>` global `BESTIARY` (and a `BESTIARY_BY_CR` index). One entry per stat block (multi-block
files like `Animated Objects.md` emit one entry per `###` block).

```
BESTIARY["basilisk"] = {
  id, name, cr, xp,                          // xp read from the printed "(700 XP)" + cross-checked vs CR→XP
  size, type, alignment,
  ac, hp, hpFormula, speed,
  abilities: {str,dex,con,int,wis,cha},      // scores + derived mods
  init,                                       // initiative mod (DEX mod, or printed "+2 (12)")
  saves: {wis:2,...}, skills:{}, senses, pp, // proficient saves; passive perception
  resist:[], immune:[], condImmune:[], vuln:[],
  languages,
  traits:  [{name, text}],
  actions: [{name, kind:"melee"|"ranged"|"save"|"other", atk, reach, range,
             dmg:[{n,die,bonus,type}], saveDC, saveAbility, recharge, text}],
  bonus:   [...], reactions:[...], legendary:[...],
  customTables: [{heading, die, rows}],       // Adam's sacred d-tables — CARRIED VERBATIM, never mechanized
  // frontmatter, for the resolver + threat resolver:
  role, habitat:[], treasure, activity:[], factionFit:[]
}
```

**Adam's custom d-tables are sacred** (CLAUDE.md). The parser carries them verbatim as `customTables`
so the DM can *surface* them (a basilisk's lair-terrain table, a banshee's tone-variance table) — the
engine never rolls or mechanizes them; they're DM-facing flavor/affordance the DM reads to objectify
the scene.

**Stat-block attacks parse from the regular 5.5 grammar** (`+X to hit, reach R, Hit: N (XdY+Z) <type>
damage`; `DC N <ABL> saving throw`). Where a stat block is too freeform to parse an attack cleanly,
the entry still carries AC/HP/abilities/CR (always parseable) and the raw action text — the resolver
falls back to "DM reads the action text, calls `resolveAttack` with the numbers." No monster is
dropped for an unparseable trait.

## Layer 2 — the threat→stat-block resolver

The walk layer's `threat.{low,mid,boss}` names come from the **threat-identity tables, not the asset
library** — so the names don't always match a file. `resolveCreature(nameString, {cr, role, habitat})`
bridges them:

1. **Exact / normalized name match** against `BESTIARY` ids (slugify, strip articles).
2. **Fallback by band:** if no name match, pick a `BESTIARY_BY_CR` entry near the slot's expected CR,
   filtered by `role`/`habitat`/`factionFit` when the encounter carries them — so a "Boss CR" slot in
   a cave yields a CR-appropriate lurking brute, not a random name.
3. **Quick-stats fallback** (DMG #4, already built as `Walk-On Quick Stats`): a statless walk-on
   (a generic guard, a spooked merchant) gets benchmark numbers by CR — the DM never invents stats.

`combatStart` resolves every walk creature-string through this before the fight, so foes enter combat
with real AC/HP/attacks. **This is the single wire that turns the bestiary from inert files into a
played system.**

## Layer 3 — the resolver primitives (`src/engine/combat.js`)

Pure functions where possible (atoms in, deltas out — they never narrate). The DM calls them; the
script owns the result.

- `combatStart({pc, foes, objectiveRef, scene})` → builds `GS.combat`, resolves creatures, rolls
  side-based initiative. Returns the opening state delta (who goes first, starting bands).
- `resolveAttack({d20?, atkBonus, targetAC, advantage, cover, dmg:[{n,die,bonus,type}], crit?})` →
  `{hit, natural, total, crit, damage, breakdown}`. `d20` supplied = the PC's open roll; omitted = the
  engine rolls (a foe). Cover adds the 5.5 AC bonus (+2 half / +5 three-quarters; full = can't target).
- `resolveSave({d20?, saveMod, dc, advantage})` → `{success, total}`.
- `applyDamage(combatant, amount, type?)` → clamps HP `0..maxHp`, applies resist/immune/vuln, sets
  `down` at 0 (and on the PC, routes through the existing `hp_changed` event → resources clamp + death
  saves are DM-narrated in v1).
- `moveBand(combatant, dir, dash?)` → shifts one band (two on Dash), clamped Melee↔Out.
- `combatEnd({outcome})` → emits `encounter_resolved` + one `kill` per downed foe, tears down
  `GS.combat`. **The only place combat touches advancement/difficulty.**

Conditions are tracked as strings on the combatant and surfaced to the DM (the engine enforces the
ones with clean mechanical hooks — prone → melee advantage, restrained → disadvantage — and *surfaces*
the rest for DM adjudication, logged as precedent via `adjudication` when a ruling is needed).

## Layer 4 — CR→XP and the advancement seam

The standardized **SRD CR→XP table** lands in `src/engine/advancement.js` as a canonical-constant-in-
code lookup (`CR_XP`, same pattern as `XP_THRESHOLDS`) — CR 0→10 … CR 30→155,000. `combatEnd` sums the
defeated foes' CR-XP into the `encounter_resolved` payload.

**Pricing this build (interim — the big re-tune is deliberately deferred):** `encounter_resolved` now
prices from *real foe CR* (sum of `CR_XP`) instead of the flat `100 × tier` placeholder — but **stays
objective-gated** (`ADVANCEMENT.md`): an objective-tied fight pays its full CR-XP; objectiveless
grinding still pays ~0, and the fixed world's finite targets self-limit the grind. **Whether to
un-gate CR-XP into the *primary* advancement spine — demoting the milestone economy (`front_closed` /
`clock_fired` / `choice`) to a supplement and re-tuning all of it against felt combat XP — is the
explicitly-deferred re-tune** (HANDOFF / NEXT-STEPS: *don't tune twice*; decide after a playtest feels
real combat XP). This build installs the machinery and the honest CR pricing; it does not flip the
economy. ⚑ **Open re-tune flagged — see Open questions.**

## The event surface (the permanent contract)

Unchanged from the sketch — `ADVANCEMENT.md`/`DIFFICULTY.md` already consume these (`EVENT-CONTRACT.md`):

- `encounter_resolved {foes:[{cr,victimClass}], method, objectiveRef?, outcome}` — `method` ∈
  `combat | stealth | social | environmental | avoided` (how it *ended* — a fight avoided or talked
  down emits this too, with the right method). Prices XP; `DIFFICULTY.md` reacts.
- `kill {victimClass, factionId?, victimId?, at?}` — one per downed foe. `victimClass` ∈
  `monster | hostile | neutral | civilian | authority`.

**One wiring gap this build closes:** the `kill` handler currently logs to the ledger and turns
co-located witnesses hostile, but does **not** yet advance the named `factionId`'s clock that
`DIFFICULTY.md` calls for. `combatEnd`/the `kill` handler will emit the detected `clock_advanced` on
the victim's faction — the escalation spine (kill faction people → clock climbs → `clock_fired` → an
authored named response, *not* stat-scaled super-guards).

## Scene objectification — bands now, structured cover next

The sketch's thesis stands: the objectified scene serves **tactics**, **escape routes**, and the
**miraculous out** at once, and the richer it is the more real all three become. MVP scope:

- **Range bands: BUILT** (core state). Closing/kiting/breaking-off are real from round one.
- **Cover: DM-set in v1.** `resolveAttack` honors a `cover` arg (half/three-quarters/full → the 5.5
  AC/save bonus); the DM reads the prose scene (`dims`, the dungeon `feature`/`object`, a monster's
  custom lair-terrain table) and *declares* cover. **Auto-objectifying cover/hazards/exits from the
  walk layer's terrain specs is the defined fast-follow** — the walk generators emit prose `dims` +
  hazard strings today; structuring them into `{cover, hazards, exits}` objects is a contained next
  phase, not MVP.
- **Exits = the flee path.** The walk graph already carries `exits[{targetId,label}]`; `moveBand` to
  *Out of the fight* + an exit = a real disengage. `DIFFICULTY.md`'s "flee is a decision" becomes
  mechanically reachable the moment bands exist.

## Companions & solo

v1: companions are **player-directed**, on the PC's side of initiative, sharing the PC's level
(`ADVANCEMENT.md` — no separate XP pool). They use the same resolver primitives (the player rolls
their attacks too). Autonomous companion tactics are deferred with the Fable monster-AI work.

## Build phases

1. **Bestiary index** — `build/gen-bestiary.py` → `data/bestiary.js` (+ `BESTIARY_BY_CR`); register in
   `manifest.json`; the parser carries custom d-tables verbatim. *Verifier: parse coverage, CR census,
   custom-table preservation.*
2. **CR→XP** — `CR_XP` lookup in `advancement.js`; `encounter_resolved` prices from real foe CR
   (objective-gated). *Verifier: CR→XP correctness, gating held.*
3. **Threat→stat-block resolver** — `resolveCreature` (name → bestiary → CR-band fallback → quick-stats).
4. **The resolver** — `src/engine/combat.js`: `GS.combat`, side-based initiative, attack/save/damage/
   move primitives, `combatStart`/`combatEnd`. Emits `encounter_resolved` + per-foe `kill`.
5. **The faction-escalation wire** — `kill{factionId}` → detected `clock_advanced` (closes the
   `DIFFICULTY.md` gap).
6. **Verifier** — `dev/verify-combat.mjs` (the full suite: resolver math, initiative, band movement,
   event emission, CR-XP, faction escalation).

**Defined fast-follows (not MVP):** the in-app combat tracker UI; auto-objectified terrain→cover;
per-creature initiative; autonomous monster/companion AI; death-save automation.

## Open questions

- ⚑ **The advancement re-tune** (the live one): un-gate CR-XP into the primary spine + demote the
  milestone economy to a supplement + re-tune `front_closed`/`clock_fired`/`choice` against felt
  combat XP. Deferred to *after* a playtest (don't tune twice). This build keeps the objective-gate.
- **Death saves / PC at 0 HP:** v1 DM-narrates the death-save sequence (the engine flags 0 HP via
  `hp_changed`); a scripted death-save tracker is a fast-follow.
- **Per-creature initiative** (the Fable upgrade) vs the v1 side-based order.
- **Auto-objectifying terrain → cover/hazards/exits** from the walk specs (the highest-leverage
  fast-follow per the sketch's scene-objectification thesis).
- **Monster AI tactics policy** (Fable) — when/if the script drives foe turn *decisions* instead of
  the DM.
