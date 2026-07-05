---
type: system-spec
project: Genesis
status: SPECCED 2026-07-05 — the creature bridge into the social + companion layers: monsters can
  be parleyed, befriended, recruited as hirelings/pets, or promoted to THE sidekick. Adam:
  "curveball quests where the monsters can be NPCs and sidekicks or pets if the social
  interaction goes well — one of the all time best things about D&D." Sonnet-executable.
created: 2026-07-05
related:
  - "[[SOCIAL]]"
  - "[[COMPANIONS]]"
  - "[[MONSTER-STORY-WIRING]]"
  - "[[REALM-STORY-WIRING]]"
  - "[[MONSTER-FLAVOR-TABLES]]"
---

# MONSTER-PARLEY — the owlbear that didn't have to die

## §0 The gap (ground-truthed 2026-07-05)

Everything but the bridge exists: `src/engine/social.js` is the built attitude/parley/morale
resolver (SOCIAL_DC_BY_ATTITUDE ladder, applyLeverage, the morale verdict already returns
`parley` as a combat exit) but serves NPC codex records only; `src/world/companions.js` +
dm.js:2347+ own hirelings + the ONE sidekick (hire/dismiss/loyalty/promote/level events) but
mint from rolled NPCs only; creature codex records (kind:"creature", minted at combat_start
since MONSTER-STORY-WIRING) carry habitat/activity/factionFit/flavor but no attitude. A wolf
whose morale breaks to "parley" today has nowhere to go.

## §1 Creatures join the attitude ladder

- `codexSetAttitude`-family calls accept kind:"creature" records (audit the kind guards in
  codex.js/social event cases — most are shape-agnostic; fix any `kind==="npc"` gate to
  `kind==="npc"||kind==="creature"`). Attitude default at mint: from the story data —
  `displaced` or activity suggests hunting/raiding → −1 (Unfriendly); ambient/neutral activity
  → 0; a flavor-roll or behavior that reads social/curious → the DM may open at 0/+1 via the
  normal attitude events (script sets the DEFAULT, DM narrates within it).
- **The check that moves it (SRD-shaped):** Beasts and INT-null/low creatures resolve via
  WIS (Animal Handling) against the same SOCIAL_DC ladder; everything else uses the existing
  Cha path. Implement as `socialCheckAbilityFor(rec)` (engine, pure): kind creature + type
  Beast → `{ability:"wis", skill:"Animal Handling"}`, else the current Cha default. The
  resolver math is UNCHANGED — one function decides which die the player rolls.
- **Leverage from story data (the tables finally bite for monsters too):** build
  `creatureLevers(rec)` → lever array from the record's own fields: `treasure!=="none"` →
  `want` (it guards/covets something tradable) · `displaced` → `want` (it wants safe range/
  food) · factionFit non-empty → `leverage` (name its masters/rivals) · a hostile flavor roll
  → `fear` eligible. Pure derivation, DM narrates which lever the fiction shows.
- Morale `parley` verdict (social.js §4): DM-BRIDGE runbook line — on a creature's parley
  verdict, open dialogue against the creature's codexId; social events fire exactly as for
  NPCs. (The verdict already exists; this documents the creature target.)

## §2 Recruitment — the ladder's top rungs

New event `recruit_creature {codexId, tier}` (applyEvent, dm.js — beside the companion cases):
- **Gate (script-owned):** record kind creature · attitude === +2 (Helpful) · alive/`active`.
  Anything below +2 → `{ok:false, reason:"not-helpful"}` — friendship is EARNED on the DC
  ladder, never declared.
- **tier "pet"** (Beasts + INT-low, CR ≤ 2): mints a companion of new kind `"pet"` on the
  existing companions list — non-leveling, tactics-engine-driven like hirelings, NO wages;
  loyalty instead ticks DOWN on neglect (a `pet_neglect` check rides the existing downtime/
  passTime loyalty hooks — fed/tended = stable) and DOWN HARD if the PC harms its kind.
  Stats = its bestiary chassis + applied traits, verbatim — a pet wolf is that wolf.
- **tier "hireling"** (intelligent creatures): existing `hireCompanion` path with the creature
  record as source — wage may be non-coin (the codex record's want: food/territory/a favor —
  stored as `wageNote`, economy unchanged).
- **tier "sidekick"** (CR ≤ 1/2 per the Tasha's model, ANY type incl. Beast): routes through
  the existing `promoteSidekick` — the one-slot law, leveling, player-driven. The
  monster-as-sidekick IS Tasha's rules-as-written.
- Death stays dead (COMPANIONS law, rebirth is PC-only). The codex record persists —
  `lastOutcome:"companion"` / later `"died-companion"` — the world remembers the owlbear.

## §3 Curveball quests — monsters as questgivers and allies

- `rollQuestHook`'s threatBinding (quest-hook.js) gains a fourth angle: when the bound
  creature's type/INT suggests speech OR its flavor table is mode:hook, roll 1-in-4 for
  `angle:"parley"` — the hook's pitch frames the creature as APPROACHABLE (it wants something;
  the fight is optional). The synthesis contract line: a parley-angle hook SHOULD offer the
  social path in the pitch.
- Codex creature records at attitude ≥ +1 join the prep pre-cast pool (prep.js's cast
  nomination — same eligibility as known NPCs): a befriended creature RECURS as an ally, gets
  cast into walks, can be the questgiver ("the wolf that led you to the den mouth").
- MONSTER-FLAVOR-TABLES hook-mode authors are LICENSED (doc note in that spec's §1) to write
  parley-forward rows — "it wants X and will trade" is a doer.

## §4 Build + verify

One unit, branch `feat/monster-parley` off master. Files: social.js (ability-for helper),
codex.js (kind gates), dm.js (recruit_creature + pet loyalty hooks), companions.js (pet kind),
quest-hook.js (parley angle), prep.js (pre-cast eligibility), DM-BRIDGE.md + DM-CHARTER §
(one-liners), MONSTER-FLAVOR-TABLES.md (the §3 license note). check-manifest after every
module edit. New harness `dev/verify-monster-parley.mjs` (copy the realm-wiring bootstrap):
attitude ladder works on a creature record (Beast rolls WIS/Animal Handling, ogre rolls Cha);
creatureLevers derives from treasure/displaced/factionFit; recruit below +2 refuses; pet mints
non-leveling with chassis+traits stats; CR-gate on sidekick; sidekick slot uniqueness holds;
parley-angle hook appears only for speech-capable/hook-mode creatures; pet loyalty drops on
neglect tick. MUTATION red-first: remove the +2 gate → a Hostile wolf recruits → fail; remove
the ability-for fork → a wolf parley rolls Cha → fail. Regression: verify-monster-story,
verify-realm-wiring, verify-dm-events, verify-combat, verify-social (if present), gauntlets
(fuzz on the new event + monkey 0-aborted).

## §5 Decisions (flag to veto)

| # | Decision | Ground |
|---|---|---|
| 1 | Recruit gate = Helpful(+2) exactly, script-owned | friendship earned on the existing DC ladder; anti-drift — DM never declares it |
| 2 | Beasts roll Animal Handling on the same DC ladder | SRD-shaped; one ladder, two dice |
| 3 | Pet = companions-list kind, no wages, neglect loyalty | reuses the whole companion machinery; a bond with upkeep, not a payroll line |
| 4 | Sidekick stays ONE slot, CR≤1/2, any type | Tasha's model + Adam's existing fork ruling |
| 5 | Levers derived from treasure/displaced/factionFit | the story fields this week's units built now feed the social math |
| 6 | parley angle 1-in-4 on eligible threats | curveball, not default — fights stay the norm |
