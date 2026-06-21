```button
name Reroll
type chain
actions [{"type":"command","action":"Dice Roller: Re-roll Dice"}]
```

# Segmented Dungeon Kit v.1

> Designed to generate repeatable, modular dungeon assets quickly.
> DM always retains override authority.
> Re-roll when imagination is not aligned. Coherence > randomness.

---

# I. Player Progress Tracker

*Use this when running procedural, map-light dungeons.*

- Segment #: ___ / ___ (manual)
- Objective (Room Goal): ___ (manual)
- Depth / Floor: ___ (manual, optional)
- Time Spent (in minutes): ___ (manual)

---

# II. Dungeon Setup 
(Roll Once)

*These rolls define the dungeon’s identity.*
*May be player-rolled for agency.*

## Dungeon Context
[[Dungeon Type]]
`dice: [[Dungeon Type#^dungeon-type]]`

## Origin / Owner
[[Dungeon Origin]]
`dice: [[Dungeon Origin#^dungeon-origin]]`

## Dungeon Skin
[[Dungeon Environment Skin]]
`dice: [[Dungeon Environment Skin#^dungeon-environment-skin]]`

## Threat Profile
*Let Dungeon Skin inform this heavily.*

[[Dungeon Threat Profile]]
`dice: [[Dungeon Threat Profile#^dungeon-threat-profile]]`

## Rest Pressure
[[Dungeon Rest Complications]]
`dice: [[Dungeon Rest Complications#^dungeon-rest-complications]]`

---
## A. Alert Level (Living Environment)

| Alert Level | State        | Dungeon Behavior |
|-------------|-------------|------------------|
| 0           | Unaware     | Normal activity. No adjustments. |
| 1           | Suspicious  | Minor repositioning. Enemies more cautious. |
| 2           | Searching   | +1 creature added to future combat encounters (within reason). Enemies reposition defensively. |
| 3           | Mobilized   | Boss fortifies, relocates, or prepares ambush. Reinforcement roll allowed. |

---

### Alert Increases When:

| Trigger Event |
|---------------|
| Combat lasts 3+ rounds |
| Loud magic used (thunder, explosions, collapse) |
| Enemy escapes |
| Alarm triggered |
| Distortion event alters structure |

If one or more occur → Increase Alert by 1 (max 3)

---

### Alert 3 Reinforcement Roll

If Alert Level = 3:

→ [[Dungeon Reinforcements]]  
`dice: [[Dungeon Reinforcements#^dungeon-reinforcements]]`  

---

### Alert Reset Conditions

| Reset Condition |
|-----------------|
| Long rest outside dungeon |
| Dungeon cleared |
| Narrative justification |

---

# IV. Segment Procedures

Re roll this section per segment.

---

## 1. Scene Framing

### Dungeon Scene
[[Dungeon Scene]]
`dice: [[Dungeon Scene#^dungeon-scene]]`

### Area Type
[[Dungeon Area Type]]
`dice: [[Dungeon Area Type#^dungeon-area-type]]`

### Feature / Landmark
[[Dungeon Feature]]
`dice: [[Dungeon Feature#^dungeon-feature]]`

---

## 2. Encounter Determination

### Encounter Type (Gate Roll)
[[Dungeon Encounter Type]]
`dice: [[Dungeon Encounter Type#^dungeon-encounter-type]]`

Based on result, roll ONE of the following:

---

### Enemy / Faction Encounter
[[Dungeon Enemy Category]]
`dice: [[Dungeon Enemy Category#^dungeon-enemy-category]]`

[[Dungeon Enemy Composition]]
`dice: [[Dungeon Enemy Composition#^dungeon-enemy-composition]]`

---

### Hazard / Trap / Environmental Threat
[[Dungeon Hazard]]
`dice: [[Dungeon Hazard#^dungeon-hazard]]`

---

### Social / Weird Contact
[[Dungeon Contact]]
`dice: [[Dungeon Contact#^dungeon-contact]]`

---

### Empty
[[Dungeon Empty Result]]
`dice: [[Dungeon Empty Result#^dungeon-empty-result]]`

---

### Problem / Lock
[[Dungeon Problem]]
`dice: [[Dungeon Problem#^dungeon-problem]]`

---

## 3. Secret Check (Optional per Segment)

Roll once per dungeon unless fiction justifies more.

[[Dungeon Secret Tier]]
`dice: [[Dungeon Secret Presence#^dungeon-secret-presence]]`


If Secret Present:
→ Roll Secret Type:
[[Dungeon Secret Type]]
`dice: [[Dungeon Secret Type#^dungeon-secret-type]]`


Secrets must:
- Have at least one clue.
- Never gate required progression.


---

# V. Final Segment Procedure

## Setpiece Type
[[Dungeon Finale Type]]
`dice: [[Dungeon Finale Type#^dungeon-finale-type]]`

## Boss / Major Opposition
[[Dungeon Boss]]
`dice: [[Dungeon Boss#^dungeon-boss]]`

## Revelation
[[Dungeon Revelation]]
`dice: [[Dungeon Revelation#^dungeon-revelation]]`

## Exit State
[[Dungeon Exit State]]
`dice: [[Dungeon Exit State#^dungeon-exit-state]]`

---

## If No Mapped Exit
[[Dungeon Exit Destination Type]]
`dice: [[Dungeon Exit Destination Type#^dungeon-exit-destination-type]]`