---
id: npc-opening-attitude
type: table
domain: Social / Sentient NPCs
status: source
table_class: Fork
player_facing: plumbing
voice_critical: false
---

#npc-opening-attitude
> **Where this NPC's stance toward the PC *starts*** — the rolled seed of the per-NPC Standing the social resolver then moves one step at a time (`docs/SOCIAL.md` §1). **This replaces the DM inventing how a stranger feels about the PC every scene** (the #1 drift), and it is **not** `[[NPC Demeanor]]` (a personality tic) or `[[NPC Immediate Mood]]` (today's weather) — those are flavor; *attitude is the mechanical stance that persists and evolves across visits.* Rolled **once** at first contact, stamped into `status.attitude.opening`. Weighted **hard toward Indifferent** — a stranger is a stranger. The **Lean** column is the ladder value (Hostile −2 · Wary −1 · Indifferent 0 · Friendly +1 · Helpful +2); the **Situational** note is the *condition that justifies a non-neutral opening* — the script applies it when the triggering fact is on the ledger (reputation/standing/scene, `SOCIAL.md` §1.3), so it doesn't drift. Pairs with `[[NPC Want]]`, `[[NPC Fear]]`, `[[NPC Leverage]]`, `[[NPC Trust Lever]]`, `[[NPC Honesty]]`.

| d20 | Band | Lean | Opening read | Situational |
|---|---|---|---|---|
| 1 | Grounded | Indifferent (0) | Sizes the PC up and decides they're nobody worth the bother either way. | default |
| 2 | Grounded | Indifferent (0) | Polite, transactional, already half-turned back to their own work. | default |
| 3 | Grounded | Indifferent (0) | Neither warm nor cold — the PC is weather, to be waited out. | default |
| 4 | Grounded | Indifferent (0) | Treats the PC like every other traveler: a coin's worth of attention, no more. | default |
| 5 | Grounded | Indifferent (0) | Reserves judgment entirely; gives nothing away and asks nothing in return. | default |
| 6 | Grounded | Indifferent (0) | Tired civility — they've no quarrel and no interest, and would like the day to end. | default |
| 7 | Grounded | Indifferent (0) | Watchfully neutral; helps if it costs nothing, declines the instant it does. | default |
| 8 | Grounded | Indifferent (0) | Distracted by their own troubles; the PC barely registers. | default |
| 9 | Grounded | Indifferent (0) | Professional courtesy with a closed door behind it. | default |
| 10 | Grounded | Indifferent (0) | Curious for a heartbeat, then back to neutral — strangers come and go. | default |
| 11 | Grounded | Wary (−1) | Guards their words; the last outsider through here cost them something. | recent trouble with strangers; or PC arrived armed/bloodied |
| 12 | Grounded | Wary (−1) | Suspicion worn smooth by habit — assumes the PC wants something. | a hard town, a cautious trade, or the PC's reputation precedes them poorly |
| 13 | Textured | Wary (−1) | Civil to the face, already counting the exits and their coin. | the PC bears a mark/colors of a distrusted faction or kind |
| 14 | Textured | Friendly (+1) | Takes a quick, genuine liking — something about the PC reads *kin*. | shared origin/race/faith, or the PC pulled a trust-lever on sight (`[[NPC Trust Lever]]`) |
| 15 | Textured | Friendly (+1) | Grateful before a word is spoken — the PC's arrival is *good news* here. | the PC recently aided this NPC's people/faction; standing is positive |
| 16 | Textured | Wary (−1) | Caught mid-something they'd rather no one saw; the guard goes straight up. | the scene catches the NPC in a secret/crime (`[[NPC Flaws and Secrets]]`) |
| 17 | Textured | Friendly (+1) | Opens the door wide — they've been *waiting* for someone like the PC. | the PC matches a need the NPC has (`[[NPC Want]]`); a rolled hook is live |
| 18 | Strange | Hostile (−2) | Cold loathing on sight, reason unspoken — the PC has walked into an old grudge. | standing is negative / a faction clock the PC advanced runs through this NPC (`docs/DIFFICULTY.md`) |
| 19 | Strange | Hostile (−2) | Recognition curdling to hate — the PC, or someone wearing the PC's face, wronged them. | the PC (or their past life / their faction) is canon-tied to this NPC's loss |
| 20 | Strange | Helpful (+2) | Inexplicable, immediate devotion — the PC is the answer to a prayer this NPC didn't speak aloud. | a live bond/debt/prophecy already binds them to the PC (rare; clamp-checked) |
^npc-opening-attitude
