---
type: system-spec
project: Genesis
status: SPECCED 2026-07-04 — the CONNECTION lane of the realm-enrichment wave (NEXT-STEPS later-3
  item 3). Depends on REALM-ENRICHMENT-WRITING (the desc field). Sonnet-executable.
created: 2026-07-04
related:
  - "[[REALM-WIRING]]"
  - "[[REALM-ENRICHMENT-WRITING]]"
  - "[[CODEX]]"
  - "[[EVENT-CONTRACT]]"
---

# REALM-STORY-WIRING — breach foes reach the DM's mouth and the world's memory

## §0 The gap (ground-truthed 2026-07-04)

REALM-WIRING made breach encounters SPAWN realm creatures — but the narrative layer never hears
about them. Today: `foe.realm` is stamped (combat.js:700) but dropped by `combatDigest`
(dm.js:186–192, foes carry fid/name/cr/band/lane/state only); `activeWalkDigest` (dm.js:49–99)
surfaces `encounter.type` ("Enemy") but never the creature names; no codex entry is ever minted
for a creature (codex kinds: npc/location/item/faction/thread — no "creature"); and
`encounter_resolved` (combat.js:782) carries only XP math. So the DM narrates a frontier
Coyote-Thing as a generic wolf, and the world forgets it existed.

Prereq: `desc` per creature (REALM-ENRICHMENT-WRITING W3) — but ALL wiring below degrades
gracefully when `desc` is absent (name/realm still flow), so this unit does NOT block on prose.

## §1 Carry desc through the foe chain

- `realmEncounterPool` draw (dungeon-walk.js:349–354): add `desc: rc.desc || null` and
  `summary: rc.summary || null` to the creature spec.
- `combatFromEncounter` (combat.js:696–705): after the modelKey/realm stamps, add
  `if(n.desc) f.desc = n.desc;` (same pattern). `cmFoeFrom` untouched.

## §2 Digest: the DM hears the realm creature

1. **`combatDigest` foes** (dm.js:186–192): add `realm: f.realm || null` and, ONCE PER FOE NAME
   per combat, `desc` — the first foe of a given name carries `desc`; duplicates carry only the
   name (digest-diet law: median digest must stay lean; three identical wolf descs is bloat).
2. **`activeWalkDigest` encounters** (dm.js:49–99): where a segment's `encounter` block is
   surfaced, add a `creatures` line: `[{name, realm?, summary?}]` (summary not desc — the walk
   view is a preview; full desc arrives at combat). Cap at the slot list (≤4 entries).
3. **DM-BRIDGE.md**: document the new fields under the digest contract — "narrate the realm
   creature by its `desc`; the chassis is stats only, never the fiction." One paragraph, in the
   existing "Mechanics the DM MUST fire" region. (Do NOT touch DM-BRIDGE.md if a live session is
   running — CLAUDE.md rule.)

## §3 Codex: significant foes are remembered

- **New codex kind `"creature"`** (additive — codexAdd already accepts any kind string; add it to
  any kind-enum/render lists in codex UI + codex.js so the panel groups it).
- **Mint rule (script-owned, no DM judgment):** at `combat_start` (dm.js:997 case), for each foe
  with `role ∈ {high, apex}` OR `realm != null && cr >= 1`, mint-or-touch:
  `codexAdd(w, {kind:"creature", name: f.name, provenance:"rolled",
  fields:{realm: f.realm, cr: f.cr, size, type, summary}, dm:{desc: f.desc, frame: f.statId},
  status:{...soft:false}})` — idempotent by `codexKeyId("creature", name)` (a second Coyote-Thing
  encounter TOUCHES the same record; recurrence is the point).
- **Mooks don't mint** (codex = handles, not a zoo — Consequence-Ladder law).
- **`encounter_resolved`** (combat.js:782): stamp the outcome onto minted records
  (`fields.lastOutcome: "slain"|"fled"|"resolved"`, `fields.seenCount++`) so the codex carries
  history the DM can reincorporate ("the pack that ran at Copper's Marsh").
- **Faction tie (cheap, additive):** if the active walk's breach carries a realm and any faction
  clock references that breach/realm in its tags, add a codex `links` entry to that faction —
  data-only; the DM decides meaning.

## §4 Build + verify

1. Branch `feat/realm-story-wiring`. All edits: dungeon-walk.js, combat.js, dm.js, codex.js
   (+ codex UI kind list), DM-BRIDGE.md. `python3 build/check-manifest.py` OK.
2. Extend `dev/verify-realm-wiring.mjs` (new §6+): a breach combat_start with an apex realm foe →
   codex has a `creature` record with realm/desc; a mook-only fight mints nothing; the same foe
   name twice → ONE record, seenCount 2; combatDigest foe carries realm + first-instance desc;
   activeWalkDigest surfaces creature names; `encounter_resolved` stamps lastOutcome. MUTATION:
   remove the digest realm field → harness fails.
3. Regression: `node dev/verify-dm-events.mjs` + `verify-combat` + `verify-realm-wiring` all green.

## §5 Out of scope

Urban/wilderness realm filtering ([[REALM-WALK-WIRING]] — separate unit). DM prose behavior (the
charter already owns it). No new events (mint rides combat_start; EVENT-CONTRACT unchanged —
codex_add remains available for DM-declared extras).

## §6 Decisions (flag to veto)

| # | Decision | Ground |
|---|---|---|
| 1 | Mint at combat_start, script-owned threshold (high/apex or realm+CR≥1) | anti-drift: the script owns WHO is significant; DM owns meaning |
| 2 | desc once per foe-name per combat in the digest | digest-diet law (median 9KB must hold) |
| 3 | kind "creature", idempotent by name, seenCount recurrence | recurrence-as-thread; mirrors NPC handling |
| 4 | Walk digest gets summary, combat gets desc | preview vs contact — soft-until-contact rhythm |
| 5 | Graceful without desc | writing and wiring lanes can land in either order |
