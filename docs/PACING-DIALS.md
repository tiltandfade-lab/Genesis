---
type: design-note
project: Genesis
status: SPECCED 2026-07-05 (design-talk HELD — Adam's rulings §5 locked; PROVISIONAL rows
  flagged). Build queues behind the API-throttle window + token refresh. Trigger: "Gemini runs a
  high octane session… I want that tuned up a bit… tuning settings for different player types."
created: 2026-07-05
related:
  - "[[SPICE-CURVE]]"
  - "[[DIFFICULTY]]"
  - "[[DM-CHARTER]]"
  - "[[TAROT-SESSION]]"
  - "[[SESSION-PREP]]"
---

# PACING-DIALS — octane as a tuned, script-owned setting

## §1 The insight

"High octane" is not one thing — it decomposes into knobs the engine ALREADY owns, scattered:
- **Event density** — walk encounter branch weights (Enemy/Spectacle vs Empty/Rumor), segment
  counts (pbundlePlan's level curve), complication frequency (chase, capture).
- **Clock speed** — faction-turn cadence, pressure-clock drift per rest/montage, urgency table
  bias in quest hooks.
- **Consequence heat** — spice floors (region frayLevel already does this spatially), the
  Consequence-Ladder chain length, lethality posture (DIFFICULTY).
- **DM turn energy** — charter-side: scene length, cut-to-the-action, how much air between
  beats. Today this is pure model temperament (Gemini's octane is HIS temperament — we never
  told him; the seat needs it TOLD).

The tarot session vector (TAROT-SESSION: suit→domain weight, rank→intensity, reversal→valence)
is the EXACT architectural pattern: a session parameter vector read by the rollers. PACING is
the same shape, set by the player instead of drawn from a deck — and the two compose (tarot
modulates WITHIN the chosen octane).

## §2 Proposed shape (for the talk, not locked)

One world-level (overridable per-session) vector `w.pacing`:
`{ octane: 1-5, lethality: 1-5, drip: 1-5 }` — three dials, not ten (player-facing simplicity):
- **octane** → branch-weight multipliers (Enemy/Spectacle/Complication up, Empty down), clock
  ticks per transition (+1 at 4+), chase/capture eligibility widened, urgency bias, and ONE
  digest rule-line the DM reads every turn ("keep scenes hot; cut air; end on motion" at 4-5 /
  "let it breathe" at 1-2) — the charter-side lever Gemini supplies by temperament.
- **lethality** → the existing DIFFICULTY posture (already a known re-tune item; items made the
  party stronger — Adam: "will need the game to be more difficult, totally ok").
- **drip** → lore/reveal cadence (slow-drip law intensity; Strange+ surfacing rates within the
  spice clamp).

**Player-type presets** = named vectors, nothing more: e.g. Sightseer {2,2,2} · Storyteller
{3,2,4} · **Adam {4,4,3}** (the high-octane default candidate) · Meatgrinder {4,5,2}. Presets
are a menu; the vector is the truth; every knob is script-read (anti-drift — the DM never
decides density, it reads the same digest field every turn).

## §3 Open questions for Adam (the design talk)

1. Three dials enough, or does "weird neighbors" energy want a 4th (WEIRDNESS — spice-floor
   bias) separate from octane?
2. Set at world genesis, per session, or both (world default + session override)?
3. Does octane 5 license the DM to COMPRESS walks (skip-to-contact on quiet segments), or is
   segment integrity inviolable (the dice are the story)?
4. Default for new worlds: Adam-tuned {4,4,3}, or neutral {3,3,3} with the preset picker in
   new-game flow?
5. Immediate cheap win available pre-build: a one-line standing octane hint in the digest rule
   text (sessionLean already rides every turn) — want that NOW as a taste patch, or hold for
   the real vector?

## §4 What this is NOT

Not a difficulty re-tune (that's DIFFICULTY's own deferred item — lethality just POINTS at it).
Not new content. Not a DM-temperament hack — it's telling the seat what Gemini guessed.

## §5 Adam's rulings (2026-07-05 design talk — LOCKED except where flagged)

1. **HOT-OPEN LAW (locked):** every fresh adventure opens in medias res at octane floor 4 —
   the opening scene starts INSIDE the rolled Opening Tension, a clock already visibly moving.
   The dial governs cruise, never takeoff. "Players engaged right away."
2. **Player-triggered heat (locked):** the pressure-inject verb is DM-fireable AND
   player-requestable — a bored player asking for action is a legitimate signal the DM honors
   (charter line). The payload is ALWAYS rolled from live state (nearest clock advances / a
   front fires / an arrival / a deadline) — demand-not-supply; the request picks WHEN, never WHAT.
3. **The anti-sycophancy guarantee (standing, worth stating):** Gemini's late-session drift
   ("every roll is 18+, the player gets away with anything to complete the one-shot") is
   STRUCTURALLY impossible here — the script rolls all dice, openly; the DM never touches
   outcomes. SEAT-PROMPT gets one line: *a completed session is not the deliverable; the honest
   world is.* Difficulty stays hard-and-dangerous by architecture, not discipline.
4. **Intrigue IS pressure (locked):** the same object at an earlier knowledge grade — a soft
   clock dealt as mystery, graduating to named pressure when cashed (the neighbors→door→guards→
   chase loop is the reference experience). No separate intrigue system.
5. **WEIRDNESS dial (PROVISIONAL yes)** + **the DRY-STREAK ESCALATOR (locked in principle):**
   never fudge a die — instead a script-owned, openly-logged escalator: N consecutive Grounded
   results on player-surfacing spice tables raises a temporary band-floor bonus on subsequent
   rolls (the fraying-rim pattern, temporal instead of spatial), resetting on any Strange+
   result. Kills the 400-grounded-rolls desert with math, not fudge. N + the ramp = tuning
   constants (start N≈10 significant rolls; flag-to-veto).
6. **The quiet-streak license (locked):** quiet segments are pressure-RELEASE by design; at a
   SECOND consecutive quiet segment the digest flags `quietStreak:2` — the DM's standing
   license to fire the injector. EXCEPTION: an unexplored rolled secret/treasure in reach
   defers the nudge — exploration time is earned; the DM guides toward it subtly instead.
7. **Segments inviolable (locked):** no octane compresses walk segments away — the dice are
   the story; the injector (not compression) is the heat tool; the DM may montage narration,
   never the rolls.
8. **Set points (PROVISIONAL):** world-genesis default vector + per-session override; the
   preset picker rides the new-game flow. Adam default candidate {octane 4, lethality 4,
   drip 3, weird 3+}.
