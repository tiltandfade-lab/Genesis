---
id: starting-state-opening-register
type: table-set
domain: World Building / Starting State
status: source
table_class: Commitment
player_facing: reveal
voice_critical: false
design-authority: "[[TIYL-START-DIVERSITY]] — RULED by Adam 2026-07-27 (all four §6 questions)"
spice: "1–25 SETTLED · 26–50 ARRIVAL WITH EDGE · 51–80 IN MEDIAS RES · 81–95 WRONG · 96–100 MYTHIC COLD OPEN"
---

# Starting State — Opening Register
> A single d100 rolled once, first, before the why/foot/standing entry triplet — decides how
> hot and how strange minute zero is. The 2026-07-26 batch roll (`docs/intel/tiyl-starts.md`)
> found the openings the chain produces are a monoculture: 12 of 12 starts opened in a
> settlement, 11 of 12 were calm arrivals. This table is the fix: weights, not locks — every
> opening stays reachable by every class, species, and background; the dice lean, they never
> railroad. **RULED (2026-07-27): weights locked as authored (25/25/30/15/5); no player lean
> for now; WRONG rows realm-honest only; MYTHIC rows may permanently mark the world.**
>
> Engine key mapping (mirrored in `data/starting-state.js` as `SS.eRegister`, keys read by
> `rollEntry()`): SETTLED → `settled` · ARRIVAL WITH EDGE → `edge` · IN MEDIAS RES → `medias` ·
> WRONG → `wrong` · MYTHIC COLD OPEN → `mythic`.
>
> **One-time spice bend, fenced:** this register's rarity curve is deliberately hotter than
> ambient spice — that is the entire point — but it is spent once, at character birth. After
> turn zero the normal SPICE-CURVE rarity resumes everywhere; this table is never precedent
> for a time-escalation dial (which stays banned).

|d100|Band|What minute zero is|
|---|---|---|
|1–25|SETTLED|Today's behavior, demoted to one band: ordinary business in an ordinary place. The why/foot/standing triplet runs exactly as it does today; the opening tension stays latent.|
|26–50|ARRIVAL WITH EDGE|The same arrival triplet, but the world's tension is already present-tense: something is visibly wrong in this place as you arrive, and the opening tension is live, not latent.|
|51–80|IN MEDIAS RES|The opening is the middle of an event — a danger clock is running at turn zero. See "In Medias Res — Situation," below.|
|81–95|WRONG|Bizarre, not (necessarily) violent — player unhurt, questions armed. See "Wrong — Situation," below.|
|96–100|MYTHIC COLD OPEN|World-grade strangeness at minute zero, rare and real — allowed to mark the world permanently from turn one. See "Mythic Cold Open — Situation," below.|

---

## In Medias Res — Situation
> What is true in this exact second, for an ARRIVAL WITH EDGE-and-hotter open specifically
> rolled IN MEDIAS RES: verbs mid-flight, a danger clock already running. The existing `foot`
> roll (Starting State - Entry.md) still fires for every band — this table's row sits ON TOP
> of it, it does not replace it. Juice Textured, except rows 11–12 (Strange).

#opening-register-medias

|d12|Band|Result|
|---|---|---|
|1|Textured|the rope is in your hands and fraying, and the shouting below is getting closer|
|2|Textured|the building you woke in is on fire, and the door is not where it was last night|
|3|Textured|you are running full out and you don't remember starting, and the footsteps behind you just closed the gap|
|4|Textured|the ambush is already sprung and your weapon is still sheathed, and the first blow is already on its way|
|5|Textured|the water is at your knees and climbing fast, and the only door out just went under|
|6|Textured|you are standing over a body with blood on your hands you can't explain, and voices are coming up the stairs|
|7|Textured|the caravan around you is under attack from both sides, and no one has told you which one you're supposed to be defending|
|8|Textured|you are flat against a cliff ledge in the dark with no rope, and the hand that was holding yours just let go|
|9|Textured|the cell door is standing wide open in front of you, and somewhere close a bell has just started ringing|
|10|Textured|the crowd around you has just become a riot, and the first thrown stone was aimed at you|
|11|Strange|you are beating the brush on someone else's hunt, and whatever they're hunting just found you first|
|12|Strange|the theft in your hands is already falling apart, and the owner has just turned around|

---

## Wrong — Situation
> States, not violence — the player is unhurt, questions are armed. Realm-honest (RULED
> 2026-07-27): rows are realm-adaptive archetypes for the DM to instantiate in this world's own
> register — WRONG means *this world* is wrong, never that the genre changed. No proper nouns,
> no genre-specific technology, no realm-violating imagery. Juice always Strange.

#opening-register-wrong

|d12|Band|Result|
|---|---|---|
|1|Strange|you are dressed for a ceremony you don't remember, and everyone is waiting on you|
|2|Strange|the town is silent at noon, and every door on the street stands open|
|3|Strange|you are standing at your own funeral, and the mourners keep waiting for you to lie back down|
|4|Strange|every stranger in this town greets you by name, and none of them will say how they know it|
|5|Strange|a mark has appeared on your skin overnight, and it grows warmer whenever someone stares at it|
|6|Strange|you keep passing people wearing your own face, and not one of them seems to notice|
|7|Strange|the season here is wrong by your own reckoning, and no one will explain how much time has passed|
|8|Strange|the whole street calls you by a name that isn't yours, gently correcting you whenever you argue|
|9|Strange|there is a letter in your hand addressed to you in your own writing, and you don't remember writing it|
|10|Strange|every animal in sight keeps its distance from you, and the ones that live here are quietly leaving|
|11|Strange|you wake already mid-sentence, finishing words you don't remember starting|
|12|Strange|your face is nailed to a notice on every door in town, and everyone thanks you for whatever it says you did|

---

## Mythic Cold Open — Situation
> World-grade, and each row is written so acting on it — or ignoring it — legitimately marks
> the world forever (RULED 2026-07-27: "it was gonna get changed at some point! Let the game
> be weird."). No two rows alike in kind (celestial, chthonic, temporal, communal,
> personal-apotheosis, cosmological). Juice always Mythic.

#opening-register-mythic

|d6|Band|Result|
|---|---|---|
|1|Mythic|the sky has a seam in it tonight, and you are the only one looking up|
|2|Mythic|the ground beneath this exact spot has been hollow for longer than anyone has lived, and tonight you can hear it breathing|
|3|Mythic|you have already lived through this exact day once, and you are the only one who remembers how it went differently|
|4|Mythic|every soul in this place dreamed the same dream tonight, and in every version of it, you were the one who opened the last door|
|5|Mythic|something that was only ever said about you has just become true, and the world is quietly rearranging itself around it|
|6|Mythic|one law this world has never broken gives way in front of you tonight, and it does not spring back|
