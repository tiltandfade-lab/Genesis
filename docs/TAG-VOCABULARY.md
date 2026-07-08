---
type: registry
project: Genesis
status: canon — the tag vocabulary (RULED in-format 2026-07-08)
created: 2026-07-08
related:
  - "[[CRAFT-PASS-RUNBOOK]]"
  - "[[TABLE-ROW-CONTRACT]]"
  - "docs/table-reviews/ (review sidecars)"
---

# TAG-VOCABULARY — the canon row-theme tags

Tags are part of the table format (Adam's ruling, 2026-07-08): every crafted table carries a
`Tags` column — last column, comma-separated, lowercase, 2–4 per row. This file is the canon.
**Reuse before inventing**: a new tag enters canon by being added HERE in the same commit that
first uses it. Lint does not police the vocabulary yet (future spec item); this registry is the
discipline in the meantime. Tags ride into `tables.json`, so they are future engine surface
(theme-filtered rolls, codex search, DM prep queries).

## Core vocabulary

**Sins & appetites** — pride, greed, envy, wrath, sloth, gluttony, lust, hunger, addiction
**Bonds** — family, marriage, parentage, child, love, kin (fantasy-race tension), oath, mercy
**Injury & fear** — menace, betrayal, blackmail, poison, arson, theft, wrath, shame, guilt
**Law & power** — authority, justice, witness, captivity, fugitive, war
**Livelihood** — trade, debt, famine, charity, home, festival, storm
**The unreal** — curse, omen, haunt, doppel, breach, madness, bargain, faith, death, time
**Texture** — silly, secret, rumor, truth, grief, feud, beast, song, dance, language

Semantics worth pinning:
- `kin` = fantasy-species social tension (the Elder Scrolls lane), always kin-agnostic in prose.
- `breach` = the row mechanically spawns/implies a realm breach (DM logs codex/map).
- `silly` = comedic register, not low stakes — the gag rows doctrine (playable pressure required).
- `love` vs `lust` = devotion vs desire; a row can carry both.
- `disease` covers plague, contagion, quarantine, and blame-of-contagion.
- `mercy` = the consequences of sparing; `charity` = the consequences of giving.

## Realm extension packs (PROPOSED — canon per-pack when that realm's tables get crafted)

Each realm's physics permits hook-shapes the core can't express; a cartoon world bends further
than a fantasy one, a dinosaur world further still. Use core tags first; add the pack tag when
the theme is realm-native. Packs are seeds, not caps.

| Realm | Pack tags | The realm-native shapes they cover |
|---|---|---|
| Bright-Kingdom | whimsy, transformation, contagious-feeling, toon-physics, musical | emotions manifest and spread; bodies reshape for comic/story logic; the world breaks into song; physics obeys narrative, not mass |
| Lost-World | predation, territory, brood, migration, deep-time, colossal | food-chain pressure; land that belongs to something; eggs/young as stakes; herds moving THROUGH civilization; time measured in strata |
| Chrome | machine, signal, upgrade, obsolescence, surveillance, symbiosis | helpful automation with its own agenda; being improved away; messages in the hum; watched by the walls; flesh-metal bargains |
| Noir | case, racket, frame-job, confession, corruption, vice | trouble that walks in at dusk; organized pressure; guilt assigned by narrative; everyone narrating their own sins |
| Frontier | claim, duel, drifter, posse, lawless, horizon | land/right staked and jumped; ritualized violence; strangers with pasts; justice as a crowd; the pull of what's past the edge |
| Gloom | mourning, veil, memento, dirge, the-unsaid | grief as weather and economy; the thin line between living and remembering; objects that hold the dead; what politeness won't say |
| High-Seas | voyage, mutiny, salvage, leviathan, tide, chart | the ship as a town; authority at sea; what the water gives back; things too big to fight; schedules the moon owns |
| Suburb | conformity, committee, bylaw, curfew, pleasant | menace with a smile; rules that enforce themselves; the crime of being different; the lawn as ideology |
| Theater | role, script, audience, mask, rehearsal, curtain | identity as casting; lives that follow dramatic law; being watched as a condition; what happens off-stage |
| Ash | cinder, remnant, memorial, hearth, tending | what survives burning; the dead as residents; fire as covenant; duties to what's gone |
| Cosmic | void, constellation, orbit, signal, immensity | scale as horror and wonder; patterns overhead with opinions; messages across distances that shouldn't close; insignificance as a pressure |

## Housekeeping

- The NPC Hook d300 is the reference corpus for core-tag usage; its review sidecar
  (`docs/table-reviews/npc-hook.review.json`) shows the sidecar-override mechanism.
- When a realm table gets crafted, promote its pack from PROPOSED to CANON here (with any
  additions the craft discovered) in the same commit.
- Future engine uses (theme-weighted rolls, "give me a silly hook", codex theme search) should
  read tags from compiled `tables.json` — never re-derive from prose.
