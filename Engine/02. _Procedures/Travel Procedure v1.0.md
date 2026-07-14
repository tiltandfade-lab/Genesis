
```button
name Reroll
type chain
actions [{"type":"command","action":"Dice Roller: Re-roll Dice"}]
```

# Segmented Travel Kit v0

## Segment Info
- Segment #: 2/6  (manual)
- Goal / Destination: 5 (manual)

---
# Journey Set Up (Roll Once or Override)
## Route Context (Abstract)
Manual Override:
[[Travel Route Type]]
`dice: [[Travel Route Type#^travel-route-type]]`

## Environment Skin (Optional)
Manual Override:
[[Travel Biome]]
`dice: [[Travel Biome#^travel-biome]]`

---
# Segment Results (roll per segment)
## Travel Scene (In-Media-Res)
[[Travel Scene]]
`dice: [[Travel Scene#^travel-scene]]`

## Travel Event Type
[[Travel Event Type]]
`dice: [[Travel Event Type#^travel-event-type]]`
(determines which of the below are chosen)

## Landmark / Feature
[[Travel Landmark]]
`dice: [[Travel Landmark#^travel-landmark]]`

OR
## Threat Vector
[[Travel Threat]]
`dice: [[Travel Threat#^travel-threat]]`

OR
## Complication / Twist
[[Travel Complication]]
`dice: [[Travel Complication#^travel-complication]]`

## Route Distortion (Optional: “never the same way twice”)
[[Travel Route Distortion]]
`dice: [[Travel Route Distortion#^travel-route-distortion]]`

## Choice Prompt (What must the player decide?)
[[Travel Choice Prompt]]
`dice: [[Travel Choice Prompt#^travel-choice-prompt]]`

---
# Final segment
## Arrival State (Final Segment Only)
[[Travel Destination Arrival State]]
`dice: [[Travel Destination Arrival State#^travel-destination-arrival-state]]`

---

# For travelers with no destination
At the end of all segments they arrive here:
[[Travel Destination Type]]
`dice: [[Travel Destination Type^travel-destination-type]]`