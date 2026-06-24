---
type: system-spec
branch: Genesis
status: locked
created: 2026-06-23
related:
  - "[[SPICE-CURVE]]"
  - "[[DM-CHARTER]]"
  - "[[DESIGN]]"
---

# Genesis — The Critical-Magnitude System (spec v1)

The honest-dice spike mechanism. SPICE-CURVE §3 named it in one line ("the Critical-Magnitude
system — nat 1/20 → second d20"); this spec is the full rule, authored from Adam's design call
(2026-06-23). It is the **one place** a single d20 action can momentarily reach the top of both the
Spice and Scope axes — the exception, not a trend.

## 1. The rule

A **natural 20** (critical success) or a **natural 1** (critical failure) on any d20 action roll
**demands a second d20** — the **magnitude die**. The first die sets the *direction* (triumph or
disaster); the second sets *how far it goes*.

| 1st | 2nd | Outcome | Character |
|---|---|---|---|
| **20** | 1–10 | **Standard Critical Success** | The normal, generous crit ruling — they clearly and cleanly succeed. Apply whatever the best standard interpretation of the action is. |
| **20** | 11–19 | **Amplified Success** | The magnitude of the effect increases dramatically; the consequences ripple outward beyond the immediate action (scope widens — Local → Regional). |
| **20** | **20** | **Mythic Success** | A permanent, world-altering boon. Wondrous, scarcely believable. Becomes canon. |
| **1** | 11–20 | **Standard Critical Failure** | Humorous, tragic, or painful — but recoverable. *"Humor that is remembered."* |
| **1** | 2–10 | **Amplified Failure** | The magnitude curves toward catastrophe; the cost spreads. |
| **1** | **1** | **Mythic Failure** | The ultimate. Humor by default, **but in high-stakes situations things go as wrong as they possibly can** — incredibly dark, permanent outcomes. Becomes canon. |

The two **Mythic** ends are deliberate **mirrors**. The canonical examples (Adam):
- **20/20 — the Light of Lathander.** A cleric pleads with a bandit who meant to attack or extort
  the party, and double-crits. Radiant light shines down on the spot *permanently*; the light works
  the bandit's genuine repentance; he later returns to reveal everything he knows about the bandit
  operation; the townsfolk build and maintain a shrine around the enduring light.
- **1/1 — the dark twin.** Where a 20/20 might raise a shrine, a 1/1 in a high-stakes moment might
  tear the planes — a portal to a hell dimension opens at the spot, and a dark cult coalesces around
  it. The outcome need not take that exact shape; it is calibrated to **that magnitude**.

## 2. Tone of the magnitude

- **Success** skews **wondrous / triumphant** as it climbs.
- **Failure** skews **humorous by default** — and the humor should be *memorable*, the kind retold
  for sessions. **Exception: high stakes.** When the moment matters (a life on the line, a ritual at
  its hinge, a planar boundary already thin), a Mythic Failure goes **as dark and as permanent as the
  fiction allows.** The DM reads the stakes and chooses the register.
- The Mythic ends **mirror each other in kind**: if the world can hold a permanent shrine of light,
  it can hold a permanent wound of dark. Calibrate the 1/1 against what a 20/20 would have created in
  the same scene.

## 3. How it sits on the existing axes

This system is the **live realization** of two things already on the books:

- **SPICE-CURVE §3 — Spice × Scope.** The magnitude die spikes *both* axes at once. Standard →
  Amplified → Mythic maps to Local → Regional → Planar/Cosmic. This is the sanctioned spike; normal
  table rolls still grade spice *statically* (§2), never on a timer.
- **The Constitution's Escalation Curve** (90% Local / 9% Regional / 0.9% Planar / 0.09% Cosmic).
  A 20/20 or a 1/1 is ~0.25% of any crit-triggering roll, so Mythic crits arrive at roughly the
  Curve's intended rarity — the math already agrees with the target.

**Emergence (SPICE-CURVE §2):** a Mythic crit outcome is **written to the World State Ledger as
permanent canon** — the shrine, the hell-wound, the redeemed-then-returned NPC. The world grows
stranger because strange things actually happened and *persist*, never because a dial forced them.

## 4. The seam — generic engine vs. situational payload (the design distinction)

The crit-magnitude system is the **generic engine**: it fires on *any* d20 action — a sword swing,
a lockpick, a chase, a heist, a plea to a bandit.

The **Myth suite** (`Myth Seeds` → `Myth Costs` → `Myth Becomes Geography`) is **one downstream
payload**, not the universal answer. It only handles the case where a mythic outcome **mythologizes a
place or deed** — the bandit-shrine fits; a 20/20 *parry* does not. Adam's catch (2026-06-23):
*"some of these mythic tables are too specific to apply to a very situational double crit."* Exactly
— they are situational by design.

**Target architecture (future build, NOT wired yet):**
- The crit engine, on a Mythic end, reaches for a **context-appropriate mythic-outcome oracle**
  (combat / social / exploration / planar / …) rather than one universal table.
- The **Myth suite is the `place/deed` context** of that oracle — the aftermath toolkit for "a place
  just acquired a legend": Seed (what kind) → Costs (what it now demands) → Geography (how it scars
  the land).
- A generic Mythic-Success / Mythic-Failure outcome oracle, context-tagged, is the missing piece
  between the engine and the payloads. Flagged here; not built this pass.

## 5. DM-side conduct (Charter alignment)

- **Dice are open** (DM-CHARTER §6.1 dice transparency). The *player* rolls both the natural die and
  the magnitude die; the spike is never hidden — the player sees the dice run hot.
- **The DM narrates the outcome** (definitive) and **scales the magnitude to context and stakes**
  (§2 above). The magnitude die tells the DM *how big*; the DM's craft is *what shape*, true to the
  fiction in front of them.
- **Telegraph, then deliver** (DM-CHARTER §5 danger/fairness): a high-stakes Mythic Failure should
  land in a scene whose stakes were *already felt*, not ambushed.
- **State the rule clearly when asked** (DM-CHARTER §6/§10.7): a player who wants to know what the
  second d20 means gets a straight answer, in voice.

## 6. Build status

- **Spec:** locked 2026-06-23 (this doc).
- **Rule of play:** usable now by a human/AI DM (it is a narration-and-ruling protocol; no engine code
  required to run it at the table / over the DM Bridge).
- **Engine wiring (future):** (a) the generic context-tagged mythic-outcome oracle; (b) the crit
  engine that rolls the magnitude die and routes to it; (c) auto-writing the Mythic outcome to the
  Ledger as canon. None built this pass.
